import { useCallback, useEffect, useState } from 'react'
import { getFavorites, toggleFavorite as toggleFav } from '@/lib/favorites'
import { useAuth } from '@/contexts/AuthContext'
import { useRestaurantStore } from '@/stores/restaurants'

export function useRestaurants() {
    // Liste des restos : vient du cache partagé (zustand)
    const restaurants = useRestaurantStore((s) => s.restaurants)
    const loading = useRestaurantStore((s) => s.loading)
    const error = useRestaurantStore((s) => s.error)
    const fetchRestaurants = useRestaurantStore((s) => s.fetch)

    // Favoris : spécifiques à l'utilisateur, gérés localement
    const [favorites, setFavorites] = useState<string[]>([])
    const { user } = useAuth()

    const loadFavorites = useCallback(async () => {
        if (!user) {
            setFavorites([])
            return
        }
        try {
            const favs = await getFavorites()
            setFavorites(favs)
        } catch (err) {
            console.error('Error loading favorites:', err)
            setFavorites([])
        }
    }, [user])

    useEffect(() => {
        fetchRestaurants()
    }, [fetchRestaurants])

    useEffect(() => {
        loadFavorites()
    }, [loadFavorites])

    const toggleFavorite = async (restaurantId: string) => {
        if (!user) return false
        try {
            const isFav = await toggleFav(restaurantId)
            setFavorites((prev) =>
                isFav ? [...prev, restaurantId] : prev.filter((id) => id !== restaurantId),
            )
            return isFav
        } catch (err) {
            console.error('Error toggling favorite:', err)
            return false
        }
    }

    const isFavorite = (restaurantId: string) => favorites.includes(restaurantId)

    const refresh = () => {
        fetchRestaurants(true)
        loadFavorites()
    }

    return {
        restaurants,
        favorites,
        loading,
        error,
        refresh,
        toggleFavorite,
        isFavorite,
    }
}
