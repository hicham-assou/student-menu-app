-- =====================================================================
--  Stud'Table — Migration "Découverte" (catégories, tags, horaires,
--  suggestions). A executer dans Supabase → SQL Editor → Run.
-- =====================================================================

-- 1) Nouvelles colonnes sur les restaurants ---------------------------
alter table public.restaurants
  add column if not exists categories text[] default '{}',  -- plusieurs cuisines
  add column if not exists tags       text[] default '{}',  -- regimes (halal, vege...)
  add column if not exists hours      jsonb;                -- horaires structures

-- Index GIN pour filtrer rapidement par categorie (tableau)
create index if not exists restaurants_categories_idx on public.restaurants using gin (categories);

-- 2) Table des suggestions / signalements -----------------------------
create table if not exists public.suggestions (
  id              uuid primary key default gen_random_uuid(),
  type            text not null default 'new' check (type in ('new', 'correction')),
  restaurant_id   text references public.restaurants(id) on delete set null,
  restaurant_name text,
  address         text,
  city            text,
  message         text,
  contact_email   text,
  user_id         uuid references auth.users(id) on delete set null,
  status          text not null default 'pending',
  created_at      timestamptz not null default now()
);

alter table public.suggestions enable row level security;

-- N'importe qui (connecté ou non) peut envoyer une suggestion...
drop policy if exists "anyone can insert suggestions" on public.suggestions;
create policy "anyone can insert suggestions"
  on public.suggestions for insert
  to anon, authenticated
  with check (true);

-- ...mais personne ne peut les lire depuis l'app (lecture via le dashboard
-- Supabase uniquement). Pas de policy SELECT => aucun accès en lecture.
