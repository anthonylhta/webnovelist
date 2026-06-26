// app/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { useRouter } from "next/navigation";
import { Settings, User, Clock, AlertCircle, CheckCircle, Crown, ShieldCheck } from "lucide-react";

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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="w-4 h-4 text-seal-bright" />;
      case "moderator":
        return <ShieldCheck className="w-4 h-4 text-gold" />;
      default:
        return <User className="w-4 h-4 text-muted" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-seal/20 text-seal-bright border border-seal/50";
      case "moderator":
        return "bg-gold/20 text-gold border border-gold/50";
      default:
        return "bg-hairline text-muted border border-hairline";
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-muted">Loading settings...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-muted">Failed to load settings.</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 font-serif text-paper">
        <Settings className="w-8 h-8 text-gold" />
        Settings
      </h1>

      {/* Account Info */}
      <div className="bg-surface border border-hairline rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 font-serif text-paper">Account Info</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted">Email</div>
              <div>{settings.email}</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted">Role</div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm mt-1 ${getRoleBadge(
                  settings.role
                )}`}
              >
                {getRoleIcon(settings.role)}
                {settings.role}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted">Member Since</div>
              <div>
                {new Date(settings.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Username */}
      <div className="bg-surface border border-hairline rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 font-serif text-paper">Change Username</h2>

        {/* Cooldown Notice */}
        {!isAdmin && settings.daysUntilChange > 0 && (
          <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-lg p-3 mb-4 text-sm">
            <Clock className="w-4 h-4 shrink-0" />
            You can change your username again in {settings.daysUntilChange} day
            {settings.daysUntilChange !== 1 ? "s" : ""}.
          </div>
        )}

        {isAdmin && (
          <div className="flex items-center gap-2 bg-seal/10 border border-seal/30 text-seal-bright rounded-lg p-3 mb-4 text-sm">
            <Crown className="w-4 h-4 shrink-0" />
            Admin — no cooldown applied.
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-seal/10 border border-seal/50 text-seal-bright rounded-lg p-3 mb-4 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 bg-jade/10 border border-jade/50 text-jade rounded-lg p-3 mb-4 text-sm">
            <CheckCircle className="w-4 h-4 shrink-0" />
            {success}
          </div>
        )}

        <form onSubmit={handleUsernameChange} className="space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1">
              Username
            </label>
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
              className="w-full bg-surface border border-hairline rounded-lg px-4 py-3
                         text-paper focus:outline-none focus:border-gold-dim
                         disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-faint mt-1">
              3-30 characters. Letters, numbers, hyphens, and underscores only.
              {!isAdmin && (
                <span> Can be changed once every {settings.cooldownDays} days.</span>
              )}
            </p>
          </div>

          <button
            type="submit"
            disabled={saving || !canChange || !!success}
            className="bg-gold hover:bg-gold-bright disabled:bg-gold/50
                       text-ink font-semibold py-3 px-6 rounded-lg transition"
          >
            {saving
              ? "Updating..."
              : success
              ? "Signing out..."
              : "Update Username"}
          </button>
        </form>

        {settings.usernameChangedAt && (
          <p className="text-xs text-faint mt-4">
            Last changed:{" "}
            {new Date(settings.usernameChangedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}
      </div>
    </div>
  );
}