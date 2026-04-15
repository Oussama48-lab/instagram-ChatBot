"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
export default function CommandCenterPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [openSlots, setOpenSlots] = useState<any[]>([]); // stores all slots from Supabase
  async function handleMessage(message: string) {
    console.log("User said:", message);

    // 1. Call Claude to extract day + time
    const res = await fetch("/api/analyse-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const { intent, day, time } = await res.json();

    if (intent !== "book" || !day || !time) {
      console.log("No booking intent detected");
      return;
    }

    // 2. Fetch open slots
    const { data: slots } = await supabase
      .from("appointment_slots")
      .select("*")
      .eq("status", "open");

    if (!slots || slots.length === 0) {
      console.log("No slots available");
      return;
    }

    // 3. Find the matching slot
    const slot = slots.find((s) => s.day === day && s.time === time);

    if (!slot) {
      console.log("Requested slot not available");
      return;
    }

    // 4. Book it
    const success = await bookSlot(slot.id);
    if (success) getOpenSlots();
  }
  async function getOpenSlots() {
    const { data, error } = await supabase
      .from("appointment_slots")
      .select("*")

    if (error) {
      console.error("Error fetching slots:", error);
    } else {
      console.log("Open slots:", data);
      setOpenSlots(data); // save slots to state
    }
  }
  useEffect(() => {
    getOpenSlots(); // fetch open slots on component mount
    getCustomers();
  }, []);

  // Transform openSlots into the same shape as your old 'slots' object
  const slotsByDay: Record<string, Record<string, "open" | "confirmed" | "blocked">> = useMemo(() => {
    const result: Record<string, Record<string, "open" | "confirmed" | "blocked">> = {};

    openSlots.forEach((slot) => {
      if (!result[slot.day]) {
        result[slot.day] = {};
      }
      result[slot.day][slot.time] = slot.is_booked ? "confirmed" : slot.status === "blocked" ? "blocked" : "open";
    });

    return result;
  }, [openSlots]);

  async function bookSlot(slotId: number) {
    const { data, error } = await supabase
      .from("appointment_slots")
      .update({
        status: "confirmed",
        is_booked: true
      })
      .eq("id", slotId)
      .select();

    if (error) {
      console.error("Error booking slot:", error);
      return false;
    }

    console.log("Slot booked successfully:", data);
    return true;
  }
  async function getCustomers() {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching customers:", error);
    } else {
      setCustomers(data || []);
    }
  }

  const steps = [
    {
      title: "Incoming DM",
      subtitle: "Triggers + intent capture",
      badge: "Instagram",
      accent: "from-[#7C3AED] to-[#D946EF]",
    },
    {
      title: "AI Analysis",
      subtitle: "Extracts goal, urgency, and slot fit",
      badge: "Model",
      accent: "from-[#60A5FA] to-[#A78BFA]",
    },
    {
      title: "Auto-Reply / Book",
      subtitle: "Draft reply + reserve appointment",
      badge: "Scheduler",
      accent: "from-[#10B981] to-[#34D399]",
    },
  ];

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
  const times = ["9a", "11a", "1p", "3p", "5p"] as const;
  type Day = (typeof days)[number];
  type Time = (typeof times)[number];
  type SlotState = "open" | "confirmed" | "blocked";

  const liveFeed = [
    {
      name: "Maya K.",
      handle: "@mayakdesign",
      time: "Just now",
      message: "Do you have anything this Thursday afternoon?",
      draft:
        "Yes — I can do Thu at 3:00 PM or 5:00 PM. Which works best for you, and what’s the best email to send the confirmation?",
      status: "needs-approval",
      dentalImage: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Jared S.",
      handle: "@jared.studio",
      time: "2m",
      message: "Price for a 30-min consult?",
      draft:
        "A 30-minute consult is $49. If you'd like, I can book you into the next open slot and send a confirmation.",
      status: "edited",
      dentalImage: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Nina",
      handle: "@ninawellness",
      time: "8m",
      message: "Can I reschedule my appointment from Friday?",
      draft:
        "Absolutely — tell me your preferred day/time window and I’ll propose a few open slots for you.",
      status: "auto-sent",
    },
  ];

  const chip = (label: string, tone: "purple" | "emerald" | "zinc") => {
    const cls =
      tone === "purple"
        ? "border-purple-500/30 bg-purple-500/10 text-purple-200"
        : tone === "emerald"
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
          : "border-white/10 bg-white/5 text-zinc-200";
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${cls}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="min-h-[100dvh] bg-[#07070B] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-purple-600/25 blur-3xl" />
        <div className="absolute -bottom-40 right-[-80px] h-[520px] w-[520px] rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_50%_-10%,rgba(124,58,237,0.25),rgba(7,7,11,0)_60%)]" />
      </div>

      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl" />
              <div className="min-w-0">
                <div className="truncate text-sm text-zinc-300">Command Center</div>
                <h1 className="truncate text-lg font-semibold tracking-tight">
                  InstaSchedule Pro
                </h1>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            {chip("IG: Connected", "purple")}
            {chip("Auto-Reply: On", "zinc")}
            {chip("Bookings: Live", "emerald")}
          </div>

          <div className="flex items-center gap-2">
            <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 backdrop-blur-xl transition hover:bg-white/10">
              New Rule
            </button>


            <button className="rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-3 py-2 text-sm font-medium text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition hover:brightness-110">
              Publish
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleMessage("book monday at 3pm")}
            className="rounded-xl bg-emerald-500 px-3 py-2 text-sm text-white"
          >
            Test Booking
          </button></div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <section className="lg:col-span-8">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold tracking-tight">Automation Hub</h2>
                  <p className="text-sm text-zinc-300">
                    Visual logic for DM → analysis → booking
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {chip("Logic Builder", "zinc")}
                  {chip("Electric Purple", "purple")}
                </div>
              </div>

              <div className="relative mt-5">
                <svg
                  className="pointer-events-none absolute inset-0 hidden h-full w-full sm:block"
                  viewBox="0 0 1000 220"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="flow" x1="0" x2="1">
                      <stop offset="0%" stopColor="rgba(124,58,237,0.85)" />
                      <stop offset="100%" stopColor="rgba(16,185,129,0.85)" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M240 110 C 340 110, 360 110, 470 110"
                    fill="none"
                    stroke="url(#flow)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.9"
                  />
                  <path
                    d="M530 110 C 640 110, 660 110, 760 110"
                    fill="none"
                    stroke="url(#flow)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.9"
                  />
                  <circle cx="240" cy="110" r="3.5" fill="rgba(124,58,237,0.95)" />
                  <circle cx="470" cy="110" r="3.5" fill="rgba(167,139,250,0.95)" />
                  <circle cx="530" cy="110" r="3.5" fill="rgba(96,165,250,0.95)" />
                  <circle cx="760" cy="110" r="3.5" fill="rgba(16,185,129,0.95)" />
                </svg>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {steps.map((s) => (
                    <div
                      key={s.title}
                      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
                    >
                      <div
                        className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${s.accent}`}
                      />
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold">{s.title}</div>
                          <div className="mt-1 text-xs text-zinc-300">{s.subtitle}</div>
                        </div>
                        <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[11px] text-zinc-200">
                          {s.badge}
                        </span>
                      </div>

                      <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
                        <div className="flex items-center justify-between text-xs text-zinc-300">
                          <span>Confidence</span>
                          <span className="text-zinc-200">0.92</span>
                        </div>
                        <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
                          <div className="h-1.5 w-[92%] rounded-full bg-gradient-to-r from-purple-500 to-emerald-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold tracking-tight">Availability Matrix</h2>
                  <p className="text-sm text-zinc-300">
                    Weekly view: open slots vs confirmed appointments
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {chip("Confirmed", "emerald")}
                  {chip("Open", "zinc")}
                </div>
              </div>

              <div className="mt-6 overflow-x-auto pb-4">
                <div className="min-w-[760px] rounded-2xl border border-white/5 bg-[#0A0A0E] p-4 shadow-inner shadow-white/5">
                  <div className="grid grid-cols-8 gap-3">
                    <div className="col-span-1" />
                    {days.map((d) => (
                      <div key={d} className="col-span-1 mb-2 text-center text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                        {d}
                      </div>
                    ))}

                    {times.map((t) => (
                      <div key={t} className="contents">
                        <div className="col-span-1 flex items-center justify-end pr-3 text-xs font-medium text-zinc-500">
                          {t}
                        </div>
                        {days.map((d) => {
                          const v: SlotState = slotsByDay[d]?.[t] ?? "open";
                          const isConfirmed = v === "confirmed";
                          const isBlocked = v === "blocked";
                          const isOpen = v === "open";

                          const bg = isConfirmed
                            ? "bg-emerald-500/10 border-emerald-500/20"
                            : isBlocked
                              ? "bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed"
                              : "bg-white/[0.03] border-white/10 hover:border-purple-500/30 hover:bg-purple-500/10 hover:shadow-[0_0_15px_rgba(124,58,237,0.1)]";

                          return (
                            <button
                              key={`${d}-${t}`}
                              disabled={!isOpen}
                              className={`col-span-1 flex h-[68px] flex-col justify-center rounded-xl border ${bg} p-3 text-left transition-all duration-300 ${isOpen ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
                            >
                              <div className="flex w-full items-center justify-between gap-2">
                                <span className={`text-[13px] font-semibold ${isConfirmed ? 'text-emerald-400' : isBlocked ? 'text-zinc-600' : 'text-zinc-200'}`}>
                                  {isConfirmed ? "Booked" : isBlocked ? "Blocked" : "Open"}
                                </span>
                                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${isConfirmed ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : isBlocked ? 'bg-zinc-700' : 'bg-purple-400 shadow-[0_0_8px_rgba(167,139,250,0.6)]'}`} />
                              </div>
                              <span className={`mt-1 text-[11px] font-medium ${isConfirmed ? 'text-emerald-500/70' : isBlocked ? 'text-zinc-700' : 'text-zinc-500'}`}>
                                {isConfirmed ? "30m • Consult" : "30 min"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="lg:col-span-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold tracking-tight">Live Feed</h2>
                  <p className="text-sm text-zinc-300">
                    Real-time messages + AI drafted response
                  </p>
                </div>
                {chip("Realtime", "zinc")}
              </div>

              <div className="mt-5 space-y-3">
                {/* Check if we have real customers from Supabase */}
                {customers.length > 0 ? (
                  customers.map((customer) => (
                    <div key={customer.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">Patient #{customer.instagram_id?.slice(-5)}</div>
                          <div className="truncate text-xs text-zinc-400">Instagram • Just now</div>
                        </div>
                        {customer.last_dental_image ? chip("Photo Received", "purple") : chip("New Lead", "zinc")}
                      </div>

                      {/* This displays the actual image you just saved to Supabase! */}
                      {customer.last_dental_image && (
                        <div className="mt-3">
                          <div className="group relative aspect-[16/9] overflow-hidden rounded-xl border border-white/10 bg-black/40">
                            <img
                              src={customer.last_dental_image}
                              alt="Patient Dental Scan"
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-[10px] font-bold text-emerald-400">
                              LIVE CAPTURE
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-2.5">
                        <div className="text-[11px] font-medium text-zinc-300">Status</div>
                        <div className="mt-1 text-sm text-zinc-100">
                          {customer.last_dental_image ? "Image ready for review." : "Awaiting message..."}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  /* This shows if your table is still empty */
                  <div className="text-center py-10 text-zinc-500 text-sm border border-dashed border-white/10 rounded-2xl">
                    No messages received yet.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold tracking-tight">
                    Knowledge Base Settings
                  </h2>
                  <p className="text-sm text-zinc-300">
                    Business facts and tone-of-voice for the AI
                  </p>
                </div>
                {chip("Minimal", "zinc")}
              </div>

              <div className="mt-5 space-y-3">
                <label className="block">
                  <div className="text-xs font-medium text-zinc-300">Business Facts</div>
                  <textarea
                    className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] outline-none focus:border-purple-400/35 focus:ring-2 focus:ring-purple-500/15"
                    rows={5}
                    placeholder={
                      "Hours, pricing, location, cancellation policy, key services...\n\nExample:\n- 30-min consult: $49\n- Booking window: Mon–Fri\n- Cancellation: 24 hours"
                    }
                    defaultValue={
                      "• 30-min consult: $49\n• Office hours: Mon–Fri, 9am–5pm\n• Cancellation: 24 hours notice\n• Services: Consults, onboarding, follow-ups"
                    }
                  />
                </label>

                <label className="block">
                  <div className="text-xs font-medium text-zinc-300">Tone of Voice</div>
                  <textarea
                    className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] outline-none focus:border-purple-400/35 focus:ring-2 focus:ring-purple-500/15"
                    rows={4}
                    placeholder={"Short, professional, friendly. Ask one question at a time."}
                    defaultValue={
                      "Professional, warm, and concise. Ask one question at a time. Confirm details before booking. Never overpromise. Use clear next steps."
                    }
                  />
                </label>

                <button className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-3 py-2 text-sm font-medium text-white transition hover:brightness-110">
                  Save settings
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

