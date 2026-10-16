import React from 'react';
import Link from 'next/link';
import { HouseEvent } from '@/types';
import { Badge } from '@/components/ui/Badge';
import {
  Sparkles,
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  Radio,
  CheckCircle2,
  Flame,
  Zap,
} from 'lucide-react';

interface FlagshipFeaturesProps {
  flagshipEvents: HouseEvent[];
}

export const FlagshipFeatures: React.FC<FlagshipFeaturesProps> = ({
  flagshipEvents,
}) => {
  const paradox = flagshipEvents.find((e) => e.flagshipType === 'PARADOX');
  const saavan = flagshipEvents.find((e) => e.flagshipType === 'SAAVAN');

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#F3F0E8] tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#43E5D2]" />
            Centralized Flagship Gatherings
          </h2>
          <p className="text-xs text-[#9EA8B6] mt-0.5">
            Premier annual confluences organized centrally by the IITM BS Student Activities Council
          </p>
        </div>
        <span className="text-xs text-[#43E5D2] font-bold font-mono uppercase tracking-wider hidden sm:inline px-3 py-1 rounded-full bg-[#202631] border border-[#43E5D2]/30 shadow-xs">
          Official Flagships
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* PARADOX Card: High-energy on-campus flagship treatment (Preserves Coral #FF896D) */}
        {paradox && (
          <div className="relative rounded-2xl bg-gradient-to-br from-[#261E28] via-[#202631] to-[#101116] border border-[#FF896D]/30 p-6 flex flex-col justify-between group shadow-lg hover:shadow-[0_0_24px_rgba(255,137,109,0.18)] transition-all overflow-hidden">
            {/* Top decorative glow */}
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#FF896D]/15 rounded-full blur-3xl pointer-events-none group-hover:bg-[#FF896D]/25 transition-all" />

            <div className="space-y-4 relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#FF896D]/15 text-[#FF896D] border border-[#FF896D]/40">
                    <Flame className="w-3.5 h-3.5 text-[#FF896D]" />
                    Offline · On campus
                  </span>
                  <span className="text-[11px] font-mono font-medium text-[#9EA8B6]">
                    In-Person Confluence
                  </span>
                </div>
                <Badge variant="coral" size="sm">
                  {paradox.term} 2026 Term
                </Badge>
              </div>

              <div>
                <Link href={`/events/${paradox.id}`}>
                  <h3 className="text-3xl font-black text-[#F3F0E8] group-hover:text-[#FF896D] transition-colors tracking-tight flex items-center gap-2">
                    PARADOX
                    <span className="text-xs font-mono font-normal text-[#FF896D] px-2 py-0.5 rounded bg-[#FF896D]/10 border border-[#FF896D]/30">
                      FLAGSHIP
                    </span>
                  </h3>
                </Link>
                <p className="text-xs font-bold text-[#FF896D] mt-1 tracking-wide uppercase">
                  Annual IIT Madras Campus Confluence • Student Council
                </p>
                <p className="text-xs text-[#9EA8B6] mt-2 line-clamp-3 leading-relaxed">
                  {paradox.shortDescription}
                </p>
              </div>

              <div className="space-y-2.5 pt-3.5 border-t border-[#343A49] text-xs text-[#9EA8B6]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#FF896D] shrink-0" />
                  <span className="text-[#F3F0E8] font-bold">{paradox.date}</span>
                  <span className="text-xs text-[#9EA8B6]">• 4 Days Campus Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#FF896D] shrink-0" />
                  <span className="text-[#F3F0E8] truncate font-medium">{paradox.location}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <Users className="w-3.5 h-3.5 text-[#FF896D] shrink-0" />
                  <span>
                    <strong className="text-[#F3F0E8]">{paradox.registeredCount}</strong> registered / {paradox.capacity} capacity
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#343A49] flex items-center justify-between gap-3 relative z-10">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#43E5D2] bg-[#202631] px-3 py-1.5 rounded-full border border-[#43E5D2]/30 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#43E5D2]" />
                Pass Registered
              </span>
              <Link
                href={`/events/${paradox.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF896D] hover:bg-[#FFA28B] text-[#101116] text-xs font-bold shadow-sm transition-all"
              >
                <span>View Schedule & Pass</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* SAAVAN Card: Distinct digital-festival treatment (Preserves Violet #8B7CFF + Electric Cyan #43E5D2) */}
        {saavan && (
          <div className="relative rounded-2xl bg-gradient-to-br from-[#1C1F32] via-[#202631] to-[#101116] border border-[#8B7CFF]/35 p-6 flex flex-col justify-between group shadow-lg hover:shadow-[0_0_24px_rgba(139,124,255,0.18)] transition-all overflow-hidden">
            {/* Top decorative glow */}
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#8B7CFF]/15 rounded-full blur-3xl pointer-events-none group-hover:bg-[#43E5D2]/20 transition-all" />

            <div className="space-y-4 relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#8B7CFF]/15 text-[#8B7CFF] border border-[#8B7CFF]/40">
                    <Zap className="w-3.5 h-3.5 text-[#8B7CFF]" />
                    Online Stream
                  </span>
                  <span className="text-[11px] font-mono font-medium text-[#9EA8B6]">
                    Virtual Fest &amp; Symposium
                  </span>
                </div>
                <Badge variant="violet" size="sm">
                  {saavan.term} 2026 Term
                </Badge>
              </div>

              <div>
                <Link href={`/events/${saavan.id}`}>
                  <h3 className="text-3xl font-black text-[#F3F0E8] group-hover:text-[#43E5D2] transition-colors tracking-tight flex items-center gap-2">
                    SAAVAN
                    <span className="text-xs font-mono font-normal text-[#8B7CFF] px-2 py-0.5 rounded bg-[#8B7CFF]/15 border border-[#8B7CFF]/30">
                      VIRTUAL FEST
                    </span>
                  </h3>
                </Link>
                <p className="text-xs font-bold text-[#8B7CFF] mt-1 tracking-wide uppercase">
                  Annual Virtual Fest &amp; Global Symposium • Student Council
                </p>
                <p className="text-xs text-[#9EA8B6] mt-2 line-clamp-3 leading-relaxed">
                  {saavan.shortDescription}
                </p>
              </div>

              <div className="space-y-2.5 pt-3.5 border-t border-[#343A49] text-xs text-[#9EA8B6]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#8B7CFF] shrink-0" />
                  <span className="text-[#F3F0E8] font-bold">{saavan.date}</span>
                  <span className="text-xs text-[#9EA8B6]">• Global Streaming &amp; Discord</span>
                </div>
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-[#43E5D2] shrink-0" />
                  <span className="text-[#F3F0E8] truncate font-medium">{saavan.location}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <Users className="w-3.5 h-3.5 text-[#43E5D2] shrink-0" />
                  <span>
                    <strong className="text-[#F3F0E8]">{saavan.registeredCount}</strong> registered / {saavan.capacity} capacity
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#343A49] flex items-center justify-between gap-3 relative z-10">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#43E5D2] bg-[#202631] px-3 py-1.5 rounded-full border border-[#43E5D2]/30 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#43E5D2]" />
                Stream Access RSVPed
              </span>
              <Link
                href={`/events/${saavan.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B7CFF] to-[#43E5D2] hover:opacity-95 text-[#101116] text-xs font-bold shadow-sm transition-all"
              >
                <span>View Schedule & Join Info</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
