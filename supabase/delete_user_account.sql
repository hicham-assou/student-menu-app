-- =====================================================================
--  Stud'Table — Suppression de compte (RGPD + exigence Google Play)
-- =====================================================================
--  A EXECUTER UNE FOIS dans Supabase :
--    Dashboard → SQL Editor → coller → Run
--
--  L'app appelle cette fonction via `supabase.rpc('delete_user_account')`.
--  Elle supprime les donnees de l'utilisateur CONNECTE (avis, favoris,
--  profil) puis son compte d'authentification.
--
--  SECURITY DEFINER : la fonction s'execute avec les droits de son
--  proprietaire (postgres), ce qui autorise la suppression dans
--  auth.users — impossible autrement avec la cle anonyme.
-- =====================================================================

create or replace function public.delete_user_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  -- 1) Donnees liees a l'utilisateur
  --    (ajoute ici toute autre table qui reference l'utilisateur)
  delete from public.reviews   where user_id = uid;
  delete from public.favorites where user_id = uid;
  delete from public.profiles  where id = uid;

  -- 2) Compte d'authentification
  delete from auth.users where id = uid;
end;
$$;

-- Seul un utilisateur connecte peut l'appeler (jamais en anonyme)
revoke all on function public.delete_user_account() from public, anon;
grant execute on function public.delete_user_account() to authenticated;
