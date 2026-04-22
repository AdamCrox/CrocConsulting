"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="text-[13px] text-apple-text-secondary hover:text-apple-danger transition-colors bg-transparent border-none cursor-pointer"
    >
      Sign out
    </button>
  );
}
