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
