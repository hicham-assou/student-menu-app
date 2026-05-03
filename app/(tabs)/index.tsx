import {useState} from "react"
import {FlatList, Image, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native"
import {Ionicons} from "@expo/vector-icons"
import {Colors} from "@/constants/Colors"
import {SafeAreaView} from "react-native-safe-area-context"
import {useRestaurants} from "@/hooks/useRestaurant"
import {RestaurantCard} from "@/components/restaurant/RestaurantCard"
import type {Restaurant} from "@/types"

export default function HomeScreen() {
    const colors = Colors.light
    const [search, setSearch] = useState("")
    const [priceSort, setPriceSort] = useState<"asc" | "desc" | null>(null)

    const {restaurants, loading, error, refresh, toggleFavorite, isFavorite} = useRestaurants()

    const togglePriceSort = () => {
        if (priceSort === null) {
            setPriceSort("asc")
        } else if (priceSort === "asc") {
            setPriceSort("desc")
        } else {
            setPriceSort(null)
        }
    }

    const getMinMenuPrice = (restaurant: Restaurant) => {
        if (!restaurant.student_menu || restaurant.student_menu.length === 0) return 999999

        const prices = restaurant.student_menu.map((menu) => {
            const priceStr = menu.price.replace("€", "").replace(",", ".").trim()
            return Number.parseFloat(priceStr)
        })

        const minPrice = Math.min(...prices)
        return isNaN(minPrice) ? 999999 : minPrice
    }

    const filteredRestaurants = restaurants.filter((restaurant) => {
        if (!search.trim()) return true
        const searchLower = search.toLowerCase().trim()

        const nameMatch = restaurant.name.toLowerCase().includes(searchLower)
        const cityMatch = restaurant.city?.toLowerCase().includes(searchLower) || false
        const addressMatch = restaurant.address?.toLowerCase().includes(searchLower) || false

        return nameMatch || cityMatch || addressMatch
    })

    const sortedRestaurants = priceSort
        ? [...filteredRestaurants].sort((a, b) => {
            const aPrice = getMinMenuPrice(a)
            const bPrice = getMinMenuPrice(b)
            return priceSort === "asc" ? aPrice - bPrice : bPrice - aPrice
        })
        : filteredRestaurants

    return (
        <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Image source={require("@/assets/images/logo.png")} style={styles.logo} resizeMode="contain"/>
                    <Text style={[styles.title, {color: colors.text}]}>Stud'Table</Text>
                </View>
            </View>

            <View style={styles.searchRow}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={17} color="#94A3B8"/>
                    <TextInput
                        placeholder="Restaurant ou ville..."
                        placeholderTextColor="#94A3B8"
                        value={search}
                        onChangeText={setSearch}
                        style={[styles.searchInput, {color: colors.text}]}
                        returnKeyType="search"
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch("")} hitSlop={10}>
                            <Ionicons name="close-circle" size={17} color="#CBD5E1"/>
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                    style={[
                        styles.sortButton,
                        priceSort && {backgroundColor: colors.primary},
                    ]}
                    onPress={togglePriceSort}
                    activeOpacity={0.8}
                    accessibilityLabel="Trier par prix"
                >
                    <Text
                        style={[
                            styles.sortButtonText,
                            {color: priceSort ? "#FFFFFF" : colors.text},
                        ]}
                    >
                        €
                    </Text>
                    <Ionicons
                        name={
                            priceSort === "asc"
                                ? "arrow-up"
                                : priceSort === "desc"
                                    ? "arrow-down"
                                    : "swap-vertical"
                        }
                        size={13}
                        color={priceSort ? "#FFFFFF" : "#64748B"}
                    />
                </TouchableOpacity>
            </View>

            {search.length > 0 && (
                <View style={styles.resultsContainer}>
                    <Text style={[styles.resultsText, {color: colors.textSecondary}]}>
                        {sortedRestaurants.length} résultat{sortedRestaurants.length > 1 ? "s" : ""}
                    </Text>
                </View>
            )}

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            <FlatList
                data={sortedRestaurants}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => (
                    <RestaurantCard
                        restaurant={item}
                        isFavorite={isFavorite(item.id)}
                        onToggleFavorite={() => toggleFavorite(item.id)}
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
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="restaurant-outline" size={64} color={colors.textSecondary}/>
                            <Text style={[styles.emptyText, {color: colors.text}]}>Aucun restaurant trouvé</Text>
                            <Text style={[styles.emptySubtext, {color: colors.textSecondary}]}>
                                {search ? "Essaie une autre recherche" : ""}
                            </Text>
                        </View>
                    ) : null
                }
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 12,
    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    logo: {
        width: 60,
        height: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        letterSpacing: -0.5,
    },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 20,
        marginBottom: 16,
        gap: 8,
    },
    searchContainer: {
        flex: 1,
        height: 44,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 13,
        borderRadius: 14,
        gap: 8,
        backgroundColor: "#F1F5F9",
    },
    searchInput: {
        flex: 1,
        fontSize: 14.5,
        padding: 0,
        includeFontPadding: false,
    },
    sortButton: {
        height: 44,
        minWidth: 56,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
        borderRadius: 14,
        gap: 3,
        backgroundColor: "#F1F5F9",
    },
    sortButtonText: {
        fontSize: 15,
        fontWeight: "800",
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
        paddingHorizontal: 20,
        paddingBottom: 20,
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
})
