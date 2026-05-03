import { useCallback, useEffect, useRef, useState } from "react"
import * as Location from "expo-location"
import { AppState, Linking, Platform } from "react-native"

export type LocationStatus =
    | "idle"
    | "requesting"
    | "granted"
    | "denied"
    | "services-off"
    | "error"

export interface UserLocation {
    latitude: number
    longitude: number
}

interface UseUserLocationOptions {
    /** Demande la position automatiquement au mount (defaut: true) */
    autoRequest?: boolean
    /** Suivre la position en temps reel (defaut: false) */
    watch?: boolean
    /** Precision (defaut: Balanced) */
    accuracy?: Location.LocationAccuracy
}

interface UseUserLocationReturn {
    location: UserLocation | null
    status: LocationStatus
    error: string | null
    /** Demander/redemander la position */
    requestLocation: () => Promise<UserLocation | null>
    /** Ouvrir les parametres systeme (utile si denied) */
    openSettings: () => Promise<void>
    /** True si on peut afficher le marker utilisateur sur la carte */
    isAvailable: boolean
}

/**
 * Hook centralise pour gerer la geolocalisation utilisateur.
 *
 * Gere :
 * - La verification que les services de loc sont actives
 * - La demande de permission
 * - La recuperation de position (avec fallback getLastKnownPosition)
 * - Le watch en temps reel (optionnel)
 * - Le re-check automatique quand l'app revient au premier plan
 * - Une API simple pour ouvrir les parametres systeme
 */
export function useUserLocation(options: UseUserLocationOptions = {}): UseUserLocationReturn {
    const { autoRequest = true, watch = false, accuracy = Location.Accuracy.Balanced } = options

    const [location, setLocation] = useState<UserLocation | null>(null)
    const [status, setStatus] = useState<LocationStatus>("idle")
    const [error, setError] = useState<string | null>(null)
    const watchSubRef = useRef<Location.LocationSubscription | null>(null)

    const requestLocation = useCallback(async (): Promise<UserLocation | null> => {
        try {
            setStatus("requesting")
            setError(null)

            // 1. Verifier que les services de localisation sont actives
            const servicesEnabled = await Location.hasServicesEnabledAsync()
            if (!servicesEnabled) {
                setStatus("services-off")
                setError("Active la localisation dans les parametres de ton telephone.")
                return null
            }

            // 2. Verifier/demander la permission
            const { status: permStatus } = await Location.requestForegroundPermissionsAsync()
            if (permStatus !== "granted") {
                setStatus("denied")
                setError("Permission de localisation refusee.")
                return null
            }

            // 3. Recuperer la position (avec fallback)
            let coords: Location.LocationObjectCoords | null = null
            try {
                const pos = await Location.getCurrentPositionAsync({ accuracy })
                coords = pos.coords
            } catch {
                // Fallback : derniere position connue
                const last = await Location.getLastKnownPositionAsync()
                if (last) coords = last.coords
            }

            if (!coords) {
                setStatus("error")
                setError("Impossible de recuperer ta position. Reessaye dans quelques instants.")
                return null
            }

            const userLoc: UserLocation = {
                latitude: coords.latitude,
                longitude: coords.longitude,
            }
            setLocation(userLoc)
            setStatus("granted")
            return userLoc
        } catch (err) {
            console.error("[useUserLocation] error:", err)
            setStatus("error")
            setError("Erreur lors de la recuperation de la position.")
            return null
        }
    }, [accuracy])

    const openSettings = useCallback(async () => {
        try {
            if (Platform.OS === "ios") {
                await Linking.openURL("app-settings:")
            } else {
                await Linking.openSettings()
            }
        } catch (err) {
            console.error("[useUserLocation] openSettings error:", err)
        }
    }, [])

    // Auto-request au mount
    useEffect(() => {
        if (autoRequest) {
            void requestLocation()
        }
    }, [autoRequest, requestLocation])

    // Watch en temps reel
    useEffect(() => {
        if (!watch || status !== "granted") return

        let cancelled = false
        ;(async () => {
            try {
                const sub = await Location.watchPositionAsync(
                    {
                        accuracy,
                        distanceInterval: 20, // metres
                        timeInterval: 10000, // 10s
                    },
                    (pos) => {
                        if (cancelled) return
                        setLocation({
                            latitude: pos.coords.latitude,
                            longitude: pos.coords.longitude,
                        })
                    },
                )
                watchSubRef.current = sub
            } catch (err) {
                console.error("[useUserLocation] watch error:", err)
            }
        })()

        return () => {
            cancelled = true
            watchSubRef.current?.remove()
            watchSubRef.current = null
        }
    }, [watch, status, accuracy])

    // Re-check quand l'app revient au premier plan (utile si l'user a active la loc dans les params)
    useEffect(() => {
        const sub = AppState.addEventListener("change", (next) => {
            if (next === "active" && (status === "denied" || status === "services-off")) {
                void requestLocation()
            }
        })
        return () => sub.remove()
    }, [status, requestLocation])

    return {
        location,
        status,
        error,
        requestLocation,
        openSettings,
        isAvailable: status === "granted" && location !== null,
    }
}
