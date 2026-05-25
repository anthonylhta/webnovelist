"use client";

import { useState, useRef } from "react";
import { Camera } from "lucide-react";

interface ProfileImageUploadProps {
  type: "avatar";
  currentUrl: string | null;
  isOwner: boolean;
  username: string;
  children: React.ReactNode;
}

export default function ProfileImageUpload({
  isOwner,
  children,
}: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOwner) return <>{children}</>;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 5MB.`);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/user/profile-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }

      window.location.reload();
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <div
        className="relative group cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        {children}

        <div className="absolute inset-0 rounded-full flex items-center justify-center transition bg-black/0 group-hover:bg-black/50">
          {uploading ? (
            <div className="text-white text-sm font-medium">Uploading...</div>
          ) : (
            <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition" />
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {error && (
        <div className="mt-2 text-center text-red-400 text-xs bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-1.5">
          {error}
        </div>
      )}
    </div>
  );
}