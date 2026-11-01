-- =====================================================================
--  Stud'Table — Policy RLS UPDATE sur `profiles`
-- =====================================================================
--  Symptome : a l'inscription, le `full_name` saisi n'est pas enregistre
--  (la colonne reste vide) et l'app affiche le prefixe de l'email.
--
--  Cause : un trigger cree la ligne de profil AVANT l'ecriture cote app
--  (avec un nom vide). L'app fait ensuite un upsert qui MET A JOUR le nom,
--  mais sans policy UPDATE, cette mise a jour est bloquee par RLS.
--
--  Fix : autoriser un utilisateur authentifie a mettre a jour SA propre ligne.
--
--  A executer dans Supabase -> SQL Editor -> Run.
-- =====================================================================

alter table public.profiles enable row level security;

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
