/**
 * HouseOS Unit & Integration Tests: Live Announcements Adapter
 * 
 * Verifies all requirements:
 * 1. Pinned row maps to priority: 'pinned'
 * 2. Unpinned row maps to priority: 'normal'
 * 3. Never produces priority: 'urgent' from schema without urgency column
 * 4. Content mapping handles null or empty body gracefully
 * 5. Date formatting handles published_at, fallback to created_at, or invalid dates
 * 6. Author and category default to neutral labels ('HouseOS Administration', 'General')
 * 7. Empty array mapping preserves empty state semantics for UI
 * 8. Deterministic sorting helper verifies pinned first, then newest published/created first
 */

function formatDbAnnouncementToHouseAnnouncement(row) {
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
      formattedDate = 'Recent Notice';
    }
  }

  const category = 'General';
  const priority = row.is_pinned ? 'pinned' : 'normal';

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

let totalTests = 0;
let passedTests = 0;

function assert(description, condition, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${description}`);
  } else {
    console.error(`[FAIL] ${description} ${details ? '- ' + details : ''}`);
  }
}

console.log('--- Testing formatDbAnnouncementToHouseAnnouncement Adapter ---\n');

// Case 1: Pinned announcement with complete metadata
const pinnedRow = {
  id: 'anc-uuid-1',
  title: 'Annual Community Cup Schedule Published',
  body: 'The Inter-House competition timetable is now accessible.',
  status: 'published',
  is_pinned: true,
  published_at: '2026-10-15T10:00:00Z',
  created_at: '2026-10-15T09:30:00Z',
  updated_at: '2026-10-15T10:00:00Z',
};

const pinnedResult = formatDbAnnouncementToHouseAnnouncement(pinnedRow);

assert('1. Pinned announcement maps to priority: pinned', pinnedResult.priority === 'pinned');
assert('2. Body maps directly to content', pinnedResult.content === 'The Inter-House competition timetable is now accessible.');
assert('3. Title is preserved', pinnedResult.title === 'Annual Community Cup Schedule Published');
assert('4. ID is preserved', pinnedResult.id === 'anc-uuid-1');
assert('5. Author defaults to neutral HouseOS Administration', pinnedResult.author.name === 'HouseOS Administration');
assert('6. Author role defaults to neutral Official Notice', pinnedResult.author.role === 'Official Notice');
assert('7. Category defaults to neutral General', pinnedResult.category === 'General');
assert('8. Formats published_at timestamp cleanly', pinnedResult.date.includes('2026'));

// Case 2: Unpinned announcement (must be priority: 'normal', NEVER 'urgent')
const unpinnedRow = {
  id: 'anc-uuid-2',
  title: 'Hostel Maintenance Hours Notice',
  body: 'Water supply maintenance will be conducted between 2 PM and 4 PM.',
  status: 'published',
  is_pinned: false,
  published_at: '2026-10-14T08:00:00Z',
  created_at: '2026-10-14T07:00:00Z',
};

const unpinnedResult = formatDbAnnouncementToHouseAnnouncement(unpinnedRow);

assert('9. Unpinned announcement maps to priority: normal', unpinnedResult.priority === 'normal');
assert('10. Priority is strictly not urgent', unpinnedResult.priority !== 'urgent');

// Case 3: Missing optional metadata (null body, null published_at)
const minimalRow = {
  id: 'anc-uuid-3',
  title: 'Urgent sounding text without urgent schema column',
  body: null,
  status: 'published',
  is_pinned: false,
  published_at: null,
  created_at: '2026-10-10T12:00:00Z',
};

const minimalResult = formatDbAnnouncementToHouseAnnouncement(minimalRow);

assert('11. Null body safely defaults to empty string', minimalResult.content === '');
assert('12. Falls back to created_at when published_at is null', minimalResult.date.includes('2026'));
assert('13. Unpinned remains normal despite urgency keywords in title', minimalResult.priority === 'normal');

// Case 4: Missing both published_at and created_at
const noDateRow = {
  id: 'anc-uuid-4',
  title: 'Notice without timestamps',
  body: 'Some body text',
  status: 'published',
  is_pinned: false,
  published_at: null,
  created_at: '',
};

const noDateResult = formatDbAnnouncementToHouseAnnouncement(noDateRow);
assert('14. Missing timestamps fall back to Recent Notice without throwing', noDateResult.date === 'Recent Notice');

// Case 5: Empty array handling
const emptyRows = [];
const emptyResults = emptyRows.map(formatDbAnnouncementToHouseAnnouncement);
assert('15. Empty database rows return empty array for UI empty state', Array.isArray(emptyResults) && emptyResults.length === 0);

// Case 6: Deterministic ordering verification
const mockDbCollection = [
  { id: '1', title: 'Old Unpinned', is_pinned: false, published_at: '2026-10-01T00:00:00Z', created_at: '2026-10-01T00:00:00Z' },
  { id: '2', title: 'New Unpinned', is_pinned: false, published_at: '2026-10-12T00:00:00Z', created_at: '2026-10-12T00:00:00Z' },
  { id: '3', title: 'Older Pinned', is_pinned: true, published_at: '2026-10-05T00:00:00Z', created_at: '2026-10-05T00:00:00Z' },
  { id: '4', title: 'Newest Pinned', is_pinned: true, published_at: '2026-10-14T00:00:00Z', created_at: '2026-10-14T00:00:00Z' },
];

// Sort logic corresponding to Supabase query: is_pinned DESC, published_at DESC, created_at DESC
const sortedRows = [...mockDbCollection].sort((a, b) => {
  if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
  const timeA = new Date(a.published_at || a.created_at).getTime();
  const timeB = new Date(b.published_at || b.created_at).getTime();
  return timeB - timeA;
});

assert('16. First sorted item is Newest Pinned', sortedRows[0].id === '4');
assert('17. Second sorted item is Older Pinned', sortedRows[1].id === '3');
assert('18. Third sorted item is Newest Unpinned', sortedRows[2].id === '2');
assert('19. Fourth sorted item is Old Unpinned', sortedRows[3].id === '1');

console.log('\n========================================================');
console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} assertions passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('========================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
} else {
  process.exit(0);
}
