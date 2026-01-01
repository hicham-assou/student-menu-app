import {ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from "react-native"
import {SafeAreaView} from "react-native-safe-area-context"
import {useEffect, useRef, useState} from "react"
import MapView, {Circle, Marker, PROVIDER_GOOGLE} from "react-native-maps"
import * as Location from "expo-location"
import {Ionicons} from "@expo/vector-icons"
import {useRouter} from "expo-router"
import {useColorScheme} from "@/components/useColorScheme.web"
import {Colors} from "@/constants/Colors"
import {getRestaurants} from "@/lib/api"
import {calculateDistance, formatDistance} from "@/lib/utils"
import type {Restaurant} from "@/types"
import {CustomAlertManager} from "@/components/CustomAlert"

const {width, height} = Dimensions.get("window")
const ASPECT_RATIO = width / height
const LATITUDE_DELTA = 0.0922
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO

const minimalistMapStyle = [
    {
        featureType: "poi",
        elementType: "labels",
        stylers: [{visibility: "off"}],
    },
    {
        featureType: "poi.business",
        stylers: [{visibility: "off"}],
    },
    {
        featureType: "transit",
        stylers: [{visibility: "off"}],
    },
    {
        featureType: "road",
        elementType: "labels.icon",
        stylers: [{visibility: "off"}],
    },
]

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
            CustomAlertManager.alert("Erreur", "Impossible de charger les restaurants", undefined, "error")
        } finally {
            setLoading(false)
        }
    }

    const requestLocationPermission = async () => {
        try {
            const {status} = await Location.requestForegroundPermissionsAsync()
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
                "Autorise la localisation pour centrer la carte sur ta position",
                [
                    {text: "Annuler", style: "cancel"},
                    {text: "Activer", onPress: requestLocationPermission},
                ],
                "warning",
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
            CustomAlertManager.alert("Erreur", "Impossible de récupérer ta position", undefined, "error")
        }
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

    const getMarkerColor = (restaurant: Restaurant) => {
        if (!restaurant.student_menu || restaurant.student_menu.length === 0) {
            return colors.primary
        }

        const prices = restaurant.student_menu.map((item) =>
            Number.parseFloat(item.price.replace("€", "").replace(",", ".")),
        )
        const minPrice = Math.min(...prices)

        if (minPrice < 7) return "#10B981"
        if (minPrice < 10) return "#F59E0B"
        return "#EF4444"
    }

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary}/>
                    <Text style={[styles.loadingText, {color: colors.textSecondary}]}>Chargement de la carte...</Text>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={["top"]}>
            <View style={[styles.topBar, {backgroundColor: colors.background}]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
                    <TouchableOpacity
                        onPress={() => setShowRadius(!showRadius)}
                        style={[
                            styles.filterButton,
                            {
                                backgroundColor: showRadius ? colors.primary : colors.surface,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <Ionicons name="location" size={16} color={showRadius ? "#FFFFFF" : colors.text}/>
                        <Text style={[styles.filterButtonText, {color: showRadius ? "#FFFFFF" : colors.text}]}>
                            {showRadius ? `${radiusKm}km` : "Rayon"}
                        </Text>
                    </TouchableOpacity>

                    {showRadius && (
                        <View style={styles.radiusControls}>
                            <TouchableOpacity
                                onPress={() => setRadiusKm(Math.max(1, radiusKm - 1))}
                                style={[
                                    styles.radiusButton,
                                    {
                                        backgroundColor: colors.surface,
                                        borderColor: colors.border,
                                    },
                                ]}
                            >
                                <Ionicons name="remove" size={16} color={colors.text}/>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setRadiusKm(radiusKm + 1)}
                                style={[
                                    styles.radiusButton,
                                    {
                                        backgroundColor: colors.surface,
                                        borderColor: colors.border,
                                    },
                                ]}
                            >
                                <Ionicons name="add" size={16} color={colors.text}/>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={[styles.filterButton, {backgroundColor: colors.surface, borderColor: colors.border}]}>
                        <Ionicons name="restaurant" size={16} color={colors.text}/>
                        <Text
                            style={[styles.filterButtonText, {color: colors.text}]}>{filteredRestaurants.length} restos</Text>
                    </View>
                </ScrollView>
            </View>

            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={userLocation}
                showsUserLocation={hasLocationPermission}
                showsMyLocationButton={false}
                customMapStyle={minimalistMapStyle}
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
                        pinColor={getMarkerColor(restaurant)}
                    >
                        <View style={styles.customMarker}>
                            <View style={[styles.markerCircle, {backgroundColor: getMarkerColor(restaurant)}]}>
                                <Ionicons name="restaurant" size={16} color="#FFFFFF"/>
                            </View>
                        </View>
                    </Marker>
                ))}
            </MapView>

            <TouchableOpacity onPress={centerOnUser} style={[styles.locationButton, {backgroundColor: colors.surface}]}>
                <Ionicons name="locate" size={24} color={colors.primary}/>
            </TouchableOpacity>

            {selectedRestaurant && (
                <View style={[styles.restaurantCard, {backgroundColor: colors.surface}]}>
                    {selectedRestaurant.image ? (
                        <Image source={{uri: selectedRestaurant.image}} style={styles.cardImage} resizeMode="cover"/>
                    ) : (
                        <View style={[styles.cardImagePlaceholder, {backgroundColor: `${colors.primary}20`}]}>
                            <Ionicons name="restaurant" size={40} color={colors.primary}/>
                        </View>
                    )}

                    <View style={styles.cardContent}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardInfo}>
                                <Text style={[styles.cardTitle, {color: colors.text}]} numberOfLines={1}>
                                    {selectedRestaurant.name}
                                </Text>
                                <View style={styles.cardRow}>
                                    <Ionicons name="location" size={14} color={colors.textSecondary}/>
                                    <Text style={[styles.cardSubtitle, {color: colors.textSecondary}]}
                                          numberOfLines={1}>
                                        {selectedRestaurant.city} •{" "}
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
                                {selectedRestaurant.student_menu && selectedRestaurant.student_menu.length > 0 && (
                                    <View style={[styles.priceBadge, {backgroundColor: colors.primary}]}>
                                        <Text style={styles.priceText}>À partir
                                            de {selectedRestaurant.student_menu[0].price}</Text>
                                    </View>
                                )}
                            </View>
                            <TouchableOpacity onPress={() => setSelectedRestaurant(null)} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={colors.textSecondary}/>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            onPress={() => router.push(`/restaurant/${selectedRestaurant?.id}`)}
                            style={[styles.viewButton, {backgroundColor: colors.primary}]}
                        >
                            <Text style={styles.viewButtonText}>Voir les détails</Text>
                            <Ionicons name="arrow-forward" size={16} color="#FFFFFF"/>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <View style={[styles.legend, {backgroundColor: colors.surface}]}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, {backgroundColor: "#10B981"}]}/>
                    <Text style={[styles.legendText, {color: colors.text}]}>{"< 7€"}</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, {backgroundColor: "#F59E0B"}]}/>
                    <Text style={[styles.legendText, {color: colors.text}]}>7-10€</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, {backgroundColor: "#EF4444"}]}/>
                    <Text style={[styles.legendText, {color: colors.text}]}>{">10€"}</Text>
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
        paddingVertical: 12,
        zIndex: 10,
    },
    filtersContainer: {
        flexDirection: "row",
        gap: 8,
    },
    filterButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
    },
    filterButtonText: {
        fontSize: 13,
        fontWeight: "600",
    },
    radiusControls: {
        flexDirection: "row",
        gap: 8,
    },
    radiusButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        marginRight: 8,
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
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    locationButton: {
        position: "absolute",
        top: 200,
        right: 16,
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    restaurantCard: {
        position: "absolute",
        bottom: 16,
        left: 16,
        right: 16,
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    cardImage: {
        width: "100%",
        height: 150,
    },
    cardImagePlaceholder: {
        width: "100%",
        height: 150,
        justifyContent: "center",
        alignItems: "center",
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    cardInfo: {
        flex: 1,
        gap: 6,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    cardRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    cardSubtitle: {
        fontSize: 13,
        flex: 1,
    },
    priceBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    priceText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
    },
    closeButton: {
        padding: 4,
    },
    viewButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 12,
        borderRadius: 10,
    },
    viewButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
    },
    legend: {
        position: "absolute",
        top: 120,
        left: 16,
        flexDirection: "row",
        gap: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        fontSize: 11,
        fontWeight: "600",
    },
})
