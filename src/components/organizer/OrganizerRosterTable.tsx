'use client';

import React, { useState } from 'react';
import { EventRegistrationItem } from '@/types';
import { CheckCircle2, Award, Users } from 'lucide-react';

interface OrganizerRosterTableProps {
  initialRoster: EventRegistrationItem[];
}

export const OrganizerRosterTable: React.FC<OrganizerRosterTableProps> = ({
  initialRoster,
}) => {
  const [roster, setRoster] = useState<EventRegistrationItem[]>(initialRoster);

  const toggleCheckIn = (id: string) => {
    setRoster((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextCheckedIn = !item.checkedIn;
          return {
            ...item,
            checkedIn: nextCheckedIn,
            pointsAwarded: nextCheckedIn,
          };
        }
        return item;
      })
    );
  };

  const checkedInCount = roster.filter((r) => r.checkedIn).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Inter-House Registrations & Attendance Roster
          </h2>
          <p className="text-xs text-[#A0A6B8] mt-0.5 flex flex-wrap items-center gap-1.5">
            <span>Active Event: <strong className="text-[#43E5D2]">Inter-House Quiz Championship 2026 (WYZ Kids)</strong></span>
            <span className="text-[10px] font-mono text-[#8B7CFF] px-1.5 py-0.5 rounded bg-[#8B7CFF]/15 border border-[#8B7CFF]/30">
              Interactive Demo Session
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-[#A0A6B8] bg-[#202631] px-3.5 py-1.5 rounded-xl border border-[#343A49]">
          <Users className="w-3.5 h-3.5 text-[#43E5D2]" />
          <span>
            Verified Attendance: <strong className="text-[#43E5D2]">{checkedInCount}</strong> / {roster.length}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-[#343A49] bg-[#202631] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#F3F0E8]">
            <thead className="bg-[#101116] text-[11px] uppercase tracking-wider text-[#A0A6B8] border-b border-[#343A49]">
              <tr>
                <th className="px-4 py-3 font-semibold">Resident Name</th>
                <th className="px-4 py-3 font-semibold">House Affiliation</th>
                <th className="px-4 py-3 font-semibold">Student ID (Roll No)</th>
                <th className="px-4 py-3 font-semibold">Check-in Status</th>
                <th className="px-4 py-3 font-semibold">House Points</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#343A49]">
              {roster.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-[#101116]/40 transition-colors"
                >
                  <td className="px-4 py-3.5 font-bold text-white">
                    {item.residentName}
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-[#F3F0E8]">
                      {item.houseName}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-[#A0A6B8] font-mono text-[11px]">
                    {item.studentId}
                  </td>

                  <td className="px-4 py-3.5">
                    {item.checkedIn ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#43E5D2] bg-[#43E5D2]/15 px-2.5 py-0.5 rounded-full border border-[#43E5D2]/30">
                        <CheckCircle2 className="w-3 h-3 text-[#43E5D2]" />
                        Checked In
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#A0A6B8] bg-[#101116] px-2.5 py-0.5 rounded-full border border-[#343A49]">
                        Pending Arrival
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3.5">
                    {item.pointsAwarded ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8B7CFF] bg-[#8B7CFF]/15 px-2.5 py-0.5 rounded-full border border-[#8B7CFF]/30">
                        <Award className="w-3 h-3 text-[#8B7CFF]" />
                        +25 pts
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#A0A6B8]">On Check-in</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => toggleCheckIn(item.id)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                        item.checkedIn
                          ? 'bg-[#101116] hover:bg-[#202631] text-[#A0A6B8] border border-[#343A49]'
                          : 'bg-[#43E5D2] hover:bg-[#38C7B6] text-[#101116] font-bold shadow-xs'
                      }`}
                    >
                      {item.checkedIn ? 'Revoke Check-in' : 'Mark Arrived'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
