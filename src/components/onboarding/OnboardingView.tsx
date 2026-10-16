'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  X,
  Compass,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { assignHouseAction, type AssignHouseResult } from '@/app/onboarding/actions';

export interface OnboardingHouseItem {
  id: string;
  name: string;
  code: string;
  zone: string;
  colorHex: string;
  accentHex: string;
  residentCount: number;
}

interface OnboardingViewProps {
  houses: OnboardingHouseItem[];
  userDisplayName: string;
  userEmail: string;
  redirectTo?: string | null;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  houses,
  userDisplayName,
  userEmail,
  redirectTo,
}) => {
  const router = useRouter();
  const [selectedHouseId, setSelectedHouseId] = useState<string | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedHouse = houses.find((h) => h.id === selectedHouseId) || null;

  const handleSelect = (houseId: string) => {
    if (isPending) return;
    setSelectedHouseId(houseId);
    setErrorMessage(null);
  };

  const handleOpenConfirm = () => {
    if (!selectedHouseId || isPending) return;
    setErrorMessage(null);
    setConfirmModalOpen(true);
  };

  const handleConfirmAssignment = () => {
    if (!selectedHouseId || isPending) return;

    startTransition(async () => {
      try {
        const result: AssignHouseResult = await assignHouseAction(selectedHouseId, redirectTo);

        if (result.success) {
          setConfirmModalOpen(false);
          router.push(result.redirectTo || '/');
          router.refresh();
        } else {
          setConfirmModalOpen(false);
          let friendly = result.error;
          if (result.code === 'HOUSE_ALREADY_ASSIGNED') {
            friendly = 'A house has already been assigned to your account. Redirecting...';
            const dest = redirectTo || '/';
            setTimeout(() => {
              router.push(dest);
              router.refresh();
            }, 1200);
          } else if (result.code === 'FORBIDDEN_ROLE') {
            friendly = 'House onboarding is strictly reserved for verified resident students.';
          } else if (result.code === 'UNAUTHENTICATED') {
            friendly = 'Your authentication session has expired. Please sign in again.';
          }
          setErrorMessage(friendly);
        }
      } catch (err: unknown) {
        setConfirmModalOpen(false);
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'A network error occurred while submitting your house selection.'
        );
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#101116] text-[#F3F0E8] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="rounded-2xl bg-[#202631] border border-[#343A49] p-6 sm:p-8 md:p-10 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-[#43E5D2] px-3 py-1 rounded-full bg-[#43E5D2]/10 border border-[#43E5D2]/25">
              <Sparkles className="w-3.5 h-3.5 text-[#43E5D2]" />
              IIT Madras BS Degree • HouseOS Onboarding
            </div>
            <div className="text-xs text-[#9EA8B6] font-mono">
              Signed in as: <strong className="text-white">{userDisplayName}</strong> ({userEmail})
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Choose Your <span className="text-[#43E5D2]">Campus House</span>
            </h1>
            <p className="text-sm sm:text-base text-[#9EA8B6] max-w-3xl leading-relaxed">
              Every resident student belongs to one of the 12 canonical Houses of IIT Madras BS Degree. Your house determines your team in inter-house tournaments, Community Cup rankings, and local student councils.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2 text-xs text-[#8B7CFF] font-mono">
            <ShieldCheck className="w-4 h-4 text-[#8B7CFF]" />
            <span>House selection is permanent and cannot be modified after confirmation.</span>
          </div>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-[#FF896D]/15 border border-[#FF896D]/40 text-xs text-[#F3F0E8] flex items-start gap-3 shadow-lg"
          >
            <AlertCircle className="w-5 h-5 text-[#FF896D] shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="font-bold text-[#FF896D]">House Assignment Error</p>
              <p className="text-[11px] leading-relaxed text-[#F3F0E8]">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-[#9EA8B6] hover:text-[#F3F0E8] p-1 rounded transition-colors"
              aria-label="Dismiss error notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 12-House Grid Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-[#9EA8B6]">
            <span className="uppercase tracking-wider font-bold text-white">
              Official 12 Houses Directory ({houses.length} Houses Available)
            </span>
            <span>Click a card to select</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {houses.map((house) => {
              const isSelected = selectedHouseId === house.id;

              return (
                <button
                  key={house.id}
                  type="button"
                  onClick={() => handleSelect(house.id)}
                  className={`text-left p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43E5D2] ${
                    isSelected
                      ? 'bg-[#28303E] border-[#43E5D2] shadow-[0_0_24px_rgba(67,229,210,0.2)]'
                      : 'bg-[#202631] border-[#343A49] hover:border-[#43E5D2]/40 hover:bg-[#202631]/90'
                  }`}
                >
                  {/* Top color indicator bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5 transition-all"
                    style={{ backgroundColor: house.colorHex || '#43E5D2' }}
                  />

                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border shadow-xs"
                      style={{
                        backgroundColor: `${house.colorHex || '#43E5D2'}20`,
                        borderColor: `${house.colorHex || '#43E5D2'}50`,
                        color: house.colorHex || '#43E5D2',
                      }}
                    >
                      {house.code}
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#101116] border border-[#343A49] text-[#9EA8B6]">
                      {house.zone}
                    </span>
                  </div>

                  <div className="space-y-1 mb-4">
                    <h2 className="text-lg font-black text-white tracking-tight group-hover:text-[#43E5D2] transition-colors">
                      {house.name.endsWith('House') ? house.name : `${house.name} House`}
                    </h2>
                    <p className="text-[11px] text-[#9EA8B6] font-mono">
                      Active Community • {house.residentCount} Residents
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-3 border-t border-[#343A49]/60">
                    <span className="text-[11px] text-[#9EA8B6] flex items-center gap-1">
                      <Compass className="w-3 h-3 text-[#43E5D2]" />
                      {house.zone}
                    </span>

                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 text-[#43E5D2] font-bold font-mono text-[11px]">
                        <CheckCircle2 className="w-4 h-4 text-[#43E5D2]" />
                        Selected
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#9EA8B6] group-hover:text-white transition-colors">
                        Select →
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Floating Action Bottom Bar */}
        <div className="sticky bottom-6 z-20 p-4 sm:p-5 rounded-2xl bg-[#202631]/95 backdrop-blur-md border border-[#343A49] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            {selectedHouse ? (
              <div className="space-y-0.5">
                <p className="text-xs text-[#9EA8B6] font-mono">Selected House:</p>
                <p className="text-base font-black text-white">
                  {selectedHouse.name.endsWith('House')
                    ? selectedHouse.name
                    : `${selectedHouse.name} House`}{' '}
                  <span className="text-[#43E5D2] font-mono text-xs">({selectedHouse.zone})</span>
                </p>
              </div>
            ) : (
              <div className="text-xs text-[#9EA8B6] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#43E5D2]" />
                <span>Please select your house from the grid above to proceed.</span>
              </div>
            )}
          </div>

          <Button
            id="onboarding-proceed-button"
            variant="primary"
            size="lg"
            onClick={handleOpenConfirm}
            disabled={!selectedHouseId || isPending}
            className={`font-black min-w-[200px] ${
              selectedHouseId
                ? 'bg-[#43E5D2] hover:bg-[#35D6C3] text-[#101116] shadow-md'
                : 'bg-[#28303E] text-[#9EA8B6] cursor-not-allowed opacity-60'
            }`}
          >
            <span>Proceed with Selection</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Confirmation Modal */}
        {confirmModalOpen && selectedHouse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="max-w-md w-full rounded-2xl bg-[#202631] border border-[#343A49] p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="w-12 h-12 rounded-xl bg-[#43E5D2]/15 border border-[#43E5D2]/30 text-[#43E5D2] flex items-center justify-center mx-auto">
                <Building2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Confirm House Affiliation
                </h3>
                <p className="text-xs text-[#9EA8B6] leading-relaxed">
                  You are selecting{' '}
                  <strong className="text-white">
                    {selectedHouse.name.endsWith('House')
                      ? selectedHouse.name
                      : `${selectedHouse.name} House`}
                  </strong>{' '}
                  ({selectedHouse.zone}).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FF896D]/10 border border-[#FF896D]/30 text-xs text-[#FF896D] flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#FF896D] shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed text-[#F3F0E8]">
                  <strong>Permanent Selection:</strong> Once confirmed, your house affiliation cannot be modified. All campus competition entries and house standings will be tied to this house.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <Button
                  id="onboarding-confirm-button"
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleConfirmAssignment}
                  disabled={isPending}
                  className="font-black bg-[#43E5D2] hover:bg-[#35D6C3] text-[#101116] border-none shadow-sm"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#101116]" />
                      Securing House Affiliation...
                    </>
                  ) : (
                    'Confirm & Enter Campus'
                  )}
                </Button>

                <Button
                  id="onboarding-cancel-button"
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => setConfirmModalOpen(false)}
                  disabled={isPending}
                  className="bg-[#28303E] text-[#F3F0E8] hover:bg-[#343A49]"
                >
                  Choose a Different House
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
