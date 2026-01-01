import {FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from "react-native"
import {SafeAreaView} from "react-native-safe-area-context"
import {useRouter} from "expo-router"
import {Ionicons} from "@expo/vector-icons"
import {Colors} from "@/constants/Colors"
import {useAuth} from "@/contexts/AuthContext"
import {useEffect, useState} from "react"
import {supabase} from "@/lib/supabase"
import {CustomAlertManager} from "@/components/CustomAlert"

interface Review {
    id: string
    rating: number
    comment: string
    created_at: string
    restaurant: {
        id: string
        name: string
        image: string
        city: string
    }
}

export default function MyReviewsScreen() {
    const router = useRouter()
    const {user} = useAuth()
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const colors = Colors.light

    useEffect(() => {
        fetchReviews()
    }, [])

    const fetchReviews = async () => {
        if (!user) return

        try {
            const {data, error} = await supabase
                .from("reviews")
                .select(
                    `
          id,
          rating,
          comment,
          created_at,
          restaurant:restaurants (
            id,
            name,
            image,
            city
          )
        `,
                )
                .eq("user_id", user.id)
                .order("created_at", {ascending: false})

            if (error) throw error
            setReviews(data || [])
        } catch (error) {
            console.error("Error fetching reviews:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteReview = async (reviewId: string) => {
        CustomAlertManager.alert("Supprimer l'avis", "Es-tu sûr de vouloir supprimer cet avis ?", "confirm", [
            {text: "Annuler", style: "cancel"},
            {
                text: "Supprimer",
                style: "destructive",
                onPress: async () => {
                    try {
                        const {error} = await supabase.from("reviews").delete().eq("id", reviewId)

                        if (error) throw error

                        setReviews(reviews.filter((r) => r.id !== reviewId))
                        CustomAlertManager.alert("Succès", "Ton avis a été supprimé", "success")
                    } catch (error) {
                        console.error("Error deleting review:", error)
                        CustomAlertManager.alert("Erreur", "Impossible de supprimer l'avis", "error")
                    }
                },
            },
        ])
    }

    const renderStars = (rating: number) => {
        return (
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons key={star} name={star <= rating ? "star" : "star-outline"} size={16} color="#F59E0B"/>
                ))}
            </View>
        )
    }

    const renderReview = ({item}: { item: Review }) => (
        <TouchableOpacity
            onPress={() => router.push(`/restaurant/${item.restaurant.id}`)}
            style={[styles.reviewCard, {backgroundColor: colors.surface, borderColor: colors.border}]}
        >
            <Image
                source={{uri: item.restaurant.image || "https://via.placeholder.com/80"}}
                style={styles.restaurantImage}
            />

            <View style={styles.reviewContent}>
                <Text style={[styles.restaurantName, {color: colors.text}]}>{item.restaurant.name}</Text>
                <Text style={[styles.city, {color: colors.textSecondary}]}>{item.restaurant.city}</Text>

                {renderStars(item.rating)}

                {item.comment && <Text style={[styles.comment, {color: colors.text}]}>{item.comment}</Text>}

                <Text style={[styles.date, {color: colors.textSecondary}]}>
                    {new Date(item.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })}
                </Text>
            </View>

            <TouchableOpacity onPress={() => handleDeleteReview(item.id)} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={20} color="#EF4444"/>
            </TouchableOpacity>
        </TouchableOpacity>
    )

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text}/>
                    </TouchableOpacity>
                    <Text style={[styles.title, {color: colors.text}]}>Mes avis</Text>
                    <View style={{width: 40}}/>
                </View>
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, {color: colors.textSecondary}]}>Chargement...</Text>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text}/>
                </TouchableOpacity>
                <Text style={[styles.title, {color: colors.text}]}>Mes avis</Text>
                <View style={{width: 40}}/>
            </View>

            {reviews.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="star-outline" size={64} color={colors.textSecondary}/>
                    <Text style={[styles.emptyTitle, {color: colors.text}]}>Aucun avis</Text>
                    <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
                        Tu n'as pas encore laissé d'avis sur les restaurants
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={reviews}
                    renderItem={renderReview}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
    },
    listContent: {
        padding: 20,
    },
    reviewCard: {
        flexDirection: "row",
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    restaurantImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    reviewContent: {
        flex: 1,
        marginLeft: 12,
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    city: {
        fontSize: 13,
        marginBottom: 8,
    },
    starsContainer: {
        flexDirection: "row",
        gap: 2,
        marginBottom: 8,
    },
    comment: {
        fontSize: 14,
        marginBottom: 8,
        lineHeight: 20,
    },
    date: {
        fontSize: 12,
    },
    deleteButton: {
        padding: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
        gap: 12,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "600",
    },
    emptyText: {
        fontSize: 15,
        textAlign: "center",
    },
})
