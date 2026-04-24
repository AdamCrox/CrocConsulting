import OpenAI from "openai";

export const maxDuration = 60;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const { pdfBase64, fileName } = await req.json();
    if (!pdfBase64) return Response.json({ error: "No PDF provided" }, { status: 400 });

    const buffer = Buffer.from(pdfBase64, "base64");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");
    const parsed = await pdfParse(buffer);
    const text = parsed.text?.trim();

    if (!text || text.length < 20) {
      return Response.json({ equipment: [], substation_details: {} });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 3000,
      messages: [
        {
          role: "system",
          content: "You are an expert electrical engineer. Extract structured data from single line diagram (SLD) text. Return only valid JSON — no markdown, no explanation.",
        },
        {
          role: "user",
          content: `Analyse this text extracted from a single line diagram and return a single JSON object with two keys:

1. "substation_details": an object with any general substation information found, such as:
   - "name": substation or project name
   - "location": site or location
   - "owner": owner or client name
   - "voltage_levels": voltage levels present (e.g. "33kV / 11kV")
   - "capacity": total capacity or rating
   - "drawing_number": drawing or document number
   - "revision": revision number or date
   - "date": drawing date
   - "engineer": engineer or designer name
   - "notes": any other general notes
   Only include keys where information is actually found. Omit keys with no data.

2. "equipment": an array where identical equipment types are grouped. Each item must have:
   - "tag": equipment tag or list of tags (e.g. "CB-101, CB-102") or "—"
   - "equipment_type": type of equipment (e.g. "Circuit Breaker", "Power Transformer", "Bus Bar", "Isolator", "CT", "VT", "Cable", "Panel", "Feeder")
   - "voltage_kv": voltage as a number (e.g. 11, 33, 132) or null
   - "rating": rating as string (e.g. "630A", "20MVA") or "—"
   - "qty": integer count of how many of this item exist in the SLD (count individual instances — e.g. if there are 4 circuit breakers of the same type, qty is 4)
   - "notes": any other relevant technical info or "—"

Group items of the same equipment_type and rating together with a combined qty count. Each unique combination of equipment_type + voltage + rating = one row.

SLD text:
${text.slice(0, 6000)}`,
        },
      ],
    });

    const raw = completion.choices[0].message.content.trim();
    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      result = match ? JSON.parse(match[0]) : { equipment: [], substation_details: {} };
    }

    return Response.json({
      equipment: result.equipment ?? [],
      substation_details: result.substation_details ?? {},
      fileName,
    });
  } catch (err) {
    console.error("PDF parse error:", err);
    return Response.json({ error: "Failed to analyse PDF" }, { status: 500 });
  }
}
