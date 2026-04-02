import { useState, useEffect, useRef } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Color palette
const B = "#0071E3", BD = "#0055B0", BL = "#E8F2FF", D = "#1D1D1F", G = "#86868B", LB = "#F5F5F7", CY = "#4FC3F7", PU = "#9C5CF5", GN = "#10B981", AM = "#F59E0B", RD = "#EF4444";

// Shared input style
const inp = { width: "100%", padding: "12px 16px", borderRadius: 12, fontSize: 15, border: "1.5px solid rgba(0,0,0,0.12)", outline: "none", boxSizing: "border-box", background: LB, fontFamily: "inherit", transition: "border-color 0.2s" };

// Currency formatter
const fmt = n => n.toLocaleString("en-AU", { style: "currency", currency: "AUD", minimumFractionDigits: 0 });

// Input handlers
const onF = e => e.target.style.borderColor = B;
const onB = e => e.target.style.borderColor = "rgba(0,0,0,0.12)";

// Logo component
function CrocLogo({ size = 36 }) {
  const id = "lg" + Math.random().toString(36).slice(2, 6);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id={id} x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4FC3F7" />
          <stop offset="50%" stopColor="#7C8FF5" />
          <stop offset="100%" stopColor="#9C5CF5" />
        </linearGradient>
      </defs>
      <path d="M58 8 C30 8,6 28,6 50 C6 72,30 92,58 92 L44 74 C28 72,20 62,20 50 C20 38,28 28,44 26Z" fill={`url(#${id})`} />
      <path d="M52 30 C38 32,32 40,32 50 C32 60,38 68,52 70 L44 60 C40 58,38 54,38 50 C38 46,40 42,44 40Z" fill="white" fillOpacity="0.93" />
    </svg>
  );
}

// Data
const SUPPLIERS = ["Siemens", "ABB", "Schneider Electric", "Shanghai Electric", "Hitachi Energy", "Eaton", "GE Vernova", "Mitsubishi Electric", "Lucy Electric", "Hyosung", "CHINT", "Hyundai Electric", "Toshiba", "Fuji Electric", "Ormazabal"];

const SERVICES = [
  { tag: "Procurement", title: "Single-Source Procurement", desc: "You tell us what you need for your substation, farm, or facility. We go to our network, get multiple quotes across price tiers, and present one clear comparison.", icon: <svg width="44" height="44" viewBox="0 0 48 48" fill="none" stroke={B} strokeWidth="2"><circle cx="24" cy="24" r="8" /><circle cx="24" cy="24" r="3" fill={B} /><line x1="24" y1="8" x2="24" y2="16" /><line x1="24" y1="32" x2="24" y2="40" /><line x1="8" y1="24" x2="16" y2="24" /><line x1="32" y1="24" x2="40" y2="24" /></svg> },
  { tag: "Packaging", title: "Packaged Quotes, Three Tiers", desc: "Every project comes back as three clear options. Each tier is a complete package with total cost, lead times, and warranty. Apples to apples, not a hundred scattered line items.", icon: <svg width="44" height="44" viewBox="0 0 48 48" fill="none"><rect x="10" y="8" width="28" height="10" rx="3" fill={GN} fillOpacity="0.15" stroke={GN} strokeWidth="2" /><circle cx="16" cy="13" r="2" fill={GN} /><rect x="10" y="20" width="28" height="10" rx="3" fill={B} fillOpacity="0.15" stroke={B} strokeWidth="2" /><circle cx="16" cy="25" r="2" fill={B} /><rect x="10" y="32" width="28" height="10" rx="3" fill="#8B5CF6" fillOpacity="0.15" stroke="#8B5CF6" strokeWidth="2" /><circle cx="16" cy="37" r="2" fill="#8B5CF6" /></svg> },
  { tag: "Network", title: "25+ Supplier Relationships", desc: "Direct relationships with every major MV and HV manufacturer globally. We know which factories have capacity, which ones deliver on time, and where to get the best value.", icon: <svg width="44" height="44" viewBox="0 0 48 48" fill="none" stroke={B} strokeWidth="2"><circle cx="24" cy="12" r="6" /><circle cx="12" cy="36" r="6" /><circle cx="36" cy="36" r="6" /><line x1="24" y1="18" x2="24" y2="24" /><line x1="18" y1="30" x2="14" y2="30" /><line x1="30" y1="30" x2="34" y2="30" /><circle cx="24" cy="28" r="3" fill={B} /></svg> },
  { tag: "Delivery", title: "End-to-End Coordination", desc: "From purchase order through factory acceptance testing and logistics to site delivery. We manage the vendor communications and keep your project on schedule.", icon: <svg width="44" height="44" viewBox="0 0 48 48" fill="none" stroke={B} strokeWidth="2"><polyline points="8,36 16,28 24,32 32,20 40,12" strokeLinecap="round" strokeLinejoin="round" /><circle cx="40" cy="12" r="4" fill={B} /></svg> },
  { tag: "Training", title: "Sales Mentoring & Training", desc: "Structured mentoring and sales training built for the electrical industry. We sharpen technical sales skills, objection handling, and deal strategy.", icon: <svg width="44" height="44" viewBox="0 0 48 48" fill="none" stroke={B} strokeWidth="2"><circle cx="24" cy="14" r="6" /><path d="M12 40 C12 30,36 30,36 40" /><path d="M32 18 L36 14 L34 10" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  { tag: "AI", title: "AI-Powered Procurement Automation", desc: "AI tools that automate spec comparison, quote consolidation, supplier matching, and document generation. Faster turnaround, fewer errors.", icon: <svg width="44" height="44" viewBox="0 0 48 48" fill="none" stroke={B} strokeWidth="2"><rect x="10" y="10" width="28" height="28" rx="8" /><circle cx="18" cy="22" r="3" fill={B} /><circle cx="30" cy="22" r="3" fill={B} /><path d="M18 32 Q24 36,30 32" strokeLinecap="round" /></svg> }
];

const STEPS = ["Quote request received", "Documents under review", "Request for information", "Quotes sourced from suppliers", "Quote delivered to client", "Under client review", "Approved / Order placed"];

// FadeIn component
function FadeIn({ children, delay = 0 }) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: 0.12 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(28px)", transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s` }}>{children}</div>;
}

// ProgressTracker component
function ProgressTracker({ currentStep }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {STEPS.map((step, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16, opacity: i > currentStep ? 0.4 : 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: done ? GN : active ? B : "transparent", border: done || active ? "none" : "2px solid rgba(0,0,0,0.12)" }}>
                {done ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> : active ? <div style={{ width: 10, height: 10, borderRadius: "50%", background: "white" }} /> : <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(0,0,0,0.1)" }} />}
              </div>
              {i < STEPS.length - 1 && <div style={{ width: 2, height: 32, background: done ? GN : "rgba(0,0,0,0.08)" }} />}
            </div>
            <div style={{ paddingTop: 4 }}>
              <div style={{ fontSize: 14, fontWeight: done || active ? 600 : 400, color: active ? B : done ? D : G, lineHeight: 1.4 }}>{step}</div>
              {active && <div style={{ fontSize: 12, fontWeight: 500, color: B, marginTop: 2 }}>Current stage</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Quote Submit Portal
function QuoteSubmitPortal({ onClose, onSubmit }) {
  const [tab, setTab] = useState("upload");
  const [files, setFiles] = useState([]);
  const [contact, setContact] = useState({ name: "", email: "", company: "", phone: "", project: "", timeframe: "", quoteType: "Binding", urgency: "Standard", notes: "", siteLocation: "", standards: "" });
  const [formItems, setFormItems] = useState([{ desc: "", qty: 1, unit: "", specs: "" }]);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef(null);

  const addFile = (e) => {
    const newFiles = [...e.target.files].filter(f => /\.(xlsx|xls|pdf|docx|doc)$/i.test(f.name));
    setFiles(p => [...p, ...newFiles.map(f => ({ file: f, name: f.name, type: f.name.split('.').pop().toLowerCase(), size: (f.size / 1024).toFixed(0) + "KB" }))]);
  };
  const removeFile = (i) => setFiles(p => p.filter((_, j) => j !== i));
  const addItem = () => setFormItems(p => [...p, { desc: "", qty: 1, unit: "", specs: "" }]);
  const updateItem = (i, k, v) => setFormItems(p => p.map((it, j) => j === i ? { ...it, [k]: v } : it));
  const removeItem = (i) => setFormItems(p => p.filter((_, j) => j !== i));
  const fileIcon = (t) => t === "pdf" ? "#EF4444" : t.includes("xls") ? "#10B981" : "#0071E3";

  const doSubmit = async () => {
    const submission = {
      id: "CRC-2025-" + (Math.floor(Math.random() * 900) + 100),
      date: new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }),
      tab,
      contact,
      files: files.map(f => f.name),
      items: tab === "fillout" ? formItems : [],
      status: "New",
      clientId: "ERG-2025"
    };
    try {
      await axios.post(`${API}/submissions`, submission);
      onSubmit(submission);
      setSubmitted(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "#fff", overflowY: "auto" }}>
      {/* Nav */}
      <div style={{ position: "sticky", top: 0, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.08)", padding: "0 32px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <CrocLogo size={28} />
          <span style={{ fontSize: 17, fontWeight: 700, color: D, letterSpacing: "-0.01em" }}>CROC</span>
          <span style={{ fontSize: 17, fontWeight: 400, color: G, letterSpacing: "-0.01em" }}>GET A QUOTE</span>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 8 }} data-testid="close-submit-portal">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5L15 15M15 5L5 15" stroke={G} strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
      </div>

      {submitted ? (
        <div style={{ maxWidth: 480, margin: "120px auto", textAlign: "center", padding: "0 32px" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: BL, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M8 16L14 22L24 11" stroke={B} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: D, marginBottom: 12, letterSpacing: "-0.02em" }}>Quote request submitted</h2>
          <p style={{ fontSize: 17, color: G, lineHeight: 1.6, marginBottom: 8 }}>Adam will review your request and be in touch within one business day.</p>
          <p style={{ fontSize: 15, color: G, lineHeight: 1.6, marginBottom: 32 }}>You can track the progress of your quote in the portal.</p>
          <button onClick={onClose} style={{ background: B, color: "#fff", border: "none", padding: "14px 32px", borderRadius: 980, fontSize: 15, fontWeight: 500, cursor: "pointer" }} data-testid="back-to-site-btn">Back to site</button>
        </div>
      ) : (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 32px" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 700, color: D, marginBottom: 12, letterSpacing: "-0.02em" }}>Get a quote</h2>
          <p style={{ fontSize: 17, color: G, lineHeight: 1.6, marginBottom: 32 }}>Upload your documents or fill out the details below. We will come back with three written quotes, engineer-backed.</p>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid rgba(0,0,0,0.08)", marginBottom: 32 }}>
            {[{ k: "upload", l: "Upload my quote" }, { k: "fillout", l: "Fill out my quote" }].map(t => (
              <button key={t.k} onClick={() => setTab(t.k)} style={{ background: "none", border: "none", borderBottom: tab === t.k ? `2px solid ${B}` : "2px solid transparent", padding: "12px 24px", fontSize: 15, fontWeight: tab === t.k ? 600 : 400, color: tab === t.k ? B : G, cursor: "pointer" }} data-testid={`tab-${t.k}`}>{t.l}</button>
            ))}
          </div>

          {tab === "upload" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
              {/* File upload */}
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: D, marginBottom: 8 }}>Upload documents</h3>
                <p style={{ fontSize: 13, color: G, marginBottom: 16 }}>Accepted formats: Excel (.xlsx, .xls), PDF (.pdf), Word (.docx, .doc)</p>
                <input type="file" ref={fileRef} onChange={addFile} accept=".xlsx,.xls,.pdf,.docx,.doc" multiple style={{ display: "none" }} />
                <div onClick={() => fileRef.current?.click()} style={{ border: "2px dashed rgba(0,113,227,0.25)", borderRadius: 16, padding: "40px 24px", textAlign: "center", cursor: "pointer", background: "rgba(0,113,227,0.02)", transition: "all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = B} onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(0,113,227,0.25)"}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = B; e.currentTarget.style.background = "rgba(0,113,227,0.06)"; }}
                  onDragLeave={e => { e.currentTarget.style.borderColor = "rgba(0,113,227,0.25)"; e.currentTarget.style.background = "rgba(0,113,227,0.02)"; }}
                  onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = "rgba(0,113,227,0.25)"; e.currentTarget.style.background = "rgba(0,113,227,0.02)"; if (e.dataTransfer.files) addFile({ target: { files: e.dataTransfer.files } }); }}
                  data-testid="file-drop-zone">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ margin: "0 auto 12px" }}><rect x="8" y="6" width="24" height="28" rx="4" stroke={B} strokeWidth="2" /><path d="M16 22L20 18L24 22" stroke={B} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><line x1="20" y1="18" x2="20" y2="28" stroke={B} strokeWidth="2" /></svg>
                  <div style={{ fontSize: 15, fontWeight: 500, color: B }}>Click to upload or drag and drop</div>
                  <div style={{ fontSize: 13, color: G, marginTop: 4 }}>Excel, PDF, or Word documents</div>
                </div>
                {files.length > 0 && (
                  <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                    {files.map((f, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: LB, borderRadius: 12 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: fileIcon(f.type), textTransform: "uppercase", background: "rgba(0,0,0,0.04)", padding: "4px 8px", borderRadius: 4 }}>{f.type}</span>
                        <span style={{ flex: 1, fontSize: 14, color: D }}>{f.name}</span>
                        <span style={{ fontSize: 12, color: G }}>{f.size}</span>
                        <button onClick={() => removeFile(i)} style={{ background: "none", border: "none", cursor: "pointer", color: G, padding: 4 }} data-testid={`remove-file-${i}`}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact form */}
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: D, marginBottom: 16 }}>Your details</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[{ k: "name", l: "Full name", t: "text" }, { k: "email", l: "Email address", t: "email" }, { k: "company", l: "Company / Organisation", t: "text" }, { k: "phone", l: "Phone number", t: "tel" }, { k: "project", l: "Project name", t: "text" }].map(f => (
                    <div key={f.k}>
                      <label style={{ fontSize: 13, fontWeight: 500, color: D, display: "block", marginBottom: 6 }}>{f.l}</label>
                      <input type={f.t} value={contact[f.k]} onChange={e => setContact({ ...contact, [f.k]: e.target.value })} style={inp} onFocus={onF} onBlur={onB} data-testid={`input-${f.k}`} />
                    </div>
                  ))}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, color: D, display: "block", marginBottom: 6 }}>Quote type</label>
                      <select value={contact.quoteType} onChange={e => setContact({ ...contact, quoteType: e.target.value })} style={{ ...inp, appearance: "auto" }} data-testid="select-quote-type">
                        <option>Binding</option>
                        <option>Non-binding</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, color: D, display: "block", marginBottom: 6 }}>Urgency</label>
                      <select value={contact.urgency} onChange={e => setContact({ ...contact, urgency: e.target.value })} style={{ ...inp, appearance: "auto" }} data-testid="select-urgency">
                        <option>Standard</option>
                        <option>Urgent</option>
                        <option>Critical</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: D, display: "block", marginBottom: 6 }}>Required timeframe</label>
                    <input type="text" value={contact.timeframe} onChange={e => setContact({ ...contact, timeframe: e.target.value })} placeholder="E.g. Delivery by Q3 2025" style={inp} onFocus={onF} onBlur={onB} data-testid="input-timeframe" />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: D, display: "block", marginBottom: 6 }}>Additional notes</label>
                    <textarea value={contact.notes} onChange={e => setContact({ ...contact, notes: e.target.value })} style={{ ...inp, resize: "vertical", minHeight: 80 }} onFocus={onF} onBlur={onB} data-testid="input-notes" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Fill out form */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginBottom: 32 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: D, marginBottom: 16 }}>Project details</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {[{ k: "name", l: "Full name", t: "text" }, { k: "email", l: "Email address", t: "email" }, { k: "company", l: "Company / Organisation", t: "text" }, { k: "phone", l: "Phone number", t: "tel" }, { k: "project", l: "Project name", t: "text" }].map(f => (
                      <div key={f.k}>
                        <label style={{ fontSize: 13, fontWeight: 500, color: D, display: "block", marginBottom: 6 }}>{f.l}</label>
                        <input type={f.t} value={contact[f.k]} onChange={e => setContact({ ...contact, [f.k]: e.target.value })} style={inp} onFocus={onF} onBlur={onB} data-testid={`fillout-${f.k}`} />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: D, marginBottom: 16 }}>Requirements</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: D, display: "block", marginBottom: 6 }}>Quote type</label>
                        <select value={contact.quoteType} onChange={e => setContact({ ...contact, quoteType: e.target.value })} style={{ ...inp, appearance: "auto" }} data-testid="fillout-quote-type">
                          <option>Binding</option>
                          <option>Non-binding</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: D, display: "block", marginBottom: 6 }}>Urgency</label>
                        <select value={contact.urgency} onChange={e => setContact({ ...contact, urgency: e.target.value })} style={{ ...inp, appearance: "auto" }} data-testid="fillout-urgency">
                          <option>Standard</option>
                          <option>Urgent</option>
                          <option>Critical</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, color: D, display: "block", marginBottom: 6 }}>Required timeframe</label>
                      <input type="text" value={contact.timeframe} onChange={e => setContact({ ...contact, timeframe: e.target.value })} placeholder="E.g. Delivery by Q3 2025" style={inp} onFocus={onF} onBlur={onB} data-testid="fillout-timeframe" />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, color: D, display: "block", marginBottom: 6 }}>Site location</label>
                      <input type="text" value={contact.siteLocation} onChange={e => setContact({ ...contact, siteLocation: e.target.value })} style={inp} onFocus={onF} onBlur={onB} data-testid="fillout-site-location" />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, color: D, display: "block", marginBottom: 6 }}>Applicable standards</label>
                      <input type="text" value={contact.standards} onChange={e => setContact({ ...contact, standards: e.target.value })} style={inp} onFocus={onF} onBlur={onB} data-testid="fillout-standards" />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, color: D, display: "block", marginBottom: 6 }}>Additional notes</label>
                      <textarea value={contact.notes} onChange={e => setContact({ ...contact, notes: e.target.value })} style={{ ...inp, resize: "vertical", minHeight: 80 }} onFocus={onF} onBlur={onB} data-testid="fillout-notes" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Line items */}
              <h3 style={{ fontSize: 18, fontWeight: 600, color: D, marginBottom: 16 }}>Line items</h3>
              <div style={{ background: LB, borderRadius: 16, padding: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 120px 1fr 40px", gap: 10, marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: G, textTransform: "uppercase" }}>Description</div>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: G, textTransform: "uppercase" }}>Qty</div>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: G, textTransform: "uppercase" }}>Unit / Size</div>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: G, textTransform: "uppercase" }}>Specifications</div>
                  <div></div>
                </div>
                {formItems.map((item, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 120px 1fr 40px", gap: 10, marginBottom: 10 }}>
                    <input value={item.desc} onChange={e => updateItem(i, "desc", e.target.value)} placeholder="Equipment description" style={{ ...inp, background: "#fff" }} onFocus={onF} onBlur={onB} data-testid={`item-desc-${i}`} />
                    <input type="number" value={item.qty} onChange={e => updateItem(i, "qty", parseInt(e.target.value) || 1)} style={{ ...inp, background: "#fff" }} onFocus={onF} onBlur={onB} data-testid={`item-qty-${i}`} />
                    <input value={item.unit} onChange={e => updateItem(i, "unit", e.target.value)} placeholder="e.g. 33kV" style={{ ...inp, background: "#fff" }} onFocus={onF} onBlur={onB} data-testid={`item-unit-${i}`} />
                    <input value={item.specs} onChange={e => updateItem(i, "specs", e.target.value)} placeholder="Technical specifications" style={{ ...inp, background: "#fff" }} onFocus={onF} onBlur={onB} data-testid={`item-specs-${i}`} />
                    <button onClick={() => removeItem(i)} disabled={formItems.length === 1} style={{ background: "none", border: "none", cursor: formItems.length === 1 ? "not-allowed" : "pointer", opacity: formItems.length === 1 ? 0.3 : 1, padding: 8 }} data-testid={`remove-item-${i}`}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke={G} strokeWidth="2" strokeLinecap="round" /></svg>
                    </button>
                  </div>
                ))}
                <button onClick={addItem} style={{ width: "100%", padding: 12, border: "2px dashed rgba(0,0,0,0.12)", borderRadius: 12, background: "transparent", fontSize: 14, fontWeight: 500, color: B, cursor: "pointer", marginTop: 8 }} data-testid="add-line-item">+ Add line item</button>
              </div>
            </div>
          )}

          {/* Submit bar */}
          <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", marginTop: 40, paddingTop: 24, display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button onClick={onClose} style={{ padding: "12px 24px", border: "none", borderRadius: 12, background: LB, fontSize: 15, fontWeight: 500, color: G, cursor: "pointer" }} data-testid="cancel-submit">Cancel</button>
            <button onClick={doSubmit} style={{ padding: "12px 24px", border: "none", borderRadius: 12, background: B, fontSize: 15, fontWeight: 500, color: "#fff", cursor: "pointer" }} data-testid="submit-quote-btn">Submit quote request</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Quote Portal
function QuotePortal({ onClose }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginId, setLoginId] = useState("ERG-2025");
  const [loginPw, setLoginPw] = useState("demo1234");
  const [loginError, setLoginError] = useState("");
  const [clientName, setClientName] = useState("");
  const [quotes, setQuotes] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [detailTab, setDetailTab] = useState("progress");
  const [portalTab, setPortalTab] = useState("active");
  const [rfiResponses, setRfiResponses] = useState({});
  const [generatingAI, setGeneratingAI] = useState({});

  const doLogin = async () => {
    if (!loginId || !loginPw) { setLoginError("Please enter both fields"); return; }
    try {
      const res = await axios.post(`${API}/auth/login`, { clientId: loginId, password: loginPw });
      if (res.data.success) {
        setClientName(res.data.clientName);
        setLoggedIn(true);
        setLoginError("");
        // Load quotes and submissions
        const [quotesRes, subsRes] = await Promise.all([
          axios.get(`${API}/quotes/${loginId}`),
          axios.get(`${API}/submissions/${loginId}`)
        ]);
        setQuotes(quotesRes.data);
        setSubmissions(subsRes.data);
      } else {
        setLoginError(res.data.message || "Login failed");
      }
    } catch (e) {
      setLoginError("Login failed");
    }
  };

  const approveQuote = async (quoteId) => {
    try {
      await axios.post(`${API}/quote/${quoteId}/approve`);
      setQuotes(q => q.map(quote => quote.id === quoteId ? { ...quote, approved: true, currentStep: 6 } : quote));
      if (selectedQuote?.id === quoteId) {
        setSelectedQuote({ ...selectedQuote, approved: true, currentStep: 6 });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const submitRFI = async (quoteId, rfiIndex) => {
    const response = rfiResponses[`${quoteId}-${rfiIndex}`];
    if (!response) return;
    try {
      await axios.post(`${API}/quote/${quoteId}/rfi/${rfiIndex}/respond`, { response });
      const today = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
      setQuotes(q => q.map(quote => {
        if (quote.id === quoteId) {
          const newRfi = [...quote.rfi];
          newRfi[rfiIndex] = { ...newRfi[rfiIndex], response, responseDate: today };
          return { ...quote, rfi: newRfi };
        }
        return quote;
      }));
      if (selectedQuote?.id === quoteId) {
        const newRfi = [...selectedQuote.rfi];
        newRfi[rfiIndex] = { ...newRfi[rfiIndex], response, responseDate: today };
        setSelectedQuote({ ...selectedQuote, rfi: newRfi });
      }
      setRfiResponses(r => ({ ...r, [`${quoteId}-${rfiIndex}`]: "" }));
    } catch (e) {
      console.error(e);
    }
  };

  const generateAI = async (submissionId) => {
    setGeneratingAI(g => ({ ...g, [submissionId]: true }));
    try {
      const res = await axios.post(`${API}/ai/generate`, { submissionId });
      setSubmissions(s => s.map(sub => sub.id === submissionId ? { ...sub, aiOutput: res.data.output } : sub));
    } catch (e) {
      console.error(e);
    }
    setGeneratingAI(g => ({ ...g, [submissionId]: false }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const total = (items) => items.reduce((s, i) => s + (i.qty * i.unit), 0);
  const pendingRFI = (rfi) => rfi.filter(r => !r.response).length;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "#fff", overflowY: "auto" }}>
      {/* Nav */}
      <div style={{ position: "sticky", top: 0, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.08)", padding: "0 32px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <CrocLogo size={28} />
          <span style={{ fontSize: 17, fontWeight: 700, color: D, letterSpacing: "-0.01em" }}>CROC</span>
          <span style={{ fontSize: 17, fontWeight: 400, color: G, letterSpacing: "-0.01em" }}>QUOTE PORTAL</span>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 8 }} data-testid="close-portal">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5L15 15M15 5L5 15" stroke={G} strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
      </div>

      {!loggedIn ? (
        /* Login screen */
        <div style={{ maxWidth: 400, margin: "120px auto", padding: "0 32px" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <CrocLogo size={48} />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: D, textAlign: "center", marginBottom: 8, letterSpacing: "-0.02em" }}>View my quote</h2>
          <p style={{ fontSize: 15, color: G, textAlign: "center", marginBottom: 32 }}>Enter your client number and password.</p>
          {loginError && <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 14, color: "#DC2626" }}>{loginError}</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: D, display: "block", marginBottom: 6 }}>Client number</label>
              <input type="text" value={loginId} onChange={e => setLoginId(e.target.value)} style={inp} onFocus={onF} onBlur={onB} data-testid="login-client-id" />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: D, display: "block", marginBottom: 6 }}>Password</label>
              <input type="password" value={loginPw} onChange={e => setLoginPw(e.target.value)} style={inp} onFocus={onF} onBlur={onB} onKeyDown={e => e.key === "Enter" && doLogin()} data-testid="login-password" />
            </div>
            <button onClick={doLogin} style={{ width: "100%", padding: "14px 24px", border: "none", borderRadius: 12, background: B, fontSize: 15, fontWeight: 500, color: "#fff", cursor: "pointer", marginTop: 8 }} data-testid="login-btn">Log in</button>
          </div>
          <p style={{ fontSize: 13, color: G, textAlign: "center", marginTop: 24 }}>Demo: ERG-2025 / demo1234</p>
        </div>
      ) : selectedQuote ? (
        /* Quote detail */
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 32px" }}>
          <button onClick={() => setSelectedQuote(null)} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, color: B, marginBottom: 24 }} data-testid="back-to-quotes">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke={B} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Back to quotes
          </button>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, fontFamily: "monospace", color: B }} data-testid="quote-id">{selectedQuote.id}</span>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 980, background: selectedQuote.type === "Binding" ? BL : "#FEF3C7", color: selectedQuote.type === "Binding" ? B : "#92400E" }}>{selectedQuote.type}</span>
                {selectedQuote.approved && <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 980, background: "#ECFDF5", color: GN }}>Approved</span>}
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: D, marginBottom: 8, letterSpacing: "-0.02em" }}>{selectedQuote.project}</h2>
              <p style={{ fontSize: 14, color: G }}>{selectedQuote.client} - Raised {selectedQuote.dateRaised}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: D, letterSpacing: "-0.02em" }}>{fmt(total(selectedQuote.items))}</div>
              <div style={{ fontSize: 13, color: G }}>ex. GST</div>
            </div>
          </div>

          {/* Warning banners */}
          {selectedQuote.type === "Binding" && selectedQuote.expiryDate && !selectedQuote.approved && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 12, padding: "12px 16px", marginBottom: 24 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="#92400E" strokeWidth="2" /><path d="M10 6V10L12 12" stroke="#92400E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span style={{ fontSize: 14, color: "#92400E" }}>PO must be received by {selectedQuote.expiryDate}</span>
            </div>
          )}
          {selectedQuote.type === "Non-binding" && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: BL, border: "1px solid rgba(0,113,227,0.15)", borderRadius: 12, padding: "12px 16px", marginBottom: 24 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke={B} strokeWidth="2" /><path d="M10 6V11" stroke={B} strokeWidth="2" strokeLinecap="round" /><circle cx="10" cy="14" r="1" fill={B} /></svg>
              <span style={{ fontSize: 14, color: B }}>Non-binding estimate, +/- 10%</span>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(0,0,0,0.08)", marginBottom: 24 }}>
            {[{ k: "progress", l: "Progress" }, { k: "items", l: "Line items" }, { k: "rfi", l: `RFI (${selectedQuote.rfi.length})` }].map(t => (
              <button key={t.k} onClick={() => setDetailTab(t.k)} style={{ background: "none", border: "none", borderBottom: detailTab === t.k ? `2px solid ${B}` : "2px solid transparent", padding: "12px 24px", fontSize: 14, fontWeight: detailTab === t.k ? 600 : 400, color: detailTab === t.k ? B : G, cursor: "pointer" }} data-testid={`detail-tab-${t.k}`}>{t.l}</button>
            ))}
          </div>

          {detailTab === "progress" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
              <ProgressTracker currentStep={selectedQuote.currentStep} />
              <div style={{ background: LB, borderRadius: 16, padding: 28 }}>
                {[
                  ["Quote ID", selectedQuote.id],
                  ["Project", selectedQuote.project],
                  ["Client", selectedQuote.client],
                  ["Date raised", selectedQuote.dateRaised],
                  ["Quote type", selectedQuote.type],
                  ["Total value", fmt(total(selectedQuote.items))],
                  ["Status", selectedQuote.approved ? "Approved" : STEPS[selectedQuote.currentStep]]
                ].map(([l, v], i, arr) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}>
                    <span style={{ fontSize: 13, color: G }}>{l}</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: D }}>{v}</span>
                  </div>
                ))}
                {selectedQuote.currentStep >= 4 && !selectedQuote.approved && (
                  <button onClick={() => approveQuote(selectedQuote.id)} style={{ width: "100%", marginTop: 20, padding: "14px 24px", border: "none", borderRadius: 12, background: GN, fontSize: 15, fontWeight: 500, color: "#fff", cursor: "pointer" }} data-testid="approve-quote-btn">Approve quote</button>
                )}
                {selectedQuote.approved && (
                  <div style={{ textAlign: "center", marginTop: 20, padding: "14px 24px", background: "#ECFDF5", borderRadius: 12, fontSize: 15, fontWeight: 500, color: GN }}>Quote approved</div>
                )}
              </div>
            </div>
          )}

          {detailTab === "items" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 100px 100px 120px", gap: 12, padding: "12px 0", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: G, textTransform: "uppercase" }}>Description</div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: G, textTransform: "uppercase" }}>Qty</div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: G, textTransform: "uppercase" }}>Unit</div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: G, textTransform: "uppercase" }}>Supplier</div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: G, textTransform: "uppercase", textAlign: "right" }}>Total</div>
              </div>
              {selectedQuote.items.map((item, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 70px 100px 100px 120px", gap: 12, padding: "14px 0", background: i % 2 === 0 ? "#fff" : "transparent", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                  <div style={{ fontSize: 14, color: D }}>{item.desc}</div>
                  <div style={{ fontSize: 14, color: D }}>{item.qty}</div>
                  <div style={{ fontSize: 14, color: D }}>{fmt(item.unit)}</div>
                  <div style={{ fontSize: 14, color: D }}>{item.supplier}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: D, textAlign: "right" }}>{fmt(item.qty * item.unit)}</div>
                </div>
              ))}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 12, padding: "16px 0", borderTop: "2px solid rgba(0,0,0,0.08)" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: D }}>Total (ex. GST)</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: D, textAlign: "right" }}>{fmt(total(selectedQuote.items))}</div>
              </div>
            </div>
          )}

          {detailTab === "rfi" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {selectedQuote.rfi.length === 0 ? (
                <p style={{ fontSize: 15, color: G, textAlign: "center", padding: 40 }}>No RFIs for this quote</p>
              ) : selectedQuote.rfi.map((rfi, i) => (
                <div key={i} style={{ background: LB, borderRadius: 16, padding: 24, border: !rfi.response ? `1px solid ${AM}33` : "1px solid transparent" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: B }}>{rfi.fromSender}</span>
                      <span style={{ fontSize: 12, color: G }}>{rfi.date}</span>
                    </div>
                    {rfi.response ? (
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 980, background: "#ECFDF5", color: GN }}>Resolved</span>
                    ) : (
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 980, background: "#FEF2F2", color: RD }}>Response required</span>
                    )}
                  </div>
                  <p style={{ fontSize: 15, color: D, lineHeight: 1.6, marginBottom: rfi.response ? 16 : 0 }}>{rfi.message}</p>
                  {rfi.response ? (
                    <div style={{ borderLeft: `3px solid ${GN}`, paddingLeft: 16, marginTop: 16 }}>
                      <p style={{ fontSize: 14, color: D, lineHeight: 1.5, marginBottom: 4 }}>{rfi.response}</p>
                      <span style={{ fontSize: 12, color: G }}>{rfi.responseDate}</span>
                    </div>
                  ) : (
                    <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
                      <input
                        type="text"
                        value={rfiResponses[`${selectedQuote.id}-${i}`] || ""}
                        onChange={e => setRfiResponses(r => ({ ...r, [`${selectedQuote.id}-${i}`]: e.target.value }))}
                        placeholder="Type your response..."
                        style={{ ...inp, flex: 1, background: "#fff" }}
                        onFocus={onF}
                        onBlur={onB}
                        data-testid={`rfi-response-${i}`}
                      />
                      <button onClick={() => submitRFI(selectedQuote.id, i)} style={{ padding: "12px 24px", border: "none", borderRadius: 12, background: B, fontSize: 14, fontWeight: 500, color: "#fff", cursor: "pointer" }} data-testid={`rfi-submit-${i}`}>Send</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Dashboard */
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <div>
              <p style={{ fontSize: 13, color: G, marginBottom: 4 }}>Logged in as</p>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: D, letterSpacing: "-0.02em" }}>{clientName}</h2>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[{ k: "active", l: "Active quotes" }, { k: "submissions", l: `Submissions (${submissions.length})` }].map(t => (
                <button key={t.k} onClick={() => setPortalTab(t.k)} style={{ padding: "8px 16px", border: "none", borderRadius: 980, background: portalTab === t.k ? B : "transparent", fontSize: 13, fontWeight: 500, color: portalTab === t.k ? "#fff" : G, cursor: "pointer" }} data-testid={`portal-tab-${t.k}`}>{t.l}</button>
              ))}
            </div>
          </div>

          {portalTab === "active" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {quotes.map(q => (
                <div key={q.id} onClick={() => { setSelectedQuote(q); setDetailTab("progress"); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 28px", background: "#fff", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 16, cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = B; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,113,227,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.06)"; e.currentTarget.style.boxShadow = "none"; }}
                  data-testid={`quote-card-${q.id}`}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "monospace", color: B }}>{q.id}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 980, background: q.type === "Binding" ? BL : "#FEF3C7", color: q.type === "Binding" ? B : "#92400E" }}>{q.type}</span>
                      {q.approved && <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 980, background: "#ECFDF5", color: GN }}>Approved</span>}
                      {pendingRFI(q.rfi) > 0 && <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 980, background: "#FEF2F2", color: RD }}>RFI pending</span>}
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 600, color: D, marginBottom: 4, letterSpacing: "-0.02em" }}>{q.project}</h3>
                    <p style={{ fontSize: 14, color: G }}>{q.client} - Raised {q.dateRaised}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: D, letterSpacing: "-0.02em" }}>{fmt(total(q.items))}</div>
                    <div style={{ fontSize: 13, color: G }}>ex. GST</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {submissions.length === 0 ? (
                <p style={{ fontSize: 15, color: G, textAlign: "center", padding: 40 }}>No submissions yet</p>
              ) : submissions.map(sub => (
                <div key={sub.id} style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 16, padding: "24px 28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "monospace", color: B }}>{sub.id}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 980, background: BL, color: B }}>{sub.status}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 980, background: sub.contact.quoteType === "Binding" ? BL : "#FEF3C7", color: sub.contact.quoteType === "Binding" ? B : "#92400E" }}>{sub.contact.quoteType}</span>
                      </div>
                      <h3 style={{ fontSize: 17, fontWeight: 600, color: D, marginBottom: 4 }}>{sub.contact.project || "Untitled project"}</h3>
                      <p style={{ fontSize: 14, color: G }}>{sub.contact.company} - {sub.date}</p>
                      <p style={{ fontSize: 13, color: G, marginTop: 4 }}>{sub.files.length > 0 ? `${sub.files.length} file(s) uploaded` : `${sub.items.length} line item(s)`}</p>
                    </div>
                    <button onClick={() => generateAI(sub.id)} disabled={generatingAI[sub.id]} style={{ padding: "10px 20px", border: "none", borderRadius: 12, background: B, fontSize: 13, fontWeight: 500, color: "#fff", cursor: generatingAI[sub.id] ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 8 }} data-testid={`generate-ai-${sub.id}`}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="3" stroke="white" strokeWidth="1.5" /><path d="M5 8L7 10L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      {generatingAI[sub.id] ? "Generating..." : "Generate AI quote"}
                    </button>
                  </div>
                  {sub.items.length > 0 && (
                    <div style={{ background: LB, borderRadius: 12, padding: 16, marginTop: 12 }}>
                      {sub.items.slice(0, 3).map((item, i) => (
                        <div key={i} style={{ fontSize: 13, color: D, padding: "6px 0", borderBottom: i < Math.min(sub.items.length, 3) - 1 ? "1px solid rgba(0,0,0,0.04)" : "none" }}>
                          {item.desc || "No description"} - Qty: {item.qty}
                        </div>
                      ))}
                      {sub.items.length > 3 && <div style={{ fontSize: 13, color: G, marginTop: 8 }}>+{sub.items.length - 3} more items</div>}
                    </div>
                  )}
                  {sub.aiOutput && (
                    <div style={{ marginTop: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, background: "linear-gradient(135deg, #4FC3F7 0%, #9C5CF5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI-Generated RFQ</span>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => generateAI(sub.id)} style={{ padding: "6px 12px", border: "none", borderRadius: 8, background: LB, fontSize: 12, fontWeight: 500, color: G, cursor: "pointer" }} data-testid={`regenerate-${sub.id}`}>Regenerate</button>
                          <button onClick={() => copyToClipboard(sub.aiOutput)} style={{ padding: "6px 12px", border: "none", borderRadius: 8, background: LB, fontSize: 12, fontWeight: 500, color: G, cursor: "pointer" }} data-testid={`copy-${sub.id}`}>Copy</button>
                        </div>
                      </div>
                      <textarea value={sub.aiOutput} onChange={e => setSubmissions(s => s.map(x => x.id === sub.id ? { ...x, aiOutput: e.target.value } : x))} style={{ width: "100%", minHeight: 300, padding: 16, borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)", fontSize: 13, fontFamily: "monospace", lineHeight: 1.6, resize: "vertical", outline: "none", boxSizing: "border-box" }} data-testid={`ai-output-${sub.id}`} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Main App
function App() {
  const [showForm, setShowForm] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const submitForm = async () => {
    try {
      await axios.post(`${API}/contact`, form);
      setSent(true);
      setTimeout(() => { setShowForm(false); setSent(false); setForm({ name: "", email: "", company: "", phone: "", message: "" }); }, 2800);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmission = (submission) => {
    setSubmissions(s => [...s, submission]);
  };

  // Show portals
  if (showPortal) return <QuotePortal onClose={() => setShowPortal(false)} />;
  if (showSubmit) return <QuoteSubmitPortal onClose={() => setShowSubmit(false)} onSubmit={handleSubmission} />;

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Helvetica, sans-serif", WebkitFontSmoothing: "antialiased", margin: 0, padding: 0 }}>
      {/* Global styles */}
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::selection { background: #0071E3; color: #fff; }
      `}</style>

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, height: 56, zIndex: 100, background: scrolled ? "rgba(255,255,255,0.88)" : "transparent", backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none", WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none", borderBottom: scrolled ? "1px solid rgba(0,0,0,0.08)" : "1px solid transparent", transition: "all 0.3s ease" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 32px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} data-testid="logo">
            <CrocLogo size={32} />
            <span style={{ fontSize: 17, fontWeight: 700, color: D, letterSpacing: "-0.01em" }}>CROC</span>
            <span style={{ fontSize: 17, fontWeight: 400, color: G, letterSpacing: "-0.01em" }}>CONSULTING</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {["Services", "How it works", "About"].map(link => (
              <button key={link} onClick={() => scrollTo(link.toLowerCase().replace(/ /g, "-"))} style={{ background: "none", border: "none", fontSize: 13, fontWeight: 500, color: G, cursor: "pointer", padding: "8px 0", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = D} onMouseLeave={e => e.target.style.color = G} data-testid={`nav-${link.toLowerCase().replace(/ /g, "-")}`}>{link}</button>
            ))}
            <button onClick={() => setShowSubmit(true)} style={{ padding: "8px 20px", border: "none", borderRadius: 980, background: GN, fontSize: 13, fontWeight: 500, color: "#fff", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.target.style.background = "#059669"} onMouseLeave={e => e.target.style.background = GN} data-testid="nav-get-quote">Get a quote</button>
            <button onClick={() => setShowPortal(true)} style={{ padding: "8px 20px", border: "none", borderRadius: 980, background: BD, fontSize: 13, fontWeight: 500, color: "#fff", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.target.style.background = "#003D7A"} onMouseLeave={e => e.target.style.background = BD} data-testid="nav-view-quote">View my quote</button>
            <button onClick={() => setShowForm(true)} style={{ padding: "8px 20px", border: "none", borderRadius: 980, background: B, fontSize: 13, fontWeight: 500, color: "#fff", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.target.style.background = BD} onMouseLeave={e => e.target.style.background = B} data-testid="nav-book-appointment">Book an appointment</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(180deg, #fff 0%, ${BL} 100%)`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: `radial-gradient(${B} 1px, transparent 1px)`, backgroundSize: "32px 32px" }} />
        <div style={{ textAlign: "center", maxWidth: 800, padding: "120px 32px 80px", position: "relative" }}>
          <FadeIn delay={0}><CrocLogo size={72} /></FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ display: "inline-block", padding: "8px 16px", borderRadius: 980, background: "rgba(0,113,227,0.08)", fontSize: 13, fontWeight: 500, color: B, marginTop: 28, marginBottom: 24 }}>Outsourced MV & HV equipment procurement</div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <h1 style={{ fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.06, color: D, marginBottom: 20 }}>
              One call. <span style={{ background: "linear-gradient(135deg, #4FC3F7 0%, #9C5CF5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Every supplier.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.25}>
            <p style={{ fontSize: "clamp(17px, 2vw, 21px)", fontWeight: 400, lineHeight: 1.55, color: G, maxWidth: 640, margin: "0 auto 32px" }}>Your team is lean. Your procurement needs are not. One phone call gets you three written quotes, engineer-backed and ready for sign-off.</p>
          </FadeIn>
          <FadeIn delay={0.35}>
            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              <button onClick={() => setShowSubmit(true)} style={{ padding: "16px 32px", border: "none", borderRadius: 980, background: B, fontSize: 15, fontWeight: 500, color: "#fff", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,113,227,0.25)", transition: "all 0.2s" }} onMouseEnter={e => { e.target.style.background = BD; e.target.style.transform = "scale(1.04)"; }} onMouseLeave={e => { e.target.style.background = B; e.target.style.transform = "scale(1)"; }} data-testid="hero-get-quote">Get a quote now</button>
              <button onClick={() => setShowForm(true)} style={{ padding: "16px 32px", border: "none", borderRadius: 980, background: "rgba(0,113,227,0.08)", fontSize: 15, fontWeight: 500, color: B, cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.target.style.background = "rgba(0,113,227,0.14)"} onMouseLeave={e => e.target.style.background = "rgba(0,113,227,0.08)"} data-testid="hero-book-appointment">Book an appointment</button>
            </div>
          </FadeIn>
          <FadeIn delay={0.5}>
            <div style={{ marginTop: 56 }}>
              <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", color: G, textTransform: "uppercase", marginBottom: 16 }}>Trusted supplier network</p>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, maxWidth: 640, margin: "0 auto" }}>
                {SUPPLIERS.map(s => <span key={s} style={{ fontSize: 14, fontWeight: 500, color: "rgba(0,0,0,0.3)" }}>{s}</span>)}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Services */}
      <section id="services" style={{ padding: "100px 32px", background: "#fff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <FadeIn>
            <p style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.08em", color: B, textTransform: "uppercase", marginBottom: 12 }}>Services</p>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, color: D, marginBottom: 12 }}>Procurement. Training. Automation.</h2>
            <p style={{ fontSize: 17, color: G, marginBottom: 48 }}>No retainers, no overhead. Commission-based. Our procurement service costs you nothing.</p>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {SERVICES.map((s, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div style={{ background: LB, borderRadius: 20, padding: 36, border: "1px solid transparent", transition: "all 0.3s ease", cursor: "default" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.border = "1px solid rgba(0,113,227,0.15)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,113,227,0.08)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = LB; e.currentTarget.style.border = "1px solid transparent"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <div style={{ marginBottom: 20 }}>{s.icon}</div>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: B, textTransform: "uppercase", marginBottom: 8 }}>{s.tag}</p>
                  <h3 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.25, color: D, marginBottom: 12 }}>{s.title}</h3>
                  <p style={{ fontSize: 15, fontWeight: 400, lineHeight: 1.6, color: G }}>{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ padding: "100px 32px", background: D }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <FadeIn>
            <p style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.08em", color: B, textTransform: "uppercase", marginBottom: 12 }}>How it works</p>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#fff", marginBottom: 40 }}>Stop chasing quotes.<br />Start approving them.</h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <p style={{ fontSize: 18, fontWeight: 400, lineHeight: 1.7, color: "rgba(255,255,255,0.6)" }}>Every procurement policy has the same requirement: get multiple written quotes before you can approve the spend. That means someone in your business is ringing around to 16 different companies, chasing responses, comparing specs, and losing weeks on admin that has nothing to do with their actual job.</p>
              <p style={{ fontSize: 18, fontWeight: 400, lineHeight: 1.7, color: "rgba(255,255,255,0.6)" }}>Croc Consulting replaces all of that with one phone call. You tell us what you need. We come back with three written quotes for every line item, each one reviewed and backed by qualified engineers to ensure technical accuracy, compliance, and like-for-like comparison.</p>
              <p style={{ fontSize: 18, fontWeight: 400, lineHeight: 1.7, color: "rgba(255,255,255,0.6)" }}>You review the package. Cross out what you do not want. Approve what you do. We place the order. Done.</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 48, paddingTop: 40 }}>
              <p style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>Three quotes. One call. <span style={{ background: "linear-gradient(135deg, #4FC3F7 0%, #9C5CF5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Engineer-backed.</span></p>
            </div>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 32, marginTop: 48 }}>
              {[["25+", "Supplier relationships"], ["40+", "Years in the industry"], ["$0", "Cost to you"], ["100%", "Vendor neutral"]].map(([n, l]) => (
                <div key={l} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-0.03em", color: B }}>{n}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>{l}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* About */}
      <section id="about" style={{ padding: "100px 32px", background: "#fff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80 }}>
          <FadeIn>
            <p style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.08em", color: B, textTransform: "uppercase", marginBottom: 12 }}>About</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, color: D, marginBottom: 24 }}>Adam Croxton</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <p style={{ fontSize: 17, fontWeight: 400, lineHeight: 1.65, color: G }}>With over 40 years in the electrical industry spanning technical sales, support, and procurement across medium-voltage, high-voltage, and secondary systems at leading OEMs including Siemens, Adam has built direct relationships with the people who design, manufacture, and ship this equipment.</p>
              <p style={{ fontSize: 17, fontWeight: 400, lineHeight: 1.65, color: G }}>Croc Consulting exists because most substations, farms, and infrastructure operators do not have a dedicated procurement team. They are resource-poor but their equipment needs are anything but simple. Adam bridges that gap: one phone call replaces weeks of chasing quotes.</p>
              <p style={{ fontSize: 17, fontWeight: 400, lineHeight: 1.65, color: G }}>Based in Brisbane. Serving clients across Australia and the Asia-Pacific.</p>
            </div>
            <button onClick={() => setShowForm(true)} style={{ marginTop: 32, padding: "14px 28px", border: "none", borderRadius: 980, background: B, fontSize: 15, fontWeight: 500, color: "#fff", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.target.style.background = BD} onMouseLeave={e => e.target.style.background = B} data-testid="about-get-in-touch">Get in touch</button>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div style={{ background: LB, borderRadius: 24, padding: 48 }}>
              {[
                ["Experience", "40+ years in the electrical industry"],
                ["Background", "Technical Sales, Support & Procurement, MV/HV"],
                ["OEM", "Siemens and leading global manufacturers"],
                ["Specialisation", "Switchgear, protection, transmission"],
                ["Education", "University of the Sunshine Coast"],
                ["Location", "Brisbane, Australia"],
                ["Model", "Commission-based, no cost to buyer"]
              ].map(([l, v], i, arr) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", color: G, textTransform: "uppercase" }}>{l}</span>
                  <span style={{ fontSize: 15, fontWeight: 500, color: D, textAlign: "right", maxWidth: "60%" }}>{v}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Supplier Network */}
      <section style={{ padding: "80px 32px", background: LB }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <p style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.08em", color: B, textTransform: "uppercase", marginBottom: 12 }}>Network</p>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, color: D, marginBottom: 40 }}>One call reaches all of them.</h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
              {SUPPLIERS.map(s => (
                <div key={s} style={{ padding: "14px 28px", borderRadius: 12, background: "#fff", border: "1px solid rgba(0,0,0,0.06)", fontSize: 15, fontWeight: 600, color: D, cursor: "default", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.target.style.borderColor = B; e.target.style.color = B; e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 4px 12px rgba(0,113,227,0.08)"; }}
                  onMouseLeave={e => { e.target.style.borderColor = "rgba(0,0,0,0.06)"; e.target.style.color = D; e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "none"; }}>
                  {s}
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 32px", background: `linear-gradient(180deg, #fff 0%, ${BL} 100%)`, textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <FadeIn><CrocLogo size={48} /></FadeIn>
          <FadeIn delay={0.1}>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, color: D, marginTop: 24, marginBottom: 12 }}>Ready to simplify your procurement?</h2>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p style={{ fontSize: 17, color: G, marginBottom: 32 }}>Tell us what you need. Three quotes, engineer-backed, no cost to you.</p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              <button onClick={() => setShowSubmit(true)} style={{ padding: "16px 32px", border: "none", borderRadius: 980, background: B, fontSize: 15, fontWeight: 500, color: "#fff", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,113,227,0.25)", transition: "all 0.2s" }} onMouseEnter={e => { e.target.style.background = BD; e.target.style.transform = "scale(1.04)"; }} onMouseLeave={e => { e.target.style.background = B; e.target.style.transform = "scale(1)"; }} data-testid="cta-get-quote">Get a quote now</button>
              <button onClick={() => setShowForm(true)} style={{ padding: "16px 32px", border: "none", borderRadius: 980, background: "rgba(0,113,227,0.08)", fontSize: 15, fontWeight: 500, color: B, cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.target.style.background = "rgba(0,113,227,0.14)"} onMouseLeave={e => e.target.style.background = "rgba(0,113,227,0.08)"} data-testid="cta-book-appointment">Book an appointment</button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: D, padding: "60px 32px 40px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 40 }}>
            <div style={{ maxWidth: 320 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <CrocLogo size={28} />
                <span style={{ fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>CROC</span>
                <span style={{ fontSize: 17, fontWeight: 400, color: G, letterSpacing: "-0.01em" }}>CONSULTING</span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 400, lineHeight: 1.6, color: "rgba(255,255,255,0.5)" }}>Outsourced procurement for MV and HV equipment. Commission-based. No cost to you.</p>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 16 }}>Contact</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <a href="mailto:Adam.croxton@outlook.com" style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Adam.croxton@outlook.com</a>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>+61 (0) 400 000 000</span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Brisbane, Australia</span>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 48, paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>2025 Croc Consulting. All rights reserved.</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>ABN 00 000 000 000</span>
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => { setShowForm(false); setSent(false); }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 48, maxWidth: 480, width: "90%", boxShadow: "0 24px 80px rgba(0,0,0,0.18)", animation: "slideUp 0.3s ease" }} onClick={e => e.stopPropagation()}>
            <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            <button onClick={() => { setShowForm(false); setSent(false); }} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", padding: 8 }} data-testid="close-modal">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5L15 15M15 5L5 15" stroke={G} strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
            {sent ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: BL, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M8 16L14 22L24 11" stroke={B} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <h3 style={{ fontSize: 24, fontWeight: 700, color: D, marginBottom: 8 }}>Thank you</h3>
                <p style={{ fontSize: 15, color: G }}>Adam will be in touch within one business day.</p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <CrocLogo size={28} />
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 600, color: D }}>Book an appointment</h3>
                    <p style={{ fontSize: 14, color: G }}>Tell us about your procurement needs.</p>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[{ k: "name", l: "Full name", t: "text" }, { k: "email", l: "Email address", t: "email" }, { k: "company", l: "Company", t: "text" }, { k: "phone", l: "Phone number", t: "tel" }].map(f => (
                    <div key={f.k}>
                      <label style={{ fontSize: 13, fontWeight: 500, color: D, display: "block", marginBottom: 6 }}>{f.l}</label>
                      <input type={f.t} value={form[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })} style={inp} onFocus={onF} onBlur={onB} data-testid={`booking-${f.k}`} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: D, display: "block", marginBottom: 6 }}>Message</label>
                    <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} style={{ ...inp, resize: "vertical", minHeight: 100 }} onFocus={onF} onBlur={onB} data-testid="booking-message" />
                  </div>
                  <button onClick={submitForm} style={{ width: "100%", padding: "14px 24px", border: "none", borderRadius: 12, background: B, fontSize: 15, fontWeight: 500, color: "#fff", cursor: "pointer", marginTop: 8 }} data-testid="booking-submit">Send enquiry</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
