import { useMemo, useState } from "react"
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { Colors } from "@/constants/Colors"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRestaurants } from "@/hooks/useRestaurant"
import { useUserLocation } from "@/hooks/useUserLocation"
import { RestaurantCard } from "@/components/restaurant/RestaurantCard"
import { CustomAlertManager } from "@/components/customAlert/CustomAlert"
import { CategoryRegimeModal } from "@/components/discovery/CategoryRegimeModal"
import { isOpenNow } from "@/lib/hours"
import { calculateDistance } from "@/lib/utils"
import type { Restaurant } from "@/types"

function getMinMenuPrice(restaurant: Restaurant): number {
    if (!restaurant.student_menu || restaurant.student_menu.length === 0) return 999999
    const prices = restaurant.student_menu.map((menu) =>
        Number.parseFloat(menu.price.replace("€", "").replace(",", ".").trim()),
    )
    const min = Math.min(...prices)
    return isNaN(min) ? 999999 : min
}

export default function HomeScreen() {
    const colors = Colors.light
    const router = useRouter()
    const [search, setSearch] = useState("")
    const [priceSort, setPriceSort] = useState<"asc" | "desc" | null>(null)
    const [distanceSort, setDistanceSort] = useState(false)
    const [openNow, setOpenNow] = useState(false)
    const [filterCategories, setFilterCategories] = useState<string[]>([])
    const [filterTags, setFilterTags] = useState<string[]>([])
    const [showFilters, setShowFilters] = useState(false)
    const [locating, setLocating] = useState(false)

    const { restaurants, loading, error, refresh, toggleFavorite, isFavorite } = useRestaurants()
    const { location, requestLocation } = useUserLocation({ autoRequest: false })

    const togglePriceSort = () => {
        setDistanceSort(false)
        setPriceSort((prev) => (prev === null ? "asc" : prev === "asc" ? "desc" : null))
    }

    const toggleDistanceSort = async () => {
        if (distanceSort) {
            setDistanceSort(false)
            return
        }
        let loc = location
        if (!loc) {
            setLocating(true)
            loc = await requestLocation()
            setLocating(false)
        }
        if (loc) {
            setDistanceSort(true)
            setPriceSort(null)
        } else {
            CustomAlertManager.alert(
                "Localisation désactivée",
                "Active la localisation pour trier les restos les plus proches de toi.",
                "info",
            )
        }
    }

    // Enrichissement (prix, distance, statut ouvert)
    const enriched = useMemo(() => {
        return restaurants.map((r) => ({
            restaurant: r,
            minPrice: getMinMenuPrice(r),
            distance: location
                ? calculateDistance(location.latitude, location.longitude, r.latitude, r.longitude)
                : null,
            open: isOpenNow(r.hours),
        }))
    }, [restaurants, location])

    // Filtrage
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        return enriched.filter(({ restaurant: r, open }) => {
            if (q) {
                const haystack = `${r.name} ${r.city ?? ""} ${r.address ?? ""}`.toLowerCase()
                if (!haystack.includes(q)) return false
            }
            if (
                filterCategories.length > 0 &&
                !(r.categories || []).some((c) => filterCategories.includes(c))
            )
                return false
            if (filterTags.length > 0 && !filterTags.every((t) => (r.tags || []).includes(t))) return false
            if (openNow && !open) return false
            return true
        })
    }, [enriched, search, filterCategories, filterTags, openNow])

    // Tri
    const sorted = useMemo(() => {
        const arr = [...filtered]
        if (distanceSort && location) {
            arr.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
        } else if (priceSort) {
            arr.sort((a, b) =>
                priceSort === "asc" ? a.minPrice - b.minPrice : b.minPrice - a.minPrice,
            )
        }
        return arr
    }, [filtered, distanceSort, priceSort, location])

    const activeFilterCount = filterCategories.length + filterTags.length
    const hasActiveFilter = !!search || activeFilterCount > 0 || openNow || distanceSort

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Image source={require("@/assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
                <View style={styles.headerText}>
                    <Text style={styles.brandTitle}>Stud'Table</Text>
                    <Text style={styles.subtitle}>Le menu étudiant près de toi</Text>
                </View>
            </View>

            {/* Search + price sort */}
            <View style={styles.searchRow}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={17} color="#94A3B8" />
                    <TextInput
                        placeholder="Restaurant ou ville..."
                        placeholderTextColor="#94A3B8"
                        value={search}
                        onChangeText={setSearch}
                        style={[styles.searchInput, { color: colors.text }]}
                        returnKeyType="search"
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch("")} hitSlop={10}>
                            <Ionicons name="close-circle" size={17} color="#CBD5E1" />
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.sortButton, priceSort && { backgroundColor: colors.primary }]}
                    onPress={togglePriceSort}
                    activeOpacity={0.8}
                    accessibilityLabel="Trier par prix"
                >
                    <Text style={[styles.sortButtonText, { color: priceSort ? "#FFFFFF" : colors.text }]}>€</Text>
                    <Ionicons
                        name={priceSort === "asc" ? "arrow-up" : priceSort === "desc" ? "arrow-down" : "swap-vertical"}
                        size={13}
                        color={priceSort ? "#FFFFFF" : "#64748B"}
                    />
                </TouchableOpacity>
            </View>

            {/* Barre de filtres */}
            <View style={styles.filterWrap}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterRow}
                >
                    <Chip
                        active={distanceSort}
                        onPress={toggleDistanceSort}
                        icon="navigate"
                        label={locating ? "Localisation…" : "Près de moi"}
                        loading={locating}
                    />
                    <Chip active={openNow} onPress={() => setOpenNow((v) => !v)} icon="time" label="Ouvert" />
                    <TouchableOpacity
                        onPress={() => setShowFilters(true)}
                        activeOpacity={0.8}
                        style={[styles.chip, styles.chipIcon, activeFilterCount > 0 && styles.chipActive]}
                    >
                        <Ionicons
                            name="options-outline"
                            size={15}
                            color={activeFilterCount > 0 ? "#FFFFFF" : "#F97316"}
                        />
                        <Text style={[styles.chipText, activeFilterCount > 0 && styles.chipTextActive]}>
                            {activeFilterCount > 0 ? `Filtres (${activeFilterCount})` : "Filtres"}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {hasActiveFilter && (
                <View style={styles.resultsContainer}>
                    <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
                        {sorted.length} résultat{sorted.length > 1 ? "s" : ""}
                    </Text>
                </View>
            )}

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            <FlatList
                data={sorted}
                keyExtractor={(item) => item.restaurant.id}
                renderItem={({ item }) => (
                    <RestaurantCard
                        restaurant={item.restaurant}
                        isFavorite={isFavorite(item.restaurant.id)}
                        onToggleFavorite={() => toggleFavorite(item.restaurant.id)}
                    />
                )}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={refresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
                ListFooterComponent={
                    sorted.length > 0 ? (
                        <TouchableOpacity
                            style={styles.suggestBtn}
                            onPress={() => router.push("/suggest")}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                            <Text style={styles.suggestText}>Un resto manque ? Suggère-le</Text>
                        </TouchableOpacity>
                    ) : null
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="restaurant-outline" size={64} color={colors.textSecondary} />
                            <Text style={[styles.emptyText, { color: colors.text }]}>Aucun restaurant trouvé</Text>
                            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                                {hasActiveFilter ? "Essaie d'élargir tes filtres" : ""}
                            </Text>
                            <TouchableOpacity
                                style={styles.suggestBtnEmpty}
                                onPress={() => router.push("/suggest")}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                                <Text style={styles.suggestTextEmpty}>Suggérer un resto</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null
                }
            />

            <CategoryRegimeModal
                visible={showFilters}
                initialCategories={filterCategories}
                initialTags={filterTags}
                onClose={() => setShowFilters(false)}
                onApply={(c, t) => {
                    setFilterCategories(c)
                    setFilterTags(t)
                }}
            />
        </SafeAreaView>
    )
}

function Chip({
    active,
    onPress,
    icon,
    label,
    loading,
}: {
    active: boolean
    onPress: () => void
    icon: keyof typeof Ionicons.glyphMap
    label: string
    loading?: boolean
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={loading}
            activeOpacity={0.8}
            style={[styles.chip, styles.chipIcon, active && styles.chipActive]}
        >
            {loading ? (
                <ActivityIndicator size="small" color="#F97316" />
            ) : (
                <Ionicons name={icon} size={14} color={active ? "#FFFFFF" : "#F97316"} />
            )}
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FAFAF9",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 20,
        paddingTop: 4,
        paddingBottom: 14,
    },
    logo: {
        width: 38,
        height: 38,
    },
    headerText: {
        flex: 1,
    },
    brandTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#1C1917",
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 12.5,
        fontWeight: "500",
        color: "#78716C",
        marginTop: 1,
    },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 20,
        marginBottom: 12,
        gap: 8,
    },
    searchContainer: {
        flex: 1,
        height: 46,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        borderRadius: 16,
        gap: 8,
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        fontSize: 14.5,
        padding: 0,
        includeFontPadding: false,
    },
    sortButton: {
        height: 46,
        minWidth: 56,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
        borderRadius: 16,
        gap: 3,
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    sortButtonText: {
        fontSize: 15,
        fontWeight: "800",
    },
    filterWrap: {
        marginBottom: 8,
    },
    filterRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 20,
    },
    chip: {
        paddingHorizontal: 13,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        borderWidth: 1.5,
        borderColor: "transparent",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    chipIcon: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    chipActive: {
        backgroundColor: "#F97316",
        borderColor: "#F97316",
    },
    chipText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#1C1917",
    },
    chipTextActive: {
        color: "#FFFFFF",
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: "#ECE7E1",
        marginHorizontal: 2,
    },
    resultsContainer: {
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    resultsText: {
        fontSize: 13,
        fontWeight: "500",
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 110,
        gap: 14,
    },
    errorContainer: {
        backgroundColor: "#FEE2E2",
        marginHorizontal: 20,
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
    },
    errorText: {
        color: "#DC2626",
        textAlign: "center",
        fontWeight: "500",
        fontSize: 14,
    },
    suggestBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 16,
        marginTop: 14,
    },
    suggestText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#F97316",
    },
    emptyContainer: {
        alignItems: "center",
        paddingTop: 60,
        gap: 10,
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 17,
        fontWeight: "600",
        textAlign: "center",
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: "center",
    },
    suggestBtnEmpty: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#F97316",
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 14,
        marginTop: 10,
    },
    suggestTextEmpty: {
        color: "#FFFFFF",
        fontSize: 14.5,
        fontWeight: "700",
    },
})
