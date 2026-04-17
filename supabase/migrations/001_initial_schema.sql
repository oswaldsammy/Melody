-- Enums
create type user_role as enum ('client', 'musician');
create type musician_type as enum ('solo', 'band', 'session', 'teacher');
create type booking_status as enum ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed');
create type media_type as enum ('photo', 'audio');
create type notification_type as enum ('booking_request', 'message', 'review', 'payout', 'booking_confirmed', 'booking_completed');

-- Profiles (extends auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  full_name text not null,
  avatar_url text,
  phone text,
  location text,
  push_token text,
  created_at timestamptz not null default now()
);

-- Musician profiles
create table musician_profiles (
  id uuid primary key references profiles(id) on delete cascade,
  musician_type musician_type not null,
  bio text,
  genres text[] not null default '{}',
  hourly_rate integer not null default 0, -- in cents
  years_experience integer,
  stripe_account_id text,
  stripe_onboarding_complete boolean not null default false,
  is_available boolean not null default true,
  avg_rating numeric(3,2) not null default 0,
  review_count integer not null default 0
);

-- Musician media (photos + audio samples)
create table musician_media (
  id uuid primary key default gen_random_uuid(),
  musician_id uuid not null references musician_profiles(id) on delete cascade,
  media_type media_type not null,
  storage_path text not null,
  display_name text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Availability windows
create table availability (
  id uuid primary key default gen_random_uuid(),
  musician_id uuid not null references musician_profiles(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_blocked boolean not null default true
);

-- Bookings
create table bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id),
  musician_id uuid not null references musician_profiles(id),
  status booking_status not null default 'pending',
  event_type text not null,
  event_date timestamptz not null,
  duration_hours numeric(4,2) not null,
  location text not null,
  notes text,
  quoted_amount integer not null, -- cents
  platform_fee integer not null,  -- cents
  musician_payout integer not null, -- cents
  stripe_payment_intent_id text,
  stripe_transfer_id text,
  paid_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Conversations (auto-created on booking insert)
create table conversations (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete set null,
  client_id uuid not null references profiles(id),
  musician_id uuid not null references musician_profiles(id),
  created_at timestamptz not null default now()
);

-- Messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id),
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Reviews (one per booking)
create table reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references bookings(id),
  reviewer_id uuid not null references profiles(id),
  musician_id uuid not null references musician_profiles(id),
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- Notifications
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type notification_type not null,
  payload jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Indexes
create index on bookings(client_id);
create index on bookings(musician_id);
create index on bookings(status);
create index on messages(conversation_id, created_at);
create index on reviews(musician_id);
create index on notifications(user_id, read_at);
create index on musician_profiles using gin(genres);
create index on availability(musician_id, starts_at, ends_at);
