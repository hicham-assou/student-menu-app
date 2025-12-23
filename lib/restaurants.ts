import {supabase} from './supabase'
import type {Restaurant} from '@/types'

// Récupérer les restaurants du gérant connecté
export async function getMyRestaurants(): Promise<Restaurant[]> {
    try {
        const {data: {user}} = await supabase.auth.getUser()

        if (!user) {
            throw new Error('User not authenticated')
        }

        const {data, error} = await supabase
            .from('restaurants')
            .select('*')
            .eq('owner_id', user.id)
            .order('created_at', {ascending: false})

        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Error fetching my restaurants:', error)
        return []
    }
}

// Mettre à jour un restaurant
export async function updateRestaurant(
    restaurantId: string,
    updates: Partial<Restaurant>
): Promise<boolean> {
    try {
        const {data: {user}} = await supabase.auth.getUser()

        if (!user) {
            throw new Error('User not authenticated')
        }

        // Vérifier que l'utilisateur est bien le propriétaire
        const {data: restaurant} = await supabase
            .from('restaurants')
            .select('owner_id')
            .eq('id', restaurantId)
            .single()

        if (restaurant?.owner_id !== user.id) {
            throw new Error('Unauthorized')
        }

        // <CHANGE> Retiré updated_at qui n'existe pas dans la table
        const {error} = await supabase
            .from('restaurants')
            .update(updates)
            .eq('id', restaurantId)

        if (error) throw error
        return true
    } catch (error) {
        console.error('Error updating restaurant:', error)
        return false
    }
}

// Vérifier si l'utilisateur est propriétaire d'un restaurant
export async function isRestaurantOwner(restaurantId: string): Promise<boolean> {
    try {
        const {data: {user}} = await supabase.auth.getUser()

        if (!user) return false

        const {data, error} = await supabase
            .from('restaurants')
            .select('owner_id')
            .eq('id', restaurantId)
            .single()

        if (error) throw error
        return data?.owner_id === user.id
    } catch (error) {
        console.error('Error checking restaurant owner:', error)
        return false
    }
}