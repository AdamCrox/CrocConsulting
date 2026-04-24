import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export async function POST(request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const body = await request.json();
    const {
      email, company, contact_name, contact_email, phone,
      equipment_type, voltage_level, offer_type, project_number,
      project_name, details, files,
      quotePdfB64, sldCsvB64,
    } = body;

    if (!email || !equipment_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { data: submission, error } = await supabase
      .from("submissions")
      .insert({
        email,
        company,
        contact_name,
        phone,
        equipment_type,
        voltage_level,
        details: { ...details, offer_type, project_number, project_name, contact_email },
        files: files ?? [],
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    const subject = `${project_number ? `[${project_number}] ` : ""}${project_name || company || "Quote Request"}`;

    const htmlBody = `
      <div style="font-family:sans-serif;max-width:640px;margin:0 auto;color:#1d1d1f">
        <div style="background:#0071E3;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0;font-size:22px">CROC CONSULTING</h1>
          <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:14px">New Quote Request</p>
        </div>
        <div style="border:1px solid #d2d2d7;border-top:none;border-radius:0 0 12px 12px;padding:32px">
          ${project_number ? `<p style="background:#f0f7ff;border-left:3px solid #0071E3;padding:10px 16px;border-radius:4px;font-size:15px;margin:0 0 24px"><strong>Project Number:</strong> ${project_number}</p>` : ""}

          <h2 style="font-size:16px;margin:0 0 12px;color:#1d1d1f">Project Details</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
            ${project_name ? `<tr><td style="padding:6px 0;color:#6e6e73;width:40%">Project Name</td><td style="padding:6px 0;font-weight:500">${project_name}</td></tr>` : ""}
            ${equipment_type ? `<tr><td style="padding:6px 0;color:#6e6e73">Type of Project</td><td style="padding:6px 0;font-weight:500">${equipment_type}</td></tr>` : ""}
            ${voltage_level ? `<tr><td style="padding:6px 0;color:#6e6e73">Voltage Levels</td><td style="padding:6px 0;font-weight:500">${voltage_level}</td></tr>` : ""}
            ${offer_type ? `<tr><td style="padding:6px 0;color:#6e6e73">Type of Offer</td><td style="padding:6px 0;font-weight:500">${offer_type}</td></tr>` : ""}
            ${details?.timeframe ? `<tr><td style="padding:6px 0;color:#6e6e73">Date Required By</td><td style="padding:6px 0;font-weight:500">${details.timeframe}</td></tr>` : ""}
            ${details?.order_date ? `<tr><td style="padding:6px 0;color:#6e6e73">Order Date</td><td style="padding:6px 0;font-weight:500">${details.order_date}</td></tr>` : ""}
            ${details?.delivery_location ? `<tr><td style="padding:6px 0;color:#6e6e73">Delivery Location</td><td style="padding:6px 0;font-weight:500">${details.delivery_location}</td></tr>` : ""}
          </table>

          <h2 style="font-size:16px;margin:0 0 12px;color:#1d1d1f">Contact Details</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
            ${contact_name ? `<tr><td style="padding:6px 0;color:#6e6e73;width:40%">Contact Name</td><td style="padding:6px 0;font-weight:500">${contact_name}</td></tr>` : ""}
            ${company ? `<tr><td style="padding:6px 0;color:#6e6e73">Company</td><td style="padding:6px 0;font-weight:500">${company}</td></tr>` : ""}
            ${contact_email ? `<tr><td style="padding:6px 0;color:#6e6e73">Email</td><td style="padding:6px 0;font-weight:500">${contact_email}</td></tr>` : ""}
            ${phone ? `<tr><td style="padding:6px 0;color:#6e6e73">Phone</td><td style="padding:6px 0;font-weight:500">${phone}</td></tr>` : ""}
          </table>

          ${details?.description ? `
          <h2 style="font-size:16px;margin:0 0 8px;color:#1d1d1f">Description</h2>
          <p style="font-size:14px;color:#3a3a3c;background:#f5f5f7;padding:16px;border-radius:8px;margin:0 0 24px;line-height:1.6">${details.description}</p>` : ""}

          ${files?.length > 0 ? `
          <h2 style="font-size:16px;margin:0 0 8px;color:#1d1d1f">Uploaded Files</h2>
          <ul style="font-size:14px;margin:0 0 24px;padding-left:20px">
            ${files.map((u, i) => `<li><a href="${u}" style="color:#0071E3">File ${i + 1}</a></li>`).join("")}
          </ul>` : ""}

          <div style="border-top:1px solid #d2d2d7;padding-top:20px;margin-top:8px">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/submissions" style="background:#0071E3;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">Review in Admin Dashboard →</a>
          </div>
        </div>
      </div>
    `;

    // Build attachments
    const attachments = [];
    if (quotePdfB64) {
      attachments.push({
        filename: `${project_number || "quote"}_quote.pdf`,
        content: quotePdfB64,
        contentType: "application/pdf",
      });
    }
    if (sldCsvB64) {
      attachments.push({
        filename: `${project_number || "quote"}_equipment_schedule.csv`,
        content: sldCsvB64,
        contentType: "text/csv",
      });
    }

    const emailPayload = {
      from: "CrocConsulting <noreply@crocconsulting.com.au>",
      subject,
      html: htmlBody,
      attachments,
    };

    // Send to admin
    await resend.emails.send({ ...emailPayload, to: "adam.croxton@outlook.com" });

    // Send confirmation to client (contact_email on the form, or account email)
    const clientEmail = contact_email || email;
    if (clientEmail) {
      await resend.emails.send({
        ...emailPayload,
        to: clientEmail,
        subject: `Your quote request has been received — ${subject}`,
        html: htmlBody.replace(
          "Review in Admin Dashboard →",
          "We will be in touch shortly."
        ).replace(
          `href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/submissions"`,
          `href="${process.env.NEXT_PUBLIC_SITE_URL}/portal"`
        ),
      });
    }

    return NextResponse.json({ success: true, submissionId: submission.id });
  } catch (err) {
    console.error("submit error:", err);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
