import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const { submissionId } = await request.json();
    if (!submissionId) return NextResponse.json({ error: "Missing submissionId" }, { status: 400 });

    const supabase = createServiceClient();
    const { error } = await supabase
      .from("submissions")
      .update({ status: "rejected" })
      .eq("id", submissionId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("reject error:", err);
    return NextResponse.json({ error: "Rejection failed" }, { status: 500 });
  }
}
