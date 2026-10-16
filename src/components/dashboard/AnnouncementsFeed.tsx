import React from 'react';
import { HouseAnnouncement } from '@/types';
import { Pin, AlertTriangle, BellRing, BellOff, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

interface AnnouncementsFeedProps {
  announcements: HouseAnnouncement[];
  error?: string | null;
}

export const AnnouncementsFeed: React.FC<AnnouncementsFeedProps> = ({
  announcements,
  error = null,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#F3F0E8] tracking-tight flex items-center gap-2">
            <BellRing className="w-5 h-5 text-[#8B7CFF]" />
            House Announcements
          </h2>
          <p className="text-xs text-[#9EA8B6] mt-0.5">
            Official bulletins and operational notices across houses
          </p>
        </div>
      </div>

      {error ? (
        <div className="p-5 rounded-2xl bg-[#202631] border border-[#FF896D]/30 space-y-2">
          <div className="flex items-center gap-2 text-[#FF896D]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <h3 className="text-sm font-bold text-[#F3F0E8]">Announcements Temporarily Unavailable</h3>
          </div>
          <p className="text-xs text-[#9EA8B6] leading-relaxed">
            Unable to synchronize live campus notices at this time. Please check your connection or try again shortly.
          </p>
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="No Announcements Published"
          description="There are currently no active campus bulletins or operational notices posted."
          className="py-10"
        />
      ) : (
        <div className="grid gap-3">
          {announcements.map((item) => {
            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  item.priority === 'urgent'
                    ? 'border-[#FF896D]/50 bg-[#FF896D]/10'
                    : item.priority === 'pinned'
                    ? 'border-[#43E5D2]/40 bg-[#43E5D2]/5'
                    : 'bg-[#202631] border-[#343A49]'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {item.priority === 'urgent' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FF896D]/20 text-[#FF896D] border border-[#FF896D]/40">
                        <AlertTriangle className="w-3 h-3 text-[#FF896D]" />
                        Urgent Notice
                      </span>
                    ) : item.priority === 'pinned' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#43E5D2]/15 text-[#43E5D2] border border-[#43E5D2]/30">
                        <Pin className="w-3 h-3 text-[#43E5D2]" />
                        Pinned
                      </span>
                    ) : (
                      <Badge variant="violet" size="sm">
                        {item.category}
                      </Badge>
                    )}
                    <span className="text-xs text-[#9EA8B6] font-mono">{item.category}</span>
                  </div>
                  <span className="text-[11px] text-[#9EA8B6] font-mono whitespace-nowrap">
                    {item.date}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#F3F0E8] mb-1 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-[#9EA8B6] leading-relaxed">
                  {item.content}
                </p>

                <div className="mt-3 pt-2.5 border-t border-[#343A49] flex items-center justify-between text-[11px] text-[#9EA8B6]">
                  <span>By <strong className="text-[#F3F0E8]">{item.author.name}</strong></span>
                  <span className="text-[#8B7CFF] font-medium">{item.author.role}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

