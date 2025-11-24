"use client";

import Image from "next/image";

export default function DownloadLanding() {
  return (
    <main className="min-h-screen relative overflow-hidden font-sans text-gray-900">

      {/* BACKGROUND LAYER 1 — Main Fintech Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6A42F6] via-[#8B4BFF] to-[#0AB2FF] opacity-100 -z-30" />

      {/* BACKGROUND LAYER 2 — Wavy Mesh Pattern */}
      <div
        className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none -z-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.08) 0%, transparent 60%), radial-gradient(circle at 30% 70%, rgba(255,255,255,0.05) 0%, transparent 60%)",
        }}
      />

      {/* BACKGROUND LAYER 3 — Wavy SVG Shapes */}
      <svg className="absolute inset-0 w-full h-full opacity-30 -z-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6A42F6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0AB2FF" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        <path d="M0 300 C 300 250 500 350 800 300 C 1100 250 1400 350 1700 300 L 1700 900 L 0 900 Z" fill="url(#waveGradient)" />
        <path d="M0 450 C 300 380 500 470 800 440 C 1100 420 1400 480 1700 430 L 1700 900 L 0 900 Z" fill="url(#waveGradient)" opacity="0.4" />
        <path d="M0 600 C 300 550 500 620 800 600 C 1100 570 1400 650 1700 600 L 1700 900 L 0 900 Z" fill="url(#waveGradient)" opacity="0.25" />
      </svg>

      {/* BACKGROUND LAYER 4 — Animated glow blobs */}
      <div className="absolute w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-blob-slow top-20 left-10 -z-10"></div>
      <div className="absolute w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-blob-slower top-60 right-12 -z-10"></div>
      <div className="absolute w-60 h-60 bg-fuchsia-500/10 rounded-full blur-2xl animate-blob-slower bottom-32 left-1/3 -z-10"></div>

      {/* NAVBAR */}
      <nav className="w-full border-b bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="DreamGullak Logo" className="h-10 w-auto" />
            <span className="text-xl font-bold text-purple-700">DreamGullak</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="/" className="hover:text-purple-700 transition">Home</a>
            <a href="/download" className="bg-purple-700 text-white px-5 py-2 rounded-full shadow hover:bg-purple-800 transition">Download</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT SIDE */}
        <div className="animate-fadeInUp [animation-duration:1.2s]">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-md">
            Dream Gullak — <br /> Save smarter. Reach your goals.
          </h1>

          <p className="mt-6 text-white/90 text-lg max-w-lg">
            Create multiple gullaks (jars), set targets, auto-save, and track your progress.
          </p>

          {/* MAIN DOWNLOAD BUTTON */}
          <div className="mt-8">
            <button className="bg-gradient-to-r from-[#00C6FF] via-[#6A42F6] to-[#FF2D95] text-white px-8 py-4 rounded-full shadow-xl text-lg font-semibold hover:shadow-2xl transition">
              Download App (Coming Soon)
            </button>
          </div>

          {/* APP STORE + PLAY STORE BUTTONS */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">

            <button className="bg-gradient-to-r from-[#00C6FF] via-[#6A42F6] to-[#FF2D95] text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition font-semibold">
              Google Play — Coming Soon
            </button>

            <button className="bg-gradient-to-r from-[#00C6FF] via-[#6A42F6] to-[#FF2D95] text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition font-semibold">
              App Store — Coming Soon
            </button>

          </div>

          {/* FEATURES INLINE WITH GRADIENT SQUARE ICONS */}
          <div className="mt-10 grid grid-cols-2 gap-6 max-w-md">

            {[
              { title: "Multiple Gullaks", desc: "Separate saving jars." },
              { title: "Auto Save", desc: "Recurring deposits." },
              { title: "Secure", desc: "Protected & encrypted." },
              { title: "Track Progress", desc: "Charts & insights." }
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3 animate-fadeInUp">

                {/* Gradient Square Icon */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00C6FF] via-[#6A42F6] to-[#FF2D95] flex items-center justify-center text-white font-bold shadow-md">
                  {i + 1}
                </div>

                <p className="text-sm text-white">
                  <strong>{f.title}</strong><br />{f.desc}
                </p>
              </div>
            ))}
          </div>

        </div>

        {/* HERO IMAGE */}
        <div className="flex justify-center md:justify-end animate-fadeInUp [animation-duration:1.4s]">
          <div className="w-[360px] md:w-[460px] drop-shadow-2xl rounded-3xl overflow-hidden">
            <img src="/hero.png" alt="Dream Gullak App Preview" className="w-full rounded-3xl shadow-2xl" />
          </div>
        </div>

      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="bg-gray-50 py-20 rounded-t-3xl shadow-inner">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center">Features</h2>
          <p className="text-gray-600 text-center mt-2">Everything you need to save easily.</p>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              "Goal-based Jars",
              "Auto & Manual Top-ups",
              "Easy Withdrawals",
              "Transaction History",
              "Referral & Rewards",
              "Security"
            ].map((title, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl shadow hover:shadow-xl transition animate-fadeInUp">
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="mt-3 text-gray-600 text-sm">Details coming soon.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center">How it works</h2>

        <div className="mt-12 grid md:grid-cols-3 gap-10">
          {["Create a Gullak", "Add Money", "Reach Your Goal"].map((step, idx) => (
            <div key={idx} className="bg-gradient-to-b from-purple-100 to-purple-50 p-8 rounded-2xl shadow text-center animate-fadeInUp">
              <div className="text-4xl mb-2">{idx + 1}️⃣</div>
              <h4 className="mt-2 font-semibold text-lg">{step}</h4>
              <p className="text-sm text-gray-600 mt-2">Description coming soon.</p>
            </div>
          ))}
        </div>
      </section>

      {/* SCREENSHOTS */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold">App Screenshots</h2>
          <p className="text-gray-600 mt-2">Real screenshots from the DreamGullak App</p>

          <div className="mt-10 flex flex-wrap gap-6 justify-center">
            {["/screenshots/screen1.png", "/screenshots/screen2.png", "/screenshots/screen3.png"].map((ss, i) => (
              <img key={i} src={ss} alt={`Screenshot ${i + 1}`} className="w-56 rounded-xl shadow-xl animate-fadeInUp" />
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-100 py-10 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="logo" className="h-10 opacity-80" />
            <div>
              <div className="font-semibold text-lg">DreamGullak</div>
              <div className="text-sm text-gray-400">Save for your dreams — coming soon on mobile</div>
            </div>
          </div>

          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} DreamGullak. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ANIMATIONS */}
      <style jsx global>{`
        @keyframes blobMove {
          0% { transform: translate(0px,0px) scale(1); }
          33% { transform: translate(20px,-12px) scale(1.05); }
          66% { transform: translate(-14px,10px) scale(0.97); }
          100% { transform: translate(0px,0px) scale(1); }
        }
        .animate-blob-slow { animation: blobMove 12s infinite ease-in-out; }
        .animate-blob-slower { animation: blobMove 20s infinite ease-in-out; }

        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.9s ease both; }
      `}</style>

    </main>
  );
}
