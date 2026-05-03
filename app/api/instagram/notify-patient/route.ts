import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getAvailableSlots(bizId: number): Promise<string> {
  const { data: slots } = await supabase
    .from("appointment_slots")
    .select("day, time")
    .eq("is_booked", false)
    .eq("status", "open")
    .eq("business_owner_id", bizId)
    .order("day", { ascending: true });

  if (!slots || slots.length === 0) return "ما كاين حتى slot متاح دابا.";

  const DAY_LABEL: Record<string, string> = {
    Mon: "Lundi", Tue: "Mardi", Wed: "Mercredi",
    Thu: "Jeudi", Fri: "Vendredi", Sat: "Samedi", Sun: "Dimanche",
  };
  const TIME_LABEL: Record<string, string> = {
    "9a": "09h00", "10a": "10h00", "11a": "11h00", "12p": "12h00",
    "1p": "13h00", "2p": "14h00", "3p":  "15h00", "4p":  "16h00",
    "5p": "17h00", "6p": "18h00", "7p":  "19h00", "8p":  "20h00",
    "9p": "21h00", "10p": "22h00",
  };

  const byDay: Record<string, string[]> = {};
  for (const s of slots) {
    if (!byDay[s.day]) byDay[s.day] = [];
    byDay[s.day].push(TIME_LABEL[s.time] ?? s.time);
  }

  const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return DAY_ORDER
    .filter(d => byDay[d])
    .map(d => `• ${DAY_LABEL[d] ?? d}: ${byDay[d].join(", ")}`)
    .join("\n");
}

async function sendDM(recipientId: string, text: string, token: string) {
  await fetch(`https://graph.facebook.com/v25.0/me/messages?access_token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message:   { text },
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { customer_id } = await req.json();
    if (!customer_id) return NextResponse.json({ error: "Missing customer_id" }, { status: 400 });

    // Fetch customer
    const { data: customer } = await supabase
      .from("customers")
      .select("instagram_id, business_owner_id, name, first_name")
      .eq("id", customer_id)
      .maybeSingle();

    if (!customer?.instagram_id) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Fetch page access token from business owner
    const { data: biz } = await supabase
      .from("buisness_owner")
      .select("page_access_token")
      .eq("id", customer.business_owner_id)
      .maybeSingle();

    if (!biz?.page_access_token) {
      return NextResponse.json({ error: "No page access token found" }, { status: 500 });
    }

    const availableSlots = await getAvailableSlots(customer.business_owner_id);
    const name = customer.name || customer.first_name || "";
    const greetMsg = `مرحبا${name ? ` ${name}` : ""} 😊 الطبيب شاف ملفك وكيقولك مزيان. واش بغيتي تدير رونديفو؟ هادي الأوقات المتاحة:\n${availableSlots}`;

    await sendDM(customer.instagram_id, greetMsg, biz.page_access_token);

    // Update status to BOT_ACTIVE so bot can handle booking replies
    await supabase
      .from("customers")
      .update({ status: "BOT_ACTIVE" })
      .eq("id", customer_id);

    console.log(`[NOTIFY] Greeting sent to ${customer.instagram_id}`);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[NOTIFY ERROR]", err);
    return NextResponse.json({ error: err?.message ?? "Internal error" }, { status: 500 });
  }
}
