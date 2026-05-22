// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CurrentUserProvider } from "@/components/CurrentUserProvider";
import { getCurrentUser } from "@/lib/current-user";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "WebNovelist",
  description: "Track your Chinese webnovel reading",
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
          colorBackground: "#111827",
          colorInputBackground: "#1f2937",
          colorText: "#f3f4f6",
          colorInputText: "#f3f4f6",
          colorPrimary: "#2563eb",
        },
      }}
    >
      <html lang="en">
        <body className="bg-gray-950 text-gray-100 min-h-screen flex flex-col">
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
