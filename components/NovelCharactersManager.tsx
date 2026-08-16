"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ImageUpload from "@/components/ImageUpload";
import { FolioLabel } from "@/components/FolioKit";

const ROLES = ["Protagonist", "Main Character", "Antagonist", "Supporting"];

const ROLE_COLORS: Record<string, string> = {
  Protagonist: "border-gold text-gold",
  "Main Character": "border-gold-dim text-gold-dim",
  Antagonist: "border-seal-bright text-seal-bright",
  Supporting: "border-hairline text-muted",
};

const INPUT =
  "w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px] text-paper focus:border-gold-dim focus:outline-none";
const LABEL = "mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted";
const VERB = "font-mono text-[11px] transition";

interface Character {
  id: number;
  name: string;
  role: string | null;
  imageUrl: string | null;
  _count: { favorites: number };
}

interface NovelCharactersManagerProps {
  novelId: string;
}

const EMPTY_FORM = { name: "", role: "", imageUrl: "" };

export default function NovelCharactersManager({ novelId }: NovelCharactersManagerProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/novels/${novelId}/characters`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCharacters(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load characters");
        setLoading(false);
      });
  }, [novelId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim()) { setAddError("Name is required"); return; }
    setAddLoading(true);
    setAddError("");
    try {
      const res = await fetch(`/api/novels/${novelId}/characters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addForm.name.trim(),
          role: addForm.role || null,
          imageUrl: addForm.imageUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setAddError(data.error || "Failed to add character"); return; }
      setCharacters((prev) => [...prev, data]);
      setAddForm(EMPTY_FORM);
      setShowAddForm(false);
    } catch {
      setAddError("Failed to add character");
    } finally {
      setAddLoading(false);
    }
  };

  const startEdit = (char: Character) => {
    setEditingId(char.id);
    setEditForm({ name: char.name, role: char.role || "", imageUrl: char.imageUrl || "" });
    setEditError("");
    setConfirmDeleteId(null);
    setShowAddForm(false);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    if (!editForm.name.trim()) { setEditError("Name is required"); return; }
    setEditLoading(true);
    setEditError("");
    try {
      const res = await fetch(`/api/characters/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          role: editForm.role || null,
          imageUrl: editForm.imageUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setEditError(data.error || "Failed to update"); return; }
      setCharacters((prev) => prev.map((c) => c.id === editingId ? { ...data, _count: c._count } : c));
      setEditingId(null);
    } catch {
      setEditError("Failed to update");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/characters/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCharacters((prev) => prev.filter((c) => c.id !== id));
        setConfirmDeleteId(null);
      }
    } catch {
      // ignore
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return null;

  const characterForm = (
    mode: "add" | "edit",
    form: typeof EMPTY_FORM,
    setForm: (f: typeof EMPTY_FORM) => void,
    onSubmit: (e: React.FormEvent) => void,
    onCancel: () => void,
    busy: boolean,
    formError: string
  ) => (
    <form onSubmit={onSubmit} className={`space-y-3 border border-gold-dim/40 p-4 ${mode === "add" ? "mt-4" : ""}`}>
      <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-gold-dim">
        {mode === "add" ? "New character" : "Edit character"}
      </p>
      {formError && (
        <p className="border-l-2 border-seal pl-3 font-mono text-[11px] text-seal-bright">{formError}</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Name <span className="text-seal-bright">*</span></label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={INPUT}
            placeholder="Character name"
            required
            autoFocus={mode === "add"}
          />
        </div>
        <div>
          <label className={LABEL}>Role</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className={INPUT}
          >
            <option value="">— None —</option>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <ImageUpload
        currentUrl={form.imageUrl}
        onUpload={(url) => setForm({ ...form, imageUrl: url })}
      />
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={busy}
          className="rounded-[2px] bg-gold px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition hover:bg-gold-bright disabled:bg-gold/50"
        >
          {busy ? "Saving..." : mode === "add" ? "Add character" : "Save"}
        </button>
        <button type="button" onClick={onCancel} className={`${VERB} text-muted hover:text-paper`}>
          [cancel]
        </button>
      </div>
    </form>
  );

  return (
    <div>
      <FolioLabel
        right={
          showAddForm ? undefined : (
            <button
              type="button"
              onClick={() => { setShowAddForm(true); setEditingId(null); setConfirmDeleteId(null); }}
              className="normal-case tracking-normal text-gold transition hover:text-gold-bright"
            >
              [+ add character]
            </button>
          )
        }
      >
        Characters{characters.length > 0 && ` · ${characters.length}`}
      </FolioLabel>

      {error && (
        <p className="mb-3 border-l-2 border-seal pl-3 font-mono text-[11px] text-seal-bright">{error}</p>
      )}

      {/* Character list */}
      {characters.length > 0 && (
        <div className="divide-y divide-hairline border border-hairline">
          {characters.map((char) =>
            editingId === char.id ? (
              <div key={char.id} className="p-2">
                {characterForm("edit", editForm, setEditForm, handleEdit, () => setEditingId(null), editLoading, editError)}
              </div>
            ) : (
              <div key={char.id} className="flex items-center gap-3 px-3 py-2.5">
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-hairline bg-hairline">
                  <Image fill sizes="36px" src={char.imageUrl || "/default-avatar.svg"} alt={char.name} className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif text-[15px] text-paper">{char.name}</p>
                  <div className="mt-0.5 flex items-center gap-2 font-mono text-[9.5px]">
                    {char.role && (
                      <span className={`rounded-[2px] border px-1.5 py-px uppercase tracking-[0.12em] ${ROLE_COLORS[char.role] ?? ROLE_COLORS.Supporting}`}>
                        {char.role}
                      </span>
                    )}
                    <span className="text-faint tabular-nums">
                      {char._count.favorites} fav{char._count.favorites !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 font-mono text-[11px]">
                  {confirmDeleteId === char.id ? (
                    <>
                      <span className="text-seal-bright">delete?</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(char.id)}
                        disabled={deleteLoading}
                        className={`${VERB} text-seal-bright hover:text-paper disabled:opacity-50`}
                      >
                        [yes]
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className={`${VERB} text-muted hover:text-paper`}
                      >
                        [no]
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEdit(char)}
                        className={`${VERB} text-muted hover:text-gold`}
                        title="Edit"
                      >
                        [edit]
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(char.id)}
                        className={`${VERB} text-muted hover:text-seal-bright`}
                        title="Delete"
                      >
                        [rm]
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {characters.length === 0 && !showAddForm && (
        <p className="font-serif text-[14px] text-muted">No characters added yet.</p>
      )}

      {/* Add form */}
      {showAddForm &&
        characterForm(
          "add",
          addForm,
          setAddForm,
          handleAdd,
          () => { setShowAddForm(false); setAddForm(EMPTY_FORM); setAddError(""); },
          addLoading,
          addError
        )}
    </div>
  );
}
