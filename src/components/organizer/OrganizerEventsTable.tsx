'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HouseEvent } from '@/types';
import { Button } from '@/components/ui/Button';
import {
  Plus,
  Eye,
  X,
  AlertCircle,
  Sparkles,
  MapPin,
  Globe,
  Swords,
} from 'lucide-react';

interface OrganizerEventsTableProps {
  events: HouseEvent[];
}

export const OrganizerEventsTable: React.FC<OrganizerEventsTableProps> = ({ events }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitNotice, setSubmitNotice] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'flagship' | 'society' | 'interhouse'>('all');

  const filtered = events.filter((e) => {
    if (filterType === 'flagship') return e.isFlagship;
    if (filterType === 'society') return e.organizerType === 'club_society';
    if (filterType === 'interhouse') return e.isInterHouse;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#F3F0E8] tracking-tight">
            Campus Activities &amp; Flagship Coordination
          </h2>
          <p className="text-xs text-[#A0A6B8]">
            Oversee centralized events (PARADOX &amp; SAAVAN), club &amp; society events, and inter-house competitions.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowCreateModal(true)}
          className="self-start sm:self-auto bg-[#43E5D2] hover:bg-[#38C7B6] text-[#101116] font-bold shadow-xs border-none"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Stage New Event
        </Button>
      </div>

      {/* Filter Tabs for Event Classification */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#202631] border border-[#343A49] text-xs w-fit">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            filterType === 'all'
              ? 'bg-[#43E5D2] text-[#101116] shadow-xs'
              : 'text-[#A0A6B8] hover:text-[#F3F0E8]'
          }`}
        >
          All Events ({events.length})
        </button>
        <button
          onClick={() => setFilterType('flagship')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            filterType === 'flagship'
              ? 'bg-[#43E5D2] text-[#101116] shadow-xs'
              : 'text-[#A0A6B8] hover:text-[#F3F0E8]'
          }`}
        >
          Centralized Flagships (2)
        </button>
        <button
          onClick={() => setFilterType('society')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            filterType === 'society'
              ? 'bg-[#43E5D2] text-[#101116] shadow-xs'
              : 'text-[#A0A6B8] hover:text-[#F3F0E8]'
          }`}
        >
          Club &amp; Society Events
        </button>
        <button
          onClick={() => setFilterType('interhouse')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            filterType === 'interhouse'
              ? 'bg-[#43E5D2] text-[#101116] shadow-xs'
              : 'text-[#A0A6B8] hover:text-[#F3F0E8]'
          }`}
        >
          Inter-House Competitions
        </button>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-[#343A49] bg-[#202631] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#F3F0E8]">
            <thead className="bg-[#101116] text-[11px] uppercase tracking-wider text-[#A0A6B8] font-mono border-b border-[#343A49]">
              <tr>
                <th className="px-4 py-3.5 font-bold">Event &amp; Organizing Entity</th>
                <th className="px-4 py-3.5 font-bold">Format &amp; Venue</th>
                <th className="px-4 py-3.5 font-bold">Competition Type</th>
                <th className="px-4 py-3.5 font-bold">Registrations</th>
                <th className="px-4 py-3.5 font-bold">Points</th>
                <th className="px-4 py-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#343A49]">
              {filtered.map((event) => {
                const fillRatio = Math.round(
                  (event.registeredCount / event.capacity) * 100
                );

                return (
                  <tr
                    key={event.id}
                    className="hover:bg-[#101116]/40 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-[#F3F0E8] text-sm">
                        {event.title}
                      </div>
                      <div className="text-[11px] text-[#A0A6B8] flex items-center gap-1.5 mt-0.5">
                        <span className="text-[#43E5D2] font-mono font-semibold">
                          {event.organizingEntity}
                        </span>
                        <span>•</span>
                        <span className="font-mono">{event.term} Term</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {event.deliveryMode === 'offline' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FF896D]/15 text-[#FF896D] border border-[#FF896D]/30">
                            <MapPin className="w-3 h-3 text-[#FF896D]" />
                            Offline
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#43E5D2]/15 text-[#43E5D2] border border-[#43E5D2]/30">
                            <Globe className="w-3 h-3 text-[#43E5D2]" />
                            Online
                          </span>
                        )}
                        <span className="text-[#A0A6B8] text-[11px] truncate max-w-xs">
                          {event.location}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#A0A6B8] mt-0.5 font-mono">
                        {event.date}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      {event.isInterHouse ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#43E5D2] bg-[#43E5D2]/10 px-2 py-0.5 rounded-full border border-[#43E5D2]/30">
                          <Swords className="w-3 h-3 text-[#43E5D2]" />
                          Inter-House Cup
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#A0A6B8]">
                          Open Participation
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#F3F0E8] font-mono">
                          {event.registeredCount}/{event.capacity}
                        </span>
                        <span className="text-[10px] text-[#A0A6B8] font-mono">
                          ({fillRatio}%)
                        </span>
                      </div>
                      <div className="w-24 bg-[#101116] rounded-full h-1.5 mt-1 overflow-hidden border border-[#343A49]">
                        <div
                          className={`h-1.5 rounded-full ${
                            fillRatio >= 90 ? 'bg-[#FF896D]' : 'bg-[#43E5D2]'
                          }`}
                          style={{ width: `${Math.min(fillRatio, 100)}%` }}
                        />
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-mono">
                      <span className="font-bold text-[#8B7CFF]">
                        +{event.housePoints}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/events/${event.id}`}>
                          <button
                            className="p-1.5 rounded-lg hover:bg-[#101116] text-[#A0A6B8] hover:text-[#43E5D2] transition-colors cursor-pointer"
                            title="Preview Public Page"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                        <button
                          onClick={() =>
                            alert(
                              `Simulated: Edit modal for "${event.title}". Persistence will be added in Phase 2.`
                            )
                          }
                          className="px-2.5 py-1 rounded-lg bg-[#101116] hover:bg-[#202631] text-[#F3F0E8] border border-[#343A49] text-[11px] font-bold transition-colors cursor-pointer shadow-xs"
                        >
                          Manage
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stage New Event Modal Mock */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101116]/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#202631] border border-[#343A49] rounded-2xl p-6 shadow-2xl space-y-4 text-[#F3F0E8]">
            <div className="flex items-center justify-between pb-3 border-b border-[#343A49]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#43E5D2]" />
                <h3 className="text-base font-bold text-[#F3F0E8]">Stage New Campus Event</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#A0A6B8] hover:text-[#F3F0E8] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#101116] border border-[#343A49] text-xs text-[#A0A6B8] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#43E5D2] shrink-0 mt-0.5" />
              <p>
                <strong>Phase 1.5 Foundation:</strong> Demonstrates event model distinctions (centralized vs club vs inter-house). Real-time persistence will connect in Phase 2.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#F3F0E8] mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Inter-House Hackathon 2026"
                  className="w-full px-3 py-2 rounded-xl bg-[#101116] border border-[#343A49] text-[#F3F0E8] placeholder-[#A0A6B8] focus:outline-none focus:ring-2 focus:ring-[#43E5D2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#F3F0E8] mb-1">
                    Organizing Entity Type
                  </label>
                  <select className="w-full px-3 py-2 rounded-xl bg-[#101116] border border-[#343A49] text-[#F3F0E8] focus:outline-none focus:ring-2 focus:ring-[#43E5D2]">
                    <option>Centralized Flagship (Council)</option>
                    <option>Club &amp; Society Event</option>
                    <option>House Committee Event</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#F3F0E8] mb-1">
                    Delivery Mode
                  </label>
                  <select className="w-full px-3 py-2 rounded-xl bg-[#101116] border border-[#343A49] text-[#F3F0E8] focus:outline-none focus:ring-2 focus:ring-[#43E5D2]">
                    <option>Online</option>
                    <option>Offline · On campus</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#F3F0E8] mb-1">
                    Inter-House Competition?
                  </label>
                  <select className="w-full px-3 py-2 rounded-xl bg-[#101116] border border-[#343A49] text-[#F3F0E8] focus:outline-none focus:ring-2 focus:ring-[#43E5D2]">
                    <option>Yes (Award Community Cup Points)</option>
                    <option>No (General Campus Activity)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#F3F0E8] mb-1">
                    Academic Term
                  </label>
                  <select className="w-full px-3 py-2 rounded-xl bg-[#101116] border border-[#343A49] text-[#F3F0E8] focus:outline-none focus:ring-2 focus:ring-[#43E5D2]">
                    <option>Sep Term</option>
                    <option>Jan Term</option>
                    <option>May Term</option>
                  </select>
                </div>
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
                onClick={() => setShowCreateModal(false)}
                className="border-[#343A49] text-[#A0A6B8] hover:text-[#F3F0E8]"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSubmitNotice('Draft event staged for demonstration.');
                  setTimeout(() => {
                    setSubmitNotice(null);
                    setShowCreateModal(false);
                  }, 800);
                }}
                disabled={Boolean(submitNotice)}
                className="bg-[#43E5D2] hover:bg-[#38C7B6] text-[#101116] font-bold border-none"
              >
                {submitNotice ? 'Saved!' : 'Save Draft Event'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
