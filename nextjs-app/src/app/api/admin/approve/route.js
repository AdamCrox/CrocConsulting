import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const STAGE_NAMES = [
  "Quote Received", "Initial Review", "Supplier Outreach",
  "Quotes Gathered", "Engineering Review", "Quote Prepared", "Quote Delivered",
];

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

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

    const password = generatePassword();

    // Create Supabase Auth user
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: submission.email,
      password,
      email_confirm: true,
    });
    if (authErr) throw authErr;

    // Insert client record
    const { data: client, error: clientErr } = await supabase
      .from("clients")
      .insert({
        email: submission.email,
        name: submission.contact_name,
        company: submission.company,
      })
      .select()
      .single();
    if (clientErr) throw clientErr;

    // Create quote
    const { data: quote, error: quoteErr } = await supabase
      .from("quotes")
      .insert({
        client_id: client.id,
        submission_id: submissionId,
        current_stage: 1,
        status: "active",
      })
      .select()
      .single();
    if (quoteErr) throw quoteErr;

    // Create 7 stages (stage 1 auto-completed as "received")
    const stagesToInsert = STAGE_NAMES.map((name, i) => ({
      quote_id: quote.id,
      stage_number: i + 1,
      stage_name: name,
      completed: i === 0,
      completed_at: i === 0 ? new Date().toISOString() : null,
      notes: i === 0 ? "Quote request received and accepted." : null,
    }));
    await supabase.from("quote_stages").insert(stagesToInsert);

    // Update submission status
    await supabase.from("submissions").update({ status: "accepted" }).eq("id", submissionId);

    // Update quote to stage 2 (since stage 1 is auto-complete)
    await supabase.from("quotes").update({ current_stage: 2 }).eq("id", quote.id);

    // Email client with credentials
    await resend.emails.send({
      from: "CrocConsulting <noreply@crocconsulting.com.au>",
      to: submission.email,
      subject: "Your CrocConsulting Quote Has Been Accepted",
      html: `
        <h2>Your quote request has been accepted</h2>
        <p>Hi ${submission.contact_name || "there"},</p>
        <p>We have reviewed your request for <strong>${submission.equipment_type}</strong> and are progressing your quote.</p>
        <p>You can track the progress of your quote at any time using the client portal:</p>
        <p><strong>Portal URL:</strong> <a href="${process.env.NEXT_PUBLIC_SITE_URL}/portal">${process.env.NEXT_PUBLIC_SITE_URL}/portal</a></p>
        <p><strong>Email:</strong> ${submission.email}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p>Please keep these credentials safe. You can change your password after logging in.</p>
        <p>If you have any questions, reply to this email and Adam will get back to you.</p>
        <p>— CrocConsulting</p>
      `,
    });

    return NextResponse.json({ success: true, quoteId: quote.id, clientId: client.id });
  } catch (err) {
    console.error("approve error:", err);
    return NextResponse.json({ error: "Approval failed" }, { status: 500 });
  }
}
