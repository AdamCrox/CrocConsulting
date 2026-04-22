"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function QuotePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (authError) {
      setError("Something went wrong. Please try again.");
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="h-14 flex items-center px-8 border-b border-apple-border">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="text-[17px] font-bold text-apple-text-primary">CROC</span>
          <span className="text-[17px] font-normal text-apple-text-secondary">CONSULTING</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-8">
        {sent ? (
          <div className="max-w-md w-full text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M6 16L12 22L26 8" stroke="#0071E3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-[32px] font-bold text-apple-text-primary tracking-tight mb-3">Check your email</h1>
            <p className="text-[17px] text-apple-text-secondary leading-relaxed mb-2">
              We sent a magic link to <strong>{email}</strong>
            </p>
            <p className="text-[15px] text-apple-text-secondary">
              Click the link in the email to continue filling in your quote request.
            </p>
          </div>
        ) : (
          <div className="max-w-md w-full animate-fade-in">
            {/* Progress indicator */}
            <div className="flex items-center gap-2 mb-10">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-apple-blue text-white text-[11px] font-bold">1</div>
              <div className="h-px flex-1 bg-apple-border" />
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-apple-border text-apple-text-secondary text-[11px] font-bold">2</div>
              <div className="h-px flex-1 bg-apple-border" />
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-apple-border text-apple-text-secondary text-[11px] font-bold">3</div>
            </div>

            <p className="text-[13px] font-semibold tracking-widest text-apple-blue uppercase mb-3">Step 1 of 3</p>
            <h1 className="text-[36px] font-bold text-apple-text-primary tracking-tight mb-3">Get a quote</h1>
            <p className="text-[17px] text-apple-text-secondary leading-relaxed mb-8">
              Enter your email and we will send you a secure link to continue. No password needed.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[13px] font-medium text-apple-text-primary mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com.au"
                  className="w-full px-4 py-3 rounded-xl border border-apple-border bg-apple-surface text-[15px] text-apple-text-primary placeholder:text-apple-text-secondary focus:outline-none focus:border-apple-blue transition-colors"
                />
              </div>

              {error && (
                <p className="text-[13px] text-apple-danger">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="btn-primary w-full text-base"
              >
                {loading ? "Sending link..." : "Send magic link"}
              </button>
            </form>

            <p className="text-[13px] text-apple-text-secondary mt-6 text-center">
              Already have an account?{" "}
              <Link href="/portal" className="text-apple-blue hover:underline">
                Track my quote
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
