import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import ClientLayout from "./components/ClientLayout";
import ClientProviders from "./components/ClientProviders";

// ⭐ Add ThemeProvider
import { ThemeProvider } from "./context/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dream Gullak",
  description: "Save money for your dreams with Dream Gullak.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* ⭐ Wrap entire app with ThemeProvider */}
        <ThemeProvider>
          {/* Your other providers remain intact */}
          <ClientProviders>
            <ClientLayout>{children}</ClientLayout>
          </ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
