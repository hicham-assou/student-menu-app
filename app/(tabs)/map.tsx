import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useEffect, useMemo, useRef, useState } from "react"
import MapView, { Circle, Marker } from "react-native-maps"
import * as Location from "expo-location"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { Colors } from "@/constants/Colors"
import { getRestaurants } from "@/lib/api"
import { calculateDistance, formatDistance } from "@/lib/utils"
import type { Restaurant } from "@/types"
import { CustomAlertManager} from "@/components/customAlert/CustomAlert";
import {useColorScheme} from "@/components/useColorScheme";

const { width, height } = Dimensions.get("window")
const ASPECT_RATIO = width / height
const LATITUDE_DELTA = 0.0922
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO

export default function MapScreen() {
    const colorScheme = useColorScheme() ?? "light"
    const colors = Colors[colorScheme]
    const router = useRouter()
    const mapRef = useRef<MapView>(null)

    const [restaurants, setRestaurants] = useState<Restaurant[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
    const [showRadius, setShowRadius] = useState(false)
    const [radiusKm, setRadiusKm] = useState(5)

    const [userLocation, setUserLocation] = useState({
        latitude: 50.8503,
        longitude: 4.3517,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
    })
    const [hasLocationPermission, setHasLocationPermission] = useState(false)

    useEffect(() => {
        loadRestaurants()
        requestLocationPermission()
    }, [])

    const loadRestaurants = async () => {
        try {
            setLoading(true)
            const data = await getRestaurants()
            setRestaurants(data)
        } catch (error) {
            console.error("Error loading restaurants:", error)
            CustomAlertManager.alert("Erreur", "Impossible de charger les restaurants", "error")
        } finally {
            setLoading(false)
        }
    }

    const requestLocationPermission = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync()

            if (status === "granted") {
                setHasLocationPermission(true)
                const location = await Location.getCurrentPositionAsync({})

                setUserLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA,
                })
                mapRef.current?.animateToRegion({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA,
                })
            }
        } catch (error) {
            console.error("Error requesting location permission:", error)
        }
    }

    const centerOnUser = async () => {
        if (!hasLocationPermission) {
            CustomAlertManager.alert(
                "Localisation désactivée",
                "Active la localisation dans les paramètres de ton téléphone pour centrer la carte sur ta position",
                "info",
            )
            return
        }

        try {
            const location = await Location.getCurrentPositionAsync({})

            const newRegion = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
            }
            setUserLocation(newRegion)
            mapRef.current?.animateToRegion(newRegion)
        } catch (error) {
            console.error("Error getting position:", error)
            CustomAlertManager.alert("Erreur", "Impossible de récupérer ta position", "error")
        }
    }

    const toggleRadiusFilter = () => {
        if (!hasLocationPermission) {
            CustomAlertManager.alert(
                "Localisation désactivée",
                "Active la localisation dans les paramètres de ton téléphone pour filtrer par rayon",
                "info",
            )
            return
        }
        setShowRadius(!showRadius)
    }

    const filteredRestaurants = restaurants.filter((restaurant) => {
        if (!showRadius) return true

        const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            restaurant.latitude,
            restaurant.longitude,
        )
        return distance <= radiusKm
    })

    const handleMarkerPress = (restaurant: Restaurant) => {
        setSelectedRestaurant(restaurant)
        mapRef.current?.animateToRegion({
            latitude: restaurant.latitude,
            longitude: restaurant.longitude,
            latitudeDelta: LATITUDE_DELTA / 2,
            longitudeDelta: LONGITUDE_DELTA / 2,
        })
    }

    const markerColors = useMemo(() => {
        const colorMap = new Map<string, string>()

        filteredRestaurants.forEach((restaurant) => {
            if (!restaurant.student_menu || restaurant.student_menu.length === 0) {
                colorMap.set(restaurant.id, colors.primary)
                return
            }

            const prices = restaurant.student_menu.map((item) =>
                Number.parseFloat(item.price.replace("€", "").replace(",", ".")),
            )
            const minPrice = Math.min(...prices)

            if (minPrice < 7) {
                colorMap.set(restaurant.id, "#10B981")
            } else if (minPrice < 10) {
                colorMap.set(restaurant.id, "#F59E0B")
            } else {
                colorMap.set(restaurant.id, "#EF4444")
            }
        })

        return colorMap
    }, [filteredRestaurants, colors.primary])

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Chargement de la carte...</Text>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: "#f5f5f5" }]} edges={["top"]}>
            <View style={styles.topBar}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
                    <TouchableOpacity
                        onPress={toggleRadiusFilter}
                        style={[styles.filterButton, showRadius && styles.filterButtonActive]}
                    >
                        <Ionicons name="location" size={18} color={showRadius ? "#FFFFFF" : "#FF6B35"} />
                        <Text style={[styles.filterButtonText, showRadius && styles.filterButtonTextActive]}>
                            {showRadius ? `${radiusKm}km` : "Rayon"}
                        </Text>
                    </TouchableOpacity>

                    {showRadius && (
                        <View style={styles.radiusControls}>
                            <TouchableOpacity onPress={() => setRadiusKm(Math.max(1, radiusKm - 1))} style={styles.radiusButton}>
                                <Ionicons name="remove" size={18} color="#333" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setRadiusKm(radiusKm + 1)} style={styles.radiusButton}>
                                <Ionicons name="add" size={18} color="#333" />
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.filterButton}>
                        <Ionicons name="restaurant" size={18} color="#FF6B35" />
                        <Text style={styles.filterButtonText}>{filteredRestaurants.length} restos</Text>
                    </View>
                </ScrollView>
            </View>

            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={userLocation}
                showsUserLocation={hasLocationPermission}
                showsMyLocationButton={false}
                userInterfaceStyle="light"
            >
                {showRadius && hasLocationPermission && (
                    <Circle
                        center={{
                            latitude: userLocation.latitude,
                            longitude: userLocation.longitude,
                        }}
                        radius={radiusKm * 1000}
                        fillColor="rgba(59, 130, 246, 0.1)"
                        strokeColor="rgba(59, 130, 246, 0.5)"
                        strokeWidth={2}
                    />
                )}

                {filteredRestaurants.map((restaurant) => (
                    <Marker
                        key={restaurant.id}
                        coordinate={{
                            latitude: restaurant.latitude,
                            longitude: restaurant.longitude,
                        }}
                        onPress={() => handleMarkerPress(restaurant)}
                        pinColor={markerColors.get(restaurant.id)}
                    >
                        <View style={styles.customMarker}>
                            <View style={[styles.markerCircle, { backgroundColor: markerColors.get(restaurant.id) }]}>
                                <Ionicons name="restaurant" size={16} color="#FFFFFF" />
                            </View>
                        </View>
                    </Marker>
                ))}
            </MapView>

            <TouchableOpacity onPress={centerOnUser} style={styles.locationButton}>
                <View style={styles.locationButtonInner}>
                    <Ionicons name="navigate" size={22} color="#FF6B35" />
                </View>
            </TouchableOpacity>

            {selectedRestaurant && (
                <View style={styles.restaurantCard}>
                    {selectedRestaurant.image ? (
                        <Image source={{ uri: selectedRestaurant.image }} style={styles.cardImage} resizeMode="cover" />
                    ) : (
                        <View style={styles.cardImagePlaceholder}>
                            <Ionicons name="restaurant" size={48} color="#FF6B35" />
                        </View>
                    )}

                    {selectedRestaurant.student_menu && selectedRestaurant.student_menu.length > 0 && (
                        <View style={styles.priceBadgeOverlay}>
                            <Text style={styles.priceTextOverlay}>{selectedRestaurant.student_menu[0].price}</Text>
                        </View>
                    )}

                    <View style={styles.cardContent}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardInfo}>
                                <Text style={styles.cardTitle} numberOfLines={1}>
                                    {selectedRestaurant.name}
                                </Text>
                                <View style={styles.cardRow}>
                                    <View style={styles.iconCircle}>
                                        <Ionicons name="location" size={12} color="#FF6B35" />
                                    </View>
                                    <Text style={styles.cardSubtitle} numberOfLines={1}>
                                        {selectedRestaurant.city}
                                    </Text>
                                    <View style={styles.dotSeparator} />
                                    <Text style={styles.cardDistance}>
                                        {formatDistance(
                                            calculateDistance(
                                                userLocation.latitude,
                                                userLocation.longitude,
                                                selectedRestaurant.latitude,
                                                selectedRestaurant.longitude,
                                            ),
                                        )}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setSelectedRestaurant(null)} style={styles.closeButton}>
                                <Ionicons name="close-circle" size={28} color="#ddd" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            onPress={() => router.push(`/restaurant/${selectedRestaurant?.id}`)}
                            style={styles.viewButton}
                        >
                            <Text style={styles.viewButtonText}>Voir le menu étudiant</Text>
                            <View style={styles.arrowCircle}>
                                <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#10B981" }]} />
                    <Text style={styles.legendText}>{"< 7€"}</Text>
                </View>
                <View style={styles.legendSeparator} />
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#F59E0B" }]} />
                    <Text style={styles.legendText}>7-10€</Text>
                </View>
                <View style={styles.legendSeparator} />
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#EF4444" }]} />
                    <Text style={styles.legendText}>{">10€"}</Text>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
    },
    loadingText: {
        fontSize: 15,
    },
    topBar: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 16,
        zIndex: 10,
        backgroundColor: "transparent",
    },
    filtersContainer: {
        flexDirection: "row",
    },
    filterButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        backgroundColor: "#FFFFFF",
        marginRight: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    filterButtonActive: {
        backgroundColor: "#FF6B35",
        shadowColor: "#FF6B35",
        shadowOpacity: 0.3,
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
    },
    filterButtonTextActive: {
        color: "#FFFFFF",
    },
    radiusControls: {
        flexDirection: "row",
        gap: 8,
    },
    radiusButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        marginRight: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    map: {
        flex: 1,
    },
    customMarker: {
        alignItems: "center",
    },
    markerCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    locationButton: {
        position: "absolute",
        top: 200,
        right: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
    },
    locationButtonInner: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    restaurantCard: {
        position: "absolute",
        bottom: 24,
        left: 16,
        right: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 12,
    },
    cardImage: {
        width: "100%",
        height: 160,
    },
    cardImagePlaceholder: {
        width: "100%",
        height: 160,
        backgroundColor: "#FFF5F0",
        justifyContent: "center",
        alignItems: "center",
    },
    priceBadgeOverlay: {
        position: "absolute",
        top: 12,
        right: 12,
        backgroundColor: "#FF6B35",
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    priceTextOverlay: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
    },
    cardContent: {
        padding: 18,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    cardInfo: {
        flex: 1,
        gap: 8,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1a1a1a",
        letterSpacing: -0.3,
    },
    cardRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    iconCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#FFF5F0",
        justifyContent: "center",
        alignItems: "center",
    },
    cardSubtitle: {
        fontSize: 13,
        color: "#666",
        fontWeight: "500",
    },
    dotSeparator: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: "#ccc",
    },
    cardDistance: {
        fontSize: 13,
        color: "#666",
        fontWeight: "500",
    },
    priceBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 14,
        marginTop: 2,
    },
    priceText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
    },
    closeButton: {
        padding: 2,
        marginLeft: 8,
    },
    viewButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingVertical: 14,
        borderRadius: 16,
        backgroundColor: "#FF6B35",
        shadowColor: "#FF6B35",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    viewButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
    },
    arrowCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "rgba(255, 255, 255, 0.25)",
        justifyContent: "center",
        alignItems: "center",
    },
    legend: {
        position: "absolute",
        top: 120,
        left: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 24,
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    legendText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#333",
    },
    legendSeparator: {
        width: 1,
        height: 14,
        backgroundColor: "#e0e0e0",
    },
})
