import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import AdminSubmissionsClient from "@/components/AdminSubmissionsClient";
import { createClient } from "@/lib/supabase/server";

export default async function AdminSubmissionsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") redirect("/admin");

  const { data: submissions } = await supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-apple-surface">
      <AdminNav active="submissions" />
      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-apple-text-primary tracking-tight">Quote Submissions</h1>
            <p className="text-[14px] text-apple-text-secondary mt-1">{submissions?.length ?? 0} total submissions</p>
          </div>
        </div>
        <AdminSubmissionsClient submissions={submissions ?? []} />
      </div>
    </div>
  );
}
