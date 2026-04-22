import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

const STAGE_NAMES = [
  "Quote Received",
  "Initial Review",
  "Supplier Outreach",
  "Quotes Gathered",
  "Engineering Review",
  "Quote Prepared",
  "Quote Delivered",
];

function ProgressTracker({ stages, currentStage }) {
  return (
    <div className="space-y-0">
      {STAGE_NAMES.map((name, i) => {
        const stageNum = i + 1;
        const stageData = stages?.find((s) => s.stage_number === stageNum);
        const done = stageData?.completed ?? false;
        const active = stageNum === currentStage && !done;

        return (
          <div key={stageNum} className="flex items-start gap-4" style={{ opacity: stageNum > currentStage ? 0.35 : 1 }}>
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                done ? "bg-apple-success" : active ? "bg-apple-blue" : "border-2 border-apple-border bg-white"
              }`}>
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : active ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-apple-border" />
                )}
              </div>
              {i < STAGE_NAMES.length - 1 && (
                <div className={`w-0.5 h-8 mt-1 ${done ? "bg-apple-success" : "bg-apple-border"}`} />
              )}
            </div>
            <div className="pt-0.5 pb-6">
              <p className={`text-[14px] leading-snug ${active ? "font-semibold text-apple-blue" : done ? "font-semibold text-apple-text-primary" : "font-normal text-apple-text-secondary"}`}>
                {name}
              </p>
              {active && <p className="text-[12px] font-medium text-apple-blue mt-0.5">Current stage</p>}
              {stageData?.completed_at && (
                <p className="text-[12px] text-apple-text-secondary mt-0.5">
                  {new Date(stageData.completed_at).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              )}
              {stageData?.notes && (
                <p className="text-[12px] text-apple-text-secondary mt-1 italic">{stageData.notes}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/portal");

  const { data: clientData } = await supabase
    .from("clients")
    .select("*")
    .eq("email", user.email)
    .single();

  const { data: quotes } = await supabase
    .from("quotes")
    .select("*, submissions(*), quote_stages(*)")
    .eq("client_id", clientData?.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-apple-surface">
      {/* Nav */}
      <nav className="sticky top-0 z-50 h-14 nav-glass border-b border-apple-border">
        <div className="max-w-4xl mx-auto px-8 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <span className="text-[17px] font-bold text-apple-text-primary">CROC</span>
            <span className="text-[17px] font-normal text-apple-text-secondary">CONSULTING</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-apple-text-secondary">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="mb-10">
          <p className="text-[13px] text-apple-text-secondary mb-1">Welcome back</p>
          <h1 className="text-[32px] font-bold text-apple-text-primary tracking-tight">
            {clientData?.name ?? clientData?.company ?? "Client Portal"}
          </h1>
        </div>

        {!quotes || quotes.length === 0 ? (
          <div className="card-apple p-12 text-center">
            <p className="text-[17px] text-apple-text-secondary mb-6">No active quotes yet.</p>
            <Link href="/quote" className="btn-primary">Submit a quote request</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {quotes.map((quote) => {
              const sub = quote.submissions;
              return (
                <div key={quote.id} className="card-apple overflow-hidden">
                  {/* Quote header */}
                  <div className="p-8 border-b border-apple-border">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[11px] font-bold tracking-widest uppercase text-apple-blue bg-blue-50 px-3 py-1 rounded-full">
                            Stage {quote.current_stage} of 7
                          </span>
                          <span className={`text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full ${
                            quote.status === "complete" ? "text-apple-success bg-green-50" : "text-apple-text-secondary bg-apple-surface"
                          }`}>
                            {quote.status === "complete" ? "Complete" : "In Progress"}
                          </span>
                        </div>
                        <h2 className="text-[19px] font-semibold text-apple-text-primary">
                          {sub?.equipment_type ?? "Equipment Quote"}
                          {sub?.voltage_level && ` — ${sub.voltage_level}`}
                        </h2>
                        <p className="text-[14px] text-apple-text-secondary mt-1">
                          Submitted {new Date(quote.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress tracker */}
                  <div className="p-8">
                    <ProgressTracker stages={quote.quote_stages} currentStage={quote.current_stage} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
