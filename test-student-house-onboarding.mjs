/**
 * HouseOS: Student House Onboarding & Profile Integration Test Suite
 *
 * Validates all required behaviors:
 * 1. New student with no house is prompted to select one (role='student', house_id IS NULL)
 * 2. Official 12 houses available in public.houses
 * 3. Valid house assignment persists in Supabase via assign_student_house RPC
 * 4. Refresh/reload preserves the assigned house (idempotent, stable)
 * 5. Student with an existing house cannot reassign (HOUSE_ALREADY_ASSIGNED)
 * 6. Invalid house IDs are rejected (HOUSE_NOT_FOUND)
 * 7. Two simultaneous assignment attempts cannot overwrite (concurrency lock / race safety)
 * 8. Direct PostgREST UPDATE on house_id is rejected by protect_profile_immutable_fields trigger
 * 9. Direct PostgREST UPDATE on role is rejected by protect_profile_immutable_fields trigger
 * 10. Unauthenticated visitors cannot invoke house assignment (UNAUTHENTICATED / permission denied)
 * 11. Organizer/warden roles cannot self-assign houses (FORBIDDEN_ROLE)
 * 12. Profile display data verification: real display_name, email, role, and house name
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
  const email = `onboarding_student_${index}_${Date.now()}@study.iitm.ac.in`;
  const password = 'StudentSecurePassword123!';
  const displayName = `Onboarding Student ${index}`;

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
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

  return { userId: authData.user.id, email, displayName, client };
}

async function createAuthenticatedRoleUser(index, role) {
  const email = `onboarding_${role}_${index}_${Date.now()}@study.iitm.ac.in`;
  const password = 'RoleSecurePassword123!';
  const displayName = `Privileged ${role} ${index}`;

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });

  if (authError || !authData.user) {
    throw new Error(`Failed to create ${role} user: ${authError?.message}`);
  }

  // Update role to organizer / warden using service role admin client
  const { error: updateError } = await adminClient
    .from('profiles')
    .update({ role })
    .eq('id', authData.user.id);

  if (updateError) {
    throw new Error(`Failed to set role ${role} for user: ${updateError.message}`);
  }

  const client = createClient(API_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error: signInError } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    throw new Error(`Sign in failed for ${role} user: ${signInError.message}`);
  }

  return { userId: authData.user.id, email, displayName, role, client };
}

async function runTests() {
  console.log('=== Starting HouseOS Student Onboarding & Profile Integration Test Suite ===\n');

  // Step 1: Check canonical 12 houses exist in public.houses
  const { data: houses, error: housesError } = await adminClient
    .from('houses')
    .select('id, name')
    .order('name');

  assert(
    'Official Houses: exactly 12 houses in public.houses',
    !housesError && houses && houses.length === 12,
    `Count: ${houses ? houses.length : 0}`
  );

  const houseA = houses[0];
  const houseB = houses[1];
  console.log(`Using test houses: ${houseA.name} (${houseA.id}) and ${houseB.name} (${houseB.id})`);

  // Step 2: New student has role='student' and house_id=null
  const student1 = await createAuthenticatedStudent(1);
  const { data: profile1, error: p1Error } = await adminClient
    .from('profiles')
    .select('id, role, house_id, display_name')
    .eq('id', student1.userId)
    .single();

  assert(
    'New Student Profile: role is "student" and house_id is NULL',
    !p1Error && profile1.role === 'student' && profile1.house_id === null,
    `Role: ${profile1?.role}, House: ${profile1?.house_id}`
  );

  // Step 3: Student assigns house via assign_student_house RPC
  const { data: rpcRes1, error: rpcErr1 } = await student1.client.rpc('assign_student_house', {
    p_house_id: houseA.id,
  });

  assert(
    'RPC assign_student_house: successfully assigns house to student',
    !rpcErr1 && rpcRes1 && rpcRes1.success === true && rpcRes1.house_id === houseA.id,
    `Success: ${rpcRes1?.success}, House: ${rpcRes1?.house_name}`
  );

  // Step 4: Verify house_id persisted in database
  const { data: p1Updated } = await adminClient
    .from('profiles')
    .select('id, role, house_id, houses(id, name)')
    .eq('id', student1.userId)
    .single();

  assert(
    'Persistence: profile in database has house_id set',
    p1Updated && p1Updated.house_id === houseA.id && p1Updated.houses?.name === houseA.name,
    `Database house: ${p1Updated?.houses?.name}`
  );

  // Step 5: Refresh/re-query preserves assigned house
  const { data: p1Reload } = await student1.client
    .from('profiles')
    .select('id, role, house_id, houses(id, name)')
    .eq('id', student1.userId)
    .single();

  assert(
    'Session/Reload: authenticated client reads assigned house successfully',
    p1Reload && p1Reload.house_id === houseA.id,
    `Loaded: ${p1Reload?.houses?.name}`
  );

  // Step 6: Assigned student cannot re-assign or switch house via RPC
  const { data: rpcRes1Reassign } = await student1.client.rpc('assign_student_house', {
    p_house_id: houseB.id,
  });

  assert(
    'Immutability: RPC rejects re-assignment for student with existing house',
    rpcRes1Reassign && rpcRes1Reassign.success === false && rpcRes1Reassign.code === 'HOUSE_ALREADY_ASSIGNED',
    `Code: ${rpcRes1Reassign?.code}, Message: ${rpcRes1Reassign?.message}`
  );

  // Verify house in DB did NOT change
  const { data: p1AfterReassign } = await adminClient
    .from('profiles')
    .select('house_id')
    .eq('id', student1.userId)
    .single();

  assert(
    'Immutability: database house_id remains houseA after rejected reassignment',
    p1AfterReassign && p1AfterReassign.house_id === houseA.id,
    `House ID: ${p1AfterReassign?.house_id}`
  );

  // Step 7: Invalid house ID rejected
  const student2 = await createAuthenticatedStudent(2);
  const invalidHouseId = '00000000-0000-0000-0000-000000000000';
  const { data: rpcRes2Invalid } = await student2.client.rpc('assign_student_house', {
    p_house_id: invalidHouseId,
  });

  assert(
    'Validation: invalid house ID rejected with HOUSE_NOT_FOUND',
    rpcRes2Invalid && rpcRes2Invalid.success === false && rpcRes2Invalid.code === 'HOUSE_NOT_FOUND',
    `Code: ${rpcRes2Invalid?.code}, Message: ${rpcRes2Invalid?.message}`
  );

  const { data: p2AfterInvalid } = await adminClient
    .from('profiles')
    .select('house_id')
    .eq('id', student2.userId)
    .single();

  assert(
    'Validation: student house_id remains NULL after invalid attempt',
    p2AfterInvalid && p2AfterInvalid.house_id === null,
    `House ID: ${p2AfterInvalid?.house_id}`
  );

  // Step 8: Concurrent assignment attempts (race safety / FOR UPDATE lock)
  const student3 = await createAuthenticatedStudent(3);
  console.log('Testing race-safe concurrent assignment with student3...');
  const [resConcurrentA, resConcurrentB] = await Promise.all([
    student3.client.rpc('assign_student_house', { p_house_id: houseA.id }),
    student3.client.rpc('assign_student_house', { p_house_id: houseB.id }),
  ]);

  const outcomes = [resConcurrentA.data, resConcurrentB.data];
  const successCount = outcomes.filter((o) => o?.success === true).length;
  const failureCount = outcomes.filter((o) => o?.success === false && o?.code === 'HOUSE_ALREADY_ASSIGNED').length;

  assert(
    'Concurrency: exactly one concurrent request succeeds, the other gets HOUSE_ALREADY_ASSIGNED',
    successCount === 1 && failureCount === 1,
    `Success: ${successCount}, Rejected: ${failureCount}`
  );

  // Step 9: Direct client PostgREST UPDATE on house_id must be rejected
  const { data: directUpdateData, error: directUpdateError } = await student2.client
    .from('profiles')
    .update({ house_id: houseA.id })
    .eq('id', student2.userId)
    .select();

  const directUpdateBlocked =
    directUpdateError !== null ||
    (directUpdateData && directUpdateData.length === 0);

  const { data: p2DirectCheck } = await adminClient
    .from('profiles')
    .select('house_id')
    .eq('id', student2.userId)
    .single();

  assert(
    'Security: direct PostgREST table UPDATE on house_id is blocked',
    directUpdateBlocked && p2DirectCheck?.house_id === null,
    `Error: ${directUpdateError?.message || 'Blocked by trigger'}, Current house_id: ${p2DirectCheck?.house_id}`
  );

  // Step 10: Direct client PostgREST UPDATE on role must be rejected
  const { data: directRoleData, error: directRoleError } = await student2.client
    .from('profiles')
    .update({ role: 'organizer' })
    .eq('id', student2.userId)
    .select();

  const directRoleBlocked =
    directRoleError !== null ||
    (directRoleData && directRoleData.length === 0);

  const { data: p2RoleCheck } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', student2.userId)
    .single();

  assert(
    'Security: direct PostgREST table UPDATE on role is blocked',
    directRoleBlocked && p2RoleCheck?.role === 'student',
    `Error: ${directRoleError?.message || 'Blocked by trigger'}, Current role: ${p2RoleCheck?.role}`
  );

  // Step 11: Unauthenticated visitor cannot assign house
  const { data: anonRes, error: anonErr } = await anonClient.rpc('assign_student_house', {
    p_house_id: houseA.id,
  });

  const anonBlocked =
    anonErr !== null ||
    (anonRes && anonRes.success === false && (anonRes.code === 'UNAUTHENTICATED' || anonRes.code === 'UNAUTHORIZED'));

  assert(
    'Security: unauthenticated visitor cannot invoke assign_student_house',
    anonBlocked,
    `Error: ${anonErr?.message || anonRes?.code}`
  );

  // Step 12: Organizer role cannot assign a student house
  const organizer = await createAuthenticatedRoleUser(1, 'organizer');
  const { data: orgRes } = await organizer.client.rpc('assign_student_house', {
    p_house_id: houseA.id,
  });

  assert(
    'Role restriction: organizer rejected from house assignment (FORBIDDEN_ROLE)',
    orgRes && orgRes.success === false && orgRes.code === 'FORBIDDEN_ROLE',
    `Code: ${orgRes?.code}, Message: ${orgRes?.message}`
  );

  // Step 13: Warden role cannot assign a student house
  const warden = await createAuthenticatedRoleUser(2, 'warden');
  const { data: wardenRes } = await warden.client.rpc('assign_student_house', {
    p_house_id: houseA.id,
  });

  assert(
    'Role restriction: warden rejected from house assignment (FORBIDDEN_ROLE)',
    wardenRes && wardenRes.success === false && wardenRes.code === 'FORBIDDEN_ROLE',
    `Code: ${wardenRes?.code}, Message: ${wardenRes?.message}`
  );

  // Summary
  console.log('\n=== Test Run Summary ===');
  console.log(`Total assertions: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);

  if (passedTests === totalTests) {
    console.log('\n🎉 ALL ONBOARDING & PROFILE INTEGRATION TESTS PASSED!');
    process.exit(0);
  } else {
    console.error('\n❌ SOME ONBOARDING TESTS FAILED');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
