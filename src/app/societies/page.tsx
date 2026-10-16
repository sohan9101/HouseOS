import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertCircle, RefreshCw, KeyRound } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { SocietiesView } from '@/components/societies/SocietiesView';
import { mergeDbSocietyWithMeta } from '@/lib/data/societies';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Society } from '@/types';

export const metadata: Metadata = {
  title: 'Clubs & Societies — HouseOS',
  description: 'Explore the 30 student-run clubs and societies powering technical, cultural, and competitive life at IIT Madras BS.',
};

export const instant = false;

export default async function SocietiesPage() {
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
              The live clubs &amp; societies directory requires Supabase connectivity. Please ensure{' '}
              <code className="text-[#43E5D2] font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
              <code className="text-[#43E5D2] font-mono">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> are configured in your{' '}
              <code className="text-[#F3F0E8] font-mono">.env.local</code> file.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  // 2. Query live societies from Supabase (deterministic order by category and name)
  let dbSocieties: {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
  }[] | null = null;
  let queryError: string | null = null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('societies')
      .select('id, name, description, category')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      queryError = error.message;
    } else {
      dbSocieties = data;
    }
  } catch (err: unknown) {
    queryError = err instanceof Error ? err.message : 'Failed to connect to Supabase database.';
  }

  // 3. Handle explicit query error (do not silently replace with mock records)
  if (queryError || !dbSocieties) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-2xl bg-[#202631] border border-[#FF896D]/40 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF896D]/15 border border-[#FF896D]/30 flex items-center justify-center text-[#FF896D]">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#F3F0E8]">Live Societies Directory Unavailable</h1>
                <p className="text-xs text-[#9EA8B6]">Database query to public.societies did not complete successfully.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#101116] border border-[#343A49] text-xs font-mono text-[#FF896D]">
              Error: {queryError || 'No records returned from public.societies.'}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/societies"
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
  const societies: Society[] = dbSocieties.map(mergeDbSocietyWithMeta);

  return (
    <AppShell>
      <SocietiesView societies={societies} isLive={true} />
    </AppShell>
  );
}
