import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { createClient } from "@/lib/supabase/server";

export default async function AdminClientsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") redirect("/admin");

  const { data: clients } = await supabase
    .from("clients")
    .select("*, quotes(id, current_stage, status)")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-apple-surface">
      <AdminNav active="clients" />
      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-apple-text-primary tracking-tight">Clients</h1>
          <p className="text-[14px] text-apple-text-secondary mt-1">{clients?.length ?? 0} registered clients</p>
        </div>

        {!clients || clients.length === 0 ? (
          <div className="card-apple p-12 text-center">
            <p className="text-[15px] text-apple-text-secondary">No clients yet. Accept a submission to create a client account.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {clients.map((client) => (
              <div key={client.id} className="card-apple p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-[17px] font-semibold text-apple-text-primary">{client.name || client.email}</h3>
                  <p className="text-[14px] text-apple-text-secondary">{client.email}</p>
                  {client.company && <p className="text-[14px] text-apple-text-secondary">{client.company}</p>}
                  <p className="text-[13px] text-apple-text-secondary mt-2">
                    Joined {new Date(client.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[13px] text-apple-text-secondary">
                    {client.quotes?.length ?? 0} quote{client.quotes?.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
