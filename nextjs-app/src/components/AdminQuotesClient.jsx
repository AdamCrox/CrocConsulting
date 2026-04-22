"use client";
import { useState } from "react";

const STAGE_NAMES = [
  "Quote Received", "Initial Review", "Supplier Outreach",
  "Quotes Gathered", "Engineering Review", "Quote Prepared", "Quote Delivered",
];

export default function AdminQuotesClient({ quotes }) {
  const [localQuotes, setLocalQuotes] = useState(quotes);
  const [loading, setLoading] = useState({});
  const [noteInputs, setNoteInputs] = useState({});

  const advanceStage = async (quoteId, currentStage) => {
    if (currentStage >= 7) return;
    setLoading((l) => ({ ...l, [quoteId]: true }));

    try {
      const res = await fetch("/api/admin/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteId,
          stageNumber: currentStage,
          notes: noteInputs[`${quoteId}-${currentStage}`] ?? "",
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLocalQuotes((qs) =>
        qs.map((q) => {
          if (q.id !== quoteId) return q;
          const newStages = q.quote_stages.map((s) =>
            s.stage_number === currentStage ? { ...s, completed: true, completed_at: new Date().toISOString(), notes: noteInputs[`${quoteId}-${currentStage}`] ?? "" } : s
          );
          return { ...q, current_stage: Math.min(currentStage + 1, 7), quote_stages: newStages };
        })
      );
    } catch {
      alert("Failed to update stage. Please try again.");
    }
    setLoading((l) => ({ ...l, [quoteId]: false }));
  };

  if (localQuotes.length === 0) {
    return (
      <div className="card-apple p-12 text-center">
        <p className="text-[15px] text-apple-text-secondary">No quotes yet. Accept a submission to create a quote.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {localQuotes.map((quote) => {
        const client = quote.clients;
        const sub = quote.submissions;
        const stages = quote.quote_stages ?? [];
        const currentStage = quote.current_stage;

        return (
          <div key={quote.id} className="card-apple overflow-hidden">
            <div className="p-6 border-b border-apple-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-apple-blue bg-blue-50 px-3 py-1 rounded-full">
                    Stage {currentStage}/7
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-apple-text-secondary bg-apple-surface px-3 py-1 rounded-full">
                    {STAGE_NAMES[currentStage - 1]}
                  </span>
                </div>
                <h2 className="text-[17px] font-semibold text-apple-text-primary">
                  {client?.company ?? client?.name ?? client?.email ?? "Unknown Client"}
                </h2>
                <p className="text-[13px] text-apple-text-secondary">{client?.email}</p>
                {sub?.equipment_type && (
                  <p className="text-[13px] text-apple-text-secondary">{sub.equipment_type} · {sub.voltage_level}</p>
                )}
              </div>

              {currentStage <= 7 && (
                <div className="flex flex-col gap-3 shrink-0 min-w-[240px]">
                  <textarea
                    value={noteInputs[`${quote.id}-${currentStage}`] ?? ""}
                    onChange={(e) => setNoteInputs((n) => ({ ...n, [`${quote.id}-${currentStage}`]: e.target.value }))}
                    placeholder="Optional note for this stage…"
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-apple-border bg-apple-surface text-[13px] resize-none focus:outline-none focus:border-apple-blue"
                  />
                  <button
                    onClick={() => advanceStage(quote.id, currentStage)}
                    disabled={loading[quote.id] || currentStage > 7}
                    className="btn-primary !text-[13px] !min-h-0 !px-5 !py-2.5 disabled:opacity-50"
                  >
                    {loading[quote.id] ? "Updating…" : currentStage === 7 ? "All stages complete" : `Complete Stage ${currentStage}`}
                  </button>
                </div>
              )}
            </div>

            {/* Stage mini-timeline */}
            <div className="p-6">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {STAGE_NAMES.map((name, i) => {
                  const stageNum = i + 1;
                  const stage = stages.find((s) => s.stage_number === stageNum);
                  const done = stage?.completed ?? false;
                  const active = stageNum === currentStage;
                  return (
                    <div key={stageNum} className="flex items-center gap-2 shrink-0">
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium ${
                        done ? "bg-green-50 text-apple-success" :
                        active ? "bg-blue-50 text-apple-blue" :
                        "bg-apple-surface text-apple-text-secondary"
                      }`}>
                        {done && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        {active && !done && <div className="w-1.5 h-1.5 rounded-full bg-apple-blue" />}
                        {name}
                      </div>
                      {i < STAGE_NAMES.length - 1 && (
                        <div className={`w-4 h-px ${done ? "bg-apple-success" : "bg-apple-border"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
