// Types pour les restaurants
export interface MenuItem {
    title: string
    price: string,
    image_url?: string
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
    student_menu_conditions?: string
    created_at?: string
    subscription_status: 'active' | 'inactive' | 'expired'
    owner_id?: string
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

// Types pour l'authentification
export interface Profile {
    id: string
    email: string
    full_name?: string
    avatar_url?: string
    role: 'student' | 'restaurant_owner' | 'admin'
    restaurant_id?: string
    created_at: string
    updated_at: string
}

export interface AuthUser {
    id: string
    email: string
    profile?: Profile
}

// Types pour les avis
export interface Review {
    id: string
    user_id: string
    restaurant_id: string
    rating: number
    comment?: string
    created_at: string
    updated_at: string
    user?: {
        full_name?: string
        avatar_url?: string
    }
}