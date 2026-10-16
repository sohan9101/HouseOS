'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  LogIn,
  ShieldCheck,
  Building2,
  Compass,
  Trophy,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { logoutAction } from '@/app/login/actions';

interface TopBarProps {
  onToggleMobileNav: () => void;
  isMobileNavOpen?: boolean;
}

interface AuthProfile {
  id: string;
  email: string | null;
  displayName: string;
  role: string;
  houseId: string | null;
  houseName: string | null;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleMobileNav, isMobileNavOpen = false }) => {
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [authProfile, setAuthProfile] = useState<AuthProfile | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        router.push('/events');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  useEffect(() => {
    const supabase = createClient();

    const fetchAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, display_name, role, house_id, houses(id, name)')
            .eq('id', user.id)
            .maybeSingle();

          const name =
            profile?.display_name ||
            (user.user_metadata?.display_name as string) ||
            user.email?.split('@')[0] ||
            'Resident Student';

          const rawHouse = profile?.houses as { id: string; name: string } | null;
          const houseName = rawHouse?.name
            ? rawHouse.name.endsWith('House')
              ? rawHouse.name
              : `${rawHouse.name} House`
            : null;

          setAuthProfile({
            id: user.id,
            email: user.email ?? null,
            displayName: name,
            role: profile?.role || 'student',
            houseId: profile?.house_id || null,
            houseName,
          });
        } else {
          setAuthProfile(null);
        }
      } catch {
        // Fallback gracefully on network/session errors
        setAuthProfile(null);
      }
    };

    fetchAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, display_name, role, house_id, houses(id, name)')
          .eq('id', session.user.id)
          .maybeSingle();

        const name =
          profile?.display_name ||
          (session.user.user_metadata?.display_name as string) ||
          session.user.email?.split('@')[0] ||
          'Resident Student';

        const rawHouse = profile?.houses as { id: string; name: string } | null;
        const houseName = rawHouse?.name
          ? rawHouse.name.endsWith('House')
            ? rawHouse.name
            : `${rawHouse.name} House`
          : null;

        setAuthProfile({
          id: session.user.id,
          email: session.user.email ?? null,
          displayName: name,
          role: profile?.role || 'student',
          houseId: profile?.house_id || null,
          houseName,
        });
      } else {
        setAuthProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logoutAction();
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-[#101116]/85 backdrop-blur-md border-b border-[#343A49]">
      {/* Left: Mobile Toggle & House Context */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileNav}
          aria-expanded={isMobileNavOpen}
          aria-controls="mobile-navigation-drawer"
          className="p-2 -ml-2 rounded-lg text-[#9EA8B6] hover:text-[#43E5D2] hover:bg-[#202631] md:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43E5D2] cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* House Context Selector Pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#202631] border border-[#343A49] text-xs text-[#F3F0E8] shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#43E5D2] animate-pulse" />
          <span className="font-bold text-white">
            {authProfile
              ? authProfile.houseName ||
                (authProfile.role === 'student'
                  ? 'No House Assigned'
                  : `${authProfile.role.toUpperCase()} Console`)
              : 'Campus Cosmos'}
          </span>
          <span className="text-[#5A5E70] font-mono">•</span>
          <span className="text-[#43E5D2] font-mono font-semibold">Sep 2026 Term</span>
          <span className="text-[#5A5E70] hidden sm:inline">•</span>
          <span className="text-[#9EA8B6] hidden sm:inline text-[11px] font-mono">IITM BS</span>
        </div>
      </div>

      {/* Middle/Right: Search & Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative hidden md:flex items-center">
          <Link
            href="/events"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#202631] border border-[#343A49] text-xs text-[#9EA8B6] w-64 hover:border-[#43E5D2]/50 transition-colors cursor-pointer shadow-xs"
          >
            <Search className="w-3.5 h-3.5 text-[#9EA8B6]" />
            <span className="flex-1 text-[#9EA8B6] truncate font-mono">Search PARADOX, events...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#101116] text-[10px] text-[#9EA8B6] border border-[#343A49] font-mono">
              ⌘K
            </kbd>
          </Link>
        </div>

        {/* Notifications Icon */}
        <Link
          href="/#announcements"
          className="relative p-2 rounded-lg text-[#9EA8B6] hover:text-[#43E5D2] hover:bg-[#202631] border border-transparent hover:border-[#343A49] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43E5D2]"
          aria-label="Campus Notices"
          title="Sep Term Exam & Campus Notices"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#43E5D2]" />
        </Link>

        {/* User Auth Section */}
        {authProfile ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 pl-2 rounded-lg bg-[#202631] border border-[#343A49] hover:border-[#43E5D2]/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43E5D2] shadow-xs cursor-pointer"
              aria-expanded={userMenuOpen}
            >
              <div className="w-7 h-7 rounded-md bg-[#43E5D2] text-[#101116] flex items-center justify-center text-xs font-black">
                {getInitials(authProfile.displayName)}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <span className="block font-bold text-white leading-tight truncate max-w-[120px]">
                  {authProfile.displayName}
                </span>
                <span className="block text-[10px] font-mono text-[#43E5D2] leading-tight capitalize">
                  {authProfile.role}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#9EA8B6] hidden sm:block" />
            </button>

            {/* User Dropdown Flyout */}
            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#202631] border border-[#343A49] shadow-2xl py-1.5 z-50 text-xs">
                  <div className="px-3.5 py-2.5 border-b border-[#343A49]">
                    <p className="font-bold text-white truncate">{authProfile.displayName}</p>
                    <p className="text-[#9EA8B6] font-mono text-[11px] truncate">
                      {authProfile.email}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[#43E5D2] font-mono text-[11px] font-bold bg-[#43E5D2]/10 px-2 py-1 rounded-md border border-[#43E5D2]/30">
                      <span className="capitalize">{authProfile.role} Account</span>
                      <span className="text-[10px] text-[#A0A6B8] font-normal">Active</span>
                    </div>
                    {authProfile.houseName ? (
                      <div className="mt-1.5 flex items-center justify-between text-[#8B7CFF] font-mono text-[11px] bg-[#8B7CFF]/10 px-2 py-1 rounded-md border border-[#8B7CFF]/30">
                        <span className="font-semibold truncate">House: {authProfile.houseName}</span>
                        <span className="text-[10px] text-[#A0A6B8]">Assigned</span>
                      </div>
                    ) : authProfile.role === 'student' ? (
                      <Link
                        href="/onboarding"
                        onClick={() => setUserMenuOpen(false)}
                        className="mt-1.5 flex items-center justify-between text-[#FF896D] font-mono text-[11px] bg-[#FF896D]/10 px-2 py-1 rounded-md border border-[#FF896D]/30 hover:bg-[#FF896D]/20 transition-colors"
                      >
                        <span className="font-semibold">Select House</span>
                        <span className="text-[10px] underline">Onboard →</span>
                      </Link>
                    ) : null}
                  </div>

                  <div className="py-1">
                    <Link
                      href="/houses"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-[#9EA8B6] hover:text-white hover:bg-[#28303E]"
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#9EA8B6]" />
                      <span>Official 12 Houses</span>
                    </Link>
                    <Link
                      href="/societies"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-[#9EA8B6] hover:text-white hover:bg-[#28303E]"
                    >
                      <Compass className="w-3.5 h-3.5 text-[#9EA8B6]" />
                      <span>Clubs & Societies (30)</span>
                    </Link>
                    <Link
                      href="/standings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-[#8B7CFF] hover:bg-[#28303E]"
                    >
                      <Trophy className="w-3.5 h-3.5 text-[#8B7CFF]" />
                      <span>Community Cup Leaderboard</span>
                    </Link>
                    {authProfile.role !== 'student' && (
                      <Link
                        href="/organizer"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-[#43E5D2] font-medium hover:bg-[#28303E]"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#43E5D2]" />
                        <span>Organizer Console</span>
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-[#343A49]">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[#FF896D] hover:bg-[#FF896D]/10 text-left cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Unauthenticated state: Clean Sign In CTA */
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#43E5D2] hover:bg-[#38C7B6] text-[#101116] font-bold text-xs transition-colors shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
