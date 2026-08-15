// app/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FolioSheet, FolioLabel } from "@/components/FolioKit";
import FolioNav from "@/components/FolioNav";

interface UserSettings {
  id: string;
  username: string;
  email: string;
  role: string;
  usernameChangedAt: string | null;
  createdAt: string;
  daysUntilChange: number;
  cooldownDays: number;
}

export default function SettingsPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const currentUser = useCurrentUser();
  const router = useRouter();

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [newUsername, setNewUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (isLoaded && isSignedIn) {
      fetchSettings();
    }
  }, [isLoaded, isSignedIn, router]);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/user/settings");
      const data = await res.json();

      if (res.ok) {
        setSettings(data);
        setNewUsername(data.username);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const trimmed = newUsername.trim();

    if (trimmed === settings?.username) {
      setError("That's already your username");
      return;
    }

    if (trimmed.length < 3 || trimmed.length > 30) {
      setError("Username must be 3-30 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setError("Username can only contain letters, numbers, hyphens, and underscores");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setSuccess("Username updated! You'll need to log in again for the change to take full effect.");

      // Re-fetch settings to update cooldown info
      await fetchSettings();

      // Sign out after 3 seconds so the session refreshes with new username
      setTimeout(() => {
        signOut({ redirectUrl: "/sign-in" });
      }, 3000);
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const isAdmin = currentUser?.role === "admin";
  const canChange = isAdmin || !settings?.daysUntilChange;

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="font-mono text-xs text-muted">opening settings…</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="font-mono text-xs text-muted">failed to load settings.</div>
      </div>
    );
  }

  const ROLE_COLORS: Record<string, string> = {
    admin: "text-seal-bright",
    moderator: "text-gold",
    user: "text-body",
  };

  return (
    <FolioSheet
      statusLeft="webnovelist · settings"
      statusRight={settings.username}
      footer="ink & gold"
    >
      {/* Account */}
      <div className="border-b border-hairline px-4 py-4">
        <FolioLabel>Account</FolioLabel>
        <div className="space-y-1.5 font-mono text-[11.5px]">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-muted">email</span>
            <span className="min-w-0 truncate text-body">{settings.email}</span>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-muted">role</span>
            <span className={ROLE_COLORS[settings.role] ?? "text-body"}>
              {settings.role}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-muted">member since</span>
            <span className="text-body tabular-nums">
              {new Date(settings.createdAt)
                .toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
                .toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Import from AniList — admins/mods only (it creates catalog entries) */}
      {(currentUser?.role === "admin" || currentUser?.role === "moderator") && (
        <div className="border-b border-hairline px-4 py-4">
          <FolioLabel
            right={
              <Link
                href="/settings/import"
                className="normal-case tracking-normal text-gold transition hover:text-gold-bright"
              >
                [open importer]
              </Link>
            }
          >
            AniList import
          </FolioLabel>
          <p className="font-serif text-[14px] leading-relaxed text-muted">
            Pull your manga, manhwa, and light-novel list from AniList into
            your library.
          </p>
        </div>
      )}

      {/* Change username */}
      <div className="border-b border-hairline px-4 py-4">
        <FolioLabel>Username</FolioLabel>

        {!isAdmin && settings.daysUntilChange > 0 && (
          <p className="mb-3 border-l-2 border-warn pl-3 font-mono text-[11px] text-warn">
            you can change your username again in {settings.daysUntilChange} day
            {settings.daysUntilChange !== 1 ? "s" : ""}.
          </p>
        )}

        {isAdmin && (
          <p className="mb-3 border-l-2 border-seal pl-3 font-mono text-[11px] text-seal-bright">
            admin — no cooldown applied.
          </p>
        )}

        {error && (
          <p className="mb-3 border-l-2 border-seal pl-3 font-mono text-[11px] text-seal-bright">
            {error}
          </p>
        )}

        {success && (
          <p className="mb-3 border-l-2 border-jade pl-3 font-mono text-[11px] text-jade">
            {success}
          </p>
        )}

        <form onSubmit={handleUsernameChange}>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => {
              setNewUsername(e.target.value);
              setError("");
              setSuccess("");
            }}
            disabled={!canChange || !!success}
            minLength={3}
            maxLength={30}
            className="w-full max-w-sm border border-hairline bg-transparent px-3 py-2 font-mono
                       text-[12.5px] text-paper focus:border-gold-dim focus:outline-none
                       disabled:cursor-not-allowed disabled:opacity-50"
          />
          <p className="mt-1.5 font-mono text-[9.5px] text-faint">
            3–30 characters. letters, numbers, hyphens, and underscores only.
            {!isAdmin && <span> one change every {settings.cooldownDays} days.</span>}
          </p>

          <button
            type="submit"
            disabled={saving || !canChange || !!success}
            className="mt-3 font-mono text-[12px] text-gold transition hover:text-gold-bright
                       disabled:cursor-default disabled:text-faint"
          >
            {saving
              ? "[updating…]"
              : success
              ? "[signing out…]"
              : "[update username]"}
          </button>
        </form>

        {settings.usernameChangedAt && (
          <p className="mt-3 font-mono text-[9.5px] text-faint">
            last changed{" "}
            {new Date(settings.usernameChangedAt)
              .toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
              .toLowerCase()}
          </p>
        )}
      </div>

      <FolioNav />
    </FolioSheet>
  );
}
