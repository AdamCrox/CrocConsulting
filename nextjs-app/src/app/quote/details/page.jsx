"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const EQUIPMENT_TYPES = [
  "Circuit Breaker", "Switchgear Panel", "Power Transformer",
  "Distribution Transformer", "MV Cable", "HV Cable",
  "Protection Relay", "Current Transformer", "Voltage Transformer", "Other",
];

const VOLTAGE_LEVELS = [
  "LV (<1 kV)", "MV (1–36 kV)", "HV (36–150 kV)", "EHV (>150 kV)",
];

export default function QuoteDetailsPage() {
  const router = useRouter();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    company: "", contact_name: "", phone: "",
    equipment_type: "", voltage_level: "",
    quantity: "", description: "", timeframe: "",
    standards: "", site_location: "",
  });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleFiles = (e) => {
    const valid = [...e.target.files].filter((f) =>
      /\.(xlsx|xls|pdf|docx|doc)$/i.test(f.name)
    );
    setFiles((prev) => [...prev, ...valid]);
  };

  const removeFile = (i) => setFiles((prev) => prev.filter((_, j) => j !== i));

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

      const res = await fetch("/api/quote/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          ...form,
          quantity: parseInt(form.quantity) || null,
          details: {
            description: form.description,
            timeframe: form.timeframe,
            standards: form.standards,
            site_location: form.site_location,
          },
          files: fileUrls,
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
              </div>
            </div>

            {/* Equipment */}
            <div className="card-apple p-8">
              <h2 className="text-[19px] font-semibold text-apple-text-primary mb-6">Equipment required</h2>
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Equipment type *</label>
                  <select required className={`${inputClass} appearance-auto`} value={form.equipment_type} onChange={(e) => update("equipment_type", e.target.value)}>
                    <option value="">Select type…</option>
                    {EQUIPMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Voltage level *</label>
                  <select required className={`${inputClass} appearance-auto`} value={form.voltage_level} onChange={(e) => update("voltage_level", e.target.value)}>
                    <option value="">Select voltage…</option>
                    {VOLTAGE_LEVELS.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Quantity</label>
                  <input type="number" min="1" className={inputClass} value={form.quantity} onChange={(e) => update("quantity", e.target.value)} placeholder="1" />
                </div>
              </div>
            </div>
          </div>

          {/* Project details */}
          <div className="card-apple p-8 mb-8">
            <h2 className="text-[19px] font-semibold text-apple-text-primary mb-6">Project details</h2>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Description / Requirements *</label>
                <textarea required className={`${inputClass} resize-y min-h-[120px]`} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe the equipment, technical specifications, and any relevant project context…" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className={labelClass}>Required timeframe</label>
                  <input className={inputClass} value={form.timeframe} onChange={(e) => update("timeframe", e.target.value)} placeholder="e.g. Q3 2026" />
                </div>
                <div>
                  <label className={labelClass}>Site location</label>
                  <input className={inputClass} value={form.site_location} onChange={(e) => update("site_location", e.target.value)} placeholder="e.g. Toowoomba QLD" />
                </div>
                <div>
                  <label className={labelClass}>Applicable standards</label>
                  <input className={inputClass} value={form.standards} onChange={(e) => update("standards", e.target.value)} placeholder="e.g. AS/NZS 62271" />
                </div>
              </div>
            </div>
          </div>

          {/* File upload */}
          <div className="card-apple p-8 mb-8">
            <h2 className="text-[19px] font-semibold text-apple-text-primary mb-2">Documents (optional)</h2>
            <p className="text-[13px] text-apple-text-secondary mb-6">Upload spec sheets, single line diagrams, or existing RFQs. Accepted: Excel, PDF, Word.</p>

            <input ref={fileRef} type="file" accept=".xlsx,.xls,.pdf,.docx,.doc" multiple onChange={handleFiles} className="hidden" />
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-apple-blue/30 rounded-2xl p-10 text-center cursor-pointer hover:border-apple-blue hover:bg-blue-50/30 transition-all"
            >
              <svg className="mx-auto mb-3" width="36" height="36" viewBox="0 0 36 36" fill="none">
                <rect x="6" y="4" width="24" height="28" rx="4" stroke="#0071E3" strokeWidth="1.5" />
                <path d="M14 20L18 16L22 20" stroke="#0071E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="18" y1="16" x2="18" y2="26" stroke="#0071E3" strokeWidth="1.5" />
              </svg>
              <p className="text-[15px] font-medium text-apple-blue">Click to upload or drag files</p>
              <p className="text-[13px] text-apple-text-secondary mt-1">Excel, PDF, or Word documents</p>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 bg-apple-surface rounded-xl">
                    <span className="text-[11px] font-bold text-apple-blue uppercase bg-blue-50 px-2 py-0.5 rounded">
                      {f.name.split(".").pop()}
                    </span>
                    <span className="flex-1 text-[14px] text-apple-text-primary truncate">{f.name}</span>
                    <span className="text-[12px] text-apple-text-secondary">{(f.size / 1024).toFixed(0)} KB</span>
                    <button type="button" onClick={() => removeFile(i)} className="text-apple-text-secondary hover:text-apple-danger p-1 bg-transparent border-none cursor-pointer">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                ))}
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
