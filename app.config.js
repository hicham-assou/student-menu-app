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
      bundleIdentifier: "com.studentfood.app",
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "Stud'Table utilise ta position pour trouver les restaurants près de toi.",
        NSCameraUsageDescription:
          "Stud'Table utilise la caméra pour prendre des photos.",
        NSPhotoLibraryUsageDescription:
          "Stud'Table accède à ta galerie pour choisir des photos de profil ou de restaurant.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.Studentfood.app",
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY_ANDROID,
        },
      },
      // Permissions strictement necessaires : localisation 1er plan + galerie/camera.
      // Pas de background location, ni micro, ni stockage externe legacy.
      permissions: [
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.CAMERA",
        "android.permission.READ_MEDIA_IMAGES",
      ],
      // On bloque explicitement celles que des plugins pourraient rajouter
      // (sinon risque de rejet / mauvaise fiche Play Store).
      blockedPermissions: [
        "android.permission.ACCESS_BACKGROUND_LOCATION",
        "android.permission.RECORD_AUDIO",
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
          cameraPermission:
            "Stud'Table utilise la caméra pour prendre des photos.",
        },
      ],
    ],
    extra: {
      router: {},
      eas: {
        projectId: "a498ab23-4218-4b9a-96d3-7f6c8f422622",
      },
    },
  },
};
