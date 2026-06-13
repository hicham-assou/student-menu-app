import { create } from "zustand"
import { getRestaurants } from "@/lib/api"
import type { Restaurant } from "@/types"

// Au-delà de ce délai, les données sont considérées périmées et re-fetchées.
const STALE_MS = 5 * 60 * 1000 // 5 min

interface RestaurantStore {
    restaurants: Restaurant[]
    loading: boolean
    error: string | null
    lastFetch: number | null
    /** Charge les restos (depuis le cache si frais, sinon réseau). */
    fetch: (force?: boolean) => Promise<void>
    getById: (id: string) => Restaurant | undefined
}

export const useRestaurantStore = create<RestaurantStore>((set, get) => ({
    restaurants: [],
    loading: false,
    error: null,
    lastFetch: null,

    fetch: async (force = false) => {
        const { lastFetch, restaurants, loading } = get()
        if (loading) return
        const fresh = lastFetch != null && Date.now() - lastFetch < STALE_MS
        if (!force && fresh && restaurants.length > 0) return

        set({ loading: true, error: null })
        try {
            const data = await getRestaurants()
            set({ restaurants: data, loading: false, lastFetch: Date.now() })
        } catch (err) {
            console.error("[restaurantStore] fetch error:", err)
            set({ loading: false, error: "Impossible de charger les restaurants" })
        }
    },

    getById: (id) => get().restaurants.find((r) => r.id === id),
}))
