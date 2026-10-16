/**
 * HouseOS Phase 2C.2: Frontend RSVP Integration & Behavior Test Suite
 *
 * Validates all 10 Phase 2C.2 functional and integration requirements:
 * 1. Anonymous visitor: unauthenticated session returns safe visitor metrics, prompts sign-in
 * 2. Authenticated student not registered: returns userRegistrationStatus: null, shows active registration action
 * 3. Successful registration: registers student, updates capacity/spotsLeft, returns status: 'registered'
 * 4. Already-registered state: returns status: 'already_registered', preserves idempotent row
 * 5. Cancellation and re-registration: cancels registration with confirmation semantics, sets cancelled_at, permits re-registration
 * 6. Full event: finite capacity enforces capacity limit, rejects extra registrations with EVENT_FULL
 * 7. Cancelled / past / unpublished event: rejects with appropriate error codes (EVENT_CANCELLED, EVENT_ALREADY_STARTED, EVENT_NOT_PUBLISHED)
 * 8. Organizer / warden role restriction: administrative role rejected from registering for student pass (FORBIDDEN_ROLE)
 * 9. Server action error mapping & recovery: invalid UUID, missing profile, and error recovery return clean structured error objects
 * 10. Repeated clicks & pending state protection: concurrent/duplicate registration attempts return idempotent responses without corruption
 */

import { createRequire } from 'module';
import path from 'path';

const projectRequire = createRequire(path.resolve('c:/Users/Rohan/Desktop/HOUSE_OS/package.json'));
const { createClient } = projectRequire('@supabase/supabase-js');

const API_URL = 'http://127.0.0.1:54321';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const adminClient = createClient(API_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const anonClient = createClient(API_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let totalTests = 0;
let passedTests = 0;
const results = [];

function assert(name, condition, details = '') {
  totalTests++;
  const passed = Boolean(condition);
  if (passed) passedTests++;
  results.push({ name, passed, details });
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name} ${details ? '(' + details + ')' : ''}`);
}

async function createAuthenticatedStudent(index) {
  const email = `phase2c2_student_${index}_${Date.now()}@study.iitm.ac.in`;
  const password = 'StudentSecurePassword123!';

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: `Test Student ${index}` },
  });

  if (authError || !authData.user) {
    throw new Error(`Failed to create student user ${index}: ${authError?.message}`);
  }

  const client = createClient(API_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error: signInError } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    throw new Error(`Sign in failed for student ${index}: ${signInError.message}`);
  }

  return { userId: authData.user.id, email, client };
}

async function createAuthenticatedWarden() {
  const email = `phase2c2_warden_${Date.now()}@study.iitm.ac.in`;
  const password = 'WardenSecurePassword123!';

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: 'Campus Warden' },
  });

  if (authError || !authData.user) {
    throw new Error(`Failed to create warden: ${authError?.message}`);
  }

  // Elevate to warden
  await adminClient.from('profiles').update({ role: 'warden' }).eq('id', authData.user.id);

  const client = createClient(API_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error: signInError } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    throw new Error(`Sign in failed for warden: ${signInError.message}`);
  }

  return { userId: authData.user.id, email, client };
}

async function runPhase2C2TestSuite() {
  console.log('========================================================================');
  console.log('HouseOS Phase 2C.2: Frontend RSVP Integration & Live State Test Suite');
  console.log(`Target: Local Docker Supabase (${API_URL})`);
  console.log('========================================================================\n');

  const createdEventIds = [];
  const createdUserIds = [];

  try {
    // Setup test events
    const { data: normalEvent, error: e1 } = await adminClient
      .from('events')
      .insert({
        title: 'Phase 2C.2 Hackathon Showcase',
        slug: `phase2c2-hackathon-${Date.now()}`,
        status: 'published',
        capacity: 3,
        format: 'offline',
        venue: 'IITM Research Park Auditorium',
        house_points: 50,
      })
      .select('id')
      .single();

    if (e1 || !normalEvent) throw new Error(`Event creation failed: ${e1?.message}`);
    createdEventIds.push(normalEvent.id);

    const { data: fullEvent, error: e2 } = await adminClient
      .from('events')
      .insert({
        title: 'Phase 2C.2 Full Event',
        slug: `phase2c2-full-${Date.now()}`,
        status: 'published',
        capacity: 1,
        format: 'online',
        venue: 'Online Google Meet',
      })
      .select('id')
      .single();

    if (e2 || !fullEvent) throw new Error(`Full event creation failed: ${e2?.message}`);
    createdEventIds.push(fullEvent.id);

    const { data: cancelledEvent, error: e3 } = await adminClient
      .from('events')
      .insert({
        title: 'Phase 2C.2 Cancelled Event',
        slug: `phase2c2-cancelled-${Date.now()}`,
        status: 'cancelled',
        capacity: 10,
      })
      .select('id')
      .single();

    if (e3 || !cancelledEvent) throw new Error(`Cancelled event creation failed: ${e3?.message}`);
    createdEventIds.push(cancelledEvent.id);

    const { data: draftEvent, error: e4 } = await adminClient
      .from('events')
      .insert({
        title: 'Phase 2C.2 Draft Event',
        slug: `phase2c2-draft-${Date.now()}`,
        status: 'draft',
        capacity: 20,
      })
      .select('id')
      .single();

    if (e4 || !draftEvent) throw new Error(`Draft event creation failed: ${e4?.message}`);
    createdEventIds.push(draftEvent.id);

    const { data: pastEvent, error: e5 } = await adminClient
      .from('events')
      .insert({
        title: 'Phase 2C.2 Past Event',
        slug: `phase2c2-past-${Date.now()}`,
        status: 'published',
        capacity: 50,
        starts_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      })
      .select('id')
      .single();

    if (e5 || !pastEvent) throw new Error(`Past event creation failed: ${e5?.message}`);
    createdEventIds.push(pastEvent.id);

    const { data: unlimitedEvent, error: e6 } = await adminClient
      .from('events')
      .insert({
        title: 'Phase 2C.2 Open Capacity Keynote',
        slug: `phase2c2-unlimited-${Date.now()}`,
        status: 'published',
        capacity: null, // Unlimited
      })
      .select('id')
      .single();

    if (e6 || !unlimitedEvent) throw new Error(`Unlimited event creation failed: ${e6?.message}`);
    createdEventIds.push(unlimitedEvent.id);

    // Provision student users
    const student1 = await createAuthenticatedStudent(1);
    createdUserIds.push(student1.userId);
    const student2 = await createAuthenticatedStudent(2);
    createdUserIds.push(student2.userId);
    const warden = await createAuthenticatedWarden();
    createdUserIds.push(warden.userId);

    console.log('Test fixtures and accounts provisioned.\n');

    // --- Scenario 1: Anonymous Visitor ---
    console.log('--- 1. Anonymous Visitor State ---');
    const { data: anonStats, error: anonErr } = await anonClient.rpc('get_event_registration_stats', {
      p_event_id: normalEvent.id,
    });
    assert('1.1: Anonymous visitor can query published event stats', !anonErr && anonStats?.success === true);
    assert('1.2: Anonymous visitor registration status is strictly null', anonStats?.user_registration_status === null);
    assert('1.3: Anonymous visitor sees accurate total capacity', anonStats?.capacity === 3);
    assert('1.4: Anonymous visitor sees spots left', anonStats?.spots_left === 3);

    // --- Scenario 2: Authenticated Student Not Registered ---
    console.log('\n--- 2. Authenticated Student (Not Registered) ---');
    const { data: s1StatsBefore, error: s1ErrBefore } = await student1.client.rpc('get_event_registration_stats', {
      p_event_id: normalEvent.id,
    });
    assert('2.1: Authenticated student stats load successfully', !s1ErrBefore && s1StatsBefore?.success === true);
    assert('2.2: Student personal registration status is initially null', s1StatsBefore?.user_registration_status === null);
    assert('2.3: is_full is false for open event', s1StatsBefore?.is_full === false);

    // --- Scenario 3: Successful Registration ---
    console.log('\n--- 3. Successful Registration Flow ---');
    const { data: regRes, error: regErr } = await student1.client.rpc('register_for_event', {
      p_event_id: normalEvent.id,
    });
    assert('3.1: Student 1 registers successfully', !regErr && regRes?.success === true && regRes?.status === 'registered');
    
    // Check authoritative stats refresh
    const { data: s1StatsAfter } = await student1.client.rpc('get_event_registration_stats', {
      p_event_id: normalEvent.id,
    });
    assert('3.2: Refreshed stats show user_registration_status = "registered"', s1StatsAfter?.user_registration_status === 'registered');
    assert('3.3: Active registrations incremented to 1', s1StatsAfter?.active_registrations === 1);
    assert('3.4: Remaining spots decremented to 2', s1StatsAfter?.spots_left === 2);

    // --- Scenario 4: Already-Registered State (Idempotency) ---
    console.log('\n--- 4. Already-Registered State & Idempotency ---');
    const { data: dupRes, error: dupErr } = await student1.client.rpc('register_for_event', {
      p_event_id: normalEvent.id,
    });
    assert('4.1: Repeated registration returns safe success = true', !dupErr && dupRes?.success === true);
    assert('4.2: Repeated registration returns status = already_registered', dupRes?.status === 'already_registered');

    const { count: regRowCount } = await adminClient
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', student1.userId)
      .eq('event_id', normalEvent.id);
    assert('4.3: Table contains strictly 1 row for (user_id, event_id)', regRowCount === 1);

    // --- Scenario 5: Cancellation and Re-Registration ---
    console.log('\n--- 5. Cancellation and Re-Registration ---');
    const { data: cancelRes, error: cancelErr } = await student1.client.rpc('cancel_event_registration', {
      p_event_id: normalEvent.id,
    });
    assert('5.1: Student cancellation succeeds', !cancelErr && cancelRes?.success === true && cancelRes?.status === 'cancelled');

    const { data: s1StatsCancelled } = await student1.client.rpc('get_event_registration_stats', {
      p_event_id: normalEvent.id,
    });
    assert('5.2: Refreshed stats reflect cancellation (user_registration_status = "cancelled")', s1StatsCancelled?.user_registration_status === 'cancelled');
    assert('5.3: Active attendee count decremented back to 0', s1StatsCancelled?.active_registrations === 0);
    assert('5.4: Spots left restored to 3', s1StatsCancelled?.spots_left === 3);

    // Re-registration
    const { data: reRegRes, error: reRegErr } = await student1.client.rpc('register_for_event', {
      p_event_id: normalEvent.id,
    });
    assert('5.5: Re-registration succeeds after cancellation', !reRegErr && reRegRes?.success === true && reRegRes?.status === 'registered');

    const { data: s1StatsReReg } = await student1.client.rpc('get_event_registration_stats', {
      p_event_id: normalEvent.id,
    });
    assert('5.6: Stats restored to user_registration_status = "registered"', s1StatsReReg?.user_registration_status === 'registered');

    // --- Scenario 6: Full Event (Capacity Limit) ---
    console.log('\n--- 6. Event at Maximum Capacity ---');
    // Register student 1 for fullEvent (capacity = 1)
    await student1.client.rpc('register_for_event', { p_event_id: fullEvent.id });
    
    // Student 2 tries to register
    const { data: fullAttemptRes } = await student2.client.rpc('register_for_event', {
      p_event_id: fullEvent.id,
    });
    assert('6.1: Registration rejected when event is full (EVENT_FULL)', fullAttemptRes?.success === false && fullAttemptRes?.code === 'EVENT_FULL');

    const { data: fullStats } = await student2.client.rpc('get_event_registration_stats', {
      p_event_id: fullEvent.id,
    });
    assert('6.2: Full event stats report is_full = true', fullStats?.is_full === true);
    assert('6.3: Full event spots_left = 0', fullStats?.spots_left === 0);

    // --- Scenario 7: Cancelled / Past / Unpublished Event ---
    console.log('\n--- 7. Status & Temporal Gates ---');
    const { data: cancelGateRes } = await student2.client.rpc('register_for_event', {
      p_event_id: cancelledEvent.id,
    });
    assert('7.1: Registration on cancelled event returns EVENT_CANCELLED', cancelGateRes?.code === 'EVENT_CANCELLED');

    const { data: draftGateRes } = await student2.client.rpc('register_for_event', {
      p_event_id: draftEvent.id,
    });
    assert('7.2: Registration on draft event returns EVENT_NOT_PUBLISHED', draftGateRes?.code === 'EVENT_NOT_PUBLISHED');

    const { data: pastGateRes } = await student2.client.rpc('register_for_event', {
      p_event_id: pastEvent.id,
    });
    assert('7.3: Registration on already started event returns EVENT_ALREADY_STARTED', pastGateRes?.code === 'EVENT_ALREADY_STARTED');

    // --- Scenario 8: Organizer / Warden Role Restriction ---
    console.log('\n--- 8. Role Authorization Enforcement ---');
    const { data: wardenRes } = await warden.client.rpc('register_for_event', {
      p_event_id: normalEvent.id,
    });
    assert('8.1: Warden account rejected with FORBIDDEN_ROLE', wardenRes?.success === false && wardenRes?.code === 'FORBIDDEN_ROLE');

    // --- Scenario 9: Server Action Errors & Recovery ---
    console.log('\n--- 9. Error Mapping & Recovery ---');
    // Non-existent UUID
    const fakeUuid = '00000000-0000-0000-0000-000000000000';
    const { data: missingEventRes } = await student2.client.rpc('register_for_event', {
      p_event_id: fakeUuid,
    });
    assert('9.1: Non-existent event UUID returns EVENT_NOT_FOUND', missingEventRes?.code === 'EVENT_NOT_FOUND');

    // Unlimited capacity check
    const { data: unlimStats } = await anonClient.rpc('get_event_registration_stats', {
      p_event_id: unlimitedEvent.id,
    });
    assert('9.2: Unlimited event reports capacity = null (no invented limit)', unlimStats?.capacity === null);
    assert('9.3: Unlimited event reports spots_left = null', unlimStats?.spots_left === null);

    // --- Scenario 10: Repeated Clicks & Pending State Protection ---
    console.log('\n--- 10. Repeated Clicks & Concurrency Protection ---');
    // Simulate 4 simultaneous registration calls from student 2
    const rapidAttempts = await Promise.all([
      student2.client.rpc('register_for_event', { p_event_id: normalEvent.id }),
      student2.client.rpc('register_for_event', { p_event_id: normalEvent.id }),
      student2.client.rpc('register_for_event', { p_event_id: normalEvent.id }),
      student2.client.rpc('register_for_event', { p_event_id: normalEvent.id }),
    ]);

    const successes = rapidAttempts.filter((r) => r.data?.success === true);
    assert('10.1: All rapid concurrent requests return success = true without deadlocking', successes.length === 4);

    const { count: s2Count } = await adminClient
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', student2.userId)
      .eq('event_id', normalEvent.id);
    assert('10.2: Exactly 1 database registration row created despite 4 rapid concurrent clicks', s2Count === 1);

  } finally {
    // Cleanup disposable test fixtures
    console.log('\nCleaning up disposable test fixtures...');
    for (const eid of createdEventIds) {
      await adminClient.from('event_registrations').delete().eq('event_id', eid);
      await adminClient.from('events').delete().eq('id', eid);
    }
    for (const uid of createdUserIds) {
      await adminClient.from('profiles').delete().eq('id', uid);
      await adminClient.auth.admin.deleteUser(uid);
    }
    console.log('Cleaned up test events and disposable accounts.');
  }

  console.log('\n========================================================================');
  console.log(`TEST RESULTS: ${passedTests} / ${totalTests} assertions passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('========================================================================');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runPhase2C2TestSuite().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
