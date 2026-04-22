import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const { quoteId, stageNumber, notes } = await request.json();
    if (!quoteId || !stageNumber) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const supabase = createServiceClient();

    // Mark the stage complete
    const { error: stageErr } = await supabase
      .from("quote_stages")
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
        notes: notes || null,
      })
      .eq("quote_id", quoteId)
      .eq("stage_number", stageNumber);

    if (stageErr) throw stageErr;

    // Advance the quote's current_stage
    const nextStage = Math.min(stageNumber + 1, 7);
    const { error: quoteErr } = await supabase
      .from("quotes")
      .update({
        current_stage: nextStage,
        status: stageNumber === 7 ? "complete" : "active",
      })
      .eq("id", quoteId);

    if (quoteErr) throw quoteErr;

    return NextResponse.json({ success: true, nextStage });
  } catch (err) {
    console.error("stage error:", err);
    return NextResponse.json({ error: "Stage update failed" }, { status: 500 });
  }
}
