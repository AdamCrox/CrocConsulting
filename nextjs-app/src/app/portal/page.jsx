"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function PortalLoginPage() {
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
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Invalid email or password. Please check your credentials.");
      setLoading(false);
    } else {
      router.push("/portal/dashboard");
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-apple-border bg-apple-surface text-[15px] text-apple-text-primary placeholder:text-apple-text-secondary focus:outline-none focus:border-apple-blue transition-colors";

  return (
    <div className="min-h-screen bg-apple-surface flex flex-col">
      <nav className="h-14 flex items-center px-8 bg-white border-b border-apple-border">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="text-[17px] font-bold text-apple-text-primary">CROC</span>
          <span className="text-[17px] font-normal text-apple-text-secondary">CLIENT PORTAL</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="card-apple p-10">
            <h1 className="text-[28px] font-bold text-apple-text-primary tracking-tight mb-2">Sign in</h1>
            <p className="text-[15px] text-apple-text-secondary mb-8">
              Access your quote progress and status updates.
            </p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-[13px] font-medium text-apple-text-primary mb-2">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com.au"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-apple-text-primary mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className={inputClass}
                />
              </div>

              {error && <p className="text-[13px] text-apple-danger">{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary w-full text-base">
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-apple-border text-center">
              <p className="text-[13px] text-apple-text-secondary">
                New client?{" "}
                <Link href="/quote" className="text-apple-blue hover:underline">
                  Submit a quote request
                </Link>
              </p>
              <p className="text-[13px] text-apple-text-secondary mt-2">
                Use the same email and password you created when submitting your quote.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
