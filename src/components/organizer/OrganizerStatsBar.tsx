import React from 'react';
import { OrganizerStat } from '@/types';
import { TrendingUp } from 'lucide-react';

interface OrganizerStatsBarProps {
  stats: OrganizerStat[];
}

export const OrganizerStatsBar: React.FC<OrganizerStatsBarProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div key={idx} className="p-4 rounded-2xl bg-[#202631] border border-[#343A49] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#A0A6B8] mb-1 font-mono">
            <span>{stat.label}</span>
            <span
              className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${
                stat.trendDirection === 'up'
                  ? 'text-[#43E5D2]'
                  : 'text-[#A0A6B8]'
              }`}
            >
              {stat.trendDirection === 'up' && <TrendingUp className="w-3 h-3 text-[#43E5D2]" />}
              {stat.trend}
            </span>
          </div>

          <div className="text-2xl font-black text-[#F3F0E8] tracking-tight my-1">
            {stat.value}
          </div>

          <p className="text-[11px] text-[#A0A6B8]">{stat.description}</p>
        </div>
      ))}
    </div>
  );
};
