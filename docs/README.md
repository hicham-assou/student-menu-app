# Pages web publiques — Stud'Table

Ces pages doivent être **accessibles publiquement** pour la fiche Google Play
(politique de confidentialité + suppression de compte).

## Publier avec GitHub Pages (gratuit, 2 min)

1. Pousse cette branche / merge sur `main`.
2. Sur GitHub : **Settings → Pages**.
3. Sous **Build and deployment → Source**, choisis **Deploy from a branch**.
4. **Branch : `main`**, **Folder : `/docs`** → **Save**.
5. Attends ~1 min. Les URLs seront :

   - Politique de confidentialité :
     `https://hicham-assou.github.io/student-menu-app/privacy-policy.html`
   - Suppression de compte :
     `https://hicham-assou.github.io/student-menu-app/delete-account.html`

## Où mettre ces URLs dans la Play Console

- **Politique de confidentialité** : Play Console → *Politique de confidentialité*
  (et dans la section *Sécurité des données*).
- **Suppression de compte** : Play Console → *Sécurité des données →
  « Les utilisateurs peuvent-ils demander la suppression des données ? »* →
  fournir l'URL `delete-account.html`.

> ⚠️ Pense à exécuter `supabase/delete_user_account.sql` dans Supabase
> (SQL Editor) pour que le bouton « Supprimer mon compte » de l'app fonctionne.
