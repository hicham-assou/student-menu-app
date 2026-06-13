"use client"

import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { formatPrice, minMenuPrice } from "@/lib/price"
import type { Restaurant } from "@/types"

interface RestaurantCardProps {
    restaurant: Restaurant
    isFavorite: boolean
    onToggleFavorite: () => void
}

export function RestaurantCard({ restaurant, isFavorite, onToggleFavorite }: RestaurantCardProps) {
    const router = useRouter()

    const minPrice = minMenuPrice(restaurant.student_menu)
    const menuCount = restaurant.student_menu?.length ?? 0

    return (
        <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => router.push(`/restaurant/${restaurant.id}`)}
            style={styles.card}
        >
            {/* Image ou placeholder */}
            {restaurant.image ? (
                <Image source={{ uri: restaurant.image }} style={styles.image} resizeMode="cover" />
            ) : (
                <View style={styles.placeholder}>
                    <Ionicons name="restaurant" size={52} color="rgba(255,255,255,0.55)" />
                </View>
            )}

            {/* Gradient overlay bas */}
            <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.22)", "rgba(0,0,0,0.78)"]}
                locations={[0.3, 0.6, 1]}
                style={styles.gradient}
            />

            {/* Bouton favori — haut droite */}
            <TouchableOpacity
                style={styles.heartBtn}
                onPress={onToggleFavorite}
                activeOpacity={0.75}
                hitSlop={8}
            >
                <Ionicons
                    name={isFavorite ? "heart" : "heart-outline"}
                    size={19}
                    color={isFavorite ? "#EF4444" : "#FFFFFF"}
                />
            </TouchableOpacity>

            {/* Badge nombre de menus — haut gauche */}
            {menuCount > 0 && (
                <View style={styles.menuBadge}>
                    <Ionicons name="restaurant" size={11} color="#F97316" />
                    <Text style={styles.menuBadgeText}>
                        {menuCount} menu{menuCount > 1 ? "s" : ""}
                    </Text>
                </View>
            )}

            {/* Infos en bas */}
            <View style={styles.info}>
                <View style={styles.infoLeft}>
                    <Text style={styles.name} numberOfLines={1}>
                        {restaurant.name}
                    </Text>
                    <View style={styles.cityRow}>
                        <Ionicons name="location-sharp" size={11} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.city} numberOfLines={1}>
                            {restaurant.city}
                        </Text>
                    </View>
                </View>

                {minPrice !== null && (
                    <View style={styles.pricePill}>
                        <Text style={styles.priceFrom}>dès</Text>
                        <Text style={styles.priceValue}>{formatPrice(minPrice)}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    )
}


const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        overflow: "hidden",
        height: 210,
        backgroundColor: "#E8D5C4",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    image: {
        width: "100%",
        height: "100%",
    },
    placeholder: {
        width: "100%",
        height: "100%",
        backgroundColor: "#D4A27A",
        justifyContent: "center",
        alignItems: "center",
    },
    gradient: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: "75%",
    },
    heartBtn: {
        position: "absolute",
        top: 14,
        right: 14,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    menuBadge: {
        position: "absolute",
        top: 14,
        left: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.92)",
    },
    menuBadgeText: {
        fontSize: 11.5,
        fontWeight: "700",
        color: "#1C1917",
    },
    info: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 10,
        gap: 10,
    },
    infoLeft: {
        flex: 1,
        gap: 4,
    },
    name: {
        fontSize: 18,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: -0.3,
    },
    cityRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    city: {
        fontSize: 12.5,
        fontWeight: "500",
        color: "rgba(255,255,255,0.75)",
    },
    pricePill: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 3,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: "#F97316",
    },
    priceFrom: {
        fontSize: 11,
        fontWeight: "600",
        color: "rgba(255,255,255,0.85)",
    },
    priceValue: {
        fontSize: 16,
        fontWeight: "800",
        color: "#FFFFFF",
    },
})
