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
        NSLocationAlwaysUsageDescription:
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
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "READ_MEDIA_IMAGES",
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
          locationAlwaysAndWhenInUsePermission:
            "Stud'Table utilise ta position pour trouver les restaurants près de toi.",
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
  },
};
