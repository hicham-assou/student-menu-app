-- =====================================================================
--  Stud'Table — Fix inscription : policy RLS INSERT sur `profiles`
-- =====================================================================
--  Symptome : a l'inscription, l'app affiche
--    "new row violates row-level security policy for table profiles"
--
--  Cause : AuthContext.signUp() insere la ligne de profil
--  (id, email, full_name, role) juste apres supabase.auth.signUp(),
--  mais aucune policy n'autorise l'utilisateur a creer SA propre ligne.
--
--  Fix : autoriser un utilisateur authentifie a inserer une ligne
--  dont l'id correspond a son propre auth.uid().
--
--  A executer dans Supabase -> SQL Editor -> Run.
-- =====================================================================

-- RLS doit etre active sur la table (sans effet si deja le cas)
alter table public.profiles enable row level security;

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);
