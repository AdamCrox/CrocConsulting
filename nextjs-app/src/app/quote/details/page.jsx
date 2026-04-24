"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function buildProjectPrefix(company, contactName, projectName) {
  const co = company.trim().replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase();
  const initials = contactName.trim().split(/\s+/).map((w) => w[0] ?? "").join("").toUpperCase();
  const proj = projectName.trim().replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase();
  return [co, initials, proj].filter(Boolean).join("-");
}

const PROJECT_TYPES = [
  "Greenfield", "Brownfield", "Solar Farm", "BESS", "Wind Farm", "Mine Site", "Other",
];

const VOLTAGE_LEVELS = [
  "11 kV", "33 kV", "66 kV", "132 kV", "275 kV", "330 kV",
];

const SLD_COLS = ["tag", "equipment_type", "voltage_kv", "rating", "qty", "notes"];
const SLD_HEADERS = ["Tag", "Equipment Type", "Voltage (kV)", "Rating", "QTY", "Notes"];

function downloadCSV(rows, fileName, details = {}) {
  const detailLines = Object.entries(details)
    .map(([k, v]) => `"${k.replace(/_/g, " ")}","${String(v).replace(/"/g, '""')}"`)
    .join("\n");
  const separator = detailLines ? detailLines + "\n\n" : "";
  const header = SLD_HEADERS.join(",");
  const body = rows.map((r) =>
    SLD_COLS.map((c) => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(",")
  ).join("\n");
  const blob = new Blob([separator + header + "\n" + body], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = fileName.replace(/\.pdf$/i, "") + "_equipment_schedule.csv";
  a.click();
}

export default function QuoteDetailsPage() {
  const router = useRouter();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    company: "", contact_name: "", phone: "", contact_email: "",
    project_name: "", project_type: "", voltage_levels: [],
    offer_type: "", description: "", timeframe: "",
    order_date: "", delivery_location: "",
  });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [projectNumber, setProjectNumber] = useState("");
  const [generatingNum, setGeneratingNum] = useState(false);

  const generateProjectNumber = useCallback(async (company, contactName, projectName) => {
    const prefix = buildProjectPrefix(company, contactName, projectName);
    if (!prefix || prefix.length < 3) { setProjectNumber(""); return; }
    setGeneratingNum(true);
    try {
      const supabase = createClient();
      const { count } = await supabase.from("submissions").select("*", { count: "exact", head: true });
      const seq = String((count ?? 0) + 1).padStart(4, "0");
      setProjectNumber(`${prefix}-${seq}`);
    } catch {
      const seq = String(Math.floor(Math.random() * 9000) + 1000);
      setProjectNumber(`${prefix}-${seq}`);
    } finally {
      setGeneratingNum(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (form.company && form.contact_name && form.project_name) {
        generateProjectNumber(form.company, form.contact_name, form.project_name);
      } else {
        setProjectNumber("");
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [form.company, form.contact_name, form.project_name, generateProjectNumber]);

  // SLD analysis state — keyed by file index
  const [analysing, setAnalysing] = useState({});
  const [sldResults, setSldResults] = useState({});
  const [sldDetails, setSldDetails] = useState({});
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleFiles = (e) => {
    const valid = [...e.target.files].filter((f) =>
      /\.(xlsx|xls|pdf|docx|doc)$/i.test(f.name)
    );
    setFiles((prev) => [...prev, ...valid]);
  };

  const removeFile = (i) => {
    setFiles((prev) => prev.filter((_, j) => j !== i));
    setSldResults((prev) => {
      const next = { ...prev };
      delete next[i];
      return next;
    });
  };

  const analysePdf = async (file, index) => {
    setAnalysing((a) => ({ ...a, [index]: true }));
    setSldResults((r) => ({ ...r, [index]: null }));
    try {
      const base64 = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result.split(",")[1]);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });

      const resp = await fetch("/api/quote/parse-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64: base64, fileName: file.name }),
      });

      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      setSldResults((r) => ({ ...r, [index]: data.equipment }));
      setSldDetails((d) => ({ ...d, [index]: data.substation_details ?? {} }));
    } catch (err) {
      setSldResults((r) => ({ ...r, [index]: "error" }));
    } finally {
      setAnalysing((a) => ({ ...a, [index]: false }));
    }
  };

  const buildQuotePdf = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const blue = [0, 113, 227];
    const dark = [29, 29, 31];
    const grey = [110, 110, 115];
    let y = 20;

    // Header
    doc.setFontSize(20); doc.setTextColor(...blue);
    doc.text("CROC CONSULTING", 14, y); y += 8;
    doc.setFontSize(11); doc.setTextColor(...grey);
    doc.text("Quote Request", 14, y); y += 12;
    doc.setDrawColor(210, 210, 215); doc.line(14, y, 196, y); y += 8;

    const field = (label, value) => {
      if (!value) return;
      doc.setFontSize(9); doc.setTextColor(...grey); doc.text(label, 14, y);
      doc.setFontSize(11); doc.setTextColor(...dark); doc.text(String(value), 14, y + 5);
      y += 14;
    };

    doc.setFontSize(13); doc.setTextColor(...dark);
    doc.text("Project Details", 14, y); y += 8;
    field("Project Number", projectNumber);
    field("Project Name", form.project_name);
    field("Type of Project", form.project_type);
    field("Voltage Levels", form.voltage_levels.join(", "));
    field("Type of Offer", form.offer_type);
    y += 4; doc.line(14, y, 196, y); y += 8;

    doc.setFontSize(13); doc.setTextColor(...dark);
    doc.text("Contact Details", 14, y); y += 8;
    field("Company", form.company);
    field("Contact Name", form.contact_name);
    field("Email", form.contact_email);
    field("Phone", form.phone);
    y += 4; doc.line(14, y, 196, y); y += 8;

    doc.setFontSize(13); doc.setTextColor(...dark);
    doc.text("Requirements", 14, y); y += 8;
    if (form.description) {
      doc.setFontSize(9); doc.setTextColor(...grey); doc.text("Description", 14, y); y += 5;
      doc.setFontSize(10); doc.setTextColor(...dark);
      const lines = doc.splitTextToSize(form.description, 180);
      doc.text(lines, 14, y); y += lines.length * 5 + 6;
    }
    field("Date Quote Required By", form.timeframe);
    field("Order Date", form.order_date);
    field("Delivery Location", form.delivery_location);

    return doc.output("datauristring").split(",")[1];
  };

  const buildSldCsv = () => {
    const allResults = Object.values(sldResults).filter((r) => Array.isArray(r) && r.length > 0).flat();
    if (allResults.length === 0) return null;
    const header = SLD_HEADERS.join(",");
    const body = allResults.map((r) =>
      SLD_COLS.map((c) => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(",")
    ).join("\n");
    return btoa(unescape(encodeURIComponent(header + "\n" + body)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/quote"); return; }

      let fileUrls = [];
      if (files.length > 0) {
        setUploading(true);
        const submissionId = crypto.randomUUID();
        for (const file of files) {
          const { data, error: uploadErr } = await supabase.storage
            .from("quote-files")
            .upload(`${submissionId}/${file.name}`, file);
          if (uploadErr) throw uploadErr;
          const { data: urlData } = supabase.storage
            .from("quote-files")
            .getPublicUrl(data.path);
          fileUrls.push(urlData.publicUrl);
        }
        setUploading(false);
      }

      const [quotePdfB64, sldCsvB64] = await Promise.all([buildQuotePdf(), Promise.resolve(buildSldCsv())]);

      const res = await fetch("/api/quote/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          ...form,
          equipment_type: form.project_type,
          voltage_level: form.voltage_levels.join(", "),
          offer_type: form.offer_type,
          project_number: projectNumber,
          contact_email: form.contact_email,
          details: {
            project_number: projectNumber,
            description: form.description,
            timeframe: form.timeframe,
            order_date: form.order_date,
            delivery_location: form.delivery_location,
          },
          files: fileUrls,
          quotePdfB64,
          sldCsvB64,
        }),
      });

      if (!res.ok) throw new Error("Submission failed");
      router.push("/quote/confirmation");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
      setUploading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-apple-border bg-apple-surface text-[15px] text-apple-text-primary placeholder:text-apple-text-secondary focus:outline-none focus:border-apple-blue transition-colors";
  const labelClass = "block text-[13px] font-medium text-apple-text-primary mb-2";

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 h-14 nav-glass border-b border-apple-border flex items-center px-8 justify-between">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="text-[17px] font-bold text-apple-text-primary">CROC</span>
          <span className="text-[17px] font-normal text-apple-text-secondary">GET A QUOTE</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-apple-blue flex items-center justify-center text-white text-[10px] font-bold">✓</div>
          <div className="h-px w-6 bg-apple-border" />
          <div className="w-5 h-5 rounded-full bg-apple-blue flex items-center justify-center text-white text-[10px] font-bold">2</div>
          <div className="h-px w-6 bg-apple-border" />
          <div className="w-5 h-5 rounded-full border border-apple-border flex items-center justify-center text-apple-text-secondary text-[10px] font-bold">3</div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">
        <h1 className="text-[36px] font-bold text-apple-text-primary tracking-tight mb-2">Quote details</h1>
        <p className="text-[17px] text-apple-text-secondary mb-10">
          Fill in your requirements below. The more detail you provide, the more accurate your quotes will be.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* Contact details */}
            <div className="card-apple p-8">
              <h2 className="text-[19px] font-semibold text-apple-text-primary mb-6">Your details</h2>
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Company / Organisation *</label>
                  <input required className={inputClass} value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="Ergon Energy" />
                </div>
                <div>
                  <label className={labelClass}>Contact name *</label>
                  <input required className={inputClass} value={form.contact_name} onChange={(e) => update("contact_name", e.target.value)} placeholder="Jane Smith" />
                </div>
                <div>
                  <label className={labelClass}>Phone number</label>
                  <input type="tel" className={inputClass} value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+61 400 000 000" />
                </div>
                <div>
                  <label className={labelClass}>Email address</label>
                  <input type="email" className={inputClass} value={form.contact_email} onChange={(e) => update("contact_email", e.target.value)} placeholder="you@company.com.au" />
                </div>
              </div>
            </div>

            {/* Equipment */}
            <div className="card-apple p-8">
              <h2 className="text-[19px] font-semibold text-apple-text-primary mb-6">Equipment required</h2>
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Project name *</label>
                  <input required className={inputClass} value={form.project_name} onChange={(e) => update("project_name", e.target.value)} placeholder="e.g. Toowoomba Zone Substation" />
                </div>
                <div>
                  <label className={labelClass}>Type of project *</label>
                  <select required className={`${inputClass} appearance-auto`} value={form.project_type} onChange={(e) => update("project_type", e.target.value)}>
                    <option value="">Select project type…</option>
                    {PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Voltage level * <span className="text-apple-text-secondary font-normal">(select all that apply)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {VOLTAGE_LEVELS.map((v) => {
                      const checked = form.voltage_levels.includes(v);
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() => update("voltage_levels", checked ? form.voltage_levels.filter((x) => x !== v) : [...form.voltage_levels, v])}
                          className={`px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-colors cursor-pointer ${checked ? "bg-apple-blue text-white border-apple-blue" : "bg-apple-surface text-apple-text-primary border-apple-border hover:border-apple-blue hover:text-apple-blue"}`}
                        >
                          {v}
                        </button>
                      );
                    })}
                  </div>
                  {form.voltage_levels.length === 0 && (
                    <input type="text" required className="sr-only" readOnly value="" aria-hidden="true" tabIndex={-1} />
                  )}
                </div>
                <div>
                  <label className={labelClass}>Type of offer</label>
                  <select className={`${inputClass} appearance-auto`} value={form.offer_type} onChange={(e) => update("offer_type", e.target.value)}>
                    <option value="">Select offer type…</option>
                    <option value="Firm and binding">Firm and binding</option>
                    <option value="Budget">Budget</option>
                    <option value="Accurate non binding">Accurate non binding</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Project details */}
          <div className="card-apple p-8 mb-8">
            <h2 className="text-[19px] font-semibold text-apple-text-primary mb-6">Project details</h2>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Project number</label>
                <div className={`${inputClass} flex items-center gap-3`}>
                  {generatingNum ? (
                    <span className="text-apple-text-secondary text-[14px]">Generating…</span>
                  ) : projectNumber ? (
                    <span className="font-mono font-semibold text-apple-blue tracking-wide">{projectNumber}</span>
                  ) : (
                    <span className="text-apple-text-secondary text-[14px]">Fill in Company, Contact name and Project name to generate</span>
                  )}
                </div>
              </div>
              <div>
                <label className={labelClass}>Description / Requirements *</label>
                <textarea required className={`${inputClass} resize-y min-h-[120px]`} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe the equipment, technical specifications, and any relevant project context…" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className={labelClass}>Date quote required by</label>
                  <input type="date" className={inputClass} value={form.timeframe} onChange={(e) => update("timeframe", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Delivery location</label>
                  <input className={inputClass} value={form.delivery_location} onChange={(e) => update("delivery_location", e.target.value)} placeholder="e.g. Toowoomba QLD" />
                </div>
                <div>
                  <label className={labelClass}>Order date</label>
                  <input type="date" className={inputClass} value={form.order_date} onChange={(e) => update("order_date", e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* File upload */}
          <div className="card-apple p-8 mb-8">
            <h2 className="text-[19px] font-semibold text-apple-text-primary mb-2">Documents (optional)</h2>
            <p className="text-[13px] text-apple-text-secondary mb-6">
              Upload spec sheets, single line diagrams, or existing RFQs. Accepted: Excel, PDF, Word.
              <br />
              <span className="text-apple-blue font-medium">PDF single line diagrams can be analysed automatically — click "Read SLD" after uploading.</span>
            </p>

            <input ref={fileRef} type="file" accept=".xlsx,.xls,.pdf,.docx,.doc" multiple onChange={handleFiles} className="hidden" />

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-3 px-6 py-3 rounded-xl border border-apple-blue/30 bg-blue-50/40 hover:bg-blue-50 hover:border-apple-blue text-apple-blue font-medium text-[15px] transition-all cursor-pointer"
            >
              <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
                <rect x="6" y="4" width="24" height="28" rx="4" stroke="#0071E3" strokeWidth="1.5" />
                <path d="M14 20L18 16L22 20" stroke="#0071E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="18" y1="16" x2="18" y2="26" stroke="#0071E3" strokeWidth="1.5" />
              </svg>
              Click to upload
            </button>


            {files.length > 0 && (
              <div className="mt-4 space-y-4">
                {files.map((f, i) => {
                  const isPdf = /\.pdf$/i.test(f.name);
                  const result = sldResults[i];
                  const isAnalysing = analysing[i];

                  return (
                    <div key={i}>
                      <div className="flex items-center gap-3 px-4 py-3 bg-apple-surface rounded-xl">
                        <span className="text-[11px] font-bold text-apple-blue uppercase bg-blue-50 px-2 py-0.5 rounded">
                          {f.name.split(".").pop()}
                        </span>
                        <span className="flex-1 text-[14px] text-apple-text-primary truncate">{f.name}</span>
                        <span className="text-[12px] text-apple-text-secondary">{(f.size / 1024).toFixed(0)} KB</span>

                        {isPdf && (
                          <button
                            type="button"
                            onClick={() => analysePdf(f, i)}
                            disabled={isAnalysing}
                            className="text-[12px] font-semibold text-apple-blue bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-apple-blue/20 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {isAnalysing ? "Reading…" : "Read SLD"}
                          </button>
                        )}

                        <button type="button" onClick={() => removeFile(i)} className="text-apple-text-secondary hover:text-apple-danger p-1 bg-transparent border-none cursor-pointer">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>

                      {/* SLD results table */}
                      {isAnalysing && (
                        <div className="mt-3 px-4 py-6 bg-blue-50/40 rounded-xl text-center">
                          <div className="inline-block w-5 h-5 border-2 border-apple-blue border-t-transparent rounded-full animate-spin mb-2" />
                          <p className="text-[13px] text-apple-text-secondary">Analysing single line diagram…</p>
                        </div>
                      )}

                      {result === "error" && (
                        <p className="mt-2 text-[13px] text-apple-danger px-1">Could not extract data from this PDF. Please check it is a readable single line diagram.</p>
                      )}

                      {Array.isArray(result) && result.length === 0 && (
                        <p className="mt-2 text-[13px] text-apple-text-secondary px-1">No equipment items detected. This may not be a single line diagram.</p>
                      )}

                      {Array.isArray(result) && result.length > 0 && (
                        <div className="mt-3 rounded-2xl border border-apple-border overflow-hidden">
                          {/* General substation details */}
                          {sldDetails[i] && Object.keys(sldDetails[i]).length > 0 && (
                            <div className="px-5 py-4 bg-blue-50/40 border-b border-apple-border">
                              <p className="text-[12px] font-semibold text-apple-text-secondary uppercase tracking-wide mb-2">General Substation Details</p>
                              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                                {Object.entries(sldDetails[i]).map(([k, v]) => (
                                  <div key={k} className="flex gap-2 text-[12px]">
                                    <span className="text-apple-text-secondary capitalize min-w-[90px]">{k.replace(/_/g, " ")}:</span>
                                    <span className="text-apple-text-primary font-medium">{v}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="flex items-center justify-between px-5 py-3 bg-apple-surface border-b border-apple-border">
                            <span className="text-[13px] font-semibold text-apple-text-primary">
                              {result.length} item{result.length !== 1 ? "s" : ""} extracted from SLD
                            </span>
                            <button
                              type="button"
                              onClick={() => downloadCSV(result, f.name, sldDetails[i])}
                              className="flex items-center gap-1.5 text-[12px] font-semibold text-apple-blue bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-apple-blue/20 transition-colors cursor-pointer"
                            >
                              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                <path d="M6.5 1v8M3.5 6.5l3 3 3-3" stroke="#0071E3" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M1 10.5h11" stroke="#0071E3" strokeWidth="1.4" strokeLinecap="round" />
                              </svg>
                              Download CSV
                            </button>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-[12px]">
                              <thead>
                                <tr className="bg-apple-surface/50">
                                  {SLD_HEADERS.map((h) => (
                                    <th key={h} className="text-left px-4 py-2 text-apple-text-secondary font-semibold border-b border-apple-border whitespace-nowrap">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {result.map((row, ri) => (
                                  <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-apple-surface/30"}>
                                    {SLD_COLS.map((col) => (
                                      <td key={col} className="px-4 py-2 text-apple-text-primary border-b border-apple-border/50 whitespace-nowrap">
                                        {row[col] ?? "—"}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {error && <p className="text-[13px] text-apple-danger mb-6">{error}</p>}

          <div className="flex justify-end gap-4">
            <Link href="/" className="btn-secondary">Cancel</Link>
            <button type="submit" disabled={submitting} className="btn-primary min-w-[180px]">
              {uploading ? "Uploading files…" : submitting ? "Submitting…" : "Submit quote request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
