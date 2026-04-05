// components/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, LogOut, User, Menu, X, Plus, BarChart3 } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold"
          onClick={closeMenu}
        >
          <BookOpen className="w-6 h-6 text-blue-500" />
          <span>NovelTracker</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/browse" className="hover:text-blue-400 transition">
            Browse
          </Link>

          {status === "loading" ? (
            <div className="w-20 h-8 bg-gray-800 rounded-lg animate-pulse" />
          ) : session ? (
            <>
              <Link href="/list" className="hover:text-blue-400 transition">
                My List
              </Link>
              <Link href="/stats" className="hover:text-blue-400 transition">
                Stats
              </Link>
              <Link href="/add-novel" className="hover:text-blue-400 transition">
                <Plus className="w-4 h-4 inline mr-1" />
                Add Novel
              </Link>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-blue-500" />
                  <span>{session.user?.name}</span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="text-gray-400 hover:text-red-400 transition"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-blue-400 transition">
                Login
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-gray-400 hover:text-white transition"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-900">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/browse"
              onClick={closeMenu}
              className="block py-2 hover:text-blue-400 transition"
            >
              Browse
            </Link>

            {session ? (
              <>
                <Link
                  href="/list"
                  onClick={closeMenu}
                  className="block py-2 hover:text-blue-400 transition"
                >
                  My List
                </Link>
                <Link
                  href="/stats"
                  onClick={closeMenu}
                  className="block py-2 hover:text-blue-400 transition"
                >
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  Stats
                </Link>
                <Link
                  href="/add-novel"
                  onClick={closeMenu}
                  className="block py-2 hover:text-blue-400 transition"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add Novel
                </Link>
                <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-blue-500" />
                    <span>{session.user?.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      closeMenu();
                    }}
                    className="text-red-400 text-sm flex items-center gap-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-3 pt-3 border-t border-gray-800">
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="flex-1 text-center py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="flex-1 text-center py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                >
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