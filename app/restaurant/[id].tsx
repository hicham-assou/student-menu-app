import {
    Animated,
    Dimensions,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Linking,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useCallback, useEffect, useRef, useState } from "react"
import { Colors } from "@/constants/Colors"
import { useAuth } from "@/contexts/AuthContext"
import { getRestaurants } from "@/lib/api"
import { isFavorite as checkFavorite, toggleFavorite } from "@/lib/favorites"
import { getRestaurantReviews, getRestaurantReviewStats, getUserReview } from "@/lib/reviews"
import { isRestaurantOwner } from "@/lib/restaurants"
import { trackEvent } from "@/lib/analytics"
import { ReviewStats } from "@/components/reviews/ReviewStats"
import { ReviewForm } from "@/components/reviews/ReviewForm"
import { ReviewCard } from "@/components/reviews/ReviewCard"
import { AuthModal } from "@/components/ui/AutoModal"
import { useNavigation } from "expo-router"
import { CustomAlertManager } from "@/components/customAlert/CustomAlert"
import type { Restaurant, Review } from "@/types"
import { LinearGradient } from "expo-linear-gradient"

const { width } = Dimensions.get("window")
const MENU_CARD_WIDTH = width * 0.72
const MENU_CARD_SPACING = 14

const palette = {
    orange: "#F97316",
    orangeLight: "#FDBA74",
    orangeSoft: "#FFF7ED",
    amber: "#F59E0B",
    amberSoft: "#FEF3C7",
    dark: "#1C1917",
    darkSoft: "#292524",
    gray50: "#FAFAF9",
    gray100: "#F5F5F4",
    gray200: "#E7E5E4",
    gray400: "#A8A29E",
    gray500: "#78716C",
    gray600: "#57534E",
    white: "#FFFFFF",
    red: "#EF4444",
    green: "#22C55E",
}

export default function RestaurantDetailScreen() {
    const colors = Colors.light
    const { id } = useLocalSearchParams<{ id: string }>()
    const router = useRouter()
    const navigation = useNavigation()
    const { user } = useAuth()

    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
    const [reviews, setReviews] = useState<Review[]>([])
    const [stats, setStats] = useState({ average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } })
    const [userReview, setUserReview] = useState<Review | null>(null)
    const [isFav, setIsFav] = useState(false)
    const [loading, setLoading] = useState(true)
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [showAllReviews, setShowAllReviews] = useState(false)
    const [isOwner, setIsOwner] = useState(false)
    const [activeMenuIndex, setActiveMenuIndex] = useState(0)

    const scrollY = useRef(new Animated.Value(0)).current
    const menuScrollRef = useRef<ScrollView>(null)
    const mainScrollRef = useRef<ScrollView>(null)
    const reviewFormRef = useRef<View>(null)

    const loadRestaurant = useCallback(async () => {
        if (!id) return
        try {
            const restaurants = await getRestaurants()
            const found = restaurants.find((r) => r.id === id)
            setRestaurant(found || null)
        } catch (error) {
            console.error("Error loading restaurant:", error)
        }
    }, [id])

    const loadReviews = useCallback(async () => {
        if (!id) return
        try {
            const [reviewsData, statsData, userReviewData] = await Promise.all([
                getRestaurantReviews(id),
                getRestaurantReviewStats(id),
                getUserReview(id),
            ])
            setReviews(reviewsData)
            setStats(statsData)
            setUserReview(userReviewData)
        } catch (error) {
            console.error("Error loading reviews:", error)
        }
    }, [id])

    const loadFavorite = useCallback(async () => {
        if (!id || !user) {
            setIsFav(false)
            return
        }
        try {
            const favorite = await checkFavorite(id)
            setIsFav(favorite)
        } catch (error) {
            console.error("Error checking favorite:", error)
        }
    }, [id, user])

    const checkOwnership = useCallback(async () => {
        if (!id || !user) {
            setIsOwner(false)
            return
        }
        try {
            const ownerStatus = await isRestaurantOwner(id)
            setIsOwner(ownerStatus)
        } catch (error) {
            console.error("Error checking ownership:", error)
            setIsOwner(false)
        }
    }, [id, user])

    const loadData = useCallback(async () => {
        setLoading(true)
        await Promise.all([loadRestaurant(), loadReviews(), loadFavorite(), checkOwnership()])
        setLoading(false)
    }, [loadRestaurant, loadReviews, loadFavorite, checkOwnership])

    useEffect(() => {
        loadData()
    }, [loadData])

    useEffect(() => {
        if (restaurant) {
            navigation.setOptions({ title: restaurant.name })
        }
    }, [restaurant, navigation])

    useEffect(() => {
        if (id) {
            trackEvent(id, "view")
        }
    }, [id])

    // Scroll vers le formulaire d'avis quand le clavier s'ouvre
    useEffect(() => {
        const keyboardDidShow = Keyboard.addListener("keyboardDidShow", () => {
            if (showReviewForm && mainScrollRef.current) {
                (mainScrollRef.current as any)?.scrollToEnd({ animated: true })
            }
        })

        return () => {
            keyboardDidShow.remove()
        }
    }, [showReviewForm])

    const handleToggleFavorite = async () => {
        if (!user) {
            setShowAuthModal(true)
            return
        }
        if (!id) return
        try {
            const newFavState = await toggleFavorite(id)
            setIsFav(newFavState)
            await trackEvent(id, newFavState ? "favorite" : "unfavorite")
        } catch (error) {
            CustomAlertManager.alert("Erreur", "Impossible de modifier le favori", "error")
        }
    }

    const handleAddReview = () => {
        if (!user) {
            setShowAuthModal(true)
            return
        }
        setShowReviewForm(true)
        // Scroll vers le formulaire apres un court delai
        setTimeout(() => {
            if (mainScrollRef.current) {
                (mainScrollRef.current as any)?.scrollToEnd({ animated: true })
            }
        }, 300)
    }

    const handleReviewSuccess = () => {
        setShowReviewForm(false)
        loadReviews()
    }

    const handleCall = () => {
        if (restaurant?.phone) {
            if (id) trackEvent(id, "call")
            Linking.openURL(`tel:${restaurant.phone}`)
        }
    }

    const handleDirections = () => {
        if (restaurant) {
            if (id) trackEvent(id, "directions")
            const url = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`
            Linking.openURL(url)
        }
    }

    const handleMenuScroll = (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x
        const index = Math.round(offsetX / (MENU_CARD_WIDTH + MENU_CARD_SPACING))
        setActiveMenuIndex(index)
    }

    if (loading || !restaurant) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loading}>
                    <View style={styles.loadingPulse}>
                        <Ionicons name="restaurant-outline" size={32} color={palette.orange} />
                    </View>
                    <Text style={{ color: colors.textSecondary, marginTop: 16, fontSize: 15 }}>Chargement...</Text>
                </View>
            </SafeAreaView>
        )
    }

    const sortedMenus = [...(restaurant.student_menu || [])].sort((a, b) => {
        const priceA = Number.parseFloat(a.price.replace("€", "").replace(",", "."))
        const priceB = Number.parseFloat(b.price.replace("€", "").replace(",", "."))
        return priceA - priceB
    })

    const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3)

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["bottom"]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <Animated.ScrollView
                    ref={mainScrollRef}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
                        useNativeDriver: true,
                    })}
                    scrollEventThrottle={16}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={loadData}
                            tintColor={palette.orange}
                            colors={[palette.orange]}
                        />
                    }
                >
                    {/* Hero Image */}
                    <View style={styles.heroContainer}>
                        <Animated.Image
                            source={{
                                uri:
                                    restaurant.image ||
                                    `https://placehold.co/800x400/F97316/FFFFFF?text=${encodeURIComponent(restaurant.name)}`,
                            }}
                            style={[
                                styles.heroImage,
                                {
                                    transform: [
                                        {
                                            translateY: scrollY.interpolate({
                                                inputRange: [-200, 0, 200],
                                                outputRange: [-50, 0, 40],
                                                extrapolate: "clamp",
                                            }),
                                        },
                                        {
                                            scale: scrollY.interpolate({
                                                inputRange: [-200, 0],
                                                outputRange: [1.4, 1],
                                                extrapolateRight: "clamp",
                                            }),
                                        },
                                    ],
                                },
                            ]}
                            resizeMode="cover"
                        />
                        <LinearGradient
                            colors={["transparent", "rgba(0,0,0,0.75)"]}
                            style={styles.heroGradient}
                        />

                        <View style={styles.heroTopBar}>
                            <View style={{ flex: 1 }} />
                            <View style={styles.heroTopRight}>
                                {isOwner && (
                                    <TouchableOpacity onPress={() => router.push(`/owner/edit/${id}`)} style={styles.heroBtn}>
                                        <Ionicons name="create-outline" size={20} color={palette.white} />
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity onPress={handleToggleFavorite} style={styles.heroBtn}>
                                    <Ionicons
                                        name={isFav ? "heart" : "heart-outline"}
                                        size={22}
                                        color={isFav ? palette.red : palette.white}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.heroBottom}>
                            <Text style={styles.heroName}>{restaurant.name}</Text>
                            {stats.total > 0 && (
                                <View style={styles.heroRating}>
                                    <Ionicons name="star" size={14} color={palette.amber} />
                                    <Text style={styles.heroRatingText}>{stats.average.toFixed(1)}</Text>
                                    <Text style={styles.heroRatingCount}>({stats.total} avis)</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Floating Info Card */}
                    <View style={styles.floatingCard}>
                        <View style={styles.infoGrid}>
                            <View style={styles.infoItem}>
                                <View style={[styles.infoIconCircle, { backgroundColor: palette.orangeSoft }]}>
                                    <Ionicons name="location" size={18} color={palette.orange} />
                                </View>
                                <View style={styles.infoItemContent}>
                                    <Text style={styles.infoLabel}>Adresse</Text>
                                    <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>
                                        {restaurant.address}, {restaurant.city}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.infoItem}>
                                <View style={[styles.infoIconCircle, { backgroundColor: palette.orangeSoft }]}>
                                    <Ionicons name="time" size={18} color={palette.orange} />
                                </View>
                                <View style={styles.infoItemContent}>
                                    <Text style={styles.infoLabel}>Horaires</Text>
                                    <Text style={[styles.infoValue, { color: colors.text }]}>{restaurant.opening_hours}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.actionRow}>
                            {restaurant.phone && (
                                <TouchableOpacity onPress={handleCall} style={styles.actionBtnCall} activeOpacity={0.8}>
                                    <Ionicons name="call" size={18} color={palette.white} />
                                    <Text style={styles.actionBtnCallText}>Appeler</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={handleDirections} style={styles.actionBtnDir} activeOpacity={0.8}>
                                <Ionicons name="navigate" size={18} color={palette.orange} />
                                <Text style={styles.actionBtnDirText}>Itineraire</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Student Menu Section */}
                    {restaurant.student_menu && restaurant.student_menu.length > 0 && (
                        <View style={styles.menuSection}>
                            <View style={styles.menuSectionHeader}>
                                <View>
                                    <View style={styles.menuTitleRow}>
                                        <View style={[styles.menuIconBg, { backgroundColor: palette.orangeSoft }]}>
                                            <Ionicons name="school" size={20} color={palette.orange} />
                                        </View>
                                        <Text style={[styles.menuSectionTitle, { color: colors.text }]}>Menus Etudiants</Text>
                                    </View>
                                    <Text style={styles.menuSubtitle}>
                                        {sortedMenus.length} menu{sortedMenus.length > 1 ? "s" : ""} disponible{sortedMenus.length > 1 ? "s" : ""}
                                    </Text>
                                </View>
                                <View style={styles.offreBadge}>
                                    <Ionicons name="flash" size={12} color={palette.amber} />
                                    <Text style={styles.offreBadgeText}>Offre speciale</Text>
                                </View>
                            </View>

                            <ScrollView
                                ref={menuScrollRef}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                snapToInterval={MENU_CARD_WIDTH + MENU_CARD_SPACING}
                                decelerationRate="fast"
                                contentContainerStyle={styles.menuCarousel}
                                onScroll={handleMenuScroll}
                                scrollEventThrottle={16}
                            >
                                {sortedMenus.map((item, index) => (
                                    <View key={index} style={styles.menuCardOuter}>
                                        <View
                                            style={[
                                                styles.menuCard,
                                                {
                                                    backgroundColor: colors.surface || palette.white,
                                                },
                                            ]}
                                        >
                                            {item.image_url ? (
                                                <View style={styles.menuCardImageWrap}>
                                                    <Image source={{ uri: item.image_url }} style={styles.menuCardImage} resizeMode="cover" />
                                                    <View style={styles.menuPriceFloat}>
                                                        <Text style={styles.menuPriceFloatText}>{item.price}</Text>
                                                    </View>
                                                </View>
                                            ) : (
                                                <View style={[styles.menuCardImageWrap, styles.menuCardPlaceholder]}>
                                                    <View style={styles.menuPlaceholderInner}>
                                                        <Ionicons name="restaurant" size={36} color={palette.orange} />
                                                    </View>
                                                    <View style={styles.menuPriceFloat}>
                                                        <Text style={styles.menuPriceFloatText}>{item.price}</Text>
                                                    </View>
                                                </View>
                                            )}

                                            <View style={styles.menuCardBody}>
                                                <View style={styles.menuTagRow}>
                                                    <View style={[styles.menuTag, { backgroundColor: palette.orangeSoft }]}>
                                                        <Text style={[styles.menuTagText, { color: palette.orange }]}>Menu #{index + 1}</Text>
                                                    </View>
                                                    <View style={[styles.menuTag, { backgroundColor: palette.amberSoft }]}>
                                                        <Ionicons name="flash" size={11} color={palette.amber} />
                                                        <Text style={[styles.menuTagText, { color: "#92400E" }]}>Bon plan</Text>
                                                    </View>
                                                </View>

                                                <Text style={[styles.menuCardTitle, { color: colors.text }]} numberOfLines={3}>
                                                    {item.title}
                                                </Text>

                                                <View style={styles.menuCardFooter}>
                                                    <Text style={styles.menuCardPriceLabel}>Prix etudiant</Text>
                                                    <Text style={[styles.menuCardPriceValue, { color: palette.orange }]}>{item.price}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>

                            {sortedMenus.length > 1 && (
                                <View style={styles.dotRow}>
                                    {sortedMenus.map((_, i) => (
                                        <View
                                            key={i}
                                            style={[
                                                styles.dot,
                                                i === activeMenuIndex
                                                    ? { backgroundColor: palette.orange, width: 20 }
                                                    : { backgroundColor: palette.gray200, width: 8 },
                                            ]}
                                        />
                                    ))}
                                </View>
                            )}

                            <View style={styles.studentCardInfo}>
                                <Ionicons name="card-outline" size={18} color={palette.orange} />
                                <Text style={[styles.studentCardInfoText, { color: colors.text }]}>
                                    Presente ta carte etudiante pour beneficier de ces prix
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Description */}
                    {restaurant.description && (
                        <View style={styles.descSection}>
                            <Text style={[styles.descTitle, { color: colors.text }]}>A propos</Text>
                            <Text style={[styles.descText, { color: colors.textSecondary }]}>{restaurant.description}</Text>
                        </View>
                    )}

                    <View style={[styles.divider, { backgroundColor: colors.border || palette.gray200 }]} />

                    {/* Reviews Section */}
                    <View style={styles.reviewsSection}>
                        <View style={styles.reviewsHeader}>
                            <View>
                                <Text style={[styles.reviewsTitle, { color: colors.text }]}>
                                    Avis {stats.total > 0 && `(${stats.total})`}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={handleAddReview} style={styles.addReviewBtn} activeOpacity={0.8}>
                                <Ionicons name="add" size={18} color={palette.white} />
                                <Text style={styles.addReviewBtnText}>Ajouter</Text>
                            </TouchableOpacity>
                        </View>

                        {stats.total > 0 && <ReviewStats average={stats.average} total={stats.total} />}

                        {showReviewForm && (
                            <View ref={reviewFormRef}>
                                <ReviewForm
                                    restaurantId={id!}
                                    existingReview={userReview}
                                    onSuccess={handleReviewSuccess}
                                    onCancel={() => setShowReviewForm(false)}
                                />
                            </View>
                        )}

                        {reviews.length === 0 && !showReviewForm && (
                            <View style={styles.noReviewsContainer}>
                                <Ionicons name="chatbubble-outline" size={40} color={palette.gray400} />
                                <Text style={[styles.noReviews, { color: colors.textSecondary }]}>
                                    Aucun avis pour le moment.{"\n"}Sois le premier a en laisser un !
                                </Text>
                            </View>
                        )}

                        {displayedReviews.map((review) => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                onDeleted={loadReviews}
                                onEdit={() => setShowReviewForm(true)}
                            />
                        ))}

                        {reviews.length > 3 && (
                            <TouchableOpacity
                                onPress={() => setShowAllReviews(!showAllReviews)}
                                style={styles.showMoreBtn}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.showMoreText, { color: palette.orange }]}>
                                    {showAllReviews ? "Voir moins" : `Voir tous les avis (${reviews.length})`}
                                </Text>
                                <Ionicons name={showAllReviews ? "chevron-up" : "chevron-down"} size={16} color={palette.orange} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Bottom safe space */}
                    <View style={{ height: 40 }} />
                </Animated.ScrollView>
            </KeyboardAvoidingView>

            <AuthModal
                visible={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                message="Connecte-toi pour ajouter des favoris ou laisser des avis"
            />
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
    loadingPulse: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: palette.orangeSoft,
        justifyContent: "center",
        alignItems: "center",
    },

    heroContainer: {
        height: 320,
        position: "relative",
        overflow: "hidden",
    },
    heroImage: {
        width: "100%",
        height: "100%",
    },
    heroGradient: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 200,
    },
    heroTopBar: {
        position: "absolute",
        top: Platform.OS === "ios" ? 54 : 40,
        left: 16,
        right: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    heroTopRight: {
        flexDirection: "row",
        gap: 10,
    },
    heroBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "center",
        alignItems: "center",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
            },
            android: { elevation: 4 },
        }),
    },
    heroBottom: {
        position: "absolute",
        bottom: 44,
        left: 20,
        right: 20,
    },
    heroName: {
        fontSize: 28,
        fontWeight: "800",
        color: palette.white,
        letterSpacing: -0.5,
        marginBottom: 6,
    },
    heroRating: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    heroRatingText: {
        fontSize: 15,
        fontWeight: "700",
        color: palette.white,
    },
    heroRatingCount: {
        fontSize: 13,
        color: "rgba(255,255,255,0.75)",
    },

    floatingCard: {
        marginHorizontal: 16,
        marginTop: -14,
        backgroundColor: palette.white,
        borderRadius: 20,
        padding: 18,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.1,
                shadowRadius: 16,
            },
            android: { elevation: 8 },
        }),
        marginBottom: 24,
    },
    infoGrid: {
        gap: 14,
        marginBottom: 16,
    },
    infoItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    infoIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    infoItemContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: palette.gray500,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: "600",
    },
    actionRow: {
        flexDirection: "row",
        gap: 10,
    },
    actionBtnCall: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 13,
        borderRadius: 14,
        backgroundColor: palette.orange,
    },
    actionBtnCallText: {
        color: palette.white,
        fontSize: 15,
        fontWeight: "700",
    },
    actionBtnDir: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 13,
        borderRadius: 14,
        backgroundColor: palette.orangeSoft,
        borderWidth: 1.5,
        borderColor: palette.orangeLight,
    },
    actionBtnDirText: {
        color: palette.orange,
        fontSize: 15,
        fontWeight: "700",
    },

    menuSection: {
        marginBottom: 28,
    },
    menuSectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingHorizontal: 20,
        marginBottom: 18,
    },
    menuTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    menuIconBg: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    menuSectionTitle: {
        fontSize: 22,
        fontWeight: "800",
        letterSpacing: -0.3,
    },
    menuSubtitle: {
        fontSize: 13,
        color: palette.gray500,
        marginTop: 3,
        marginLeft: 46,
    },
    offreBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: palette.amberSoft,
        borderRadius: 10,
    },
    offreBadgeText: {
        color: "#92400E",
        fontSize: 11,
        fontWeight: "700",
    },
    menuCarousel: {
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 6,
    },
    menuCardOuter: {
        width: MENU_CARD_WIDTH,
        marginRight: MENU_CARD_SPACING,
    },
    menuCard: {
        borderRadius: 20,
        overflow: "hidden",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.12,
                shadowRadius: 14,
            },
            android: { elevation: 6 },
        }),
    },
    menuCardImageWrap: {
        width: "100%",
        height: 160,
        position: "relative",
        overflow: "hidden",
    },
    menuCardImage: {
        width: "100%",
        height: "100%",
    },
    menuCardPlaceholder: {
        backgroundColor: palette.orangeSoft,
    },
    menuPlaceholderInner: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    menuPriceFloat: {
        position: "absolute",
        bottom: 10,
        right: 10,
        backgroundColor: palette.orange,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 12,
        ...Platform.select({
            ios: {
                shadowColor: palette.orange,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.4,
                shadowRadius: 6,
            },
            android: { elevation: 4 },
        }),
    },
    menuPriceFloatText: {
        color: palette.white,
        fontSize: 18,
        fontWeight: "800",
    },
    menuCardBody: {
        padding: 16,
    },
    menuTagRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 10,
    },
    menuTag: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    menuTagText: {
        fontSize: 11,
        fontWeight: "700",
    },
    menuCardTitle: {
        fontSize: 16,
        fontWeight: "700",
        lineHeight: 22,
        marginBottom: 14,
    },
    menuCardFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: palette.gray200,
    },
    menuCardPriceLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: palette.gray500,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    menuCardPriceValue: {
        fontSize: 20,
        fontWeight: "800",
    },

    dotRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
        marginTop: 16,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },

    studentCardInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginHorizontal: 20,
        marginTop: 18,
        padding: 14,
        backgroundColor: palette.orangeSoft,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: palette.orangeLight,
    },
    studentCardInfoText: {
        fontSize: 13,
        flex: 1,
        lineHeight: 18,
        fontWeight: "500",
    },

    descSection: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    descTitle: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 10,
        letterSpacing: -0.2,
    },
    descText: {
        fontSize: 15,
        lineHeight: 24,
    },

    divider: {
        height: 1,
        marginHorizontal: 20,
        marginBottom: 24,
    },

    reviewsSection: {
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    reviewsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    reviewsTitle: {
        fontSize: 20,
        fontWeight: "700",
        letterSpacing: -0.2,
    },
    addReviewBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: palette.orange,
    },
    addReviewBtnText: {
        color: palette.white,
        fontSize: 13,
        fontWeight: "700",
    },
    noReviewsContainer: {
        alignItems: "center",
        paddingVertical: 32,
        gap: 12,
    },
    noReviews: {
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
    },
    showMoreBtn: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: palette.orangeSoft,
        marginTop: 12,
    },
    showMoreText: {
        fontSize: 14,
        fontWeight: "700",
    },
})
