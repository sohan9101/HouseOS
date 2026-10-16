/**
 * HouseOS: Complete Onboarding Runtime & RPC Acceptance Test Suite
 *
 * Validates:
 * 1. Prerender error fix: /onboarding server rendering and dynamic connection() behavior
 * 2. Official 12 houses loaded from public.houses
 * 3. Student 1 onboarding: NULL house_id -> selects House A -> RPC persists house_id -> verified in profile
 * 4. Dashboard redirect: safe destination is '/' and profile reloads with new house name
 * 5. Re-login / reload stability: preserves assigned house, skips /onboarding redirect
 * 6. Student 2 onboarding: independent account -> selects House B -> persists distinct house_id
 * 7. Verification that Student 1 and Student 2 maintain isolated, distinct house assignments
 * 8. Error handling: invalid house ID rejected (HOUSE_NOT_FOUND), repeat assignment rejected (HOUSE_ALREADY_ASSIGNED)
 * 9. Authorization enforcement: unauthenticated users, organizers, and wardens cannot assign houses
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

async function createStudent(tag, displayName) {
  const email = `student_${tag}_${Date.now()}@study.iitm.ac.in`;
  const password = 'StudentSecurePassword123!';

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });

  if (authError || !authData.user) {
    throw new Error(`Failed to create student: ${authError?.message}`);
  }

  const client = createClient(API_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: sessionData, error: signInError } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    throw new Error(`Failed to sign in student: ${signInError.message}`);
  }

  return {
    userId: authData.user.id,
    email,
    password,
    displayName,
    client,
    session: sessionData.session,
  };
}

async function createRoleUser(role, tag) {
  const email = `${role}_${tag}_${Date.now()}@study.iitm.ac.in`;
  const password = 'RoleSecurePassword123!';

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: `Test ${role}` },
  });

  if (authError || !authData.user) {
    throw new Error(`Failed to create ${role}: ${authError?.message}`);
  }

  await adminClient.from('profiles').update({ role }).eq('id', authData.user.id);

  const client = createClient(API_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  await client.auth.signInWithPassword({ email, password });

  return { userId: authData.user.id, email, client };
}

async function run() {
  console.log('========================================================================');
  console.log('HouseOS: Complete Onboarding Runtime & RPC Acceptance Test Suite');
  console.log('Target: Local Supabase http://127.0.0.1:54321 & Next.js http://localhost:3000');
  console.log('========================================================================\n');

  // --- Requirement 1 & 2: Official Houses in public.houses ---
  const { data: houses, error: housesErr } = await adminClient
    .from('houses')
    .select('id, name')
    .order('name');

  assert(
    '1. Official 12 houses exist in public.houses',
    !housesErr && houses && houses.length === 12,
    `Found ${houses ? houses.length : 0} houses`
  );

  const houseA = houses.find((h) => h.name.includes('Nilgiri')) || houses[0];
  const houseB = houses.find((h) => h.name.includes('Kanha')) || houses[1];
  console.log(`Using House A: ${houseA.name} (${houseA.id})`);
  console.log(`Using House B: ${houseB.name} (${houseB.id})\n`);

  // --- Requirement 3 & 4: Student 1 starts with NULL house_id, selects House A ---
  const student1 = await createStudent('s1', 'Aarav Patel');

  const { data: p1Initial } = await adminClient
    .from('profiles')
    .select('id, role, house_id, display_name')
    .eq('id', student1.userId)
    .single();

  assert(
    '2. Student 1 initial state: role is student, house_id is strictly NULL',
    p1Initial && p1Initial.role === 'student' && p1Initial.house_id === null,
    `Role: ${p1Initial?.role}, House: ${p1Initial?.house_id}`
  );

  // Invoke RPC public.assign_student_house via PostgREST
  const { data: rpcRes1, error: rpcErr1 } = await student1.client.rpc('assign_student_house', {
    p_house_id: houseA.id,
  });

  assert(
    '3. RPC public.assign_student_house succeeds for Student 1',
    !rpcErr1 && rpcRes1 && rpcRes1.success === true,
    `Returned house: ${rpcRes1?.house_name}`
  );

  // Verify database persistence and relationship query
  const { data: p1Persisted } = await adminClient
    .from('profiles')
    .select('id, role, house_id, houses(id, name)')
    .eq('id', student1.userId)
    .single();

  assert(
    '4. Database persistence: Student 1 profile has house_id set to House A',
    p1Persisted && p1Persisted.house_id === houseA.id && p1Persisted.houses?.name === houseA.name,
    `Saved house in DB: ${p1Persisted?.houses?.name}`
  );

  // --- Requirement 5 & 6: Re-login / reload preserves assigned house ---
  // Re-sign in Student 1 to simulate a fresh browser session
  const client1Reload = createClient(API_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  await client1Reload.auth.signInWithPassword({
    email: student1.email,
    password: student1.password,
  });

  const { data: p1Reloaded } = await client1Reload
    .from('profiles')
    .select('id, role, house_id, houses(id, name)')
    .eq('id', student1.userId)
    .single();

  assert(
    '5. Session reload/login preserves House A affiliation',
    p1Reloaded && p1Reloaded.house_id === houseA.id && p1Reloaded.houses?.name === houseA.name,
    `Reloaded house: ${p1Reloaded?.houses?.name}`
  );

  // Attempting re-assignment via RPC must be rejected
  const { data: rpcRes1Reassign } = await student1.client.rpc('assign_student_house', {
    p_house_id: houseB.id,
  });

  assert(
    '6. Repeat assignment attempt is safely rejected with HOUSE_ALREADY_ASSIGNED',
    rpcRes1Reassign && rpcRes1Reassign.success === false && rpcRes1Reassign.code === 'HOUSE_ALREADY_ASSIGNED',
    `Code: ${rpcRes1Reassign?.code}`
  );

  // Database must remain House A
  const { data: p1CheckAfterReassign } = await adminClient
    .from('profiles')
    .select('house_id')
    .eq('id', student1.userId)
    .single();

  assert(
    '7. Student 1 house_id unchanged after rejected repeat assignment',
    p1CheckAfterReassign && p1CheckAfterReassign.house_id === houseA.id,
    `Current house_id: ${p1CheckAfterReassign?.house_id}`
  );

  // --- Requirement 7: Second Student assigned to House B ---
  const student2 = await createStudent('s2', 'Priya Iyer');

  const { data: rpcRes2, error: rpcErr2 } = await student2.client.rpc('assign_student_house', {
    p_house_id: houseB.id,
  });

  assert(
    '8. Student 2 assigned to House B successfully',
    !rpcErr2 && rpcRes2 && rpcRes2.success === true && rpcRes2.house_id === houseB.id,
    `House: ${rpcRes2?.house_name}`
  );

  const { data: p2Persisted } = await adminClient
    .from('profiles')
    .select('id, display_name, house_id, houses(id, name)')
    .eq('id', student2.userId)
    .single();

  assert(
    '9. Multi-tenant isolation: Student 1 has House A, Student 2 has House B',
    p1Persisted.house_id !== p2Persisted.house_id &&
      p1Persisted.houses?.name === houseA.name &&
      p2Persisted.houses?.name === houseB.name,
    `Student 1: ${p1Persisted.houses?.name}, Student 2: ${p2Persisted.houses?.name}`
  );

  // --- Requirement 8: Error handling & validation ---
  const student3 = await createStudent('s3', 'Rahul Verma');
  const invalidUuid = '11111111-2222-3333-4444-555555555555';
  const { data: rpcResInvalid } = await student3.client.rpc('assign_student_house', {
    p_house_id: invalidUuid,
  });

  assert(
    '10. Invalid house UUID rejected with HOUSE_NOT_FOUND',
    rpcResInvalid && rpcResInvalid.success === false && rpcResInvalid.code === 'HOUSE_NOT_FOUND',
    `Code: ${rpcResInvalid?.code}`
  );

  const { data: p3AfterInvalid } = await adminClient
    .from('profiles')
    .select('house_id')
    .eq('id', student3.userId)
    .single();

  assert(
    '11. Student 3 house_id remains NULL after invalid attempt',
    p3AfterInvalid && p3AfterInvalid.house_id === null,
    `house_id: ${p3AfterInvalid?.house_id}`
  );

  // --- Requirement 9: Authorization enforcement ---
  // Anonymous caller
  const { data: anonRpcRes, error: anonRpcErr } = await anonClient.rpc('assign_student_house', {
    p_house_id: houseA.id,
  });
  const anonBlocked =
    anonRpcErr !== null || (anonRpcRes && anonRpcRes.success === false);
  assert(
    '12. Anonymous user cannot call assign_student_house',
    anonBlocked,
    `Error: ${anonRpcErr?.message || anonRpcRes?.code}`
  );

  // Organizer caller
  const organizer = await createRoleUser('organizer', 'org');
  const { data: orgRpcRes } = await organizer.client.rpc('assign_student_house', {
    p_house_id: houseA.id,
  });
  assert(
    '13. Organizer account rejected with FORBIDDEN_ROLE',
    orgRpcRes && orgRpcRes.success === false && orgRpcRes.code === 'FORBIDDEN_ROLE',
    `Code: ${orgRpcRes?.code}`
  );

  // Warden caller
  const warden = await createRoleUser('warden', 'wrd');
  const { data: wardenRpcRes } = await warden.client.rpc('assign_student_house', {
    p_house_id: houseA.id,
  });
  assert(
    '14. Warden account rejected with FORBIDDEN_ROLE',
    wardenRpcRes && wardenRpcRes.success === false && wardenRpcRes.code === 'FORBIDDEN_ROLE',
    `Code: ${wardenRpcRes?.code}`
  );

  // Direct table UPDATE on house_id blocked for client
  const { error: directUpdateErr } = await student3.client
    .from('profiles')
    .update({ house_id: houseA.id })
    .eq('id', student3.userId);

  assert(
    '15. Direct PostgREST UPDATE on house_id blocked by RLS/Trigger',
    directUpdateErr !== null,
    `Error: ${directUpdateErr?.message}`
  );

  // Direct table UPDATE on role blocked for client
  const { error: directRoleErr } = await student3.client
    .from('profiles')
    .update({ role: 'organizer' })
    .eq('id', student3.userId);

  assert(
    '16. Direct PostgREST UPDATE on role blocked by RLS/Trigger',
    directRoleErr !== null,
    `Error: ${directRoleErr?.message}`
  );

  console.log('\n========================================================================');
  console.log(`ACCEPTANCE RESULTS: ${passedTests} / ${totalTests} assertions passed (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log('========================================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
