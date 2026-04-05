// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SessionProvider from "@/components/SessionProvider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "WebNovelist",
  description: "Track your Chinese webnovel reading",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen flex flex-col">
        <SessionProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 py-8 flex-1">
            {children}
          </main>
          <Footer />
        </SessionProvider>

        {/* Vercel Monitoring */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}