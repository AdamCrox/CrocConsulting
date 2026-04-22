import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const { name, email, message } = await request.json();
    if (!email || !message) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const supabase = createServiceClient();
    const { error } = await supabase.from("contacts").insert({ name, email, message });
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("contact error:", err);
    return NextResponse.json({ error: "Failed to save contact" }, { status: 500 });
  }
}
