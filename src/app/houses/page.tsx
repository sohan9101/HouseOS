import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertCircle, RefreshCw, KeyRound } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { HousesView } from '@/components/houses/HousesView';
import { getHouseStandings } from '@/lib/mock-data';
import { mergeDbHouseWithMeta } from '@/lib/data/houses';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { House } from '@/types';

export const metadata: Metadata = {
  title: 'Official 12 Houses — HouseOS',
  description: 'Explore the 12 official residential houses of the IIT Madras BS Degree community.',
};

export const instant = false;

export default async function HousesPage() {
  const standings = getHouseStandings();

  // 1. Verify environment configuration
  if (!isSupabaseConfigured()) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-2xl bg-[#202631] border border-[#8B7CFF]/40 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8B7CFF]/15 border border-[#8B7CFF]/30 flex items-center justify-center text-[#8B7CFF]">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#F3F0E8]">Supabase Configuration Required</h1>
                <p className="text-xs text-[#9EA8B6]">Environment credentials not found in runtime environment.</p>
              </div>
            </div>
            <p className="text-sm text-[#9EA8B6] leading-relaxed">
              The live houses directory requires Supabase connectivity. Please ensure{' '}
              <code className="text-[#43E5D2] font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
              <code className="text-[#43E5D2] font-mono">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> are configured in your{' '}
              <code className="text-[#F3F0E8] font-mono">.env.local</code> file.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  // 2. Query live houses from Supabase
  let dbHouses: { id: string; name: string }[] | null = null;
  let queryError: string | null = null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('houses')
      .select('id, name')
      .order('name', { ascending: true });

    if (error) {
      queryError = error.message;
    } else {
      dbHouses = data;
    }
  } catch (err: unknown) {
    queryError = err instanceof Error ? err.message : 'Failed to connect to Supabase database.';
  }

  // 3. Handle explicit query error (do not silently replace with mock records)
  if (queryError || !dbHouses) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-2xl bg-[#202631] border border-[#FF896D]/40 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF896D]/15 border border-[#FF896D]/30 flex items-center justify-center text-[#FF896D]">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#F3F0E8]">Live Houses Directory Unavailable</h1>
                <p className="text-xs text-[#9EA8B6]">Database query to public.houses did not complete successfully.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#101116] border border-[#343A49] text-xs font-mono text-[#FF896D]">
              Error: {queryError || 'No records returned from public.houses.'}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/houses"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#43E5D2] hover:bg-[#38C7B6] text-[#101116] text-xs font-bold transition-all shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Connection
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  // 4. Merge canonical database records with presentation metadata
  const houses: House[] = dbHouses.map(mergeDbHouseWithMeta);

  return (
    <AppShell>
      <HousesView houses={houses} standings={standings} isLive={true} />
    </AppShell>
  );
}
