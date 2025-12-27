import { supabase } from "./supabase"

type AnalyticsEventType = "view" | "directions" | "call" | "favorite" | "unfavorite"

export async function trackEvent(restaurantId: string, eventType: AnalyticsEventType) {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        // Appeler la fonction PostgreSQL qui met à jour les compteurs
        const { error } = await supabase.rpc("increment_restaurant_stat", {
            p_restaurant_id: restaurantId,
            p_event_type: eventType,
            p_user_id: user?.id || null,
        })

        if (error) throw error
        return true
    } catch (error) {
        console.error("Error tracking event:", error)
        return false
    }
}

export interface RestaurantStats {
    totalViews: number
    totalDirections: number
    totalCalls: number
    totalFavorites: number
    uniqueUsers: number
    averageRating: number
    totalReviews: number
    weeklyViews: number
    monthlyViews: number
    growthPercentage: number
    dailyStats?: Array<{
        date: string
        views: number
        directions: number
        calls: number
    }>
}

export type TimePeriod = "7days" | "30days" | "90days" | "365days"

export async function getRestaurantStats(
    restaurantId: string,
    period: TimePeriod = "30days",
): Promise<RestaurantStats> {
    try {
        // Récupérer les stats en temps réel (1 seule ligne)
        const { data: stats, error: statsError } = await supabase
            .from("restaurant_stats")
            .select("*")
            .eq("restaurant_id", restaurantId)
            .single()

        if (statsError && statsError.code !== "PGRST116") throw statsError

        const daysMap = { "7days": 7, "30days": 30, "90days": 90, "365days": 365 }
        const days = daysMap[period]

        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        const { data: dailyStats, error: dailyError } = await supabase
            .from("restaurant_analytics_daily")
            .select("*")
            .eq("restaurant_id", restaurantId)
            .gte("date", startDate.toISOString().split("T")[0])
            .order("date", { ascending: true })

        if (dailyError) throw dailyError

        // Calculer les stats hebdomadaires et mensuelles
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const weeklyViews =
            dailyStats?.filter((d) => new Date(d.date) >= sevenDaysAgo).reduce((sum, d) => sum + d.daily_views, 0) || 0

        const periodViews = dailyStats?.reduce((sum, d) => sum + d.daily_views, 0) || 0

        // Calculer la croissance par rapport à la période précédente
        const previousPeriodStart = new Date()
        previousPeriodStart.setDate(previousPeriodStart.getDate() - days * 2)
        const previousPeriodEnd = new Date()
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - days)

        const { data: previousStats } = await supabase
            .from("restaurant_analytics_daily")
            .select("*")
            .eq("restaurant_id", restaurantId)
            .gte("date", previousPeriodStart.toISOString().split("T")[0])
            .lt("date", previousPeriodEnd.toISOString().split("T")[0])

        const previousPeriodViews = previousStats?.reduce((sum, d) => sum + d.daily_views, 0) || 0

        const growthPercentage =
            previousPeriodViews > 0
                ? ((periodViews - previousPeriodViews) / previousPeriodViews) * 100
                : periodViews > 0
                    ? 100
                    : 0

        // Récupérer les avis pour la note moyenne
        const { data: reviews, error: reviewsError } = await supabase
            .from("reviews")
            .select("rating")
            .eq("restaurant_id", restaurantId)

        if (reviewsError) throw reviewsError

        const averageRating =
            reviews && reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0

        return {
            totalViews: stats?.total_views || 0,
            totalDirections: stats?.total_directions || 0,
            totalCalls: stats?.total_calls || 0,
            totalFavorites: stats?.total_favorites || 0,
            uniqueUsers: stats?.unique_viewers?.length || 0,
            averageRating,
            totalReviews: reviews?.length || 0,
            weeklyViews,
            monthlyViews: periodViews,
            growthPercentage,
            dailyStats: dailyStats?.map((d) => ({
                date: d.date,
                views: d.daily_views,
                directions: d.daily_directions,
                calls: d.daily_calls,
            })),
        }
    } catch (error) {
        console.error("Error fetching restaurant stats:", error)
        return {
            totalViews: 0,
            totalDirections: 0,
            totalCalls: 0,
            totalFavorites: 0,
            uniqueUsers: 0,
            averageRating: 0,
            totalReviews: 0,
            weeklyViews: 0,
            monthlyViews: 0,
            growthPercentage: 0,
        }
    }
}
