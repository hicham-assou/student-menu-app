import {supabase} from './supabase'
import type {Restaurant} from '@/types'

// Ajouter un favori
export async function addFavorite(restaurantId: string): Promise<boolean> {
    try {
        const {data: {user}} = await supabase.auth.getUser()

        if (!user) {
            throw new Error('User not authenticated')
        }

        const {error} = await supabase
            .from('favorites')
            .insert({
                user_id: user.id,
                restaurant_id: restaurantId,
            })

        if (error) throw error
        return true
    } catch (error) {
        console.error('Error adding favorite:', error)
        return false
    }
}

// Retirer un favori
export async function removeFavorite(restaurantId: string): Promise<boolean> {
    try {
        const {data: {user}} = await supabase.auth.getUser()

        if (!user) {
            throw new Error('User not authenticated')
        }

        const {error} = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('restaurant_id', restaurantId)

        if (error) throw error
        return true
    } catch (error) {
        console.error('Error removing favorite:', error)
        return false
    }
}

// Toggle favori (ajouter si pas présent, retirer si présent)
export async function toggleFavorite(restaurantId: string): Promise<boolean> {
    try {
        const {data: {user}} = await supabase.auth.getUser()

        if (!user) {
            throw new Error('User not authenticated')
        }

        // Vérifier si déjà en favori
        const {data: existing} = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('restaurant_id', restaurantId)
            .single()

        if (existing) {
            // Retirer
            await removeFavorite(restaurantId)
            return false
        } else {
            // Ajouter
            await addFavorite(restaurantId)
            return true
        }
    } catch (error) {
        console.error('Error toggling favorite:', error)
        return false
    }
}

// Récupérer tous les favoris de l'utilisateur
export async function getFavorites(): Promise<string[]> {
    try {
        const {data: {user}} = await supabase.auth.getUser()

        if (!user) {
            return []
        }

        const {data, error} = await supabase
            .from('favorites')
            .select('restaurant_id')
            .eq('user_id', user.id)

        if (error) throw error

        return data?.map(fav => fav.restaurant_id) || []
    } catch (error) {
        console.error('Error fetching favorites:', error)
        return []
    }
}

// Récupérer les restaurants favoris complets
export async function getFavoriteRestaurants() {
    try {
        const {data: {user}} = await supabase.auth.getUser()

        if (!user) {
            return []
        }

        const {data, error} = await supabase
            .from('favorites')
            .select(`
        restaurant_id,
        created_at,
        restaurants (*)
      `)
            .eq('user_id', user.id)
            .order('created_at', {ascending: false})

        if (error) throw error

        return (data?.map(fav => ({
            ...fav.restaurants,
            favorited_at: fav.created_at,
        })) || []) as unknown as Restaurant[]
    } catch (error) {
        console.error('Error fetching favorite restaurants:', error)
        return []
    }
}

// Vérifier si un restaurant est en favori
export async function isFavorite(restaurantId: string): Promise<boolean> {
    try {
        const {data: {user}} = await supabase.auth.getUser()

        if (!user) {
            return false
        }

        const {data, error} = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('restaurant_id', restaurantId)
            .single()

        if (error && error.code !== 'PGRST116') throw error

        return !!data
    } catch (error) {
        console.error('Error checking favorite:', error)
        return false
    }
}