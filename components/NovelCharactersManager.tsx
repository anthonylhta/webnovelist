"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Check, Users } from "lucide-react";
import Image from "next/image";
import ImageUpload from "@/components/ImageUpload";

const ROLES = ["Protagonist", "Main Character", "Antagonist", "Supporting"];

const ROLE_COLORS: Record<string, string> = {
  Protagonist: "text-purple-400 bg-purple-600/10 border-purple-600/30",
  "Main Character": "text-blue-400 bg-blue-600/10 border-blue-600/30",
  Antagonist: "text-red-400 bg-red-600/10 border-red-600/30",
  Supporting: "text-gray-400 bg-gray-600/10 border-gray-600/30",
};

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

  return (
    <div className="mt-8 border-t border-gray-800 pt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-500" />
          Characters
          {characters.length > 0 && (
            <span className="text-sm font-normal text-gray-500">({characters.length})</span>
          )}
        </h2>
        {!showAddForm && (
          <button
            type="button"
            onClick={() => { setShowAddForm(true); setEditingId(null); setConfirmDeleteId(null); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30
                       text-purple-400 border border-purple-600/30 rounded-lg text-sm font-medium transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Character
          </button>
        )}
      </div>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      {/* Character list */}
      {characters.length > 0 && (
        <div className="space-y-2 mb-4">
          {characters.map((char) =>
            editingId === char.id ? (
              <div key={char.id} className="bg-gray-800/60 border border-purple-600/30 rounded-xl p-4">
                <form onSubmit={handleEdit} className="space-y-3">
                  {editError && (
                    <p className="text-red-400 text-xs">{editError}</p>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Name *</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm
                                   text-gray-100 focus:outline-none focus:border-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Role</label>
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm
                                   text-gray-100 focus:outline-none focus:border-purple-500"
                      >
                        <option value="">— None —</option>
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                  <ImageUpload
                    currentUrl={editForm.imageUrl}
                    onUpload={(url) => setEditForm({ ...editForm, imageUrl: url })}
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700
                                 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {editLoading ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600
                                 text-gray-300 rounded-lg text-sm transition"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div key={char.id} className="flex items-center gap-3 bg-gray-800/40 border border-gray-700/50 rounded-xl px-4 py-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-700 border border-gray-600 shrink-0">
                  <Image fill sizes="40px" src={char.imageUrl || "/default-avatar.svg"} alt={char.name} className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-100 truncate">{char.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {char.role && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${ROLE_COLORS[char.role] ?? ROLE_COLORS.Supporting}`}>
                        {char.role}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-600">
                      {char._count.favorites} fav{char._count.favorites !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {confirmDeleteId === char.id ? (
                    <>
                      <span className="text-xs text-red-400 mr-1">Delete?</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(char.id)}
                        disabled={deleteLoading}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50
                                   text-white rounded-lg text-xs transition"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-xs transition"
                      >
                        No
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEdit(char)}
                        className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-gray-700 rounded-lg transition"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(char.id)}
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-600/10 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
        <p className="text-gray-600 text-sm mb-4">No characters added yet.</p>
      )}

      {/* Add form */}
      {showAddForm && (
        <div className="bg-gray-800/60 border border-purple-600/30 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-300 mb-3">New Character</p>
          <form onSubmit={handleAdd} className="space-y-3">
            {addError && <p className="text-red-400 text-xs">{addError}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Name *</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm
                             text-gray-100 focus:outline-none focus:border-purple-500"
                  placeholder="Character name"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Role</label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm
                             text-gray-100 focus:outline-none focus:border-purple-500"
                >
                  <option value="">— None —</option>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <ImageUpload
              currentUrl={addForm.imageUrl}
              onUpload={(url) => setAddForm({ ...addForm, imageUrl: url })}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={addLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700
                           disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
              >
                <Plus className="w-3.5 h-3.5" />
                {addLoading ? "Adding..." : "Add Character"}
              </button>
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setAddForm(EMPTY_FORM); setAddError(""); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600
                           text-gray-300 rounded-lg text-sm transition"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
