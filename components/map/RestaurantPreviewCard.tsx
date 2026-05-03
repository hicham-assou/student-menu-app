import { useEffect, useRef } from "react"
import {
    Animated,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import type { Restaurant } from "@/types"
import { calculateDistance, formatDistance, openDirections } from "@/lib/utils"

interface RestaurantPreviewCardProps {
    restaurant: Restaurant
    userLocation: { latitude: number; longitude: number } | null
    onClose: () => void
    onViewDetails: (id: string) => void
}

export function RestaurantPreviewCard({
    restaurant,
    userLocation,
    onClose,
    onViewDetails,
}: RestaurantPreviewCardProps) {
    const translateY = useRef(new Animated.Value(60)).current
    const opacity = useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.parallel([
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                friction: 9,
                tension: 60,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start()
    }, [restaurant.id, translateY, opacity])

    const distance = userLocation
        ? formatDistance(
              calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  restaurant.latitude,
                  restaurant.longitude,
              ),
          )
        : null

    const previewMenu = restaurant.student_menu?.slice(0, 2) ?? []

    return (
        <Animated.View
            style={[styles.card, { opacity, transform: [{ translateY }] }]}
            pointerEvents="box-none"
        >
            {/* Image header avec gradient et close */}
            <View style={styles.imageWrapper}>
                {restaurant.image ? (
                    <Image
                        source={{ uri: restaurant.image }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="restaurant" size={40} color="#FF6B35" />
                    </View>
                )}
                <LinearGradient
                    colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.55)"]}
                    style={StyleSheet.absoluteFillObject}
                />

                <Pressable
                    onPress={onClose}
                    style={styles.closeBtn}
                    hitSlop={10}
                    accessibilityLabel="Fermer"
                >
                    <Ionicons name="close" size={20} color="#1a1a1a" />
                </Pressable>

                <View style={styles.imageOverlay}>
                    <Text style={styles.title} numberOfLines={1}>
                        {restaurant.name}
                    </Text>
                    <View style={styles.subRow}>
                        <Ionicons name="location-outline" size={13} color="#FFF" />
                        <Text style={styles.subtitle} numberOfLines={1}>
                            {restaurant.city}
                        </Text>
                        {distance && (
                            <>
                                <View style={styles.dot} />
                                <Text style={styles.subtitle}>{distance}</Text>
                            </>
                        )}
                    </View>
                </View>
            </View>

            {/* Menu preview */}
            {previewMenu.length > 0 && (
                <View style={styles.menuSection}>
                    {previewMenu.map((item, i) => (
                        <View key={`${item.title}-${i}`} style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <View style={styles.menuBullet} />
                                <Text style={styles.menuTitle} numberOfLines={1}>
                                    {item.title}
                                </Text>
                            </View>
                            <Text style={styles.menuPrice}>{item.price}</Text>
                        </View>
                    ))}
                    {restaurant.student_menu.length > previewMenu.length && (
                        <Text style={styles.menuMore}>
                            +{restaurant.student_menu.length - previewMenu.length} autre
                            {restaurant.student_menu.length - previewMenu.length > 1 ? "s" : ""}
                        </Text>
                    )}
                </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.actionSecondary]}
                    onPress={() =>
                        openDirections(
                            restaurant.latitude,
                            restaurant.longitude,
                            restaurant.address,
                        )
                    }
                    activeOpacity={0.85}
                >
                    <Ionicons name="navigate" size={16} color="#FF6B35" />
                    <Text style={styles.actionSecondaryText}>Itinéraire</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, styles.actionPrimary]}
                    onPress={() => onViewDetails(restaurant.id)}
                    activeOpacity={0.85}
                >
                    <Text style={styles.actionPrimaryText}>Voir le menu</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFF" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    card: {
        position: "absolute",
        bottom: 24,
        left: 16,
        right: 16,
        backgroundColor: "#FFF",
        borderRadius: 22,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
        elevation: 12,
    },
    imageWrapper: {
        height: 130,
        position: "relative",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    imagePlaceholder: {
        width: "100%",
        height: "100%",
        backgroundColor: "#FFF5F0",
        justifyContent: "center",
        alignItems: "center",
    },
    closeBtn: {
        position: "absolute",
        top: 10,
        right: 10,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "rgba(255,255,255,0.95)",
        justifyContent: "center",
        alignItems: "center",
    },
    imageOverlay: {
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 12,
        gap: 5,
    },
    title: {
        color: "#FFF",
        fontSize: 19,
        fontWeight: "800",
        letterSpacing: -0.3,
    },
    subRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    subtitle: {
        color: "rgba(255,255,255,0.95)",
        fontSize: 12.5,
        fontWeight: "500",
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: "rgba(255,255,255,0.7)",
        marginHorizontal: 3,
    },
    menuSection: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 6,
        gap: 6,
    },
    menuItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    menuItemLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flex: 1,
        marginRight: 8,
    },
    menuBullet: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: "#FF6B35",
    },
    menuTitle: {
        fontSize: 13.5,
        color: "#1a1a1a",
        fontWeight: "500",
        flex: 1,
    },
    menuPrice: {
        fontSize: 13.5,
        color: "#FF6B35",
        fontWeight: "700",
    },
    menuMore: {
        fontSize: 11.5,
        color: "#94A3B8",
        fontWeight: "600",
        marginTop: 2,
    },
    actions: {
        flexDirection: "row",
        gap: 10,
        padding: 14,
        paddingTop: 10,
    },
    actionBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        paddingVertical: 12,
        borderRadius: 14,
    },
    actionSecondary: {
        backgroundColor: "#FFF5F0",
        borderWidth: 1,
        borderColor: "#FFE4D6",
    },
    actionSecondaryText: {
        color: "#FF6B35",
        fontSize: 13.5,
        fontWeight: "700",
    },
    actionPrimary: {
        backgroundColor: "#FF6B35",
        shadowColor: "#FF6B35",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    actionPrimaryText: {
        color: "#FFF",
        fontSize: 13.5,
        fontWeight: "700",
    },
})
