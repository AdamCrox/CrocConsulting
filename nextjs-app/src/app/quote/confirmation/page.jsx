import Link from "next/link";

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="h-14 flex items-center px-8 border-b border-apple-border">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="text-[17px] font-bold text-apple-text-primary">CROC</span>
          <span className="text-[17px] font-normal text-apple-text-secondary">CONSULTING</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-8">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M8 20L17 29L32 12" stroke="#30D158" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-[36px] font-bold text-apple-text-primary tracking-tight mb-4">
            Quote request received
          </h1>
          <p className="text-[17px] text-apple-text-secondary leading-relaxed mb-4">
            We have received your request and Adam will review it within one business day.
          </p>
          <p className="text-[15px] text-apple-text-secondary leading-relaxed mb-10">
            If your quote is accepted, you will receive an email with login credentials to track progress in the client portal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="btn-primary">Back to home</Link>
            <Link href="/portal" className="btn-secondary">Track my quote</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
