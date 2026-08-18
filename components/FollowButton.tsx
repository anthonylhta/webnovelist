// components/FollowButton.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/components/CurrentUserProvider";

// The [follow] / [following] bracket verb on a reader's nameplate. Signed-out
// visitors get a link to sign in; the owner sees nothing (you can't follow
// yourself — the API refuses too). After a toggle the sheet is refreshed so
// the server-rendered follower counts and circle module catch up.
export default function FollowButton({
  username,
  initialFollowing,
}: {
  username: string;
  initialFollowing: boolean;
}) {
  const me = useCurrentUser();
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [saving, setSaving] = useState(false);

  if (me?.username === username) return null;
  if (!me) {
    return (
      <Link
        href="/sign-in"
        className="shrink-0 font-mono text-[11px] text-gold transition hover:text-gold-bright"
        title="Sign in to follow"
      >
        [follow]
      </Link>
    );
  }

  const toggle = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/user/${encodeURIComponent(username)}/follow`, {
        method: following ? "DELETE" : "POST",
      });
      if (res.ok) {
        const data: { following: boolean } = await res.json();
        setFollowing(data.following);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update follow:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={saving}
      title={following ? "Unfollow" : "Follow"}
      className={`shrink-0 font-mono text-[11px] transition disabled:cursor-default ${
        following ? "text-jade hover:text-seal-bright" : "text-gold hover:text-gold-bright"
      }`}
    >
      {following ? "[following ✓]" : "[follow]"}
    </button>
  );
}
