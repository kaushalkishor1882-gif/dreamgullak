// /app/head.tsx
export default function Head() {
  return (
    <>
      {/* 🏷️ Website Title */}
      <title>Dream Gullak</title>

      {/* 📄 SEO Description */}
      <meta
        name="description"
        content="Save money for your dreams with Dream Gullak — the easiest way to save securely for goals, gadgets, trips, and more!"
      />

      {/* 🖼️ Open Graph Preview (for WhatsApp, Facebook, LinkedIn) */}
      <meta property="og:title" content="Dream Gullak" />
      <meta
        property="og:description"
        content="Save money for your dreams with Dream Gullak. Build your saving habit smartly and securely today!"
      />
      <meta
        property="og:image"
        content="https://www.dreamgullak.in/logo.png" 
      />
      <meta property="og:url" content="https://www.dreamgullak.in" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Dream Gullak" />

      {/* 🐦 Twitter / Telegram */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Dream Gullak" />
      <meta
        name="twitter:description"
        content="Save money for your dreams with Dream Gullak. The smarter, easier way to save for what you love."
      />
      <meta name="twitter:image" content="https://www.dreamgullak.in/logo.png" />
    </>
  );
}
