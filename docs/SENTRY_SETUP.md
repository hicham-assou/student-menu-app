# Crash reporting (Sentry) — guide d'installation

> ⚠️ Sentry utilise un **module natif** → il faut **rebuild** l'app (dev client
> ou EAS) après l'installation. Et il faut un **DSN** (gratuit) depuis ton
> compte Sentry. Ces étapes ne peuvent pas être faites à ta place.

## 1. Installer le package

```bash
npx expo install @sentry/react-native
```

## 2. Créer un projet Sentry + récupérer le DSN

1. Crée un compte gratuit sur https://sentry.io
2. **Create Project** → plateforme **React Native**
3. Copie le **DSN** (ressemble à `https://xxxx@oXXX.ingest.sentry.io/XXXX`)

## 3. Variables d'environnement

Dans `.env` (déjà gitignoré) :

```
EXPO_PUBLIC_SENTRY_DSN=https://...ton-dsn...
```

(Le préfixe `EXPO_PUBLIC_` rend la variable lisible côté app.)

## 4. Plugin dans `app.config.js`

Ajoute le plugin Sentry dans le tableau `plugins` :

```js
plugins: [
  "expo-router",
  // ... tes autres plugins ...
  [
    "@sentry/react-native/expo",
    {
      organization: "TON_ORG_SLUG",
      project: "TON_PROJECT_SLUG",
      // url: "https://sentry.io/" // si self-hosted
    },
  ],
],
```

## 5. Créer `lib/sentry.ts`

```ts
import * as Sentry from "@sentry/react-native"

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN

export function initSentry() {
  if (!dsn) return // pas de DSN -> no-op (dev local)
  Sentry.init({
    dsn,
    // % d'événements de perf envoyés (0.2 = 20%)
    tracesSampleRate: 0.2,
    // Mets false en prod si tu veux moins de bruit
    enableNative: true,
  })
}

// Wrappe le composant racine pour capturer les erreurs de rendu
export const wrapWithSentry = Sentry.wrap
```

## 6. Brancher dans `app/_layout.tsx`

En haut du fichier :

```ts
import { initSentry, wrapWithSentry } from "@/lib/sentry"

initSentry()
```

Puis change l'export par défaut :

```ts
// avant : export default function RootLayout() { ... }
function RootLayout() { ... }
export default wrapWithSentry(RootLayout)
```

## 7. Rebuild

```bash
# dev client
npx expo run:android
# ou build EAS
eas build -p android --profile preview
```

## 8. Tester

Ajoute temporairement un bouton qui fait `throw new Error("Sentry test")`,
déclenche-le, puis vérifie que l'erreur apparaît dans le dashboard Sentry.

---

### Bonus : upload des sourcemaps (stack traces lisibles en prod)
Ajoute un `SENTRY_AUTH_TOKEN` (token Sentry) à tes secrets EAS. Le plugin
Expo de Sentry s'occupe d'uploader les sourcemaps au build automatiquement.

---

> 💡 Pourquoi pas déjà installé dans le repo ? Le registre npm était
> inaccessible (problème de certificat SSL) au moment de la mise en place,
> et installer un module natif à moitié aurait cassé le build. Le code
> ci-dessus est prêt : une fois `npx expo install` passé chez toi, il ne
> reste qu'à coller les snippets et rebuild.
