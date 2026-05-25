// components/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen, LogOut, User, Menu, X, Plus,
  BarChart3, Shield, Crown, ShieldCheck, UserCircle, Settings,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useCurrentUser } from "@/components/CurrentUserProvider";

export default function Navbar() {
  const currentUser = useCurrentUser();
  const { signOut } = useClerk();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  const userRole = currentUser?.role;
  const userName = currentUser?.username;
  const canManageNovels = userRole === "admin" || userRole === "moderator";
  const isAdmin = userRole === "admin";

  const getRoleIcon = () => {
    switch (userRole) {
      case "admin":
        return <Crown className="w-4 h-4 text-red-400" />;
      case "moderator":
        return <ShieldCheck className="w-4 h-4 text-blue-400" />;
      default:
        return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800/60">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold"
          onClick={closeMenu}
        >
          <BookOpen className="w-6 h-6 text-blue-500" />
          <span>WebNovelist</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/browse" className="hover:text-blue-400 transition">
            Browse
          </Link>

          {currentUser ? (
            <>
              <Link href="/list" className="hover:text-blue-400 transition">
                My List
              </Link>
              <Link href="/stats" className="hover:text-blue-400 transition">
                Stats
              </Link>

              {canManageNovels && (
                <Link href="/add-novel" className="hover:text-blue-400 transition">
                  <Plus className="w-4 h-4 inline mr-1" />
                  Add Novel
                </Link>
              )}

              {isAdmin && (
                <Link href="/admin" className="hover:text-red-400 transition">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Admin
                </Link>
              )}

              <div className="flex items-center gap-3">
                <Link
                  href={`/user/${userName}`}
                  className="flex items-center gap-2 text-sm hover:text-blue-400 transition"
                >
                  {getRoleIcon()}
                  <span>{userName}</span>
                </Link>
                <Link
                  href="/settings"
                  className="text-gray-400 hover:text-blue-400 transition"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => signOut({ redirectUrl: "/" })}
                  className="text-gray-400 hover:text-red-400 transition"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="hover:text-blue-400 transition">
                Login
              </Link>
              <Link
                href="/sign-up"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-gray-400 hover:text-white transition"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-800/60 bg-gray-900/95 backdrop-blur-md">
          <div className="px-4 py-4 space-y-3">
            <Link href="/browse" onClick={closeMenu} className="block py-2 hover:text-blue-400 transition">
              Browse
            </Link>

            {currentUser ? (
              <>
                <Link href="/list" onClick={closeMenu} className="block py-2 hover:text-blue-400 transition">
                  My List
                </Link>
                <Link href="/stats" onClick={closeMenu} className="block py-2 hover:text-blue-400 transition">
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  Stats
                </Link>
                <Link
                  href={`/user/${userName}`}
                  onClick={closeMenu}
                  className="block py-2 hover:text-blue-400 transition"
                >
                  <UserCircle className="w-4 h-4 inline mr-2" />
                  My Profile
                </Link>
                <Link href="/settings" onClick={closeMenu} className="block py-2 hover:text-blue-400 transition">
                  <Settings className="w-4 h-4 inline mr-2" />
                  Settings
                </Link>

                {canManageNovels && (
                  <Link href="/add-novel" onClick={closeMenu} className="block py-2 hover:text-blue-400 transition">
                    <Plus className="w-4 h-4 inline mr-2" />
                    Add Novel
                  </Link>
                )}

                {isAdmin && (
                  <Link href="/admin" onClick={closeMenu} className="block py-2 hover:text-red-400 transition">
                    <Shield className="w-4 h-4 inline mr-2" />
                    Admin Panel
                  </Link>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                  <div className="flex items-center gap-2 text-sm">
                    {getRoleIcon()}
                    <span>{userName}</span>
                  </div>
                  <button
                    onClick={() => { signOut({ redirectUrl: "/" }); closeMenu(); }}
                    className="text-red-400 text-sm flex items-center gap-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-3 pt-3 border-t border-gray-800">
                <Link href="/sign-in" onClick={closeMenu} className="flex-1 text-center py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
                  Login
                </Link>
                <Link href="/sign-up" onClick={closeMenu} className="flex-1 text-center py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
