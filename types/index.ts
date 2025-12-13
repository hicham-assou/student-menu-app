// Types pour les restaurants
export interface MenuItem {
    title: string
    price: string
}

export interface Restaurant {
    id: string
    name: string
    address: string
    city: string
    latitude: number
    longitude: number
    phone?: string
    description?: string
    opening_hours: string
    image?: string
    student_menu: MenuItem[]
    created_at?: string
    subscription_status: 'active' | 'inactive' | 'expired'
}

// Types pour les favoris
export interface FavoriteRestaurant {
    id: string
    addedAt: string
}

// Types pour la géolocalisation
export interface UserLocation {
    latitude: number
    longitude: number
}