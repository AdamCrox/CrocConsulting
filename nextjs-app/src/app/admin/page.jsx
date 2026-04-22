"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError || !data.user) {
      setError("Invalid credentials.");
      setLoading(false);
      return;
    }

    if (data.user.app_metadata?.role !== "admin") {
      await supabase.auth.signOut();
      setError("You do not have admin access.");
      setLoading(false);
      return;
    }

    router.push("/admin/submissions");
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-apple-border bg-apple-surface text-[15px] text-apple-text-primary placeholder:text-apple-text-secondary focus:outline-none focus:border-apple-blue transition-colors";

  return (
    <div className="min-h-screen bg-apple-text-primary flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-[13px] font-semibold tracking-widest text-apple-blue uppercase mb-3">CrocConsulting</p>
          <h1 className="text-[32px] font-bold text-white tracking-tight">Admin</h1>
        </div>

        <div className="bg-white rounded-3xl p-10 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-apple-text-primary mb-2">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="admin@crocconsulting.com.au" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-apple-text-primary mb-2">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="Password" />
            </div>

            {error && <p className="text-[13px] text-apple-danger">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full text-base">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-[13px] text-white/40 hover:text-white/70 transition-colors no-underline">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
