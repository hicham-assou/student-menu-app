-- =====================================================================
--  Stud'Table — Colonne `website` + champs d'abonnement / suivi
--  A executer dans Supabase -> SQL Editor -> Run.
-- =====================================================================

-- Site web du restaurant (affiche sur la fiche si renseigne)
alter table public.restaurants
  add column if not exists website text;

-- Champs d'abonnement / suivi (normalement deja presents : "if not exists"
-- les laisse intacts si c'est le cas, sinon les cree).
alter table public.restaurants
  add column if not exists subscription_start_date date,
  add column if not exists subscription_end_date   date,
  add column if not exists subscription_price       numeric,
  add column if not exists notes                    text,
  add column if not exists contact_email            text,
  add column if not exists contact_person           text,
  add column if not exists last_contact_date        date;
