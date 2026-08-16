// components/ImageUpload.tsx
"use client";

import { useState, useRef } from "react";
import { X } from "lucide-react";

interface ImageUploadProps {
  currentUrl: string;
  onUpload: (url: string) => void;
}

export default function ImageUpload({ currentUrl, onUpload }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, WebP, or GIF)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }

    setUploading(true);

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setPreview(data.url);
      onUpload(data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setPreview(currentUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setError("");
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const clearImage = () => {
    setPreview("");
    setError("");
    onUpload("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="mb-2 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">Cover Image</label>

      {/* Error Message */}
      {error && (
        <p className="mb-3 border-l-2 border-seal pl-3 font-mono text-[11px] text-seal-bright">
          {error}
        </p>
      )}

      {preview ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Cover preview"
            className="h-44 w-32 border border-hairline object-cover"
            onError={() => {
              setError("Failed to load image preview");
            }}
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute -right-2 -top-2 rounded-[2px] bg-seal p-1 text-paper transition hover:bg-seal-bright"
            title="Clear image"
          >
            <X className="w-3 h-3" />
          </button>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="font-mono text-[11px] text-paper">uploading…</div>
            </div>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full cursor-pointer rounded-[2px] border border-dashed p-6 text-center transition ${
            dragOver ? "border-gold bg-gold/10" : "border-hairline hover:border-gold-dim"
          }`}
        >
          {uploading ? (
            <div className="font-mono text-[11px] text-muted">uploading…</div>
          ) : (
            <>
              <p className="font-serif text-[14px] text-muted">
                Drag &amp; drop an image or click to browse
              </p>
              <p className="mt-1 font-mono text-[10px] text-faint">
                max 5mb · jpg, png, webp, gif
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Manual URL input */}
      <div className="mt-3">
        <p className="mb-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-faint">
          Or paste image URL
        </p>
        <input
          type="url"
          value={preview}
          onChange={(e) => {
            setError("");
            setPreview(e.target.value);
            onUpload(e.target.value);
          }}
          placeholder="https://example.com/cover.jpg"
          className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px] text-paper focus:border-gold-dim focus:outline-none"
        />
      </div>
    </div>
  );
}