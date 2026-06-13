-- =====================================================================
--  Stud'Table — Migration des prix texte -> numerique
-- =====================================================================
--  Les prix des menus sont stockes dans le JSONB `student_menu`, sous la
--  forme de texte ("6,50€"). Ce script les convertit en nombre (6.5).
--
--  Le code de l'app est retro-compatible (il lit texte ET nombre), donc
--  cette migration peut etre passee quand tu veux — mais autant le faire
--  pour fiabiliser le tri et les filtres.
--
--  A executer dans Supabase -> SQL Editor -> Run.
-- =====================================================================

update public.restaurants r
set student_menu = (
    select jsonb_agg(
        case
            when jsonb_typeof(elem -> 'price') = 'string' then
                jsonb_set(
                    elem,
                    '{price}',
                    to_jsonb(
                        nullif(
                            regexp_replace(
                                replace(replace(elem ->> 'price', '€', ''), ',', '.'),
                                '[^0-9.]', '', 'g'
                            ),
                        '')::numeric
                    )
                )
            else elem
        end
        order by ord
    )
    from jsonb_array_elements(r.student_menu) with ordinality as t(elem, ord)
)
where r.student_menu is not null
  and jsonb_array_length(r.student_menu) > 0;
