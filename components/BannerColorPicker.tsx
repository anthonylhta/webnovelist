"use client";

import { useState } from "react";
import { Palette, Check } from "lucide-react";
import { BANNER_OPTIONS } from "@/lib/banner-colors";

interface BannerColorPickerProps {
  currentColor: string | null;
  isOwner: boolean;
}

export default function BannerColorPicker({
  currentColor,
  isOwner,
}: BannerColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(currentColor || "default");
  const [saving, setSaving] = useState(false);

  if (!isOwner) return null;

  const handleSelect = async (color: string) => {
    if (saving) return;
    setSaving(true);
    setSelected(color);

    try {
      const res = await fetch("/api/user/banner-color", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ color }),
      });

      if (res.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to update banner:", error);
      setSelected(currentColor || "default");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="absolute top-3 right-3 z-10">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-lg transition text-paper/70 hover:text-paper"
      >
        <Palette className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 top-full mt-2 bg-surface border border-hairline rounded-xl p-3 shadow-xl z-50 w-56">
            <p className="text-xs text-muted mb-2 font-medium">Banner Color</p>
            <div className="grid grid-cols-5 gap-2">
              {BANNER_OPTIONS.map((option) => (
                <button
                  key={option.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(option.name);
                  }}
                  disabled={saving}
                  title={option.name}
                  className={`relative w-9 h-9 rounded-lg bg-gradient-to-r ${option.gradient} 
                    border-2 transition hover:scale-110
                    ${
                      selected === option.name
                        ? "border-gold"
                        : "border-transparent hover:border-hairline"
                    }
                    ${saving ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  {selected === option.name && (
                    <Check className="w-3.5 h-3.5 text-paper absolute inset-0 m-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}