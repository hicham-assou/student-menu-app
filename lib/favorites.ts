import AsyncStorage from '@react-native-async-storage/async-storage'
import type { FavoriteRestaurant} from "@/types";

const FAVORITES_KEY = 'student_menu_favorites'

export async function getFavorites(): Promise<string[]> {
    try {
        const stored = await AsyncStorage.getItem(FAVORITES_KEY)
        if (!stored) return []
        const favorites: FavoriteRestaurant[] = JSON.parse(stored)
        return favorites.map((f) => f.id)
    } catch {
        return []
    }
}

export async function toggleFavorite(restaurantId: string): Promise<boolean> {
    const stored = await AsyncStorage.getItem(FAVORITES_KEY)
    const favorites: FavoriteRestaurant[] = stored ? JSON.parse(stored) : []

    const exists = favorites.find((f) => f.id === restaurantId)

    if (exists) {
        const filtered = favorites.filter((f) => f.id !== restaurantId)
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered))
        return false
    } else {
        favorites.push({ id: restaurantId, addedAt: new Date().toISOString() })
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
        return true
    }
}