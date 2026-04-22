import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export async function POST(request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const body = await request.json();
    const { email, company, contact_name, phone, equipment_type, voltage_level, quantity, details, files } = body;

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
        quantity,
        details,
        files: files ?? [],
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    // Notify admin
    await resend.emails.send({
      from: "CrocConsulting <noreply@crocconsulting.com.au>",
      to: "adam.croxton@outlook.com",
      subject: `New Quote Request — ${company || email}`,
      html: `
        <h2>New Quote Request</h2>
        <p><strong>From:</strong> ${contact_name || "Unknown"} &lt;${email}&gt;</p>
        <p><strong>Company:</strong> ${company || "N/A"}</p>
        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p><strong>Equipment:</strong> ${equipment_type} (${voltage_level || "Voltage not specified"})</p>
        <p><strong>Quantity:</strong> ${quantity || "N/A"}</p>
        ${details?.description ? `<p><strong>Description:</strong> ${details.description}</p>` : ""}
        ${details?.timeframe ? `<p><strong>Timeframe:</strong> ${details.timeframe}</p>` : ""}
        ${details?.site_location ? `<p><strong>Location:</strong> ${details.site_location}</p>` : ""}
        ${files?.length > 0 ? `<p><strong>Files:</strong> ${files.map((u, i) => `<a href="${u}">File ${i + 1}</a>`).join(", ")}</p>` : ""}
        <hr />
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/submissions">Review in admin dashboard →</a></p>
      `,
    });

    return NextResponse.json({ success: true, submissionId: submission.id });
  } catch (err) {
    console.error("submit error:", err);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
