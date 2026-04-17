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
