'use client';

import React, { useState } from 'react';
import { HouseAnnouncement } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Plus,
  AlertTriangle,
  Pin,
  X,
  Sparkles,
} from 'lucide-react';

interface OrganizerAnnouncementsManagerProps {
  announcements: HouseAnnouncement[];
}

export const OrganizerAnnouncementsManager: React.FC<
  OrganizerAnnouncementsManagerProps
> = ({ announcements }) => {
  const [showModal, setShowModal] = useState(false);
  const [submitNotice, setSubmitNotice] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#F3F0E8] tracking-tight">
            Announcements &amp; Operational Bulletins
          </h2>
          <p className="text-xs text-[#A0A6B8]">
            Post facility updates, dining schedule changes, and house council resolutions.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowModal(true)}
          className="self-start sm:self-auto bg-[#43E5D2] hover:bg-[#38C7B6] text-[#101116] font-bold shadow-xs border-none"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Publish Bulletin
        </Button>
      </div>

      <div className="grid gap-3">
        {announcements.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
              item.priority === 'urgent'
                ? 'border-[#FF896D]/40 bg-[#FF896D]/10'
                : item.priority === 'pinned'
                ? 'border-[#43E5D2]/40 bg-[#43E5D2]/5'
                : 'bg-[#202631] border-[#343A49]'
            }`}
          >
            <div className="space-y-1.5 flex-1 min-w-0">
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
                <span className="text-xs text-[#A0A6B8] font-mono">{item.category}</span>
                <span className="text-[#A0A6B8]">•</span>
                <span className="text-xs text-[#A0A6B8] font-mono">{item.date}</span>
              </div>

              <h3 className="text-sm font-bold text-[#F3F0E8]">{item.title}</h3>
              <p className="text-xs text-[#A0A6B8] line-clamp-1">{item.content}</p>

              <div className="text-[11px] text-[#A0A6B8] pt-1">
                Author: <strong className="text-[#F3F0E8]">{item.author.name}</strong> ({item.author.role})
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={() =>
                  alert(
                    `Simulated: Edit announcement "${item.title}". Persistence planned for Phase 2.`
                  )
                }
                className="px-3 py-1.5 rounded-xl bg-[#101116] hover:bg-[#202631] border border-[#343A49] text-xs text-[#F3F0E8] font-bold transition-colors shadow-xs cursor-pointer"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Publish Bulletin Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101116]/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#202631] border border-[#343A49] rounded-2xl p-6 shadow-2xl space-y-4 text-[#F3F0E8]">
            <div className="flex items-center justify-between pb-3 border-b border-[#343A49]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#43E5D2]" />
                <h3 className="text-base font-bold text-[#F3F0E8]">Publish Bulletin</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#A0A6B8] hover:text-[#F3F0E8] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#101116] border border-[#343A49] text-xs text-[#A0A6B8]">
              <p>
                <strong>Phase 1.5 Notice:</strong> Form preview for bulletin layout. Real-time broadcast and DB storage will be implemented in Phase 2.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#F3F0E8] mb-1">
                  Bulletin Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dining Hall Holiday Hours"
                  className="w-full px-3 py-2 rounded-xl bg-[#101116] border border-[#343A49] text-[#F3F0E8] placeholder-[#A0A6B8] focus:outline-none focus:ring-2 focus:ring-[#43E5D2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#F3F0E8] mb-1">
                    Category
                  </label>
                  <select className="w-full px-3 py-2 rounded-xl bg-[#101116] border border-[#343A49] text-[#F3F0E8] focus:outline-none focus:ring-2 focus:ring-[#43E5D2]">
                    <option>Facilities</option>
                    <option>Dining</option>
                    <option>Council</option>
                    <option>General</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#F3F0E8] mb-1">
                    Priority Level
                  </label>
                  <select className="w-full px-3 py-2 rounded-xl bg-[#101116] border border-[#343A49] text-[#F3F0E8] focus:outline-none focus:ring-2 focus:ring-[#43E5D2]">
                    <option>Normal</option>
                    <option>Pinned</option>
                    <option>Urgent Notice</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#F3F0E8] mb-1">
                  Message Content
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide concise operational details..."
                  className="w-full px-3 py-2 rounded-xl bg-[#101116] border border-[#343A49] text-[#F3F0E8] placeholder-[#A0A6B8] focus:outline-none focus:ring-2 focus:ring-[#43E5D2]"
                />
              </div>
            </div>

            {submitNotice && (
              <div className="p-2.5 rounded-xl bg-[#43E5D2]/15 border border-[#43E5D2]/40 text-xs text-[#43E5D2] font-semibold text-center animate-fadeIn">
                ✓ {submitNotice}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#343A49]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModal(false)}
                className="border-[#343A49] text-[#A0A6B8] hover:text-[#F3F0E8]"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSubmitNotice('Bulletin staged for demonstration.');
                  setTimeout(() => {
                    setSubmitNotice(null);
                    setShowModal(false);
                  }, 800);
                }}
                disabled={Boolean(submitNotice)}
                className="bg-[#43E5D2] hover:bg-[#38C7B6] text-[#101116] font-bold border-none"
              >
                {submitNotice ? 'Published!' : 'Publish Notice'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
