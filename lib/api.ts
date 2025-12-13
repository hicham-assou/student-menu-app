import { supabase } from './supabase'
import type { Restaurant} from "@/types";

export async function getRestaurants(): Promise<Restaurant[]> {
    const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('subscription_status', 'active')
        .order('name')

    if (error) throw error
    return data || []
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
    const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}

export async function searchRestaurants(query: string): Promise<Restaurant[]> {
    const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('subscription_status', 'active')
        .or(`name.ilike.%${query}%,address.ilike.%${query}%`)
        .order('name')

    if (error) throw error
    return data || []
}