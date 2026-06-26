// app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield, Users, BookOpen, Crown, ShieldCheck, User, Trash2,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";

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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="w-4 h-4 text-gold" />;
      case "moderator":
        return <ShieldCheck className="w-4 h-4 text-gold-dim" />;
      default:
        return <User className="w-4 h-4 text-muted" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-gold/10 text-gold border border-gold/30";
      case "moderator":
        return "bg-gold/10 text-gold-dim border border-gold/30";
      default:
        return "bg-elevated text-muted border border-hairline";
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 font-serif text-paper">
        <Shield className="w-8 h-8 text-gold" />
        Admin Panel
      </h1>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href="/admin/novels"
          className="flex items-center gap-2 bg-surface border border-hairline hover:border-gold-dim rounded-xl px-4 py-3 text-sm text-body hover:text-gold-bright transition"
        >
          <BookOpen className="w-4 h-4 text-gold" />
          Manage Novels
        </Link>
        <Link
          href="/admin/authors"
          className="flex items-center gap-2 bg-surface border border-hairline hover:border-gold-dim rounded-xl px-4 py-3 text-sm text-body hover:text-gold-bright transition"
        >
          <User className="w-4 h-4 text-gold" />
          Manage Authors
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface border border-hairline rounded-xl p-4 text-center">
          <Users className="w-5 h-5 text-gold mx-auto mb-2" />
          <div className="text-2xl font-bold">{users.length}</div>
          <div className="text-xs text-faint">Total Users</div>
        </div>
        <div className="bg-surface border border-hairline rounded-xl p-4 text-center">
          <Crown className="w-5 h-5 text-gold mx-auto mb-2" />
          <div className="text-2xl font-bold">
            {users.filter((u) => u.role === "admin").length}
          </div>
          <div className="text-xs text-faint">Admins</div>
        </div>
        <div className="bg-surface border border-hairline rounded-xl p-4 text-center">
          <ShieldCheck className="w-5 h-5 text-gold-dim mx-auto mb-2" />
          <div className="text-2xl font-bold">
            {users.filter((u) => u.role === "moderator").length}
          </div>
          <div className="text-xs text-faint">Moderators</div>
        </div>
        <div className="bg-surface border border-hairline rounded-xl p-4 text-center">
          <BookOpen className="w-5 h-5 text-jade mx-auto mb-2" />
          <div className="text-2xl font-bold">
            {users.reduce((sum, u) => sum + u._count.novelList, 0)}
          </div>
          <div className="text-xs text-faint">Total List Entries</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface border border-hairline rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-hairline text-muted text-sm">
              <th className="text-left p-4">User</th>
              <th className="text-left p-4">Role</th>
              <th className="text-left p-4 hidden md:table-cell">Novels</th>
              <th className="text-left p-4 hidden lg:table-cell">Joined</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-hairline hover:bg-elevated/30 transition"
              >
                <td className="p-4">
                  <div className="font-medium">{user.username}</div>
                  <div className="text-faint text-sm">{user.email}</div>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${getRoleBadge(
                      user.role
                    )}`}
                  >
                    {getRoleIcon(user.role)}
                    {user.role}
                  </span>
                </td>
                <td className="p-4 hidden md:table-cell text-muted">
                  {user._count.novelList}
                </td>
                <td className="p-4 hidden lg:table-cell text-muted text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  {user.id === currentUserId ? (
                    <span className="text-faint text-sm">You</span>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      {/* Role Change — Admin Only */}
                      {currentRole === "admin" && (
                        <select
                          value={user.role}
                          onChange={(e) =>
                            setChangingRole({ user, newRole: e.target.value })
                          }
                          className="bg-surface border border-hairline rounded-lg px-3 py-1.5
                                     text-sm text-paper focus:outline-none focus:border-gold-dim"
                        >
                          <option value="user">User</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}

                      {/* Delete Button */}
                      {canDelete(user) && (
                        <button
                          onClick={() => setDeletingUser(user)}
                          className="p-2 text-muted hover:text-seal-bright transition"
                          title={`Delete ${user.username}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
    </div>
  );
}