/**
 * Seed Canonical Campus Events and Demo Users into Local Supabase
 *
 * Populates:
 * 1. Canonical published events in public.events
 * 2. Demo student account: student.demo@study.iitm.ac.in / HouseOS2026!
 * 3. Demo organizer account: organizer.demo@study.iitm.ac.in / HouseOS2026!
 */

import { createRequire } from 'module';
import path from 'path';

const projectRequire = createRequire(path.resolve('c:/Users/Rohan/Desktop/HOUSE_OS/package.json'));
const { createClient } = projectRequire('@supabase/supabase-js');

const API_URL = 'http://127.0.0.1:54321';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const admin = createClient(API_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const CANONICAL_EVENTS = [
  {
    title: 'PARADOX: Annual IIT Madras Campus Confluence',
    slug: 'evt-paradox-2026',
    format: 'offline',
    venue: 'IIT Madras Main Campus, Chennai, Tamil Nadu',
    capacity: 2500,
    house_points: 50,
    status: 'published',
    organizer_type: 'central',
    organizer_name: 'IITM BS Central Activities Council',
    description:
      'The flagship offline campus gathering bringing IITM BS students to the Chennai campus for cultural, sports, and technical events.',
    starts_at: '2026-12-18T09:00:00+05:30',
    ends_at: '2026-12-21T22:00:00+05:30',
  },
  {
    title: 'SAAVAN: Annual Virtual Fest & Symposium',
    slug: 'evt-saavan-2026',
    format: 'online',
    venue: 'Virtual Stage & Interactive Community Channels',
    capacity: 5000,
    house_points: 30,
    status: 'published',
    organizer_type: 'central',
    organizer_name: 'IITM BS Central Activities Council',
    description:
      'The flagship centralized online community festival connecting remote learners across all houses and global regions.',
    starts_at: '2026-11-06T16:00:00+05:30',
    ends_at: '2026-11-08T22:30:00+05:30',
  },
  {
    title: 'Inter-House Quiz Championship 2026',
    slug: 'evt-wyz-quiz-2026',
    format: 'online',
    venue: 'Online Auditorium Room 1',
    capacity: 200,
    house_points: 25,
    status: 'published',
    organizer_type: 'club_society',
    organizer_name: 'WYZ Kids: IITM BS Quiz Society',
    description:
      'The official inter-house trivia battle spanning STEM, geopolitics, and cinema.',
    starts_at: '2026-10-24T18:00:00+05:30',
    ends_at: '2026-10-24T20:30:00+05:30',
  },
  {
    title: '48-Hour Open Source Sprint',
    slug: 'evt-codecrafters-sprint-2026',
    format: 'online',
    venue: 'Discord & GitHub Organization',
    capacity: 150,
    house_points: 40,
    status: 'published',
    organizer_type: 'club_society',
    organizer_name: 'CodeCrafters Coding Society',
    description:
      'Collaborative software sprint building developer tools, campus bots, and accessibility utilities.',
    starts_at: '2026-10-28T18:00:00+05:30',
    ends_at: '2026-10-30T18:00:00+05:30',
  },
  {
    title: 'Grandmaster Rapid Chess Blitz',
    slug: 'evt-shah-maat-chess-2026',
    format: 'online',
    venue: 'Lichess Community Arena',
    capacity: 128,
    house_points: 20,
    status: 'published',
    organizer_type: 'club_society',
    organizer_name: 'Shah Maat - Chess Society',
    description:
      'Inter-house timed tournament with Swiss system rounds leading into knockout quarterfinals.',
    starts_at: '2026-11-01T15:00:00+05:30',
    ends_at: '2026-11-01T19:00:00+05:30',
  },
  {
    title: 'AWS Cloud Architecture Deep-Dive',
    slug: 'evt-aws-cloud-workshop-2026',
    format: 'online',
    venue: 'Interactive Hands-On Lab',
    capacity: 300,
    house_points: 10,
    status: 'published',
    organizer_type: 'club_society',
    organizer_name: 'AWS Cloud Club',
    description:
      'Architecting resilient serverless applications on AWS and preparing for certification.',
    starts_at: '2026-11-12T17:00:00+05:30',
    ends_at: '2026-11-12T19:30:00+05:30',
  },
  {
    title: 'Aayam Inter-House Drama Festival',
    slug: 'evt-aayam-drama-fest-2026',
    format: 'offline',
    venue: 'SAC Amphitheatre, IIT Madras',
    capacity: 400,
    house_points: 35,
    status: 'published',
    organizer_type: 'club_society',
    organizer_name: 'Aayam - Dramatic Society',
    description:
      'Annual inter-house street theatre and one-act stage play competitions.',
    starts_at: '2026-11-20T17:30:00+05:30',
    ends_at: '2026-11-20T21:30:00+05:30',
  },
  {
    title: 'RaSoR Research Paper Symposium',
    slug: 'evt-rasor-symposium-2026',
    format: 'online',
    venue: 'Virtual Research Hall',
    capacity: 250,
    house_points: 20,
    status: 'published',
    organizer_type: 'club_society',
    organizer_name: 'RaSoR: Ramanujan Society of Research',
    description:
      'Student paper presentations spanning applied mathematics and machine learning.',
    starts_at: '2026-11-25T14:00:00+05:30',
    ends_at: '2026-11-25T18:00:00+05:30',
  },
];

async function seed() {
  console.log('Seeding canonical campus events...');

  for (const evt of CANONICAL_EVENTS) {
    const { data: existing } = await admin
      .from('events')
      .select('id, slug')
      .eq('slug', evt.slug)
      .maybeSingle();

    if (existing) {
      console.log(`Event already exists: ${evt.title} (${existing.id})`);
    } else {
      const { data, error } = await admin
        .from('events')
        .insert(evt)
        .select('id, title, slug')
        .single();

      if (error) {
        console.error(`Failed to insert ${evt.title}:`, error.message);
      } else {
        console.log(`Inserted event: ${data.title} -> ID: ${data.id}`);
      }
    }
  }

  console.log('\nProvisioning demo student account...');
  const studentEmail = 'student.demo@study.iitm.ac.in';
  const studentPassword = 'HouseOS2026!';

  const { data: list } = await admin.auth.admin.listUsers();
  const existingStudent = list?.users?.find((u) => u.email === studentEmail);

  if (existingStudent) {
    console.log(`Demo student user exists: ${existingStudent.id}`);
  } else {
    const { data: user, error } = await admin.auth.admin.createUser({
      email: studentEmail,
      password: studentPassword,
      email_confirm: true,
      user_metadata: { display_name: 'Aarav Sharma' },
    });
    if (error) {
      console.error('Failed to create demo student:', error.message);
    } else {
      console.log(`Created demo student: ${user?.user?.id}`);
    }
  }

  console.log('\nProvisioning demo organizer account...');
  const orgEmail = 'organizer.demo@study.iitm.ac.in';
  const orgPassword = 'HouseOS2026!';
  const existingOrg = list?.users?.find((u) => u.email === orgEmail);

  if (existingOrg) {
    console.log(`Demo organizer user exists: ${existingOrg.id}`);
    // Ensure role is organizer
    await admin.from('profiles').update({ role: 'organizer' }).eq('id', existingOrg.id);
  } else {
    const { data: orgUser, error: orgErr } = await admin.auth.admin.createUser({
      email: orgEmail,
      password: orgPassword,
      email_confirm: true,
      user_metadata: { display_name: 'Dr. K. Ramanathan (SAC Lead)' },
    });
    if (orgErr) {
      console.error('Failed to create demo organizer:', orgErr.message);
    } else if (orgUser?.user) {
      // Role in profiles is updated to organizer via service role
      await admin.from('profiles').update({ role: 'organizer' }).eq('id', orgUser.user.id);
      console.log(`Created demo organizer: ${orgUser.user.id}`);
    }
  }

  console.log('\nSeeding completed successfully!');
}

seed().catch(console.error);
