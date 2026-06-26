// components/ImageUpload.tsx
"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";

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
      <label className="block text-sm text-muted mb-2">Cover Image</label>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 bg-seal/10 border border-seal/40 text-seal-bright rounded-lg p-3 mb-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {preview ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Cover preview"
            className="w-32 h-44 object-cover rounded-lg border border-hairline"
            onError={() => {
              setError("Failed to load image preview");
            }}
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute -top-2 -right-2 bg-seal hover:bg-seal-bright
                       rounded-full p-1 transition"
          >
            <X className="w-3 h-3" />
          </button>
          {uploading && (
            <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
              <div className="text-sm text-paper">Uploading...</div>
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
          className={`w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition
            ${
              dragOver
                ? "border-gold bg-gold/10"
                : "border-hairline hover:border-gold-dim"
            }`}
        >
          {uploading ? (
            <div className="text-muted">Uploading...</div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-faint mx-auto mb-2" />
              <p className="text-muted text-sm">
                Drag & drop an image or click to browse
              </p>
              <p className="text-faint text-xs mt-1">
                Max 5MB · JPG, PNG, WebP, GIF
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
        <div className="flex items-center gap-2 mb-1">
          <ImageIcon className="w-3 h-3 text-faint" />
          <span className="text-xs text-faint">Or paste image URL</span>
        </div>
        <input
          type="url"
          value={preview}
          onChange={(e) => {
            setError("");
            setPreview(e.target.value);
            onUpload(e.target.value);
          }}
          placeholder="https://example.com/cover.jpg"
          className="w-full bg-surface border border-hairline rounded-lg px-3 py-2
                     text-paper text-sm focus:outline-none focus:border-gold-dim"
        />
      </div>
    </div>
  );
}