/* eslint-disable */
// Configuration Expo dynamique : lit les valeurs sensibles depuis .env
// Voir https://docs.expo.dev/workflow/configuration/

export default {
  expo: {
    name: "stud'Table",
    slug: "studTable",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "studentmenuapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.studtable.app",
      // Icone App Store : 1024x1024 sans transparence (exigee par Apple)
      icon: "./assets/images/icon-ios.png",
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "Stud'Table utilise ta position pour trouver les restaurants près de toi.",
        NSPhotoLibraryUsageDescription:
          "Stud'Table accède à ta galerie pour choisir des photos de profil ou de restaurant.",
        // L'app n'utilise pas de chiffrement non-exempte : evite la question
        // "export compliance" a chaque soumission.
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#F97316",
      },
      package: "com.studtable.app",
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY_ANDROID,
        },
      },
      // Permissions strictement necessaires : localisation 1er plan uniquement.
      // Pas de camera (non utilisee), ni de permission photos/videos : le selecteur d'images systeme
      // (Photo Picker) n'en a pas besoin, et Google Play exige une declaration
      // "fonctionnalite de base" pour READ_MEDIA_IMAGES / READ_MEDIA_VIDEO.
      permissions: [
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
      ],
      // On bloque explicitement celles que des plugins pourraient rajouter
      // (sinon risque de rejet / mauvaise fiche Play Store).
      blockedPermissions: [
        "android.permission.ACCESS_BACKGROUND_LOCATION",
        "android.permission.RECORD_AUDIO",
        "android.permission.CAMERA",
        "android.permission.READ_MEDIA_IMAGES",
        "android.permission.READ_MEDIA_VIDEO",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
      ],
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-location",
        {
          // Localisation en 1er plan uniquement (pas de background)
          locationWhenInUsePermission:
            "Stud'Table utilise ta position pour trouver les restaurants près de toi.",
          isAndroidBackgroundLocationEnabled: false,
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission:
            "Stud'Table accède à ta galerie pour choisir des photos de profil ou de restaurant.",
          // La camera n'est utilisee nulle part (galerie uniquement)
          cameraPermission: false,
          microphonePermission: false,
        },
      ],
      // Necessaire pour generer l'entitlement aps-environment (push iOS).
      // Sans ce plugin, getDevicePushTokenAsync() echoue en build standalone.
      "expo-notifications",
    ],
    extra: {
      router: {},
      eas: {
        projectId: "a498ab23-4218-4b9a-96d3-7f6c8f422622",
      },
    },
  },
};
