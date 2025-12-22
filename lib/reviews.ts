import {supabase} from "./supabase"
import type {Review} from "@/types"

export async function getRestaurantReviews(restaurantId: string): Promise<Review[]> {
    try {
        const {data: reviews, error} = await supabase
            .from("reviews")
            .select("*")
            .eq("restaurant_id", restaurantId)
            .order("created_at", {ascending: false})

        if (error) throw error
        if (!reviews || reviews.length === 0) return []

        // Récupérer les profils des utilisateurs
        const userIds = [...new Set(reviews.map((r) => r.user_id))]

        const {data: profiles} = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", userIds)

        // Mapper les profils aux avis
        return reviews.map((review) => ({
            ...review,
            user: profiles?.find((p) => p.id === review.user_id) || {
                full_name: "Utilisateur",
                avatar_url: undefined,
            },
        }))
    } catch (error) {
        console.error("Error fetching reviews:", error)
        return []
    }
}

// Calculer la note moyenne d'un restaurant
export async function getRestaurantAverageRating(restaurantId: string): Promise<number> {
    try {
        const {data, error} = await supabase.from("reviews").select("rating").eq("restaurant_id", restaurantId)

        if (error) throw error

        if (!data || data.length === 0) return 0

        const total = data.reduce((sum, review) => sum + review.rating, 0)
        return Math.round((total / data.length) * 10) / 10
    } catch (error) {
        console.error("Error calculating average rating:", error)
        return 0
    }
}

export async function getUserReview(restaurantId: string): Promise<Review | null> {
    try {
        const {
            data: {user},
        } = await supabase.auth.getUser()

        if (!user) {
            return null
        }

        const {data: review, error} = await supabase
            .from("reviews")
            .select("*")
            .eq("restaurant_id", restaurantId)
            .eq("user_id", user.id)
            .single()

        if (error && error.code !== "PGRST116") throw error
        if (!review) return null

        // Récupérer le profil séparément
        const {data: profile} = await supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).single()

        return {
            ...review,
            user: profile || {
                full_name: "Utilisateur",
                avatar_url: undefined,
            },
        }
    } catch (error) {
        console.error("Error fetching user review:", error)
        return null
    }
}

// Créer ou mettre à jour un avis
export async function upsertReview(restaurantId: string, rating: number, comment?: string): Promise<Review | null> {
    try {
        const {
            data: {user},
        } = await supabase.auth.getUser()

        if (!user) {
            throw new Error("User not authenticated")
        }

        // Vérifier si l'avis existe déjà
        const existingReview = await getUserReview(restaurantId)

        if (existingReview) {
            // Mettre à jour
            const {data, error} = await supabase
                .from("reviews")
                .update({
                    rating,
                    comment,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", existingReview.id)
                .select()
                .single()

            if (error) throw error
            return data
        } else {
            // Créer
            const {data, error} = await supabase
                .from("reviews")
                .insert({
                    user_id: user.id,
                    restaurant_id: restaurantId,
                    rating,
                    comment,
                })
                .select()
                .single()

            if (error) throw error
            return data
        }
    } catch (error) {
        console.error("Error upserting review:", error)
        return null
    }
}

// Supprimer un avis
export async function deleteReview(reviewId: string): Promise<boolean> {
    try {
        const {error} = await supabase.from("reviews").delete().eq("id", reviewId)

        if (error) throw error
        return true
    } catch (error) {
        console.error("Error deleting review:", error)
        return false
    }
}

// Obtenir les statistiques des avis d'un restaurant
export async function getRestaurantReviewStats(restaurantId: string) {
    try {
        const {data, error} = await supabase.from("reviews").select("rating").eq("restaurant_id", restaurantId)

        if (error) throw error

        const total = data?.length || 0

        if (total === 0) {
            return {
                average: 0,
                total: 0,
                distribution: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
            }
        }

        const sum = data.reduce((acc, review) => acc + review.rating, 0)
        const average = Math.round((sum / total) * 10) / 10

        // Distribution des notes
        const distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        data.forEach((review) => {
            distribution[review.rating as keyof typeof distribution]++
        })

        return {
            average,
            total,
            distribution,
        }
    } catch (error) {
        console.error("Error fetching review stats:", error)
        return {
            average: 0,
            total: 0,
            distribution: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
        }
    }
}
