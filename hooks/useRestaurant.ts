import {useCallback, useEffect, useState} from 'react'
import {getRestaurants, searchRestaurants} from '@/lib/api'
import {getFavorites, toggleFavorite as toggleFav} from '@/lib/favorites'
import type {Restaurant} from '@/types'

export function useRestaurants() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([])
    const [favorites, setFavorites] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

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
        const favs = await getFavorites()
        setFavorites(favs)
    }, [])

    useEffect(() => {
        loadRestaurants()
        loadFavorites()
    }, [loadRestaurants, loadFavorites])

    const toggleFavorite = async (restaurantId: string) => {
        const isFav = await toggleFav(restaurantId)
        if (isFav) {
            setFavorites((prev) => [...prev, restaurantId])
        } else {
            setFavorites((prev) => prev.filter((id) => id !== restaurantId))
        }
        return isFav
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