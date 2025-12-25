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

export function getDirectionsUrl(latitude: number, longitude: number, address: string): string {
    // Try to use Google Maps first, fallback to Apple Maps on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

    if (isIOS) {
        // Apple Maps URL scheme
        return `http://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`
    } else {
        // Google Maps URL
        return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`
    }
}

export function openDirections(latitude: number, longitude: number, address: string): void {
    const url = getDirectionsUrl(latitude, longitude, address)
    window.open(url, "_blank")
}
