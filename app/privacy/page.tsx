// app/privacy/page.tsx
import { FolioSheet, FolioLabel } from "@/components/FolioKit";
import FolioNav from "@/components/FolioNav";

export const metadata = {
  title: "Privacy — WebNovelist",
  description:
    "What WebNovelist collects, what's public by design, and how to take your data with you.",
};

// The stack behind the site, named plainly. Everything here acts as a
// processor — data goes to them only to run WebNovelist itself.
const PROCESSORS = [
  { name: "clerk", role: "sign-in and sessions" },
  { name: "supabase", role: "the database · sydney, australia" },
  { name: "cloudinary", role: "avatar images" },
  { name: "vercel", role: "hosting · anonymized analytics" },
];

export default function PrivacyPage() {
  return (
    <FolioSheet statusLeft="webnovelist · privacy" statusRight="updated aug 23, 2026" footer="ink & gold">
      {/* The short version */}
      <div className="border-b border-hairline px-4 py-4">
        <FolioLabel>The short version</FolioLabel>
        <p className="font-serif text-[14px] leading-relaxed text-muted">
          WebNovelist asks for very little: an email address to make an account,
          and the reading you choose to log. Profiles and libraries are public by
          design — that is the point of a tracker you can share. Nothing here is
          sold, there are no ads, and the only cookies keep you signed in. You can
          export everything you have entered, or ask for all of it to be deleted,
          at any time.
        </p>
      </div>

      {/* What is collected */}
      <div className="border-b border-hairline px-4 py-4">
        <FolioLabel>What is collected</FolioLabel>
        <div className="space-y-3 font-serif text-[14px] leading-relaxed text-muted">
          <p>
            <span className="text-body">Your account.</span> An email address and
            username, handled by Clerk — or passed along by the sign-in provider
            you choose. An avatar if you upload one, a banner colour if you pick
            one.
          </p>
          <p>
            <span className="text-body">Your library.</span> Everything you log:
            reading statuses, chapter marks, ratings, personal notes, favourites,
            the readers you follow, and any titles you submit to the catalog.
          </p>
          <p>
            <span className="text-body">Imports.</span> If you import an AniList
            or MyAnimeList list, only the rows needed to build your library are
            kept — the uploaded file itself is read in your browser and never
            stored.
          </p>
          <p>
            <span className="text-body">Technical.</span> Your IP address is
            checked in memory to rate-limit abuse; it is never written to the
            database. Vercel keeps standard, short-lived hosting logs.
          </p>
        </div>
      </div>

      {/* What is public */}
      <div className="border-b border-hairline px-4 py-4">
        <FolioLabel>What is public</FolioLabel>
        <p className="font-serif text-[14px] leading-relaxed text-muted">
          Your profile — username, avatar, reading stats, activity heatmap,
          favourites, followers — and your library entries (statuses, chapter
          progress, ratings) are visible to anyone, signed in or not. Your email
          address is never shown to anyone. Personal notes stay private: they
          appear only in your own library view and your exports.
        </p>
      </div>

      {/* Where it lives */}
      <div className="border-b border-hairline px-4 py-4">
        <FolioLabel>Where it lives</FolioLabel>
        <div className="mb-3 space-y-1.5 font-mono text-[11.5px]">
          {PROCESSORS.map((p) => (
            <div key={p.name} className="flex items-baseline justify-between gap-4">
              <span className="text-muted">{p.name}</span>
              <span className="min-w-0 truncate text-body">{p.role}</span>
            </div>
          ))}
        </div>
        <p className="font-serif text-[14px] leading-relaxed text-muted">
          These four process data only to run the site. Nothing is sold, shared
          for advertising, or passed to anyone else.
        </p>
      </div>

      {/* Cookies & analytics */}
      <div className="border-b border-hairline px-4 py-4">
        <FolioLabel>Cookies &amp; analytics</FolioLabel>
        <p className="font-serif text-[14px] leading-relaxed text-muted">
          The only cookies are Clerk&apos;s, and they exist to keep you signed
          in — strictly necessary, nothing tracked. Page analytics (Vercel Web
          Analytics and Speed Insights) are cookieless and anonymized: visits are
          counted from a request hash discarded within 24 hours, and no reader
          can be identified or followed across sites.
        </p>
      </div>

      {/* Your data, your controls */}
      <div className="border-b border-hairline px-4 py-4">
        <FolioLabel>Your data, your controls</FolioLabel>
        <p className="font-serif text-[14px] leading-relaxed text-muted">
          From{" "}
          <a href="/settings" className="text-gold transition hover:text-gold-bright">
            settings
          </a>{" "}
          you can export your whole library as JSON or CSV, and change your
          username. You can edit or remove any entry, and withdraw your own title
          submissions. To delete your account entirely, message me on{" "}
          <a
            href="https://github.com/anthonylhta"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold transition hover:text-gold-bright"
          >
            GitHub
          </a>{" "}
          — deletion removes your account and everything attached to it (library,
          activity, favourites, follows) from the database.
        </p>
      </div>

      {/* Changes */}
      <div className="border-b border-hairline px-4 py-4">
        <FolioLabel>Changes</FolioLabel>
        <p className="font-serif text-[14px] leading-relaxed text-muted">
          WebNovelist is a solo-built project. If what it collects ever changes,
          this page changes with it — the date in the bar above is the last time
          it moved.
        </p>
      </div>

      <FolioNav />
    </FolioSheet>
  );
}
