import {
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useEffect, useMemo, useRef, useState } from "react"
import MapView, { Circle } from "react-native-maps"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { Colors } from "@/constants/Colors"
import { calculateDistance } from "@/lib/utils"
import { minMenuPrice } from "@/lib/price"
import { useRestaurantStore } from "@/stores/restaurants"
import { useUserLocation } from "@/hooks/useUserLocation"
import { CustomAlertManager } from "@/components/customAlert/CustomAlert"
import { RestaurantMarker, type PriceTier } from "@/components/map/RestaurantMarker"
import { RestaurantPreviewCard } from "@/components/map/RestaurantPreviewCard"
import { MapFilters, type MapFilterState } from "@/components/map/MapFilters"
import { LocationPermissionBanner } from "@/components/map/LocationPermissionBanner"
import { PriceLegend } from "@/components/map/PriceLegend"
import { cleanMapStyle } from "@/constants/mapStyle"
import type { Restaurant } from "@/types"

const { width, height } = Dimensions.get("window")
const ASPECT_RATIO = width / height
const LATITUDE_DELTA = 0.0922
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO

// Region par defaut (Bruxelles centre) si pas de geoloc
const DEFAULT_REGION = {
    latitude: 50.8503,
    longitude: 4.3517,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
}

interface RestaurantWithPrice extends Restaurant {
    _minPrice: number | null
    _tier: PriceTier
}

function computeTier(minPrice: number | null): PriceTier {
    if (minPrice == null) return "unknown"
    if (minPrice < 7) return "low"
    if (minPrice < 10) return "mid"
    return "high"
}

export default function MapScreen() {
    const router = useRouter()
    const colors = Colors.light
    const mapRef = useRef<MapView>(null)

    const restaurants = useRestaurantStore((s) => s.restaurants)
    const loading = useRestaurantStore((s) => s.loading)
    const fetchRestaurants = useRestaurantStore((s) => s.fetch)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [filters, setFilters] = useState<MapFilterState>({
        search: "",
        radiusEnabled: false,
        radiusKm: 5,
        price: "all",
    })

    const {
        location: userLocation,
        status: locStatus,
        requestLocation,
        openSettings,
        isAvailable: locAvailable,
    } = useUserLocation({ autoRequest: true })

    // Charger les restaurants (depuis le cache partagé si dispo)
    useEffect(() => {
        fetchRestaurants()
    }, [fetchRestaurants])

    // Centrer la carte sur l'utilisateur des qu'on a sa position
    useEffect(() => {
        if (userLocation && mapRef.current) {
            mapRef.current.animateToRegion(
                {
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA,
                },
                500,
            )
        }
    }, [userLocation])

    // Pre-calculer prix min + tier pour chaque resto (memo)
    const enrichedRestaurants = useMemo<RestaurantWithPrice[]>(() => {
        return restaurants.map((r) => {
            const minPrice = minMenuPrice(r.student_menu)
            return { ...r, _minPrice: minPrice, _tier: computeTier(minPrice) }
        })
    }, [restaurants])

    // Filtrage
    const filteredRestaurants = useMemo(() => {
        const search = filters.search.trim().toLowerCase()
        return enrichedRestaurants.filter((r) => {
            // Recherche
            if (search) {
                const haystack = `${r.name} ${r.city} ${r.address}`.toLowerCase()
                if (!haystack.includes(search)) return false
            }
            // Prix
            if (filters.price !== "all" && r._tier !== filters.price) return false
            // Rayon (uniquement si on a la position)
            if (filters.radiusEnabled && userLocation) {
                const d = calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    r.latitude,
                    r.longitude,
                )
                if (d > filters.radiusKm) return false
            }
            return true
        })
    }, [enrichedRestaurants, filters, userLocation])

    const selectedRestaurant = useMemo(
        () => filteredRestaurants.find((r) => r.id === selectedId) ?? null,
        [filteredRestaurants, selectedId],
    )

    const handleMarkerPress = (restaurant: Restaurant) => {
        setSelectedId(restaurant.id)
        // Recentre sur le pin SANS changer le zoom (evite le saut de zoom brusque)
        mapRef.current?.animateCamera(
            {
                center: {
                    latitude: restaurant.latitude,
                    longitude: restaurant.longitude,
                },
            },
            { duration: 300 },
        )
    }

    const showLocationDisabledAlert = (purpose: "radius" | "center") => {
        const message =
            purpose === "radius"
                ? "Active la localisation dans les paramètres de ton téléphone pour filtrer par rayon."
                : "Active la localisation dans les paramètres de ton téléphone pour centrer la carte sur ta position."
        CustomAlertManager.alert(
            locStatus === "denied" ? "Permission refusée" : "Localisation désactivée",
            message,
            "info",
            [
                { text: "Annuler", style: "cancel" },
                { text: "Paramètres", onPress: () => void openSettings() },
            ],
        )
    }

    const handleToggleRadius = async () => {
        if (locAvailable) {
            setFilters((f) => ({ ...f, radiusEnabled: !f.radiusEnabled }))
            return
        }
        // Si pas dispo, on tente de demander la position
        const loc = await requestLocation()
        if (loc) {
            setFilters((f) => ({ ...f, radiusEnabled: true }))
        } else {
            // Loc refusee ou GPS off : on previent l'user avec un popup
            showLocationDisabledAlert("radius")
        }
    }

    const centerOnUser = async () => {
        let loc = userLocation
        if (!loc) {
            loc = await requestLocation()
        }
        if (!loc) {
            showLocationDisabledAlert("center")
            return
        }
        mapRef.current?.animateToRegion(
            {
                latitude: loc.latitude,
                longitude: loc.longitude,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
            },
            400,
        )
    }

    if (loading && restaurants.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                        Chargement de la carte...
                    </Text>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFillObject}
                initialRegion={DEFAULT_REGION}
                showsUserLocation={locAvailable}
                showsMyLocationButton={false}
                showsCompass={false}
                showsPointsOfInterest={false}
                showsBuildings={false}
                userInterfaceStyle="light"
                customMapStyle={cleanMapStyle}
                onPress={() => setSelectedId(null)}
            >
                {filters.radiusEnabled && userLocation && (
                    <Circle
                        center={{
                            latitude: userLocation.latitude,
                            longitude: userLocation.longitude,
                        }}
                        radius={filters.radiusKm * 1000}
                        fillColor="rgba(255, 107, 53, 0.08)"
                        strokeColor="rgba(255, 107, 53, 0.4)"
                        strokeWidth={2}
                    />
                )}

                {filteredRestaurants.map((r) => (
                    <RestaurantMarker
                        key={r.id}
                        restaurant={r}
                        selected={r.id === selectedId}
                        minPrice={r._minPrice}
                        tier={r._tier}
                        onPress={handleMarkerPress}
                    />
                ))}
            </MapView>

            {/* Top safe area : filtres + banner */}
            <SafeAreaView edges={["top"]} style={styles.topOverlay} pointerEvents="box-none">
                <MapFilters
                    state={filters}
                    onChange={setFilters}
                    onToggleRadius={handleToggleRadius}
                    resultCount={filteredRestaurants.length}
                    canFilterByRadius={
                        locAvailable || locStatus === "idle" || locStatus === "requesting"
                    }
                />
                <LocationPermissionBanner
                    status={locStatus}
                    onRequest={() => void requestLocation()}
                    onOpenSettings={() => void openSettings()}
                />
            </SafeAreaView>

            {/* Bouton centrer sur user (en bas-droite, au-dessus de la card si visible) */}
            <TouchableOpacity
                onPress={centerOnUser}
                activeOpacity={0.85}
                style={[
                    styles.locationFab,
                    selectedRestaurant ? styles.locationFabRaised : null,
                ]}
            >
                <Ionicons
                    name={locAvailable ? "navigate" : "navigate-outline"}
                    size={20}
                    color={locAvailable ? "#FF6B35" : "#94A3B8"}
                />
            </TouchableOpacity>

            {/* Legende prix (en bas-gauche, cachee si card affichee) */}
            {!selectedRestaurant && (
                <View style={styles.legendWrapper} pointerEvents="none">
                    <PriceLegend />
                </View>
            )}

            {/* Card resto selectionne */}
            {selectedRestaurant && (
                <RestaurantPreviewCard
                    restaurant={selectedRestaurant}
                    userLocation={userLocation}
                    onClose={() => setSelectedId(null)}
                    onViewDetails={(id) => router.push(`/restaurant/${id}`)}
                />
            )}

            {/* Empty state si filtres trop restrictifs */}
            {filteredRestaurants.length === 0 && !selectedRestaurant && (
                <View style={styles.emptyOverlay} pointerEvents="none">
                    <View style={styles.emptyCard}>
                        <Ionicons name="search" size={28} color="#94A3B8" />
                        <Text style={styles.emptyTitle}>Aucun resto trouvé</Text>
                        <Text style={styles.emptyMsg}>
                            Essaye d'élargir tes filtres ou ta zone de recherche.
                        </Text>
                    </View>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F1F5F9",
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
    topOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    locationFab: {
        position: "absolute",
        bottom: 106,
        right: 16,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#FFF",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 8,
    },
    locationFabRaised: {
        // Quand la card du resto est visible, on remonte le FAB au-dessus
        bottom: 390,
    },
    legendWrapper: {
        position: "absolute",
        bottom: 106,
        left: 16,
    },
    emptyOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyCard: {
        backgroundColor: "#FFF",
        paddingHorizontal: 24,
        paddingVertical: 22,
        borderRadius: 18,
        alignItems: "center",
        gap: 8,
        maxWidth: 280,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
        elevation: 6,
    },
    emptyTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1a1a1a",
        marginTop: 4,
    },
    emptyMsg: {
        fontSize: 12.5,
        color: "#64748B",
        textAlign: "center",
        lineHeight: 17,
    },
})
