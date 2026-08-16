"use client";

import { useEffect, useState } from "react";
import { FolioLabel } from "@/components/FolioKit";
import { RELATION_KINDS, RELATION_LABELS, relationLabel, type RelatedNovel } from "@/lib/relations";
import { mediaTypeLabel } from "@/lib/media-types";

// Admin/mod module on the edit page: link this title to others (adaptation,
// sequel, source…). Search picks the target from the catalog; the kind is
// read from this title's side ("the manhwa is an ADAPTATION of this").

type Candidate = { id: number; title: string; nativeTitle: string | null; mediaType: string };

const INPUT =
  "w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px] text-paper focus:border-gold-dim focus:outline-none";
const LABEL = "mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted";
const VERB = "font-mono text-[11px] transition";

export default function NovelRelationsManager({ novelId }: { novelId: string }) {
  const [relations, setRelations] = useState<RelatedNovel[]>([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [target, setTarget] = useState<Candidate | null>(null);
  const [kind, setKind] = useState<string>("adaptation");
  const [busy, setBusy] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const load = () =>
    fetch(`/api/novels/${novelId}/relations`)
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setRelations(data))
      .catch(() => setError("Failed to load related titles"));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [novelId]);

  // Catalog lookup for the target picker, debounced.
  useEffect(() => {
    if (query.trim().length < 2) {
      setCandidates([]);
      return;
    }
    const handle = setTimeout(() => {
      fetch(`/api/novels?search=${encodeURIComponent(query.trim())}`)
        .then((r) => r.json())
        .then((data: Candidate[]) => {
          if (!Array.isArray(data)) return;
          setCandidates(data.filter((n) => String(n.id) !== novelId).slice(0, 6));
        })
        .catch(() => setCandidates([]));
    }, 250);
    return () => clearTimeout(handle);
  }, [query, novelId]);

  const resetForm = () => {
    setShowForm(false);
    setQuery("");
    setCandidates([]);
    setTarget(null);
    setKind("adaptation");
    setError("");
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) {
      setError("Pick a title to link");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/novels/${novelId}/relations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toId: target.id, kind }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to link");
        return;
      }
      await load();
      resetForm();
    } catch {
      setError("Failed to link");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (relationId: number) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/novels/${novelId}/relations/${relationId}`, { method: "DELETE" });
      if (res.ok) {
        setRelations((prev) => prev.filter((r) => r.relationId !== relationId));
        setConfirmDeleteId(null);
      }
    } catch {
      // leave the row
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <FolioLabel
        right={
          showForm ? undefined : (
            <button
              type="button"
              onClick={() => { setShowForm(true); setConfirmDeleteId(null); }}
              className="normal-case tracking-normal text-gold transition hover:text-gold-bright"
            >
              [+ link a title]
            </button>
          )
        }
      >
        Related titles{relations.length > 0 && ` · ${relations.length}`}
      </FolioLabel>

      {error && !showForm && (
        <p className="mb-3 border-l-2 border-seal pl-3 font-mono text-[11px] text-seal-bright">{error}</p>
      )}

      {relations.length > 0 ? (
        <div className="divide-y divide-hairline border border-hairline">
          {relations.map((r) => (
            <div key={r.relationId} className="flex items-center gap-3 px-3 py-2.5">
              <span className="w-32 shrink-0 font-mono text-[9.5px] uppercase tracking-[0.14em] text-gold-dim">
                {relationLabel(r.kind)}
              </span>
              <span className="min-w-0 flex-1 truncate font-serif text-[15px] text-paper">
                {r.novel.title}
                {r.novel.nativeTitle && (
                  <span className="ml-2 font-cjk text-[11px] text-faint">{r.novel.nativeTitle}</span>
                )}
              </span>
              <span className="hidden shrink-0 font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted sm:block">
                {mediaTypeLabel(r.novel.mediaType).toLowerCase()}
              </span>
              <span className="flex shrink-0 items-center gap-2 font-mono text-[11px]">
                {confirmDeleteId === r.relationId ? (
                  <>
                    <span className="text-seal-bright">unlink?</span>
                    <button type="button" onClick={() => handleDelete(r.relationId)} disabled={busy} className={`${VERB} text-seal-bright hover:text-paper disabled:opacity-50`}>[yes]</button>
                    <button type="button" onClick={() => setConfirmDeleteId(null)} className={`${VERB} text-muted hover:text-paper`}>[no]</button>
                  </>
                ) : (
                  <button type="button" onClick={() => setConfirmDeleteId(r.relationId)} className={`${VERB} text-muted hover:text-seal-bright`} title="Unlink">[rm]</button>
                )}
              </span>
            </div>
          ))}
        </div>
      ) : (
        !showForm && <p className="font-serif text-[14px] text-muted">No related titles yet.</p>
      )}

      {showForm && (
        <form onSubmit={handleAdd} className="mt-4 space-y-3 border border-gold-dim/40 p-4">
          <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-gold-dim">Link a title</p>
          {error && (
            <p className="border-l-2 border-seal pl-3 font-mono text-[11px] text-seal-bright">{error}</p>
          )}
          <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
            <div>
              <label className={LABEL}>Title</label>
              {target ? (
                <div className="flex items-center gap-3 rounded-[2px] border border-gold-dim px-3 py-2">
                  <span className="min-w-0 flex-1 truncate font-serif text-[14px] text-paper">{target.title}</span>
                  <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted">{mediaTypeLabel(target.mediaType).toLowerCase()}</span>
                  <button type="button" onClick={() => setTarget(null)} className={`${VERB} shrink-0 text-muted hover:text-paper`}>[change]</button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="search the catalog…"
                    className={INPUT}
                    autoFocus
                  />
                  {candidates.length > 0 && (
                    <div className="mt-1 divide-y divide-hairline border border-hairline">
                      {candidates.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setTarget(c)}
                          className="flex w-full items-baseline gap-3 px-3 py-1.5 text-left transition hover:bg-elevated"
                        >
                          <span className="min-w-0 flex-1 truncate font-serif text-[14px] text-paper">{c.title}</span>
                          <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted">{mediaTypeLabel(c.mediaType).toLowerCase()}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            <div>
              <label className={LABEL}>It is this title&apos;s…</label>
              <select value={kind} onChange={(e) => setKind(e.target.value)} className={INPUT}>
                {RELATION_KINDS.map((k) => (
                  <option key={k} value={k}>{RELATION_LABELS[k]}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={busy || !target}
              className="rounded-[2px] bg-gold px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition hover:bg-gold-bright disabled:bg-gold/50"
            >
              {busy ? "Linking..." : "Link"}
            </button>
            <button type="button" onClick={resetForm} className={`${VERB} text-muted hover:text-paper`}>[cancel]</button>
          </div>
        </form>
      )}
    </div>
  );
}
