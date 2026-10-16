import React from 'react';
import Link from 'next/link';
import { Society } from '@/types';
import { Compass, ArrowRight, Calendar } from 'lucide-react';

interface SocietiesPreviewProps {
  societies: Society[];
}

export const SocietiesPreview: React.FC<SocietiesPreviewProps> = ({ societies }) => {
  const featured = societies.slice(0, 6);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#F3F0E8] tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#43E5D2]" />
            Clubs &amp; Societies Discovery
          </h2>
          <p className="text-xs text-[#9EA8B6] mt-0.5">
            Student-run technical, cultural, and competitive societies driving campus life
          </p>
        </div>
        <Link
          href="/societies"
          className="text-xs text-[#43E5D2] hover:underline font-bold inline-flex items-center gap-1.5"
        >
          <span>All 30 Societies</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {featured.map((society) => (
          <div
            key={society.id}
            className="p-4 rounded-2xl bg-[#202631] border border-[#343A49] hover:border-[#43E5D2]/50 transition-all flex flex-col justify-between group shadow-xs hover:shadow-[0_0_20px_rgba(67,229,210,0.1)]"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#43E5D2]/15 text-[#43E5D2] border border-[#43E5D2]/30">
                  {society.badgeCode}
                </span>
                <span className="text-[11px] text-[#9EA8B6] font-mono">
                  {society.category.split('&')[0].trim()}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#F3F0E8] group-hover:text-[#43E5D2] transition-colors">
                  {society.name}
                </h3>
                <p className="text-xs text-[#9EA8B6] line-clamp-2 mt-1 leading-relaxed">
                  {society.description}
                </p>
              </div>
            </div>

            <div className="mt-3.5 pt-2.5 border-t border-[#343A49] flex items-center justify-between text-xs text-[#9EA8B6]">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Calendar className="w-3 h-3 text-[#43E5D2]" />
                <strong className="text-[#F3F0E8]">{society.activeEventsCount}</strong> active events
              </span>
              <Link
                href="/societies"
                className="text-[11px] font-bold text-[#43E5D2] hover:text-[#35D6C3] transition-colors"
              >
                Explore &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
