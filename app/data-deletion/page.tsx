export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-[#07070B] text-zinc-100 px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl">🦷</span>
          <h1 className="text-2xl font-bold">Cabinet Dentaire AI</h1>
        </div>

        <h2 className="text-xl font-semibold mb-4">Data Deletion Request</h2>

        <p className="text-zinc-400 mb-6">
          If you would like to delete your data from Cabinet Dentaire AI, you have the following options:
        </p>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-semibold mb-2">Option 1 — Email Request</h3>
            <p className="text-zinc-400 text-sm">
              Send an email to{" "}
              <a
                href="mailto:oussama.tajeddine.off@gmail.com"
                className="text-purple-400 hover:underline"
              >
                oussama.tajeddine.off@gmail.com
              </a>{" "}
              with the subject line <strong>"Data Deletion Request"</strong> and include your Instagram username. We will delete your data within 30 days.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-semibold mb-2">Option 2 — What data we store</h3>
            <p className="text-zinc-400 text-sm">
              We store the following data when you interact with our Instagram bot:
            </p>
            <ul className="mt-3 space-y-1 text-zinc-400 text-sm list-disc list-inside">
              <li>Your Instagram user ID</li>
              <li>Your full name (provided by you)</li>
              <li>Your phone number (provided by you)</li>
              <li>Dental photos (provided by you)</li>
              <li>Message history with the bot</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-semibold mb-2">Option 3 — Through Facebook</h3>
            <p className="text-zinc-400 text-sm">
              You can also remove our app's access to your data through Facebook Settings → Apps and Websites → Remove Cabinet Dentaire AI.
            </p>
          </div>
        </div>

        <p className="mt-8 text-zinc-500 text-sm">
          All deletion requests are processed within 30 days. For questions, contact us at{" "}
          <a
            href="mailto:oussama.tajeddine.off@gmail.com"
            className="text-purple-400 hover:underline"
          >
            oussama.tajeddine.off@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
