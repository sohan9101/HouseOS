'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Trophy,
  ShieldCheck,
  Building2,
  Compass,
  ArrowRightLeft,
  Sparkles,
  LogIn,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SidebarProps {
  onNavigate?: () => void;
  className?: string;
}

interface AuthUserSummary {
  displayName: string;
  role: string;
  email: string | null;
  houseId: string | null;
  houseName: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, className = '' }) => {
  const pathname = usePathname();
  const [authProfile, setAuthProfile] = useState<AuthUserSummary | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const loadUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, role, house_id, houses(id, name)')
            .eq('id', user.id)
            .maybeSingle();

          const rawHouse = profile?.houses as { id: string; name: string } | null;
          const houseName = rawHouse?.name
            ? rawHouse.name.endsWith('House')
              ? rawHouse.name
              : `${rawHouse.name} House`
            : null;

          setAuthProfile({
            displayName:
              profile?.display_name ||
              (user.user_metadata?.display_name as string) ||
              user.email?.split('@')[0] ||
              'Resident Student',
            role: profile?.role || 'student',
            email: user.email ?? null,
            houseId: profile?.house_id ?? null,
            houseName,
          });
        } else {
          setAuthProfile(null);
        }
      } catch {
        setAuthProfile(null);
      }
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, role, house_id, houses(id, name)')
          .eq('id', session.user.id)
          .maybeSingle();

        const rawHouse = profile?.houses as { id: string; name: string } | null;
        const houseName = rawHouse?.name
          ? rawHouse.name.endsWith('House')
            ? rawHouse.name
            : `${rawHouse.name} House`
          : null;

        setAuthProfile({
          displayName:
            profile?.display_name ||
            (session.user.user_metadata?.display_name as string) ||
            session.user.email?.split('@')[0] ||
            'Resident Student',
          role: profile?.role || 'student',
          email: session.user.email ?? null,
          houseId: profile?.house_id ?? null,
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

  const navItems = [
    {
      name: 'Universe Dashboard',
      href: '/',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: 'Events & Festivals',
      href: '/events',
      icon: CalendarDays,
      badge: 'PARADOX • SAAVAN',
    },
    {
      name: 'House Constellation',
      href: '/houses',
      icon: Building2,
      badge: '12 Houses',
    },
    {
      name: 'Clubs & Societies',
      href: '/societies',
      icon: Compass,
      badge: '30 Orgs',
    },
    {
      name: 'Community Standings',
      href: '/standings',
      icon: Trophy,
    },
    // Only show organizer console navigation if privileged role is confirmed
    ...(authProfile && (authProfile.role === 'organizer' || authProfile.role === 'warden')
      ? [
          {
            name: 'Organizer Console',
            href: '/organizer',
            icon: ShieldCheck,
            badge: 'Warden/Council',
          },
        ]
      : []),
  ];

  return (
    <aside
      className={`flex flex-col h-full bg-[#101116] border-r border-[#343A49] select-none ${className}`}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 h-16 px-5 border-b border-[#343A49]">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-[#43E5D2] rounded-lg p-1"
        >
          <div className="w-8 h-8 rounded-lg bg-[#202631] border border-[#343A49] flex items-center justify-center text-white shadow-xs group-hover:border-[#43E5D2] transition-colors">
            <Building2 className="w-4 h-4 text-[#43E5D2]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base tracking-tight text-white">
                HouseOS
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#43E5D2] uppercase px-1.5 py-0.2 rounded bg-[#43E5D2]/10 border border-[#43E5D2]/25">
                v2.6
              </span>
            </div>
            <span className="text-[10px] text-[#9EA8B6] font-mono leading-none">
              IIT Madras BS
            </span>
          </div>
        </Link>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#9EA8B6]">
          Campus Cosmos
        </div>
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                active
                  ? 'bg-[#43E5D2] text-[#101116] shadow-xs'
                  : 'text-[#9EA8B6] hover:text-[#F3F0E8] hover:bg-[#202631]'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <item.icon
                  className={`w-4 h-4 shrink-0 ${
                    active ? 'text-[#101116]' : 'text-[#9EA8B6] group-hover:text-[#43E5D2]'
                  }`}
                />
                <span className="truncate">{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#101116] text-[#43E5D2]'
                      : 'bg-[#202631] text-[#9EA8B6] border border-[#343A49]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Proposed Community Cup Standing Mini Widget */}
      <Link
        href="/standings"
        onClick={onNavigate}
        className="block p-3.5 mx-3 mb-3 rounded-xl bg-[#202631] border border-[#343A49] hover:border-[#43E5D2]/50 transition-all shadow-xs group"
        title="View Community Cup Leaderboard"
      >
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="flex items-center gap-1.5 text-white font-bold group-hover:text-[#43E5D2] transition-colors">
            <Trophy className="w-3.5 h-3.5 text-[#43E5D2]" />
            Community Cup
          </span>
          <span className="font-mono font-bold text-[#43E5D2] text-[10px] px-1.5 py-0.5 rounded bg-[#43E5D2]/15 border border-[#43E5D2]/30">
            Leader
          </span>
        </div>
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-base font-black text-white tracking-tight">1,540 pts</span>
          <span className="text-[11px] font-mono text-[#8B7CFF]">Saranda House</span>
        </div>
        <div className="w-full bg-[#101116] rounded-full h-1.5 overflow-hidden mb-2 border border-[#343A49]">
          <div className="bg-[#43E5D2] h-1.5 rounded-full w-4/5" />
        </div>
        <p className="text-[10px] font-mono text-[#9EA8B6] flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#43E5D2]" />
            Active Season
          </span>
          <span className="text-[#43E5D2] group-hover:underline">View All →</span>
        </p>
      </Link>

      {/* User Context & Role Switcher */}
      <div className="p-3 border-t border-[#343A49] bg-[#202631]/60">
        {authProfile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#43E5D2] text-[#101116] font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                {getInitials(authProfile.displayName)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {authProfile.displayName}
                </p>
                <div className="flex items-center gap-1 text-[10px] font-mono truncate">
                  <span className="capitalize text-[#43E5D2]">{authProfile.role}</span>
                  {authProfile.houseName ? (
                    <span className="text-[#8B7CFF] truncate">• {authProfile.houseName}</span>
                  ) : authProfile.role === 'student' ? (
                    <Link
                      href="/onboarding"
                      onClick={onNavigate}
                      className="text-[#FF896D] hover:underline"
                    >
                      • Select House
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
            <Link
              href="/login"
              title="Account Options"
              className="p-1.5 rounded-lg text-[#9EA8B6] hover:text-[#43E5D2] hover:bg-[#28303E] transition-colors"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold text-white">Guest Resident</p>
              <p className="text-[10px] font-mono text-[#9EA8B6]">IITM BS Community</p>
            </div>
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#43E5D2] hover:bg-[#38C7B6] text-[#101116] text-[11px] font-bold transition-colors shadow-xs"
            >
              <LogIn className="w-3 h-3" />
              <span>Sign In</span>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};
