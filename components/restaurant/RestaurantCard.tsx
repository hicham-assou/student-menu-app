"use client"

import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { Colors } from "@/constants/Colors"
import type { Restaurant } from "@/types"

const { width } = Dimensions.get("window")

interface RestaurantCardProps {
    restaurant: Restaurant
    isFavorite: boolean
    onToggleFavorite: () => void
}

export function RestaurantCard({ restaurant, isFavorite, onToggleFavorite }: RestaurantCardProps) {
    const router = useRouter()
    const colors = Colors.light

    const getMinMenuPrice = () => {
        if (!restaurant.student_menu || restaurant.student_menu.length === 0) return null

        const prices = restaurant.student_menu.map((menu) => {
            const priceStr = menu.price.replace("€", "").replace(",", ".").trim()
            return Number.parseFloat(priceStr)
        })

        const minPrice = Math.min(...prices)
        return isNaN(minPrice) ? null : minPrice
    }

    const minPrice = getMinMenuPrice()

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push(`/restaurant/${restaurant.id}`)}
            style={[styles.card, { backgroundColor: colors.surface }]}
        >
            <View style={styles.imageWrapper}>
                <View style={styles.imageContainer}>
                    {restaurant.image ? (
                        <Image source={{ uri: restaurant.image }} style={styles.image} resizeMode="cover" />
                    ) : (
                        <View style={[styles.imagePlaceholder, { backgroundColor: colors.primary + "20" }]}>
                            <Ionicons name="restaurant" size={50} color={colors.primary} />
                        </View>
                    )}

                    {minPrice !== null && (
                        <View style={styles.priceTagContainer}>
                            <View style={[styles.priceTag, { backgroundColor: colors.primary }]}>
                                <Text style={styles.priceDes}>dès</Text>
                                <Text style={styles.priceAmount}>{minPrice.toFixed(2).replace(".", ",")}€</Text>
                                <View style={[styles.priceTriangle, { borderTopColor: colors.primary }]} />
                            </View>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.favoriteButton, { backgroundColor: "rgba(255, 255, 255, 0.98)" }]}
                        onPress={onToggleFavorite}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={isFavorite ? "heart" : "heart-outline"}
                            size={20}
                            color={isFavorite ? "#EF4444" : colors.textSecondary}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.titleSection}>
                    <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
                        {restaurant.name}
                    </Text>
                </View>

                <View style={styles.infoSection}>
                    <View style={[styles.infoPill, { backgroundColor: colors.primary + "12" }]}>
                        <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
                            <Ionicons name="location-sharp" size={12} color="#FFFFFF" />
                        </View>
                        <Text style={[styles.pillText, { color: colors.text }]} numberOfLines={1}>
                            {restaurant.city}
                        </Text>
                    </View>

                    {restaurant.student_menu && restaurant.student_menu.length > 0 && (
                        <View style={[styles.infoPill, { backgroundColor: colors.primary + "12" }]}>
                            <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
                                <Ionicons name="fast-food" size={12} color="#FFFFFF" />
                            </View>
                            <Text style={[styles.pillText, { color: colors.text }]}>
                                {restaurant.student_menu.length} menu{restaurant.student_menu.length > 1 ? "s" : ""}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        marginBottom: 12,
        marginHorizontal: 4,
        overflow: "visible",
        shadowColor: "#6366F1",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
    },
    imageWrapper: {
        overflow: "hidden",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    imageContainer: {
        width: "100%",
        height: 160,
        position: "relative",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    imagePlaceholder: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    priceTagContainer: {
        position: "absolute",
        top: 14,
        left: 0,
    },
    priceTag: {
        paddingVertical: 8,
        paddingLeft: 14,
        paddingRight: 16,
        borderTopRightRadius: 14,
        borderBottomRightRadius: 14,
        flexDirection: "row",
        alignItems: "baseline",
        gap: 4,
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 6,
    },
    priceTriangle: {
        position: "absolute",
        bottom: -6,
        left: 0,
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderLeftColor: "transparent",
        borderTopWidth: 6,
        opacity: 0.7,
    },
    priceDes: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "600",
        opacity: 0.95,
    },
    priceAmount: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "900",
        letterSpacing: -0.6,
    },
    favoriteButton: {
        position: "absolute",
        top: 14,
        right: 14,
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
    content: {
        padding: 14,
        paddingTop: 12,
    },
    titleSection: {
        marginBottom: 10,
    },
    name: {
        fontSize: 18,
        fontWeight: "800",
        letterSpacing: -0.4,
        lineHeight: 23,
    },
    infoSection: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 12,
    },
    infoPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 10,
        paddingRight: 12,
        borderRadius: 16,
    },
    iconCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    pillText: {
        fontSize: 13,
        fontWeight: "600",
        maxWidth: 140,
    },
})
