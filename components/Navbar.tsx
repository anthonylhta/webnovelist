// components/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen, LogOut, User, Menu, X,
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
  const isAdmin = userRole === "admin";

  const getRoleIcon = () => {
    switch (userRole) {
      case "admin":
        return <Crown className="w-4 h-4 text-gold" />;
      case "moderator":
        return <ShieldCheck className="w-4 h-4 text-gold-dim" />;
      default:
        return <User className="w-4 h-4 text-muted" />;
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-ink/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          onClick={closeMenu}
        >
          <BookOpen className="w-6 h-6 text-gold transition group-hover:text-gold-bright" />
          <span className="font-serif text-xl font-semibold tracking-wide text-paper">
            WebNovelist
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-7 text-sm">
          <Link href="/browse" className="text-muted hover:text-gold transition">
            Browse
          </Link>

          {currentUser ? (
            <>
              <Link href="/list" className="text-muted hover:text-gold transition">
                My List
              </Link>
              <Link href="/stats" className="text-muted hover:text-gold transition">
                Stats
              </Link>

              {isAdmin && (
                <Link href="/admin" className="text-muted hover:text-seal-bright transition">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Admin
                </Link>
              )}

              <div className="flex items-center gap-4 pl-2 border-l border-hairline">
                <Link
                  href={`/user/${userName}`}
                  className="flex items-center gap-2 text-paper hover:text-gold transition"
                >
                  {getRoleIcon()}
                  <span>{userName}</span>
                </Link>
                <Link
                  href="/settings"
                  className="text-muted hover:text-gold transition"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => signOut({ redirectUrl: "/" })}
                  className="text-muted hover:text-seal-bright transition"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="text-muted hover:text-gold transition">
                Login
              </Link>
              <Link
                href="/sign-up"
                className="bg-gold text-ink hover:bg-gold-bright px-4 py-2 rounded-md font-medium transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-muted hover:text-gold transition"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Gold hairline under the bar */}
      <div className="rule-gold" />

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-hairline bg-surface/95 backdrop-blur-md">
          <div className="px-4 py-4 space-y-1">
            <Link href="/browse" onClick={closeMenu} className="block py-2 text-muted hover:text-gold transition">
              Browse
            </Link>

            {currentUser ? (
              <>
                <Link href="/list" onClick={closeMenu} className="block py-2 text-muted hover:text-gold transition">
                  My List
                </Link>
                <Link href="/stats" onClick={closeMenu} className="block py-2 text-muted hover:text-gold transition">
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  Stats
                </Link>
                <Link
                  href={`/user/${userName}`}
                  onClick={closeMenu}
                  className="block py-2 text-muted hover:text-gold transition"
                >
                  <UserCircle className="w-4 h-4 inline mr-2" />
                  My Profile
                </Link>
                <Link href="/settings" onClick={closeMenu} className="block py-2 text-muted hover:text-gold transition">
                  <Settings className="w-4 h-4 inline mr-2" />
                  Settings
                </Link>

                {isAdmin && (
                  <Link href="/admin" onClick={closeMenu} className="block py-2 text-muted hover:text-seal-bright transition">
                    <Shield className="w-4 h-4 inline mr-2" />
                    Admin Panel
                  </Link>
                )}

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-hairline">
                  <div className="flex items-center gap-2 text-sm text-paper">
                    {getRoleIcon()}
                    <span>{userName}</span>
                  </div>
                  <button
                    onClick={() => { signOut({ redirectUrl: "/" }); closeMenu(); }}
                    className="text-seal-bright text-sm flex items-center gap-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-3 pt-3 mt-2 border-t border-hairline">
                <Link href="/sign-in" onClick={closeMenu} className="flex-1 text-center py-2 border border-hairline text-body rounded-md hover:border-gold-dim hover:text-gold transition">
                  Login
                </Link>
                <Link href="/sign-up" onClick={closeMenu} className="flex-1 text-center py-2 bg-gold text-ink font-medium rounded-md hover:bg-gold-bright transition">
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
