// app/layout.tsx
import type { Metadata } from "next";
import { DM_Sans, IBM_Plex_Mono, Shippori_Mincho } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CurrentUserProvider } from "@/components/CurrentUserProvider";
import { getCurrentUser } from "@/lib/current-user";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

// UI sans — quiet, modern; carries body copy + chrome.
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

// Ledger mono — the Folio sheets' metadata voice (dates, counts, labels,
// bracket verbs). Never carries prose.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

// Literary display serif — novel titles + section headings.
const shippori = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-shippori",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WebNovelist",
  description: "Track your reading — webnovels, manga, manhwa, and light novels",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dbUser = await getCurrentUser();
  const currentUser = dbUser
    ? {
        id: dbUser.id,
        username: dbUser.username,
        role: dbUser.role,
        avatarUrl: dbUser.avatarUrl,
      }
    : null;

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorBackground: "#16140f",
          colorInputBackground: "#211e17",
          colorText: "#f0ede8",
          colorInputText: "#f0ede8",
          colorPrimary: "#c9a84c",
        },
      }}
    >
      <html
        lang="en"
        className={`${dmSans.variable} ${plexMono.variable} ${shippori.variable}`}
      >
        <body className="text-body min-h-screen flex flex-col font-sans antialiased">
          <CurrentUserProvider value={currentUser}>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-8 flex-1">
              {children}
            </main>
            <Footer />
          </CurrentUserProvider>

          {/* Vercel Monitoring */}
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
