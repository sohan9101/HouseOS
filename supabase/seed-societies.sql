-- ==============================================================================
-- HouseOS Phase 2A: Canonical Societies Seed Script
-- Target Table: public.societies (name UNIQUE, description, category)
-- Total Records: 30
-- Source: src/lib/data/societies.ts
-- Idempotency: ON CONFLICT (name) DO UPDATE
-- ==============================================================================

INSERT INTO public.societies (name, description, category)
VALUES
  (
    'CodeCrafters',
    'Competitive programming, algorithmic problem-solving, open source projects, and software development challenges.',
    'Technology & Research'
  ),
  (
    'AWS Cloud Club',
    'Cloud architecture workshops, AWS certification roadmaps, and distributed systems architecture.',
    'Technology & Research'
  ),
  (
    'RaSoR',
    'Pure and applied mathematics research, paper reading groups, and data science symposiums.',
    'Technology & Research'
  ),
  (
    'Yantra',
    'Embedded systems, robotics simulation, hardware design, and IoT integration.',
    'Technology & Research'
  ),
  (
    'Tech Society',
    'Flagship engineering discussions, tech meetups, and developer tooling exploration.',
    'Technology & Research'
  ),
  (
    'Women in Tech',
    'Empowering women engineers in computing, mentorship circles, and diversity-focused hackathons.',
    'Technology & Research'
  ),
  (
    'JARVIS',
    'Artificial intelligence research, machine learning model fine-tuning, and neural networks.',
    'Technology & Research'
  ),
  (
    'SYNAPSE',
    'Neuroscience, cognitive science modeling, and computational biology intersections.',
    'Technology & Research'
  ),
  (
    'Amartya',
    'Quantitative finance, equity research, portfolio optimization, and valuation case competitions.',
    'Business & Entrepreneurship'
  ),
  (
    'Business.io',
    'Venture capital pitch decks, product management frameworks, and startup incubation.',
    'Business & Entrepreneurship'
  ),
  (
    'IRIS Society',
    'Industry insights, strategy consulting case studies, and corporate networking.',
    'Business & Entrepreneurship'
  ),
  (
    'Aayam',
    'Stage plays, street theatre (Nukkad Natak), scriptwriting, and dramatic performance.',
    'Culture & Creative Arts'
  ),
  (
    'AKORD',
    'Vocal ensembles, instrumental bands, classical fusion, and digital music production.',
    'Culture & Creative Arts'
  ),
  (
    'Pravaha',
    'Classical, western contemporary, and folk choreography productions.',
    'Culture & Creative Arts'
  ),
  (
    'Pixels N Panels',
    'Visual arts, graphic design, comic illustration, and digital photography.',
    'Culture & Creative Arts'
  ),
  (
    'Sahityika',
    'Creative writing workshops, poetry slams, book discussions, and campus literary journals.',
    'Culture & Creative Arts'
  ),
  (
    'Deva-Bhasha',
    'Sanskrit linguistics, ancient scientific treatises, and classical literature studies.',
    'Culture & Creative Arts'
  ),
  (
    'WYZ Kids',
    'General quiz competitions, domain trivia, and the Inter-House Quiz League.',
    'Debate & Knowledge'
  ),
  (
    'Adhyay',
    'Public administration, policy analysis, governance case studies, and civil services guidance.',
    'Debate & Knowledge'
  ),
  (
    'Diplomacia',
    'Model United Nations, parliamentary debate, foreign affairs, and geopolitical discussions.',
    'Debate & Knowledge'
  ),
  (
    'JITSIE',
    'Student publication, campus journalism, interview features, and investigative articles.',
    'Debate & Knowledge'
  ),
  (
    'Shah Maat',
    'Blitz and rapid chess tournaments, grandmaster game analysis, and inter-house chess ladders.',
    'Sports & Gaming'
  ),
  (
    'Sportify',
    'Intramural athletic tournaments, football, cricket, badminton leagues, and fitness routines.',
    'Sports & Gaming'
  ),
  (
    'Heighers',
    'Competitive gaming tournaments, LAN finals, Valorant, BGMI, and Rocket League showdowns.',
    'Sports & Gaming'
  ),
  (
    'RAAHAT',
    'Peer counseling, wellness circles, stress management before midterms, and mindfulness.',
    'Community & Other Interests'
  ),
  (
    'SAHARA',
    'Community service, educational outreach, digital literacy, and NGO volunteering drives.',
    'Community & Other Interests'
  ),
  (
    'Nature Nurture',
    'Environmental conservation, campus cleanliness, tree planting, and sustainability audits.',
    'Community & Other Interests'
  ),
  (
    'Boundless',
    'Regional travel meetups, trekking expeditions, cultural heritage trails, and local group itineraries.',
    'Community & Other Interests'
  ),
  (
    'AVASYA',
    'Social networking, regional student chapters, and cross-house community bonds.',
    'Community & Other Interests'
  ),
  (
    'Alpha Gamma Nu',
    'Leadership development, alumni relations, and student guild activities.',
    'Community & Other Interests'
  )
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  category = EXCLUDED.category;
