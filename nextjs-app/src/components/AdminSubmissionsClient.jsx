"use client";
import { useState } from "react";

const STATUS_COLORS = {
  pending: "text-amber-700 bg-amber-50",
  accepted: "text-apple-success bg-green-50",
  rejected: "text-apple-danger bg-red-50",
};

export default function AdminSubmissionsClient({ submissions }) {
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState({});
  const [localData, setLocalData] = useState(submissions);
  const [selected, setSelected] = useState(null);

  const filtered = filter === "all" ? localData : localData.filter((s) => s.status === filter);

  const handleAction = async (id, action) => {
    setLoading((l) => ({ ...l, [id]: action }));
    try {
      const endpoint = action === "approve" ? "/api/admin/approve" : "/api/admin/reject";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: id }),
      });
      if (!res.ok) throw new Error();
      setLocalData((data) =>
        data.map((s) => s.id === id ? { ...s, status: action === "approve" ? "accepted" : "rejected" } : s)
      );
    } catch {
      alert("Action failed. Please try again.");
    }
    setLoading((l) => ({ ...l, [id]: null }));
  };

  return (
    <>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {["all", "pending", "accepted", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-[13px] font-medium capitalize transition-colors border-none cursor-pointer ${
              filter === f ? "bg-apple-blue text-white" : "bg-white text-apple-text-secondary hover:bg-apple-surface"
            }`}
          >
            {f} {f !== "all" && `(${localData.filter((s) => s.status === f).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card-apple p-12 text-center">
          <p className="text-[15px] text-apple-text-secondary">No submissions in this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((sub) => (
            <div key={sub.id} className="card-apple p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${STATUS_COLORS[sub.status]}`}>
                      {sub.status}
                    </span>
                    {sub.equipment_type && (
                      <span className="text-[11px] font-medium text-apple-text-secondary bg-apple-surface px-3 py-1 rounded-full">
                        {sub.equipment_type}
                      </span>
                    )}
                    {sub.voltage_level && (
                      <span className="text-[11px] font-medium text-apple-text-secondary bg-apple-surface px-3 py-1 rounded-full">
                        {sub.voltage_level}
                      </span>
                    )}
                  </div>

                  <h3 className="text-[17px] font-semibold text-apple-text-primary mb-1">
                    {sub.contact_name || "Unknown"} — {sub.company || "No company"}
                  </h3>
                  <p className="text-[14px] text-apple-text-secondary mb-1">{sub.email}</p>
                  {sub.phone && <p className="text-[14px] text-apple-text-secondary mb-1">{sub.phone}</p>}

                  <p className="text-[13px] text-apple-text-secondary mt-3">
                    Submitted {new Date(sub.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>

                  {sub.details?.description && (
                    <p className="text-[13px] text-apple-text-secondary mt-2 line-clamp-2">
                      {sub.details.description}
                    </p>
                  )}

                  {sub.files?.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {sub.files.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-[12px] text-apple-blue hover:underline">
                          File {i + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {sub.status === "pending" && (
                  <div className="flex gap-3 shrink-0">
                    <button
                      onClick={() => handleAction(sub.id, "reject")}
                      disabled={!!loading[sub.id]}
                      className="px-5 py-2.5 rounded-full border border-apple-border text-[13px] font-medium text-apple-text-secondary hover:bg-apple-surface transition-colors bg-white cursor-pointer disabled:opacity-50"
                    >
                      {loading[sub.id] === "reject" ? "Rejecting…" : "Reject"}
                    </button>
                    <button
                      onClick={() => handleAction(sub.id, "approve")}
                      disabled={!!loading[sub.id]}
                      className="btn-primary !px-5 !py-2.5 !text-[13px] !min-h-0 disabled:opacity-50"
                    >
                      {loading[sub.id] === "approve" ? "Approving…" : "Accept"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
