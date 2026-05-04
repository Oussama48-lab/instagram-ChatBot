import Link from "next/link";

const DM_MESSAGES = [
  { from: "patient", text: "سلام، بغيت نعرف على الأسعار" },
  { from: "bot",     text: "مرحبا 😊 أهلا بك في كابيني! عافاك عطيني سميتك الكاملة" },
  { from: "patient", text: "أنا محمد العلوي" },
  { from: "bot",     text: "مزيان محمد! عافاك رقم تيليفونك؟" },
  { from: "patient", text: "0661234567" },
  { from: "bot",     text: "شكرا 😊 الطبيب غيتصل بيك دابا شوية باش يعطيك les détails" },
];

const FEATURES = [
  { icon: "🤖", title: "AI Responses in Darija & French",   desc: "Replies naturally in Moroccan Darija Arabic script — just like a real receptionist on WhatsApp." },
  { icon: "📅", title: "Automatic Appointment Booking",     desc: "Patients pick a slot, the AI confirms it — zero back-and-forth for your staff." },
  { icon: "📸", title: "Dental Photo Collection",           desc: "Bot gently asks for a dental photo before the consultation so the doctor is prepared." },
  { icon: "🔔", title: "Real-time Doctor Dashboard",        desc: "Hot leads appear instantly. One click sends the booking confirmation to the patient." },
  { icon: "🌙", title: "24/7 Always On",                    desc: "Never miss a DM again — the bot works nights, weekends, and holidays." },
  { icon: "🔒", title: "Secure & GDPR Compliant",           desc: "Patient data is encrypted at rest. We never share or sell your clinic's data." },
];

const STEPS = [
  {
    num: "01",
    title: "Connect your Instagram",
    desc: "Link your clinic's Instagram Business account in one click. Takes under two minutes.",
  },
  {
    num: "02",
    title: "Bot handles everything",
    desc: "The AI collects name, phone number, and a dental photo — automatically in Darija.",
  },
  {
    num: "03",
    title: "You review & confirm",
    desc: "Hot leads appear in your dashboard. Click Done and the patient gets notified instantly.",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "299",
    desc: "Perfect for a single-location clinic just getting started.",
    features: ["1 clinic", "Up to 100 patients / month", "AI triage in Darija", "Basic dashboard"],
    cta: "Start Free Trial",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Pro",
    price: "599",
    desc: "For growing clinics that need full power and analytics.",
    features: ["Unlimited patients", "Priority support", "Custom AI persona", "Analytics & reports"],
    cta: "Get Pro",
    href: "/signup",
    highlight: true,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#07070B] text-zinc-100 overflow-x-hidden">

      {/* ── Background glows ──────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute -bottom-48 right-[-100px] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      {/* ── Navbar ────────────────────────────────────────────────── */}
      <header className="relative z-20 border-b border-white/10 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🦷</span>
            <span className="text-sm font-semibold tracking-tight text-zinc-100">Cabinet Dentaire AI</span>
          </div>
          <Link
            href="/signup"
            className="rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition hover:brightness-110"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pt-24 pb-20 sm:px-6 sm:pt-32">
        <div className="flex flex-col items-center gap-16 lg:flex-row lg:items-center lg:gap-12">

          {/* Left: copy */}
          <div className="flex-1 text-center lg:text-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1.5 text-xs font-medium text-purple-300">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(167,139,250,0.8)]" />
              AI-powered receptionist for Moroccan dental clinics
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Your Dental Clinic's
              <span className="block bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                AI Receptionist
              </span>
              on Instagram
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-zinc-400 lg:max-w-xl">
              Never miss a patient again. Our AI answers DMs 24/7, collects patient info,
              and books appointments — automatically.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Link
                href="/signup"
                className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-6 py-3 text-center text-sm font-semibold text-white shadow-[0_0_30px_rgba(124,58,237,0.35)] transition hover:brightness-110 sm:w-auto"
              >
                Start Free Trial
              </Link>
              <a
                href="#features"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-center text-sm font-medium text-zinc-200 backdrop-blur-xl transition hover:bg-white/10 sm:w-auto"
              >
                See How It Works ↓
              </a>
            </div>
          </div>

          {/* Right: mock DM conversation */}
          <div className="relative w-full max-w-xs flex-shrink-0 sm:max-w-sm">
            {/* Glow behind phone */}
            <div className="absolute inset-0 -z-10 rounded-3xl bg-purple-600/25 blur-3xl" />

            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0D0D15] shadow-2xl">
              {/* IG header */}
              <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 text-sm">🦷</div>
                <div>
                  <div className="text-xs font-semibold text-zinc-100">Cabinet Dentaire AI</div>
                  <div className="text-[10px] text-emerald-400">● Active now</div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex flex-col gap-2.5 px-3 py-4">
                {DM_MESSAGES.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.from === "bot" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      dir="rtl"
                      className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                        msg.from === "bot"
                          ? "rounded-tl-sm bg-gradient-to-br from-purple-600/80 to-fuchsia-600/80 text-white shadow-[0_0_12px_rgba(124,58,237,0.3)]"
                          : "rounded-tr-sm border border-white/10 bg-white/10 text-zinc-200"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-purple-600/30 px-3.5 py-2.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-300 [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-300 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-300 [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────── */}
      <section id="how-it-works" className="relative z-10 border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-purple-400">How it works</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Up and running in minutes</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.num} className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-sm font-bold text-purple-300 border border-purple-500/20">
                  {step.num}
                </div>
                <h3 className="mb-2 text-base font-semibold tracking-tight">{step.title}</h3>
                <p className="text-sm leading-6 text-zinc-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Features</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Everything your clinic needs</h2>
            <p className="mt-4 text-sm text-zinc-400">Built specifically for Moroccan dental clinics.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:border-purple-500/30 hover:bg-white/[0.07]"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent opacity-0 transition group-hover:opacity-100" />
                <div className="mb-3 text-2xl">{f.icon}</div>
                <h3 className="mb-1.5 text-sm font-semibold tracking-tight text-zinc-100">{f.title}</h3>
                <p className="text-xs leading-5 text-zinc-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────── */}
      <section id="pricing" className="relative z-10 border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-purple-400">Pricing</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Simple, transparent pricing</h2>
            <p className="mt-4 text-sm text-zinc-400">No hidden fees. Cancel any time.</p>
          </div>

          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative overflow-hidden rounded-2xl border p-8 backdrop-blur-xl ${
                  plan.highlight
                    ? "border-purple-500/40 bg-gradient-to-b from-purple-500/10 to-white/5 shadow-[0_0_60px_rgba(124,58,237,0.15)]"
                    : "border-white/10 bg-white/5"
                }`}
              >
                {plan.highlight && (
                  <>
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                    <div className="absolute right-4 top-4 rounded-full bg-purple-500/20 border border-purple-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-purple-300">
                      Most Popular
                    </div>
                  </>
                )}

                <div className="mb-1 text-base font-semibold text-zinc-100">{plan.name}</div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                  <span className="text-sm text-zinc-400">MAD / month</span>
                </div>
                <p className="mt-3 text-xs leading-5 text-zinc-400">{plan.desc}</p>

                <ul className="mt-6 space-y-2.5">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-xs text-zinc-300">
                      <span className="text-emerald-400">✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`mt-8 block w-full rounded-xl py-2.5 text-center text-sm font-semibold transition ${
                    plan.highlight
                      ? "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white hover:brightness-110 shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                      : "border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🦷</span>
              <span className="text-sm font-semibold text-zinc-300">Cabinet Dentaire AI</span>
            </div>

            <div className="flex items-center gap-6 text-xs text-zinc-500">
              <Link href="/privacy" className="transition hover:text-zinc-300">Privacy Policy</Link>
              <Link href="/login"   className="transition hover:text-zinc-300">Login</Link>
              <Link href="/signup"  className="transition hover:text-zinc-300">Sign Up</Link>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-zinc-600">
            Made with ❤️ in Morocco 🇲🇦
          </div>
        </div>
      </footer>

    </div>
  );
}
