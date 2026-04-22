import Link from "next/link";
import NavBar from "@/components/NavBar";

const SERVICES = [
  {
    tag: "Procurement",
    title: "Single-Source Procurement",
    desc: "You tell us what you need for your substation, farm, or facility. We go to our network, get multiple quotes across price tiers, and present one clear comparison.",
  },
  {
    tag: "Packaging",
    title: "Packaged Quotes, Three Tiers",
    desc: "Every project comes back as three clear options. Each tier is a complete package with total cost, lead times, and warranty. Apples to apples, not a hundred scattered line items.",
  },
  {
    tag: "Network",
    title: "25+ Supplier Relationships",
    desc: "Direct relationships with every major MV and HV manufacturer globally. We know which factories have capacity, which ones deliver on time, and where to get the best value.",
  },
  {
    tag: "Delivery",
    title: "End-to-End Coordination",
    desc: "From purchase order through factory acceptance testing and logistics to site delivery. We manage the vendor communications and keep your project on schedule.",
  },
  {
    tag: "Training",
    title: "Sales Mentoring & Training",
    desc: "Structured mentoring and sales training built for the electrical industry. We sharpen technical sales skills, objection handling, and deal strategy.",
  },
  {
    tag: "AI",
    title: "AI-Powered Procurement Automation",
    desc: "AI tools that automate spec comparison, quote consolidation, supplier matching, and document generation. Faster turnaround, fewer errors.",
  },
];

const SUPPLIERS = [
  "Siemens", "ABB", "Schneider Electric", "Shanghai Electric", "Hitachi Energy",
  "Eaton", "GE Vernova", "Mitsubishi Electric", "Lucy Electric", "Hyosung",
  "CHINT", "Hyundai Electric", "Toshiba", "Fuji Electric", "Ormazabal",
];

const STEPS = [
  { num: "01", title: "Tell us what you need", desc: "Submit your requirements — upload a spec document or fill in our guided quote form." },
  { num: "02", title: "We go to market", desc: "We contact our global supplier network and source competitive offers from manufacturers." },
  { num: "03", title: "You get three options", desc: "Receive a clear, engineer-backed comparison across price tiers. You choose, we execute." },
];

export default function HomePage() {
  return (
    <>
      <NavBar />

      {/* Hero */}
      <section className="min-h-screen flex flex-col justify-center pt-14 bg-white">
        <div className="max-w-6xl mx-auto px-8 py-24 md:py-32">
          <div className="max-w-3xl animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-apple-surface rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 rounded-full bg-apple-success" />
              <span className="text-[13px] font-medium text-apple-text-secondary">Commission-based · No cost to you</span>
            </div>
            <h1 className="text-[clamp(40px,6vw,72px)] font-bold text-apple-text-primary leading-[1.05] tracking-[-0.03em] mb-6">
              MV/HV Electrical Equipment.
              <br />
              <span className="text-apple-blue">Three Quotes. One Call.</span>
            </h1>
            <p className="text-xl text-apple-text-secondary leading-relaxed mb-10 max-w-2xl">
              CrocConsulting handles procurement for medium and high-voltage switchgear, transformers, and electrical equipment.
              We tap 25+ manufacturer relationships globally and deliver engineer-backed quotes — at no cost to you.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/quote" className="btn-primary text-base px-8 py-4 min-h-[56px]">
                Get a quote
              </Link>
              <Link href="/portal" className="btn-secondary text-base px-8 py-4 min-h-[56px]">
                Track my quote
              </Link>
            </div>
          </div>
        </div>

        {/* Supplier ticker */}
        <div className="border-y border-apple-border py-5 overflow-hidden bg-apple-surface">
          <div className="flex gap-16 animate-[marquee_30s_linear_infinite] whitespace-nowrap">
            {[...SUPPLIERS, ...SUPPLIERS].map((s, i) => (
              <span key={i} className="text-[13px] font-medium text-apple-text-secondary shrink-0">{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="mb-16">
            <p className="text-[13px] font-semibold tracking-widest text-apple-blue uppercase mb-4">What we do</p>
            <h2 className="section-title mb-4">Built for the electrical industry.</h2>
            <p className="section-subtitle max-w-2xl">
              Specialised procurement services for utilities, contractors, and engineering firms working with MV and HV equipment.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s) => (
              <div key={s.tag} className="card-apple p-8 hover:shadow-[0_4px_24px_rgba(0,113,227,0.1)] transition-shadow duration-300">
                <span className="inline-block text-[11px] font-semibold tracking-widest uppercase text-apple-blue bg-blue-50 rounded-full px-3 py-1 mb-5">
                  {s.tag}
                </span>
                <h3 className="text-[19px] font-semibold text-apple-text-primary mb-3 leading-tight">{s.title}</h3>
                <p className="text-[15px] text-apple-text-secondary leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-apple-surface">
        <div className="max-w-6xl mx-auto px-8">
          <div className="mb-16 text-center">
            <p className="text-[13px] font-semibold tracking-widest text-apple-blue uppercase mb-4">The process</p>
            <h2 className="section-title mb-4">Simple from your end.</h2>
            <p className="section-subtitle">We handle the complexity. You make one decision.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+40px)] right-[-50%] h-px bg-apple-border" />
                )}
                <div className="card-apple p-8">
                  <div className="text-[40px] font-bold text-apple-blue/20 mb-4 leading-none">{step.num}</div>
                  <h3 className="text-[19px] font-semibold text-apple-text-primary mb-3">{step.title}</h3>
                  <p className="text-[15px] text-apple-text-secondary leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/quote" className="btn-primary text-base px-10 py-4 min-h-[56px]">
              Submit a quote request
            </Link>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[13px] font-semibold tracking-widest text-apple-blue uppercase mb-4">About</p>
              <h2 className="section-title mb-6">Industry-first, commission-based.</h2>
              <div className="space-y-5 text-[17px] text-apple-text-secondary leading-relaxed">
                <p>
                  CrocConsulting was built by an electrical industry professional who grew frustrated with how slow, opaque, and fragmented equipment procurement had become.
                </p>
                <p>
                  We operate on a commission model — the manufacturers pay us when you buy. That means our service costs you nothing, and our incentive is to find you the best value, not the highest margin.
                </p>
                <p>
                  We work across Australian utilities, mining operations, commercial developments, and renewable energy projects. If it runs at medium or high voltage, we can source it.
                </p>
              </div>
            </div>
            <div className="card-apple p-10">
              <div className="space-y-6">
                {[
                  { label: "Suppliers in network", value: "25+" },
                  { label: "Countries sourced from", value: "12+" },
                  { label: "Quote turnaround", value: "5 days" },
                  { label: "Cost to clients", value: "$0" },
                ].map((stat) => (
                  <div key={stat.label} className="flex justify-between items-center border-b border-apple-border pb-6 last:border-0 last:pb-0">
                    <span className="text-[15px] text-apple-text-secondary">{stat.label}</span>
                    <span className="text-[28px] font-bold text-apple-text-primary tracking-tight">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 bg-apple-text-primary">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <h2 className="text-[40px] md:text-[56px] font-bold text-white tracking-tight mb-6">
            Ready to get three quotes?
          </h2>
          <p className="text-[19px] text-white/60 mb-10 max-w-xl mx-auto">
            Submit your requirements and we will come back to you with engineer-backed options within five business days.
          </p>
          <Link href="/quote" className="inline-flex items-center justify-center rounded-full bg-apple-blue px-10 py-4 text-base font-semibold text-white transition-all hover:bg-apple-blue-hover min-h-[56px]">
            Get started — it&apos;s free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-apple-text-primary border-t border-white/10">
        <div className="max-w-6xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-white">CROC</span>
            <span className="text-[15px] text-white/50">CONSULTING</span>
          </div>
          <div className="flex gap-8">
            <Link href="/quote" className="text-[13px] text-white/50 hover:text-white transition-colors no-underline">Get a quote</Link>
            <Link href="/portal" className="text-[13px] text-white/50 hover:text-white transition-colors no-underline">Client portal</Link>
            <a href="mailto:adam.croxton@outlook.com" className="text-[13px] text-white/50 hover:text-white transition-colors no-underline">Contact</a>
          </div>
          <p className="text-[13px] text-white/30">© 2026 CrocConsulting. All rights reserved.</p>
        </div>
      </footer>

    </>
  );
}
