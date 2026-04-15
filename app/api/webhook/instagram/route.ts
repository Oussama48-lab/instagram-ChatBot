import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ── Code-side day extractor ──────────────────────────────────────────────────
// Scans the raw message text for any day word and returns the slot code.
// This runs BEFORE the AI so we never depend on Gemini to extract the day.
function extractDayFromText(text: string): string | null {
  const CODES    = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const todayIdx = new Date().getDay();
  const t        = text.toLowerCase();

  // Relative words — order matters (longest match first)
  if (/ba3d\s*ghda|ba3dghda|après-demain/.test(t)) return CODES[(todayIdx + 2) % 7];
  if (/ghda|ghdda|demain/.test(t))                  return CODES[(todayIdx + 1) % 7];
  if (/had\s*nhar|lyoum|aujourd'hui/.test(t))        return CODES[todayIdx];

  // Absolute day words
  const PATTERNS: Array<[RegExp, string]> = [
    [/\bl-?tnin\b|lundi|monday|\bmon\b/,        "Mon"],
    [/\bt-?talata\b|talata|mardi|tuesday|\btue\b/, "Tue"],
    [/\bl-?arb[ae]3?\b|arba|mercredi|wednesday|\bwed\b/, "Wed"],
    [/\bl-?khamis\b|khamis|jeudi|thursday|\bthu\b/, "Thu"],
    [/\bl?-?j?jmaa\b|ljmaa|juma|vendredi|friday|\bfri\b/, "Fri"],
    [/\bl-?sebt\b|ssebt|lsebt|samedi|saturday|\bsat\b/, "Sat"],
    [/\bl-?had\b|lhad|dimanche|sunday|\bsun\b/,   "Sun"],
  ];
  for (const [regex, code] of PATTERNS) {
    if (regex.test(t)) return code;
  }
  return null;
}

// ── Code-side time extractor ─────────────────────────────────────────────────
// Same idea — scan the raw message for a time before calling the AI.
function extractTimeFromText(text: string): string | null {
  const t = text.toLowerCase();

  // "m3a X" pattern first
  const m3aMatch = t.match(/m3a\s*(\d{1,2})/);
  if (m3aMatch) {
    const h = parseInt(m3aMatch[1]);
    if (h === 9)                  return "9a";
    if (h === 11)                 return "11a";
    if (h === 1  || h === 13)     return "1p";
    if (h === 3  || h === 15)     return "3p";
    if (h === 4  || h === 16)     return "3p"; // 4pm → nearest slot
    if (h === 5  || h === 17)     return "5p";
  }

  // HH:MM or HHh patterns
  const clockMatch = t.match(/\b(\d{1,2})(?::00|h)\b/);
  if (clockMatch) {
    const h = parseInt(clockMatch[1]);
    if (h === 9)              return "9a";
    if (h === 11)             return "11a";
    if (h === 1  || h === 13) return "1p";
    if (h === 3  || h === 15) return "3p";
    if (h === 4  || h === 16) return "3p";
    if (h === 5  || h === 17) return "5p";
  }

  // Bare slot codes the AI or user might type
  if (/\b9a\b/.test(t))  return "9a";
  if (/\b11a\b/.test(t)) return "11a";
  if (/\b1p\b/.test(t))  return "1p";
  if (/\b3p\b/.test(t))  return "3p";
  if (/\b5p\b/.test(t))  return "5p";

  return null;
}

// ── Code-side name/phone extractor ───────────────────────────────────────────
// Light regex pass — catches "Firstname Lastname, 06XXXXXXXX" patterns.
// The AI will also extract names; this is a safety net.
function extractPhoneFromText(text: string): string | null {
  const match = text.match(/(?:\+212|0)([ \-]?\d){9}/);
  return match ? match[0].replace(/\s|-/g, "") : null;
}

// ── GET — webhook verification ───────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode      = searchParams.get("hub.mode");
  const token     = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// ── POST — incoming messages ─────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body      = await req.json();
    const entry     = body?.entry?.[0];
    const messaging = entry?.messaging?.[0];

    if (
      !messaging ||
      messaging.message?.is_echo ||
      messaging.read ||
      messaging.delivery
    ) {
      return new Response("OK", { status: 200 });
    }

    const senderId    = messaging.sender?.id;
    const messageId   = messaging.message?.mid as string | undefined;
    const messageText = messaging.message?.text || "";

    // ── Atomic deduplication ─────────────────────────────────────────────────
    if (messageId) {
      const { error: dedupError } = await supabase
        .from("processed_messages")
        .insert({ message_id: messageId, processed_at: new Date().toISOString() });

      if (dedupError?.code === "23505") {
        return new Response("OK", { status: 200 }); // duplicate — ignore
      }
    }

    // ── Image-only branch ────────────────────────────────────────────────────
    const imagesDetected: string[] = (messaging.message?.attachments ?? [])
      .filter((a: any) => a.type === "image")
      .map((a: any) => a.payload.url);

    if (!messageText && imagesDetected.length > 0) {
      if (senderId) {
        await supabase.from("customers").upsert(
          {
            instagram_id:      senderId,
            last_seen_at:      new Date().toISOString(),
            last_dental_image: imagesDetected[imagesDetected.length - 1],
          },
          { onConflict: "instagram_id" }
        );
      }
      await sendInstagramMessage(
        senderId,
        "safi ra cheft tsswira dyalk , golia ghi we9tach t9der tji o 3tini ssmya o knya dyalk o numero dyal tel"
      );
      return new Response("OK", { status: 200 });
    }

    if (!messageText) return new Response("OK", { status: 200 });

    // ── Text branch ──────────────────────────────────────────────────────────

    // 1. Load saved profile
    const { data: savedProfile } = await supabase
      .from("customers")
      .select("first_name, last_name, phone, pending_day, pending_time")
      .eq("instagram_id", senderId)
      .maybeSingle();

    const CODES     = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const todayIdx  = new Date().getDay();
    const todayName = CODES[todayIdx];

    const knownFirstName = savedProfile?.first_name  ?? null;
    const knownLastName  = savedProfile?.last_name   ?? null;
    const knownPhone     = savedProfile?.phone        ?? null;
    const knownDay       = savedProfile?.pending_day  ?? null;
    const knownTime      = savedProfile?.pending_time ?? null;

    // 2. Pre-extract day/time/phone from the raw message IN CODE
    //    This is the source of truth — AI extraction is a bonus on top.
    const codeDay   = extractDayFromText(messageText);
    const codeTime  = extractTimeFromText(messageText);
    const codePhone = extractPhoneFromText(messageText);

    // 3. Build AI prompt with full context
    const profileSummary = [
      knownFirstName ? `First name: ${knownFirstName}` : "First name: unknown",
      knownLastName  ? `Last name: ${knownLastName}`   : "Last name: unknown",
      knownPhone     ? `Phone: ${knownPhone}`           : "Phone: unknown",
    ].join("\n");

    const stillNeeded = [
      !knownFirstName && "first name",
      !knownLastName  && "last name",
      !knownPhone && !codePhone && "phone number",
    ].filter(Boolean) as string[];

    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction: `You are a professional Moroccan Dental Assistant. Today is ${todayName}.

SAVED CUSTOMER PROFILE (do NOT ask for anything already listed here):
${profileSummary}

STILL NEEDED FROM THE USER:
${stillNeeded.length === 0 ? "Nothing — all profile fields are already known." : stillNeeded.join(", ")}

YOUR JOB:
- Reply ONLY in short Moroccan Darija.
- Extract first name and last name if the user provides them in this message.
- If all profile fields are known and the user has given a day and time, confirm the appointment warmly — do NOT ask for anything else.
- If profile fields are still missing AND not in this message, ask for ALL of them in ONE message.
- NEVER ask for a field already in the saved profile.

OUTPUT: JSON only — no markdown, no backticks, no extra text.
{
  "reply": "Darija reply",
  "extracted": {
    "first_name": "string | null",
    "last_name":  "string | null",
    "phone":      "string | null"
  }
}`,
    });

    let confirmationText = "";

    try {
      const result  = await model.generateContent(messageText);
      const rawText = result.response
        .text().trim()
        .replace(/```json/g, "").replace(/```/g, "").trim();

      const parsed = JSON.parse(rawText);
      const { reply, extracted } = parsed;

      // 4. Merge — code extractions win for day/time/phone, AI wins for names
      const fName   = extracted.first_name || knownFirstName;
      const lName   = extracted.last_name  || knownLastName;
      const pNumber = extracted.phone || codePhone || knownPhone;
      const day     = codeDay   || knownDay;   // code extraction is authoritative
      const time    = codeTime  || knownTime;  // code extraction is authoritative

      // 5. Persist everything we now know
      if (senderId) {
        const updateData: Record<string, any> = {
          instagram_id: senderId,
          last_seen_at: new Date().toISOString(),
        };
        if (fName)   updateData.first_name   = fName;
        if (lName)   updateData.last_name    = lName;
        if (pNumber) updateData.phone        = pNumber;
        if (day)     updateData.pending_day  = day;
        if (time)    updateData.pending_time = time;

        await supabase
          .from("customers")
          .upsert(updateData, { onConflict: "instagram_id" });
      }

      // 6. Code decides whether to book
      const canBook = !!(fName && lName && pNumber && day && time);

      if (canBook) {
        const fullName = `${fName} ${lName}`.trim();

        const { data: slot } = await supabase
          .from("appointment_slots")
          .select("id")
          .eq("status", "open")
          .eq("day", day)
          .eq("time", time)
          .maybeSingle();

        if (slot) {
          const { error: bookError } = await supabase
            .from("appointment_slots")
            .update({
              status:         "confirmed",
              is_booked:      true,
              user_id:        senderId,
              booked_by_name: fullName,
            })
            .eq("id", slot.id);

          if (!bookError) {
            await supabase
              .from("customers")
              .update({ pending_day: null, pending_time: null })
              .eq("instagram_id", senderId);

            confirmationText = `✅ Safi ${fName}! T-confirmat lik l-mou3id nhar ${day} m3a ${time}. Ntsawro!`;
          } else {
            confirmationText = "Smahlina, waq3 chi mouchkil f l-booking. 3awd jereb.";
          }
        } else {
          await supabase
            .from("customers")
            .update({ pending_day: null, pending_time: null })
            .eq("instagram_id", senderId);

          confirmationText = `Smah lia, nhar ${day} m3a ${time} déjà 3amr. Chouf chi weqt akhor?`;
        }
      } else {
        // Not ready — use AI reply, but make sure it doesn't ask for known info
        confirmationText = reply;
      }
    } catch (aiErr) {
      console.error("AI Logic Error:", aiErr);
      confirmationText = "Smah lia, waq3 chi mouchkil chwia. 3awd sift message.";
    }

    await sendInstagramMessage(senderId, confirmationText);
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("WEBHOOK CRASH:", error);
    return new Response("OK", { status: 200 });
  }
}

// ── Helper ───────────────────────────────────────────────────────────────────
async function sendInstagramMessage(recipientId: string, text: string) {
  if (!recipientId || !text) return;
  await fetch(
    `https://graph.facebook.com/v21.0/me/messages?access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message:   { text },
      }),
    }
  );
}