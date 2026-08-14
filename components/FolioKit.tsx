// The Folio kit (redesign pass 3): the bounded sheet every Folio page lives
// in, its mono module labels, and the square status seals. Server-safe.
import type { ReactNode } from "react";

/**
 * The bounded sheet — one hairline border holding the whole page, a mono
 * status bar with a live gold dot on top, and a quiet mono line below.
 */
export function FolioSheet({
  statusLeft,
  statusRight,
  footer,
  children,
}: {
  statusLeft: ReactNode;
  statusRight?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center">
      <div className="w-full border border-hairline bg-surface/20">
        <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-2 font-mono text-[11px] tracking-wide text-muted tabular-nums">
          <span className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold shadow-[0_0_6px_rgba(201,168,76,0.6)]"
            />
            <span className="truncate">{statusLeft}</span>
          </span>
          {statusRight != null && <span className="shrink-0">{statusRight}</span>}
        </div>
        {children}
      </div>
      {footer != null && (
        <p className="mt-3 font-mono text-[10px] tracking-wide text-faint">{footer}</p>
      )}
    </div>
  );
}

/** Tracked mono module label with a hairline fill and an optional right slot. */
export function FolioLabel({
  children,
  right,
}: {
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="mb-2.5 flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
      <span className="shrink-0">{children}</span>
      <span aria-hidden className="h-px flex-1 bg-hairline" />
      {right != null && <span className="shrink-0 text-gold-dim tabular-nums">{right}</span>}
    </div>
  );
}

// One glyph per reading status, in the app-wide status colors. The square
// bordered form echoes the seal stamps on anthonyta's aperture page — the
// sibling site this design language extends.
const SEALS: Record<string, { glyph: string; label: string; className: string }> = {
  reading: { glyph: "読", label: "Reading", className: "border-gold text-gold" },
  completed: { glyph: "完", label: "Completed", className: "border-jade text-jade" },
  on_hold: { glyph: "休", label: "On hold", className: "border-muted text-muted" },
  dropped: { glyph: "棄", label: "Dropped", className: "border-seal-bright text-seal-bright" },
  plan_to_read: { glyph: "積", label: "Plan to read", className: "border-gold-dim text-gold-dim" },
};

/** Square status seal. The glyph is decoration; the label carries the meaning. */
export function StatusSeal({ status }: { status: string }) {
  const seal = SEALS[status] ?? {
    glyph: "・",
    label: status,
    className: "border-faint text-faint",
  };
  return (
    <span
      role="img"
      aria-label={seal.label}
      title={seal.label}
      className={`inline-grid h-5 w-5 select-none place-items-center rounded-[2px] border-[1.5px] font-cjk text-[11px] leading-none opacity-90 ${seal.className}`}
    >
      <span aria-hidden>{seal.glyph}</span>
    </span>
  );
}
