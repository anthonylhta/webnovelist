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
    } catch (err: any) {
      setError(err.message || "Upload failed. Please try again.");
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
      <label className="block text-sm text-gray-400 mb-2">Cover Image</label>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg p-3 mb-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Cover preview"
            className="w-32 h-44 object-cover rounded-lg border border-gray-700"
            onError={() => {
              setError("Failed to load image preview");
            }}
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 
                       rounded-full p-1 transition"
          >
            <X className="w-3 h-3" />
          </button>
          {uploading && (
            <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
              <div className="text-sm text-white">Uploading...</div>
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
                ? "border-blue-500 bg-blue-500/10"
                : "border-gray-700 hover:border-gray-500"
            }`}
        >
          {uploading ? (
            <div className="text-gray-400">Uploading...</div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">
                Drag & drop an image or click to browse
              </p>
              <p className="text-gray-600 text-xs mt-1">
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
          <ImageIcon className="w-3 h-3 text-gray-500" />
          <span className="text-xs text-gray-500">Or paste image URL</span>
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
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2
                     text-gray-100 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
}