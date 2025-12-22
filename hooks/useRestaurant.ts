import {useCallback, useEffect, useState} from 'react'
import {getRestaurants, searchRestaurants} from '@/lib/api'
import {getFavorites, toggleFavorite as toggleFav} from '@/lib/favorites'
import {useAuth} from '@/contexts/AuthContext'
import type {Restaurant} from '@/types'

export function useRestaurants() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([])
    const [favorites, setFavorites] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const {user} = useAuth()

    const loadRestaurants = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const data = searchQuery
                ? await searchRestaurants(searchQuery)
                : await getRestaurants()
            setRestaurants(data)
        } catch (err) {
            setError('Impossible de charger les restaurants')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [searchQuery])

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
        loadRestaurants()
    }, [loadRestaurants])

    useEffect(() => {
        loadFavorites()
    }, [loadFavorites])

    const toggleFavorite = async (restaurantId: string) => {
        if (!user) {
            return false
        }

        try {
            const isFav = await toggleFav(restaurantId)

            // Mettre à jour l'état local
            if (isFav) {
                setFavorites((prev) => [...prev, restaurantId])
            } else {
                setFavorites((prev) => prev.filter((id) => id !== restaurantId))
            }

            return isFav
        } catch (err) {
            console.error('Error toggling favorite:', err)
            return false
        }
    }

    const isFavorite = (restaurantId: string) => favorites.includes(restaurantId)

    const search = (query: string) => {
        setSearchQuery(query)
    }

    const refresh = () => {
        loadRestaurants()
        loadFavorites()
    }

    return {
        restaurants,
        favorites,
        loading,
        error,
        searchQuery,
        search,
        refresh,
        toggleFavorite,
        isFavorite,
    }
}