// app/not-found.tsx
import Link from "next/link";
import { FolioSheet } from "@/components/FolioKit";
import FolioNav from "@/components/FolioNav";

export default function NotFound() {
  return (
    <FolioSheet statusLeft="webnovelist · lost" footer="ink & gold">
      <div className="px-4 py-16 text-center">
        <p className="font-serif text-6xl font-semibold text-paper">404</p>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-gold-dim">
          this page is not in the catalog
        </p>
        <p className="mx-auto mt-5 max-w-sm font-serif text-[14.5px] leading-relaxed text-muted">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <p className="mt-6 flex items-center justify-center gap-5 font-mono text-[12px]">
          <Link href="/" className="text-gold transition hover:text-gold-bright">
            [home]
          </Link>
          <Link href="/browse" className="text-muted transition hover:text-gold">
            [browse the catalog]
          </Link>
        </p>
      </div>
      <FolioNav />
    </FolioSheet>
  );
}
