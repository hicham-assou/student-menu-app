import { Linking, Platform } from "react-native"

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    return Math.round(distance * 100) / 100 // Round to 2 decimal places
}

export function formatDistance(distance: number): string {
    if (distance < 1) {
        return `${Math.round(distance * 1000)}m`
    }
    return `${distance}km`
}

export function cn(...classes: string[]) {
    return classes.filter(Boolean).join(" ")
}

/**
 * Construit l'URL d'itinéraire selon la plateforme :
 * - iOS : Apple Maps (natif)
 * - Android / autre : Google Maps
 */
export function getDirectionsUrl(latitude: number, longitude: number, _address?: string): string {
    if (Platform.OS === "ios") {
        return `http://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`
}

/**
 * Ouvre l'app de cartes externe pour l'itinéraire.
 * Utilise Linking de React Native (compatible iOS/Android, plus de window.open).
 */
export async function openDirections(
    latitude: number,
    longitude: number,
    address?: string,
): Promise<void> {
    const url = getDirectionsUrl(latitude, longitude, address)
    try {
        const supported = await Linking.canOpenURL(url)
        if (supported) {
            await Linking.openURL(url)
        } else {
            // Fallback Google Maps web si Apple Maps n'est pas dispo
            const fallback = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
            await Linking.openURL(fallback)
        }
    } catch (err) {
        console.error("[openDirections] error:", err)
    }
}
