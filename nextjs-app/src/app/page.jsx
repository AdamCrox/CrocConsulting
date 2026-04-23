"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const B = "#0071E3", BD = "#0055B0", GN = "#10B981", D = "#1D1D1F", G = "#86868B", LB = "#E8F2FF", SF = "#F5F5F7";

function CrocLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="croc-grad" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4FC3F7" />
          <stop offset="50%" stopColor="#7C8FF5" />
          <stop offset="100%" stopColor="#9C5CF5" />
        </linearGradient>
      </defs>
      <path d="M58 8 C30 8,6 28,6 50 C6 72,30 92,58 92 L44 74 C28 72,20 62,20 50 C20 38,28 28,44 26Z" fill="url(#croc-grad)" />
      <path d="M52 30 C38 32,32 40,32 50 C32 60,38 68,52 70 L44 60 C40 58,38 54,38 50 C38 46,40 42,44 40Z" fill="white" fillOpacity="0.93" />
    </svg>
  );
}

function FadeIn({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

const SUPPLIERS = [
  "Siemens", "ABB", "Schneider Electric", "Shanghai Electric", "Hitachi Energy",
  "Eaton", "GE Vernova", "Mitsubishi Electric", "Lucy Electric", "Hyosung",
  "CHINT", "Hyundai Electric", "Toshiba", "Fuji Electric", "Ormazabal",
];

const SERVICES = [
  {
    tag: "Procurement",
    title: "Single-Source Procurement",
    desc: "You tell us what you need for your substation, farm, or facility. We go to our network, get multiple quotes across price tiers, and present one clear comparison.",
    icon: (
      <svg width="44" height="44" viewBox="0 0 48 48" fill="none" stroke={B} strokeWidth="2">
        <circle cx="24" cy="24" r="8" /><circle cx="24" cy="24" r="3" fill={B} />
        <line x1="24" y1="8" x2="24" y2="16" /><line x1="24" y1="32" x2="24" y2="40" />
        <line x1="8" y1="24" x2="16" y2="24" /><line x1="32" y1="24" x2="40" y2="24" />
      </svg>
    ),
  },
  {
    tag: "Packaging",
    title: "Packaged Quotes, Three Tiers",
    desc: "Every project comes back as three clear options. Each tier is a complete package with total cost, lead times, and warranty. Apples to apples, not a hundred scattered line items.",
    icon: (
      <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
        <rect x="10" y="8" width="28" height="10" rx="3" fill="#10B98126" stroke="#10B981" strokeWidth="2" />
        <circle cx="16" cy="13" r="2" fill="#10B981" />
        <rect x="10" y="20" width="28" height="10" rx="3" fill={`${B}26`} stroke={B} strokeWidth="2" />
        <circle cx="16" cy="25" r="2" fill={B} />
        <rect x="10" y="32" width="28" height="10" rx="3" fill="#8B5CF626" stroke="#8B5CF6" strokeWidth="2" />
        <circle cx="16" cy="37" r="2" fill="#8B5CF6" />
      </svg>
    ),
  },
  {
    tag: "Network",
    title: "25+ Supplier Relationships",
    desc: "Direct relationships with every major MV and HV manufacturer globally. We know which factories have capacity, which ones deliver on time, and where to get the best value.",
    icon: (
      <svg width="44" height="44" viewBox="0 0 48 48" fill="none" stroke={B} strokeWidth="2">
        <circle cx="24" cy="12" r="6" /><circle cx="12" cy="36" r="6" /><circle cx="36" cy="36" r="6" />
        <line x1="24" y1="18" x2="24" y2="24" />
        <line x1="18" y1="30" x2="14" y2="30" /><line x1="30" y1="30" x2="34" y2="30" />
        <circle cx="24" cy="28" r="3" fill={B} />
      </svg>
    ),
  },
  {
    tag: "Delivery",
    title: "End-to-End Coordination",
    desc: "From purchase order through factory acceptance testing and logistics to site delivery. We manage the vendor communications and keep your project on schedule.",
    icon: (
      <svg width="44" height="44" viewBox="0 0 48 48" fill="none" stroke={B} strokeWidth="2">
        <polyline points="8,36 16,28 24,32 32,20 40,12" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="40" cy="12" r="4" fill={B} />
      </svg>
    ),
  },
  {
    tag: "Training",
    title: "Sales Mentoring & Training",
    desc: "Structured mentoring and sales training built for the electrical industry. We sharpen technical sales skills, objection handling, and deal strategy.",
    icon: (
      <svg width="44" height="44" viewBox="0 0 48 48" fill="none" stroke={B} strokeWidth="2">
        <circle cx="24" cy="14" r="6" />
        <path d="M12 40 C12 30,36 30,36 40" />
        <path d="M32 18 L36 14 L34 10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    tag: "AI",
    title: "AI-Powered Procurement Automation",
    desc: "AI tools that automate spec comparison, quote consolidation, supplier matching, and document generation. Faster turnaround, fewer errors.",
    icon: (
      <svg width="44" height="44" viewBox="0 0 48 48" fill="none" stroke={B} strokeWidth="2">
        <rect x="10" y="10" width="28" height="28" rx="8" />
        <circle cx="18" cy="22" r="3" fill={B} /><circle cx="30" cy="22" r="3" fill={B} />
        <path d="M18 32 Q24 36,30 32" strokeLinecap="round" />
      </svg>
    ),
  },
];

const ABOUT_FACTS = [
  ["Experience", "40+ years in the electrical industry"],
  ["Background", "Technical Sales, Support & Procurement, MV/HV"],
  ["OEM", "Siemens and leading global manufacturers"],
  ["Specialisation", "Switchgear, protection, transmission"],
  ["Education", "University of the Sunshine Coast"],
  ["Location", "Brisbane, Australia"],
  ["Model", "Commission-based, no cost to buyer"],
];

const inp = {
  width: "100%", padding: "12px 16px", borderRadius: 12, fontSize: 15,
  border: "1.5px solid rgba(0,0,0,0.12)", outline: "none", boxSizing: "border-box",
  background: SF, fontFamily: "inherit", transition: "border-color 0.2s",
};
const onFocus = (e) => (e.target.style.borderColor = B);
const onBlur = (e) => (e.target.style.borderColor = "rgba(0,0,0,0.12)");

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const submitBooking = async () => {
    if (!form.email || !form.message) return;
    setSending(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSent(true);
      setTimeout(() => { setShowForm(false); setSent(false); setSending(false); setForm({ name: "", email: "", company: "", phone: "", message: "" }); }, 2800);
    } catch {
      setSending(false);
    }
  };

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Helvetica, sans-serif", WebkitFontSmoothing: "antialiased" }}>

      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 56, zIndex: 100,
        background: scrolled ? "rgba(255,255,255,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        borderBottom: scrolled ? "1px solid rgba(0,0,0,0.08)" : "1px solid transparent",
        transition: "all 0.3s ease",
      }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 32px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <CrocLogo size={32} />
            <span style={{ fontSize: 17, fontWeight: 700, color: D, letterSpacing: "-0.01em" }}>CROC</span>
            <span style={{ fontSize: 17, fontWeight: 400, color: G, letterSpacing: "-0.01em" }}>CONSULTING</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {["Services", "How it works", "About"].map((link) => (
              <button key={link} onClick={() => scrollTo(link.toLowerCase().replace(/ /g, "-"))}
                style={{ background: "none", border: "none", fontSize: 13, fontWeight: 500, color: G, cursor: "pointer", padding: "8px 10px", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.target.style.color = D)} onMouseLeave={(e) => (e.target.style.color = G)}>
                {link}
              </button>
            ))}
            <Link href="/quote"
              style={{ padding: "8px 18px", border: "none", borderRadius: 980, background: GN, fontSize: 13, fontWeight: 500, color: "#fff", cursor: "pointer", textDecoration: "none", transition: "background 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#059669")} onMouseLeave={(e) => (e.currentTarget.style.background = GN)}>
              Get a quote
            </Link>
            <Link href="/portal"
              style={{ padding: "8px 18px", border: "none", borderRadius: 980, background: BD, fontSize: 13, fontWeight: 500, color: "#fff", cursor: "pointer", textDecoration: "none", transition: "background 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#003D7A")} onMouseLeave={(e) => (e.currentTarget.style.background = BD)}>
              View my quote
            </Link>
            <button onClick={() => setShowForm(true)}
              style={{ padding: "8px 18px", border: "none", borderRadius: 980, background: B, fontSize: 13, fontWeight: 500, color: "#fff", cursor: "pointer", transition: "background 0.2s" }}
              onMouseEnter={(e) => (e.target.style.background = BD)} onMouseLeave={(e) => (e.target.style.background = B)}>
              Book an appointment
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: `linear-gradient(180deg, #fff 0%, ${LB} 100%)`, position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: `radial-gradient(${B} 1px, transparent 1px)`, backgroundSize: "32px 32px" }} />
        <div style={{ textAlign: "center", maxWidth: 800, padding: "120px 32px 80px", position: "relative" }}>
          <FadeIn delay={0}><CrocLogo size={72} /></FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ display: "inline-block", padding: "8px 16px", borderRadius: 980, background: `rgba(0,113,227,0.08)`, fontSize: 13, fontWeight: 500, color: B, marginTop: 28, marginBottom: 24 }}>
              Outsourced MV & HV equipment procurement
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <h1 style={{ fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.06, color: D, marginBottom: 20 }}>
              One call.{" "}
              <span style={{ background: "linear-gradient(135deg, #4FC3F7 0%, #9C5CF5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Every supplier.
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.25}>
            <p style={{ fontSize: "clamp(17px, 2vw, 21px)", fontWeight: 400, lineHeight: 1.55, color: G, maxWidth: 640, margin: "0 auto 32px" }}>
              Your team is lean. Your procurement needs are not. One phone call gets you three written quotes, engineer-backed and ready for sign-off.
            </p>
          </FadeIn>
          <FadeIn delay={0.35}>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              <Link href="/quote"
                style={{ padding: "16px 32px", border: "none", borderRadius: 980, background: B, fontSize: 15, fontWeight: 500, color: "#fff", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,113,227,0.25)", textDecoration: "none", display: "inline-block", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = BD; e.currentTarget.style.transform = "scale(1.04)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = B; e.currentTarget.style.transform = "scale(1)"; }}>
                Get a quote now
              </Link>
              <button onClick={() => setShowForm(true)}
                style={{ padding: "16px 32px", border: "none", borderRadius: 980, background: "rgba(0,113,227,0.08)", fontSize: 15, fontWeight: 500, color: B, cursor: "pointer", transition: "background 0.2s" }}
                onMouseEnter={(e) => (e.target.style.background = "rgba(0,113,227,0.14)")} onMouseLeave={(e) => (e.target.style.background = "rgba(0,113,227,0.08)")}>
                Book an appointment
              </button>
            </div>
          </FadeIn>
          <FadeIn delay={0.5}>
            <div style={{ marginTop: 56 }}>
              <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", color: G, textTransform: "uppercase", marginBottom: 16 }}>Trusted supplier network</p>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, maxWidth: 640, margin: "0 auto" }}>
                {SUPPLIERS.map((s) => (
                  <span key={s} style={{ fontSize: 14, fontWeight: 500, color: "rgba(0,0,0,0.3)" }}>{s}</span>
                ))}
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
              <FadeIn key={s.tag} delay={i * 0.08}>
                <div style={{ background: SF, borderRadius: 20, padding: 36, border: "1px solid transparent", transition: "all 0.3s ease", cursor: "default", height: "100%" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.border = "1px solid rgba(0,113,227,0.15)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,113,227,0.08)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = SF; e.currentTarget.style.border = "1px solid transparent"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}>
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
            <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#fff", marginBottom: 40 }}>
              Stop chasing quotes.<br />Start approving them.
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <p style={{ fontSize: 18, fontWeight: 400, lineHeight: 1.7, color: "rgba(255,255,255,0.6)" }}>
                Every procurement policy has the same requirement: get multiple written quotes before you can approve the spend. That means someone in your business is ringing around to 16 different companies, chasing responses, comparing specs, and losing weeks on admin that has nothing to do with their actual job.
              </p>
              <p style={{ fontSize: 18, fontWeight: 400, lineHeight: 1.7, color: "rgba(255,255,255,0.6)" }}>
                Croc Consulting replaces all of that with one phone call. You tell us what you need. We come back with three written quotes for every line item, each one reviewed and backed by qualified engineers to ensure technical accuracy, compliance, and like-for-like comparison.
              </p>
              <p style={{ fontSize: 18, fontWeight: 400, lineHeight: 1.7, color: "rgba(255,255,255,0.6)" }}>
                You review the package. Cross out what you do not want. Approve what you do. We place the order. Done.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 48, paddingTop: 40 }}>
              <p style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>
                Three quotes. One call.{" "}
                <span style={{ background: "linear-gradient(135deg, #4FC3F7 0%, #9C5CF5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Engineer-backed.
                </span>
              </p>
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
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
          <FadeIn>
            <p style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.08em", color: B, textTransform: "uppercase", marginBottom: 12 }}>About</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, color: D, marginBottom: 24 }}>Adam Croxton</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <p style={{ fontSize: 17, fontWeight: 400, lineHeight: 1.65, color: G }}>
                With over 40 years in the electrical industry spanning technical sales, support, and procurement across medium-voltage, high-voltage, and secondary systems at leading OEMs including Siemens, Adam has built direct relationships with the people who design, manufacture, and ship this equipment.
              </p>
              <p style={{ fontSize: 17, fontWeight: 400, lineHeight: 1.65, color: G }}>
                Croc Consulting exists because most substations, farms, and infrastructure operators do not have a dedicated procurement team. They are resource-poor but their equipment needs are anything but simple. Adam bridges that gap: one phone call replaces weeks of chasing quotes.
              </p>
              <p style={{ fontSize: 17, fontWeight: 400, lineHeight: 1.65, color: G }}>
                Based in Brisbane. Serving clients across Australia and the Asia-Pacific.
              </p>
            </div>
            <button onClick={() => setShowForm(true)}
              style={{ marginTop: 32, padding: "14px 28px", border: "none", borderRadius: 980, background: B, fontSize: 15, fontWeight: 500, color: "#fff", cursor: "pointer", transition: "background 0.2s" }}
              onMouseEnter={(e) => (e.target.style.background = BD)} onMouseLeave={(e) => (e.target.style.background = B)}>
              Get in touch
            </button>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div style={{ background: SF, borderRadius: 24, padding: 48 }}>
              {ABOUT_FACTS.map(([label, value], i) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px 0", borderBottom: i < ABOUT_FACTS.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", color: G, textTransform: "uppercase", flexShrink: 0, marginRight: 16 }}>{label}</span>
                  <span style={{ fontSize: 15, fontWeight: 500, color: D, textAlign: "right", maxWidth: "65%" }}>{value}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Supplier Network */}
      <section style={{ padding: "80px 32px", background: SF }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <p style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.08em", color: B, textTransform: "uppercase", marginBottom: 12 }}>Network</p>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, color: D, marginBottom: 40 }}>One call reaches all of them.</h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
              {SUPPLIERS.map((s) => (
                <div key={s}
                  style={{ padding: "14px 28px", borderRadius: 12, background: "#fff", border: "1px solid rgba(0,0,0,0.06)", fontSize: 15, fontWeight: 600, color: D, cursor: "default", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = B; e.currentTarget.style.color = B; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,113,227,0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.06)"; e.currentTarget.style.color = D; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                  {s}
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 32px", background: `linear-gradient(180deg, #fff 0%, ${LB} 100%)`, textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <FadeIn><CrocLogo size={48} /></FadeIn>
          <FadeIn delay={0.1}>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, color: D, marginTop: 24, marginBottom: 12 }}>Ready to simplify your procurement?</h2>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p style={{ fontSize: 17, color: G, marginBottom: 32 }}>Tell us what you need. Three quotes, engineer-backed, no cost to you.</p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              <Link href="/quote"
                style={{ padding: "16px 32px", border: "none", borderRadius: 980, background: B, fontSize: 15, fontWeight: 500, color: "#fff", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,113,227,0.25)", textDecoration: "none", display: "inline-block", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = BD; e.currentTarget.style.transform = "scale(1.04)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = B; e.currentTarget.style.transform = "scale(1)"; }}>
                Get a quote now
              </Link>
              <button onClick={() => setShowForm(true)}
                style={{ padding: "16px 32px", border: "none", borderRadius: 980, background: "rgba(0,113,227,0.08)", fontSize: 15, fontWeight: 500, color: B, cursor: "pointer", transition: "background 0.2s" }}
                onMouseEnter={(e) => (e.target.style.background = "rgba(0,113,227,0.14)")} onMouseLeave={(e) => (e.target.style.background = "rgba(0,113,227,0.08)")}>
                Book an appointment
              </button>
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
              <p style={{ fontSize: 14, fontWeight: 400, lineHeight: 1.6, color: "rgba(255,255,255,0.5)" }}>
                Outsourced procurement for MV and HV equipment. Commission-based. No cost to you.
              </p>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 16 }}>Contact</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <a href="mailto:adam.croxton@outlook.com" style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>adam.croxton@outlook.com</a>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Brisbane, Australia</span>
              </div>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 16 }}>Quick links</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Link href="/quote" style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Get a quote</Link>
                <Link href="/portal" style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Client portal</Link>
                <button onClick={() => setShowForm(true)} style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>Book an appointment</button>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 48, paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>© 2026 Croc Consulting. All rights reserved.</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Brisbane, Australia</span>
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      {showForm && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => { setShowForm(false); setSent(false); }}
        >
          <div
            style={{ background: "#fff", borderRadius: 20, padding: 48, maxWidth: 480, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.18)", position: "relative" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => { setShowForm(false); setSent(false); }}
              style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", padding: 8 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5L15 15M15 5L5 15" stroke={G} strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
            {sent ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: LB, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
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
                  {[{ k: "name", l: "Full name", t: "text" }, { k: "email", l: "Email address", t: "email" }, { k: "company", l: "Company", t: "text" }, { k: "phone", l: "Phone number", t: "tel" }].map((f) => (
                    <div key={f.k}>
                      <label style={{ fontSize: 13, fontWeight: 500, color: D, display: "block", marginBottom: 6 }}>{f.l}</label>
                      <input type={f.t} value={form[f.k]} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} style={inp} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: D, display: "block", marginBottom: 6 }}>Message</label>
                    <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} style={{ ...inp, resize: "vertical", minHeight: 100 }} onFocus={onFocus} onBlur={onBlur} />
                  </div>
                  <button onClick={submitBooking} disabled={sending}
                    style={{ width: "100%", padding: "14px 24px", border: "none", borderRadius: 12, background: B, fontSize: 15, fontWeight: 500, color: "#fff", cursor: sending ? "wait" : "pointer", marginTop: 8, opacity: sending ? 0.7 : 1 }}>
                    {sending ? "Sending…" : "Send enquiry"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
