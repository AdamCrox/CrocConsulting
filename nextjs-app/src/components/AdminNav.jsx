import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function AdminNav({ active }) {
  const links = [
    { href: "/admin/submissions", label: "Submissions" },
    { href: "/admin/quotes", label: "Quotes" },
    { href: "/admin/clients", label: "Clients" },
  ];

  return (
    <nav className="sticky top-0 z-50 h-14 nav-glass border-b border-apple-border">
      <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/admin/submissions" className="no-underline">
            <span className="text-[15px] font-bold text-apple-text-primary">CROC</span>
            <span className="text-[13px] font-semibold text-apple-blue ml-2 uppercase tracking-widest">Admin</span>
          </Link>
          <div className="flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-colors no-underline ${
                  active === l.label.toLowerCase()
                    ? "bg-apple-blue text-white"
                    : "text-apple-text-secondary hover:text-apple-text-primary hover:bg-apple-surface"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <LogoutButton />
      </div>
    </nav>
  );
}
