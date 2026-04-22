import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import AdminQuotesClient from "@/components/AdminQuotesClient";
import { createClient } from "@/lib/supabase/server";

export default async function AdminQuotesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") redirect("/admin");

  const { data: quotes } = await supabase
    .from("quotes")
    .select("*, clients(*), submissions(*), quote_stages(*)")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-apple-surface">
      <AdminNav active="quotes" />
      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-apple-text-primary tracking-tight">Active Quotes</h1>
          <p className="text-[14px] text-apple-text-secondary mt-1">{quotes?.length ?? 0} quotes in the system</p>
        </div>
        <AdminQuotesClient quotes={quotes ?? []} />
      </div>
    </div>
  );
}
