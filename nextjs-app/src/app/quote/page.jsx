"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function QuotePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }
        if (!signUpData.session) {
          setError("This email is already registered. Please use the password you created previously, or track your existing quote below.");
          setLoading(false);
          return;
        }
      }

      router.push("/quote/details");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-apple-border bg-apple-surface text-[15px] text-apple-text-primary placeholder:text-apple-text-secondary focus:outline-none focus:border-apple-blue transition-colors";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="h-14 flex items-center px-8 border-b border-apple-border">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="text-[17px] font-bold text-apple-text-primary">CROC</span>
          <span className="text-[17px] font-normal text-apple-text-secondary">CONSULTING</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full animate-fade-in">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-6 h-6 rounded-full bg-apple-blue flex items-center justify-center text-white text-[11px] font-bold">1</div>
            <div className="h-px flex-1 bg-apple-border" />
            <div className="w-6 h-6 rounded-full border border-apple-border flex items-center justify-center text-apple-text-secondary text-[11px] font-bold">2</div>
            <div className="h-px flex-1 bg-apple-border" />
            <div className="w-6 h-6 rounded-full border border-apple-border flex items-center justify-center text-apple-text-secondary text-[11px] font-bold">3</div>
          </div>

          <p className="text-[13px] font-semibold tracking-widest text-apple-blue uppercase mb-3">Step 1 of 3</p>
          <h1 className="text-[36px] font-bold text-apple-text-primary tracking-tight mb-3">Get a quote</h1>
          <p className="text-[17px] text-apple-text-secondary leading-relaxed mb-8">
            Create an account to submit your quote request and track its progress.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className={inputClass}
              />
            </div>

            {error && <p className="text-[13px] text-apple-danger">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full text-base">
              {loading ? "Continuing…" : "Continue to quote details"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-apple-border">
            <p className="text-[13px] text-apple-text-secondary text-center mb-3">Already submitted a quote?</p>
            <Link href="/portal" className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl border border-apple-border bg-apple-surface text-[14px] font-medium text-apple-text-primary hover:border-apple-blue hover:text-apple-blue transition-colors no-underline">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 14c0-3 2-5 5-5s5 2 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Sign in to track your quote progress
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
