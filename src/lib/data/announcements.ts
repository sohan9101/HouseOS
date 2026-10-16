import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { HouseAnnouncement, AnnouncementCategory, AnnouncementPriority } from '@/types';

export interface DbAnnouncementRow {
  id: string;
  title: string;
  body: string | null;
  status: string;
  is_pinned: boolean;
  published_at: string | null;
  created_at: string;
  updated_at?: string | null;
}

/**
 * Formats a live Supabase `public.announcements` record into the UI `HouseAnnouncement` model.
 * 
 * Rules:
 * - Maps `body` to `content` (with empty string fallback)
 * - Derives `priority` strictly from `is_pinned`: 'pinned' if true, else 'normal'
 * - Uses neutral labels for metadata unavailable in the schema:
 *   author: { name: 'HouseOS Administration', role: 'Official Notice' }
 *   category: 'General'
 * - Formats publication or creation timestamp safely
 */
export function formatDbAnnouncementToHouseAnnouncement(
  row: DbAnnouncementRow
): HouseAnnouncement {
  let formattedDate = 'Recent Notice';
  const dateSource = row.published_at || row.created_at;

  if (dateSource) {
    try {
      const parsed = new Date(dateSource);
      if (!isNaN(parsed.getTime())) {
        formattedDate = parsed.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch {
      // Safe fallback on date parsing anomaly
      formattedDate = 'Recent Notice';
    }
  }

  const category: AnnouncementCategory = 'General';
  const priority: AnnouncementPriority = row.is_pinned ? 'pinned' : 'normal';

  return {
    id: row.id,
    title: row.title,
    content: row.body ?? '',
    author: {
      name: 'HouseOS Administration',
      role: 'Official Notice',
    },
    date: formattedDate,
    category,
    priority,
  };
}

/**
 * Server-side query for live published announcements from Supabase.
 * Respects RLS and orders deterministically:
 * Pinned announcements first, then newest published/created first.
 */
export async function getLiveAnnouncements(limit = 4): Promise<{
  announcements: HouseAnnouncement[];
  error: string | null;
}> {
  if (!isSupabaseConfigured()) {
    console.warn('[HouseOS Announcements] Supabase credentials not found in environment.');
    return {
      announcements: [],
      error: 'Database connection is not configured.',
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('announcements')
      .select('id, title, body, status, is_pinned, published_at, created_at, updated_at')
      .eq('status', 'published')
      .order('is_pinned', { ascending: false })
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[HouseOS Announcements] Failed to query published announcements:', error.message);
      return {
        announcements: [],
        error: error.message,
      };
    }

    const announcements = ((data as DbAnnouncementRow[]) || []).map(
      formatDbAnnouncementToHouseAnnouncement
    );

    return {
      announcements,
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to query announcements repository.';
    console.error('[HouseOS Announcements] Unexpected exception querying announcements:', message);
    return {
      announcements: [],
      error: message,
    };
  }
}
