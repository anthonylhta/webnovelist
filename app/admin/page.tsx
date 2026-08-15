// app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ConfirmModal from "@/components/ConfirmModal";
import { FolioSheet, FolioLabel } from "@/components/FolioKit";
import FolioNav from "@/components/FolioNav";

interface UserData {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  _count: {
    novelList: number;
  };
}

export default function AdminPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const currentUser = useCurrentUser();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [changingRole, setChangingRole] = useState<{
    user: UserData;
    newRole: string;
  } | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const currentRole = currentUser?.role;
  const currentUserId = currentUser?.id;

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (isLoaded && isSignedIn) {
      if (currentRole !== "admin" && currentRole !== "moderator") {
        router.push("/");
        return;
      }
      fetchUsers();
    }
  }, [isLoaded, isSignedIn, currentRole, router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!changingRole) return;

    setRoleLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${changingRole.user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: changingRole.newRole }),
      });

      if (res.ok) {
        setUsers(
          users.map((u) =>
            u.id === changingRole.user.id
              ? { ...u, role: changingRole.newRole }
              : u
          )
        );
      }
    } catch (error) {
      console.error("Failed to update role:", error);
    } finally {
      setRoleLoading(false);
      setChangingRole(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setUsers(users.filter((u) => u.id !== deletingUser.id));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Something went wrong");
    } finally {
      setDeleteLoading(false);
      setDeletingUser(null);
    }
  };

  // Permission: can this actor delete this target?
  const canDelete = (targetUser: UserData): boolean => {
    if (targetUser.id === currentUserId) return false;
    if (currentRole === "admin") return true;
    if (currentRole === "moderator" && targetUser.role !== "admin") return true;
    return false;
  };

  const ROLE_COLORS: Record<string, string> = {
    admin: "text-gold",
    moderator: "text-gold-dim",
    user: "text-muted",
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="font-mono text-xs text-muted">opening the back room…</div>
      </div>
    );
  }

  return (
    <FolioSheet
      wide
      statusLeft="webnovelist · curation"
      statusRight={`${users.length} reader${users.length !== 1 ? "s" : ""}`}
      footer="ink & gold · admin"
    >
      {/* Sections */}
      <div className="flex flex-wrap items-center gap-4 border-b border-hairline px-4 py-2.5 font-mono text-[11px]">
        <span className="text-gold">users</span>
        <Link href="/admin/novels" className="text-faint transition hover:text-muted">
          titles
        </Link>
        <Link href="/admin/authors" className="text-faint transition hover:text-muted">
          authors
        </Link>
        <span className="flex-1" />
        <Link href="/admin/novels/new" className="text-gold transition hover:text-gold-bright">
          [+ add title]
        </Link>
      </div>

      {/* Counts */}
      <div className="grid grid-cols-2 divide-x divide-hairline border-b border-hairline sm:grid-cols-4">
        {[
          { label: "readers", value: users.length },
          { label: "admins", value: users.filter((u) => u.role === "admin").length },
          { label: "moderators", value: users.filter((u) => u.role === "moderator").length },
          { label: "list entries", value: users.reduce((sum, u) => sum + u._count.novelList, 0) },
        ].map((cell) => (
          <div key={cell.label} className="px-4 py-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
              {cell.label}
            </p>
            <p className="mt-1.5 font-mono text-base text-paper tabular-nums">{cell.value}</p>
          </div>
        ))}
      </div>

      {/* Users */}
      <div className="border-b border-hairline px-4 pt-4 pb-1.5">
        <FolioLabel right={String(users.length)}>Readers</FolioLabel>
        <div className="divide-y divide-hairline">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] text-paper">{user.username}</p>
                <p className="truncate font-mono text-[10px] text-faint">{user.email}</p>
              </div>
              <span
                className={`w-20 shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] ${
                  ROLE_COLORS[user.role] ?? "text-muted"
                }`}
              >
                {user.role}
              </span>
              <span className="hidden w-14 shrink-0 text-right font-mono text-[10.5px] text-body tabular-nums md:block">
                {user._count.novelList}
              </span>
              <span className="hidden w-20 shrink-0 text-right font-mono text-[9.5px] text-faint tabular-nums lg:block">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
              <div className="flex w-40 shrink-0 items-center justify-end gap-3">
                {user.id === currentUserId ? (
                  <span className="font-mono text-[10px] text-faint">you</span>
                ) : (
                  <>
                    {currentRole === "admin" && (
                      <select
                        value={user.role}
                        onChange={(e) =>
                          setChangingRole({ user, newRole: e.target.value })
                        }
                        className="border border-hairline bg-transparent px-2 py-1 font-mono
                                   text-[10.5px] text-paper focus:border-gold-dim focus:outline-none"
                      >
                        <option value="user">user</option>
                        <option value="moderator">moderator</option>
                        <option value="admin">admin</option>
                      </select>
                    )}
                    {canDelete(user) && (
                      <button
                        onClick={() => setDeletingUser(user)}
                        className="font-mono text-[11px] text-muted transition hover:text-seal-bright"
                        title={`Delete ${user.username}`}
                      >
                        [rm]
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <FolioNav />

      {/* Confirm Role Change Modal */}
      {changingRole && (
        <ConfirmModal
          title="Change User Role"
          message={`Change ${changingRole.user.username}'s role from "${changingRole.user.role}" to "${changingRole.newRole}"?`}
          confirmText="Change Role"
          cancelText="Cancel"
          danger={false}
          loading={roleLoading}
          onConfirm={handleRoleChange}
          onCancel={() => setChangingRole(null)}
        />
      )}

      {/* Confirm Delete User Modal */}
      {deletingUser && (
        <ConfirmModal
          title="Delete User"
          message={`Are you sure you want to delete "${deletingUser.username}"? This will permanently remove their account and all their list data. This action cannot be undone.`}
          confirmText="Delete User"
          cancelText="Cancel"
          danger={true}
          loading={deleteLoading}
          onConfirm={handleDeleteUser}
          onCancel={() => setDeletingUser(null)}
        />
      )}
    </FolioSheet>
  );
}
