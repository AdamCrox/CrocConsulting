import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const STAGE_NAMES = [
  "Quote Received", "Initial Review", "Supplier Outreach",
  "Quotes Gathered", "Engineering Review", "Quote Prepared", "Quote Delivered",
];

export async function POST(request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { submissionId } = await request.json();
    if (!submissionId) return NextResponse.json({ error: "Missing submissionId" }, { status: 400 });

    const supabase = createServiceClient();

    // Fetch submission
    const { data: submission, error: subErr } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", submissionId)
      .single();
    if (subErr || !submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    if (submission.status !== "pending") return NextResponse.json({ error: "Already processed" }, { status: 400 });

    // Insert client record (user already has a Supabase Auth account from sign-up)
    const { data: client, error: clientErr } = await supabase
      .from("clients")
      .upsert({
        email: submission.email,
        name: submission.contact_name,
        company: submission.company,
      }, { onConflict: "email" })
      .select()
      .single();
    if (clientErr) throw clientErr;

    // Create quote
    const { data: quote, error: quoteErr } = await supabase
      .from("quotes")
      .insert({
        client_id: client.id,
        submission_id: submissionId,
        current_stage: 2,
        status: "active",
      })
      .select()
      .single();
    if (quoteErr) throw quoteErr;

    // Create 7 stages (stage 1 auto-completed)
    await supabase.from("quote_stages").insert(
      STAGE_NAMES.map((name, i) => ({
        quote_id: quote.id,
        stage_number: i + 1,
        stage_name: name,
        completed: i === 0,
        completed_at: i === 0 ? new Date().toISOString() : null,
        notes: i === 0 ? "Quote request received and accepted." : null,
      }))
    );

    // Mark submission accepted
    await supabase.from("submissions").update({ status: "accepted" }).eq("id", submissionId);

    // Email client — they already have their login, just send the portal link
    await resend.emails.send({
      from: "CrocConsulting <noreply@crocconsulting.com.au>",
      to: submission.email,
      subject: "Your quote request has been accepted",
      html: `
        <h2>Great news — your quote has been accepted!</h2>
        <p>Hi ${submission.contact_name || "there"},</p>
        <p>We've accepted your request for <strong>${submission.equipment_type}</strong> and are now working on sourcing quotes from our supplier network.</p>
        <p>You can track the progress of your quote at any time using the same login you created:</p>
        <p style="margin: 24px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/portal" style="background:#0071E3;color:#fff;padding:12px 28px;border-radius:980px;text-decoration:none;font-weight:600;">
            Track my quote →
          </a>
        </p>
        <p>Log in with your email and the password you chose when submitting your quote.</p>
        <p>— CrocConsulting</p>
      `,
    });

    return NextResponse.json({ success: true, quoteId: quote.id, clientId: client.id });
  } catch (err) {
    console.error("approve error:", err);
    return NextResponse.json({ error: "Approval failed" }, { status: 500 });
  }
}
