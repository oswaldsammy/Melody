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
