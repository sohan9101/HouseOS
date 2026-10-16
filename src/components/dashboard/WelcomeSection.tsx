'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CalendarDays, Trophy, ArrowRight, Sparkles, Building2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { TechfestConstellation3D } from './TechfestConstellation3D';
import { TechfestCssHero } from './TechfestCssHero';

interface AuthProfileState {
  displayName: string;
  email: string | null;
  role: string;
  houseId: string | null;
  houseName: string | null;
}

export const WelcomeSection: React.FC = () => {
  // Support comparing both variants: '3d' (Interactive 3D Constellation) vs 'css' (Lightweight Geometry)
  const [heroVariant, setHeroVariant] = useState<'3d' | 'css'>('3d');
  const [authProfile, setAuthProfile] = useState<AuthProfileState | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const loadProfile = async () => {
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
            email: user.email ?? null,
            role: profile?.role || 'student',
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

    loadProfile();

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
          email: session.user.email ?? null,
          role: profile?.role || 'student',
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

  return (
    <section className="relative rounded-2xl bg-[#101116] border border-[#343A49] overflow-hidden shadow-2xl text-[#F3F0E8] mb-8">
      {/* 3D / CSS Hero Graphic Background Layer */}
      <div className="absolute inset-0 pointer-events-auto">
        {heroVariant === '3d' ? (
          <TechfestConstellation3D />
        ) : (
          <TechfestCssHero />
        )}
      </div>

      {/* Editorial Content Layer with Deep Contrast Gradient Mask */}
      <div className="relative z-10 pointer-events-none p-6 sm:p-8 md:p-12 bg-gradient-to-r from-[#101116]/95 via-[#101116]/85 to-transparent flex flex-col justify-between min-h-[420px] md:min-h-[480px]">
        {/* Top bar inside hero: Community badge + Variant switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#202631] text-[#43E5D2] border border-[#43E5D2]/30 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#43E5D2]" />
              IIT Madras BS Degree • HouseOS
            </span>
            <span className="text-xs text-[#9EA8B6] font-medium tracking-wide hidden sm:inline">
              Sep 2026 Term Active
            </span>
          </div>

          {/* Interactive Variant Comparison Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#202631]/90 border border-[#343A49] text-xs backdrop-blur-md">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#9EA8B6] px-2 flex items-center gap-1">
              <Eye className="w-3 h-3 text-[#43E5D2]" />
              Hero:
            </span>
            <button
              type="button"
              onClick={() => setHeroVariant('3d')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                heroVariant === '3d'
                  ? 'bg-[#43E5D2] text-[#101116] shadow-xs'
                  : 'text-[#9EA8B6] hover:text-[#F3F0E8]'
              }`}
            >
              ✦ 3D Universe
            </button>
            <button
              type="button"
              onClick={() => setHeroVariant('css')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                heroVariant === 'css'
                  ? 'bg-[#43E5D2] text-[#101116] shadow-xs'
                  : 'text-[#9EA8B6] hover:text-[#F3F0E8]'
              }`}
            >
              ⟡ Editorial Grid
            </button>
          </div>
        </div>

        {/* Center Editorial Headlines */}
        <div className="max-w-xl my-auto py-8 pointer-events-auto">
          <div className="inline-flex items-center gap-2 text-[#43E5D2] text-xs font-mono font-bold tracking-widest uppercase mb-3">
            <span className="w-2 h-2 rounded-full bg-[#43E5D2] animate-ping" />
            Decentralized Student Operating System
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#F3F0E8] mb-4 leading-tight">
            12 HOUSES. <span className="text-[#43E5D2]">ONE UNIVERSE.</span>
          </h1>

          <p className="text-sm md:text-base text-[#9EA8B6] leading-relaxed max-w-lg mb-8">
            The unified digital campus platform connecting all 12 student houses, premier cultural flagships <strong className="text-[#F3F0E8] font-semibold">PARADOX</strong> &amp; <strong className="text-[#F3F0E8] font-semibold">SAAVAN</strong>, and 30+ specialized student societies.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/houses">
              <Button
                variant="primary"
                size="md"
                className="bg-[#43E5D2] hover:bg-[#35D6C3] text-[#101116] font-bold border-none shadow-sm hover:shadow-[0_0_16px_rgba(67,229,210,0.25)]"
              >
                <Building2 className="w-4 h-4 mr-2 text-[#101116]" />
                Explore Houses
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
            <Link href="/events">
              <Button
                variant="secondary"
                size="md"
                className="bg-[#202631] hover:bg-[#28303E] text-[#F3F0E8] border border-[#343A49]"
              >
                <CalendarDays className="w-4 h-4 mr-2 text-[#43E5D2]" />
                Discover Events
              </Button>
            </Link>
            <Link href="/standings">
              <Button
                variant="outline"
                size="md"
                className="bg-transparent hover:bg-[#202631] text-[#9EA8B6] hover:text-[#F3F0E8] border-[#343A49] hover:border-[#8B7CFF]"
              >
                <Trophy className="w-4 h-4 mr-2 text-[#8B7CFF]" />
                Community Cup
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer Identity Pill */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#343A49] text-xs text-[#9EA8B6] pointer-events-auto">
          {authProfile ? (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#202631] border border-[#43E5D2]/40 flex items-center justify-center text-xs font-black text-[#43E5D2]">
                {getInitials(authProfile.displayName)}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-bold text-[#F3F0E8]">{authProfile.displayName}</span>
                {authProfile.email && (
                  <>
                    <span className="text-[#43E5D2]">•</span>
                    <span className="font-mono text-[11px] text-[#9EA8B6]">{authProfile.email}</span>
                  </>
                )}
                <span className="text-[#43E5D2]">•</span>
                <span className="capitalize px-1.5 py-0.5 rounded bg-[#43E5D2]/10 text-[#43E5D2] text-[10px] font-mono font-bold border border-[#43E5D2]/25">
                  {authProfile.role}
                </span>
                <span className="text-[#43E5D2]">•</span>
                {authProfile.houseName ? (
                  <span className="text-[#8B7CFF] font-semibold">{authProfile.houseName}</span>
                ) : authProfile.role === 'student' ? (
                  <Link
                    href="/onboarding"
                    className="text-[#FF896D] hover:underline font-semibold"
                  >
                    Select House (Required) →
                  </Link>
                ) : (
                  <span className="text-[#9EA8B6]">Staff / Faculty</span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#202631] border border-[#343A49] flex items-center justify-center text-xs font-black text-[#9EA8B6]">
                OS
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#F3F0E8]">Guest Explorer</span>
                <span className="text-[#43E5D2]">•</span>
                <span>IIT Madras BS Degree</span>
                <span className="text-[#43E5D2]">•</span>
                <Link href="/login" className="text-[#43E5D2] hover:underline font-semibold">
                  Sign In to HouseOS →
                </Link>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 text-[11px] text-[#43E5D2]">
            <span className="w-2 h-2 rounded-full bg-[#43E5D2]" />
            <span>Interactive 12-Node Constellation Active</span>
          </div>
        </div>
      </div>
    </section>
  );
};
