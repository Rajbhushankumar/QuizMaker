-- Quiz Maker results backend (Supabase).
-- 1. Create a free project at supabase.com. 2. Open SQL Editor > New query.
-- 3. Change CHANGE_ME_SECRET below to your own admin key. 4. Paste everything and click Run.

create table if not exists results (
  id bigint generated always as identity primary key,
  t timestamptz not null default now(),
  quiz_id text not null check (char_length(quiz_id) <= 20),
  title text check (char_length(title) <= 100),
  channel text check (char_length(channel) <= 60),
  name text not null check (char_length(name) between 1 and 40),
  score int, total int, pts int, pct int, sec int
);

alter table results enable row level security;

-- Visitors can only ADD results. They cannot read the table directly.
drop policy if exists "anyone can add results" on results;
create policy "anyone can add results" on results for insert to anon with check (true);

-- Public leaderboard: top 10 for one quiz.
create or replace function get_board(q text) returns json
language sql security definer set search_path = public as $$
  select json_build_object(
    'count', (select count(*) from results where quiz_id = q),
    'top', coalesce((select json_agg(x) from (
      select name, score, total, pts, t from results
      where quiz_id = q order by pts desc, sec asc limit 10) x), '[]'::json));
$$;

-- Admin dashboard: all rows, only with the correct key.
create or replace function get_all(k text) returns json
language plpgsql security definer set search_path = public as $$
begin
  if k is distinct from 'CHANGE_ME_SECRET' then raise exception 'bad key'; end if;
  return coalesce((select json_agg(json_build_object(
    't', t, 'id', quiz_id, 'title', title, 'channel', channel, 'name', name,
    'score', score, 'total', total, 'pts', pts, 'pct', pct, 'sec', sec) order by t desc) from results), '[]'::json);
end $$;

grant execute on function get_board(text), get_all(text) to anon;
