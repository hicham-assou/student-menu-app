import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import { useColorScheme } from "@/components/useColorScheme.web"
import { Colors } from "@/constants/Colors"
import { getMyRestaurants } from "@/lib/restaurants"
import type { Restaurant } from "@/types"

export default function MyRestaurantsScreen() {
    const colorScheme = useColorScheme() ?? "light"
    const colors = Colors[colorScheme]
    const router = useRouter()

    const [restaurants, setRestaurants] = useState<Restaurant[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadRestaurants()
    }, [])

    const loadRestaurants = async () => {
        try {
            const data = await getMyRestaurants()
            setRestaurants(data)
        } catch (error) {
            console.error("Error loading restaurants:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loading}>
                    <Text style={{ color: colors.textSecondary }}>Chargement...</Text>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {restaurants.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="restaurant-outline" size={64} color={colors.textSecondary} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucun restaurant pour le moment</Text>
                        </View>
                    ) : (
                        restaurants.map((restaurant) => (
                            <TouchableOpacity
                                key={restaurant.id}
                                activeOpacity={0.7}
                                onPress={() => router.push(`/restaurant/${restaurant.id}`)}
                            >
                                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                    <Image
                                        source={{
                                            uri:
                                                restaurant.image ||
                                                `https://placehold.co/400x200/F97316/FFFFFF?text=${encodeURIComponent(restaurant.name)}`,
                                        }}
                                        style={styles.image}
                                    />
                                    <View style={styles.cardContent}>
                                        <Text style={[styles.restaurantName, { color: colors.text }]}>{restaurant.name}</Text>
                                        <Text style={[styles.restaurantAddress, { color: colors.textSecondary }]}>
                                            {restaurant.address}, {restaurant.city}
                                        </Text>

                                        <View style={styles.actions}>
                                            <TouchableOpacity
                                                onPress={(e) => {
                                                    e.stopPropagation()
                                                    router.push(`/owner/edit/${restaurant.id}`)
                                                }}
                                                style={[styles.button, { backgroundColor: colors.primary }]}
                                            >
                                                <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                                                <Text style={styles.buttonText}>Modifier</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={(e) => {
                                                    e.stopPropagation()
                                                    router.push(`/owner/stats/${restaurant.id}`)
                                                }}
                                                style={[styles.button, { backgroundColor: "#10B981" }]}
                                            >
                                                <Ionicons name="stats-chart" size={18} color="#FFFFFF" />
                                                <Text style={styles.buttonText}>Statistiques</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loading: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        padding: 20,
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
        overflow: "hidden",
    },
    image: {
        width: "100%",
        height: 160,
    },
    cardContent: {
        padding: 16,
    },
    restaurantName: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 4,
    },
    restaurantAddress: {
        fontSize: 14,
        marginBottom: 16,
    },
    actions: {
        flexDirection: "row",
        gap: 12,
    },
    button: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 10,
        borderRadius: 10,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
    emptyContainer: {
        alignItems: "center",
        paddingVertical: 60,
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
    },
})
