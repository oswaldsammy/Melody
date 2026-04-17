-- Enable extensions
create extension if not exists "uuid-ossp";

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
  id uuid primary key default uuid_generate_v4(),
  musician_id uuid not null references musician_profiles(id) on delete cascade,
  media_type media_type not null,
  storage_path text not null,
  display_name text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Availability windows
create table availability (
  id uuid primary key default uuid_generate_v4(),
  musician_id uuid not null references musician_profiles(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_blocked boolean not null default true
);

-- Bookings
create table bookings (
  id uuid primary key default uuid_generate_v4(),
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
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references bookings(id) on delete set null,
  client_id uuid not null references profiles(id),
  musician_id uuid not null references musician_profiles(id),
  created_at timestamptz not null default now()
);

-- Messages
create table messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id),
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Reviews (one per booking)
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null unique references bookings(id),
  reviewer_id uuid not null references profiles(id),
  musician_id uuid not null references musician_profiles(id),
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- Notifications
create table notifications (
  id uuid primary key default uuid_generate_v4(),
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
-- Auto-create conversation when a booking is inserted
create or replace function create_conversation_for_booking()
returns trigger language plpgsql as $$
begin
  insert into conversations (booking_id, client_id, musician_id)
  values (new.id, new.client_id, new.musician_id);
  return new;
end;
$$;

create trigger on_booking_created
  after insert on bookings
  for each row execute function create_conversation_for_booking();

-- Update musician avg_rating and review_count after review insert
create or replace function update_musician_rating()
returns trigger language plpgsql as $$
begin
  update musician_profiles
  set
    avg_rating = (
      select round(avg(rating)::numeric, 2)
      from reviews
      where musician_id = new.musician_id
    ),
    review_count = (
      select count(*) from reviews where musician_id = new.musician_id
    )
  where id = new.musician_id;
  return new;
end;
$$;

create trigger on_review_inserted
  after insert on reviews
  for each row execute function update_musician_rating();

-- Auto-create profile on auth.users insert
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  -- Profile is created explicitly during onboarding, not here.
  -- This trigger exists as a safety net for OAuth flows.
  return new;
end;
$$;
-- Enable RLS on all tables
alter table profiles enable row level security;
alter table musician_profiles enable row level security;
alter table musician_media enable row level security;
alter table availability enable row level security;
alter table bookings enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table reviews enable row level security;
alter table notifications enable row level security;

-- profiles
create policy "Public profiles are viewable" on profiles for select using (true);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);

-- musician_profiles
create policy "Musician profiles are public" on musician_profiles for select using (true);
create policy "Musicians insert own profile" on musician_profiles for insert with check (auth.uid() = id);
create policy "Musicians update own profile" on musician_profiles for update using (auth.uid() = id);

-- musician_media
create policy "Musician media is public" on musician_media for select using (true);
create policy "Musicians manage own media" on musician_media for insert with check (auth.uid() = musician_id);
create policy "Musicians update own media" on musician_media for update using (auth.uid() = musician_id);
create policy "Musicians delete own media" on musician_media for delete using (auth.uid() = musician_id);

-- availability
create policy "Availability is public" on availability for select using (true);
create policy "Musicians manage own availability" on availability for insert with check (auth.uid() = musician_id);
create policy "Musicians update own availability" on availability for update using (auth.uid() = musician_id);
create policy "Musicians delete own availability" on availability for delete using (auth.uid() = musician_id);

-- bookings
create policy "Participants view booking" on bookings for select
  using (auth.uid() = client_id or auth.uid() = musician_id);
create policy "Clients create booking" on bookings for insert
  with check (auth.uid() = client_id);
create policy "Participants update booking" on bookings for update
  using (auth.uid() = client_id or auth.uid() = musician_id);

-- conversations
create policy "Participants view conversation" on conversations for select
  using (auth.uid() = client_id or auth.uid() = musician_id);
create policy "Participants insert conversation" on conversations for insert
  with check (auth.uid() = client_id or auth.uid() = musician_id);

-- messages
create policy "Participants view messages" on messages for select
  using (
    exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.client_id = auth.uid() or c.musician_id = auth.uid())
    )
  );
create policy "Participants send messages" on messages for insert
  with check (
    auth.uid() = sender_id and
    exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.client_id = auth.uid() or c.musician_id = auth.uid())
    )
  );
create policy "Sender updates message" on messages for update
  using (auth.uid() = sender_id);

-- reviews
create policy "Reviews are public" on reviews for select using (true);
create policy "Clients submit review for completed booking" on reviews for insert
  with check (
    auth.uid() = reviewer_id and
    exists (
      select 1 from bookings b
      where b.id = booking_id
        and b.client_id = auth.uid()
        and b.status = 'completed'
    )
  );

-- notifications
create policy "Users view own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users update own notifications" on notifications for update using (auth.uid() = user_id);
-- Search musicians with filtering
create or replace function search_musicians(
  p_musician_type musician_type default null,
  p_genres text[] default null,
  p_location text default null,
  p_min_rate integer default null,
  p_max_rate integer default null,
  p_min_rating numeric default null,
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (
  id uuid,
  musician_type musician_type,
  bio text,
  genres text[],
  hourly_rate integer,
  years_experience integer,
  is_available boolean,
  avg_rating numeric,
  review_count integer,
  full_name text,
  avatar_url text,
  location text
)
language sql stable security definer as $$
  select
    mp.id,
    mp.musician_type,
    mp.bio,
    mp.genres,
    mp.hourly_rate,
    mp.years_experience,
    mp.is_available,
    mp.avg_rating,
    mp.review_count,
    p.full_name,
    p.avatar_url,
    p.location
  from musician_profiles mp
  join profiles p on p.id = mp.id
  where
    mp.stripe_onboarding_complete = true
    and mp.is_available = true
    and (p_musician_type is null or mp.musician_type = p_musician_type)
    and (p_genres is null or mp.genres && p_genres)
    and (p_location is null or p.location ilike '%' || p_location || '%')
    and (p_min_rate is null or mp.hourly_rate >= p_min_rate)
    and (p_max_rate is null or mp.hourly_rate <= p_max_rate)
    and (p_min_rating is null or mp.avg_rating >= p_min_rating)
  order by mp.avg_rating desc, mp.review_count desc
  limit p_limit
  offset p_offset;
$$;
