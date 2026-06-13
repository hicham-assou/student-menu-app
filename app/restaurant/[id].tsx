import {
    Dimensions,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Linking,
    Platform,
    RefreshControl,
    ScrollView,
    Share,
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
import { getCategory, getTag, DAY_ORDER, DAY_SHORT } from "@/constants/discovery"
import { getOpenStatus, hasAnyHours, formatPeriods } from "@/lib/hours"
import { formatPrice, priceToNumber } from "@/lib/price"

const { width } = Dimensions.get("window")
const MENU_CARD_WIDTH = width * 0.66
const MENU_CARD_SPACING = 12

// Base des liens de partage (pages hebergees via GitHub Pages, dossier /docs)
const SHARE_BASE_URL = "https://hicham-assou.github.io/student-menu-app"

const palette = {
    orange: "#F97316",
    orangeSoft: "#FFF1E8",
    amber: "#F59E0B",
    amberSoft: "#FEF3C7",
    gray200: "#ECE7E1",
    gray400: "#A8A29E",
    gray500: "#78716C",
    white: "#FFFFFF",
    red: "#EF4444",
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

    const menuScrollRef = useRef<ScrollView>(null)
    const mainScrollRef = useRef<ScrollView>(null)

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

    useEffect(() => {
        const keyboardDidShow = Keyboard.addListener("keyboardDidShow", () => {
            if (showReviewForm && mainScrollRef.current) {
                mainScrollRef.current.scrollToEnd({ animated: true })
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
        setTimeout(() => {
            mainScrollRef.current?.scrollToEnd({ animated: true })
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

    const handleShare = async () => {
        if (!restaurant) return
        try {
            const link = `${SHARE_BASE_URL}/r.html?id=${restaurant.id}&name=${encodeURIComponent(restaurant.name)}`
            const priceLine =
                sortedMenus.length > 0 ? `\nMenu étudiant dès ${formatPrice(sortedMenus[0].price)}` : ""
            await Share.share({
                title: restaurant.name,
                message:
                    `${restaurant.name} sur Stud'Table 🍽️${priceLine}\n` +
                    `📍 ${restaurant.address}, ${restaurant.city}\n\n` +
                    `👉 ${link}`,
                url: link,
            })
        } catch (error) {
            console.error("Error sharing:", error)
        }
    }

    const handleReportError = () => {
        if (!restaurant) return
        router.push(
            `/suggest?type=correction&restaurantId=${restaurant.id}&restaurantName=${encodeURIComponent(restaurant.name)}`,
        )
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
        const priceA = priceToNumber(a.price) ?? Number.POSITIVE_INFINITY
        const priceB = priceToNumber(b.price) ?? Number.POSITIVE_INFINITY
        return priceA - priceB
    })

    const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3)

    const categories = (restaurant.categories || []).map(getCategory)
    const tags = (restaurant.tags || []).map(getTag)
    const openStatus = getOpenStatus(restaurant.hours)

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["bottom"]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView
                    ref={mainScrollRef}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={loadData}
                            tintColor={palette.orange}
                            colors={[palette.orange]}
                        />
                    }
                >
                    {/* Image card */}
                    <View style={styles.imageCard}>
                        <Image
                            source={{
                                uri:
                                    restaurant.image ||
                                    `https://placehold.co/800x400/F97316/FFFFFF?text=${encodeURIComponent(restaurant.name)}`,
                            }}
                            style={styles.heroImage}
                            resizeMode="cover"
                        />
                        <LinearGradient colors={["transparent", "rgba(0,0,0,0.45)"]} style={styles.imageGradient} />

                        <View style={styles.imageActions}>
                            <TouchableOpacity onPress={handleShare} style={styles.imageBtn}>
                                <Ionicons name="share-social-outline" size={18} color={palette.white} />
                            </TouchableOpacity>
                            {isOwner && (
                                <TouchableOpacity onPress={() => router.push(`/owner/edit/${id}`)} style={styles.imageBtn}>
                                    <Ionicons name="create-outline" size={19} color={palette.white} />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={handleToggleFavorite} style={styles.imageBtn}>
                                <Ionicons
                                    name={isFav ? "heart" : "heart-outline"}
                                    size={20}
                                    color={isFav ? palette.red : palette.white}
                                />
                            </TouchableOpacity>
                        </View>

                        {stats.total > 0 && (
                            <View style={styles.ratingPill}>
                                <Ionicons name="star" size={13} color={palette.amber} />
                                <Text style={styles.ratingPillScore}>{stats.average.toFixed(1)}</Text>
                                <Text style={styles.ratingPillCount}>· {stats.total} avis</Text>
                            </View>
                        )}
                    </View>

                    {/* Title + address */}
                    <View style={styles.titleBlock}>
                        <Text style={[styles.name, { color: colors.text }]}>{restaurant.name}</Text>
                        <View style={styles.addressRow}>
                            <Ionicons name="location-outline" size={15} color={palette.gray500} />
                            <Text style={styles.addressText} numberOfLines={1}>
                                {restaurant.address}, {restaurant.city}
                            </Text>
                        </View>

                        {/* Catégories + tags */}
                        {(categories.length > 0 || tags.length > 0) && (
                            <View style={styles.tagsRow}>
                                {categories.map(
                                    (c) =>
                                        c && (
                                            <View key={c.id} style={styles.catChip}>
                                                <Text style={styles.catChipText}>
                                                    {c.emoji} {c.label}
                                                </Text>
                                            </View>
                                        ),
                                )}
                                {tags.map(
                                    (t) =>
                                        t && (
                                            <View key={t.id} style={styles.tagChip}>
                                                <Text style={styles.tagChipText}>{t.label}</Text>
                                            </View>
                                        ),
                                )}
                            </View>
                        )}
                    </View>

                    {/* Action buttons */}
                    <View style={styles.actionRow}>
                        {restaurant.phone && (
                            <TouchableOpacity onPress={handleCall} style={styles.actionBtnPrimary} activeOpacity={0.85}>
                                <Ionicons name="call" size={17} color={palette.white} />
                                <Text style={styles.actionBtnPrimaryText}>Appeler</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={handleDirections} style={styles.actionBtnSecondary} activeOpacity={0.85}>
                            <Ionicons name="navigate" size={17} color={palette.orange} />
                            <Text style={styles.actionBtnSecondaryText}>Itinéraire</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Horaires */}
                    {hasAnyHours(restaurant.hours) && (
                        <View style={styles.infoCard}>
                            <View style={styles.infoIcon}>
                                <Ionicons name="time-outline" size={20} color={palette.orange} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={styles.hoursLabelRow}>
                                    <Text style={styles.infoLabel}>Horaires</Text>
                                    {openStatus && (
                                        <View
                                            style={[
                                                styles.openPill,
                                                { backgroundColor: openStatus.isOpen ? "#DCFCE7" : "#FEE2E2" },
                                            ]}
                                        >
                                            <View
                                                style={[
                                                    styles.openDot,
                                                    { backgroundColor: openStatus.isOpen ? "#16A34A" : "#DC2626" },
                                                ]}
                                            />
                                            <Text
                                                style={[
                                                    styles.openPillText,
                                                    { color: openStatus.isOpen ? "#15803D" : "#B91C1C" },
                                                ]}
                                            >
                                                {openStatus.isOpen ? "Ouvert" : "Fermé"}
                                                {openStatus.detail ? ` · ${openStatus.detail}` : ""}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.hoursList}>
                                    {DAY_ORDER.map((d) => {
                                        const isToday = new Date().getDay() === d
                                        return (
                                            <View key={d} style={styles.hoursDayRow}>
                                                <Text style={[styles.hoursDay, isToday && styles.hoursToday]}>
                                                    {DAY_SHORT[d]}
                                                </Text>
                                                <Text style={[styles.hoursVal, isToday && styles.hoursToday]}>
                                                    {formatPeriods(restaurant.hours?.[d])}
                                                </Text>
                                            </View>
                                        )
                                    })}
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Menus étudiants */}
                    {sortedMenus.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHead}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Menus étudiants</Text>
                                <Text style={styles.sectionCount}>
                                    {sortedMenus.length} menu{sortedMenus.length > 1 ? "s" : ""}
                                </Text>
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
                                    <View key={index} style={styles.menuCard}>
                                        {item.image_url ? (
                                            <View style={styles.menuImageWrap}>
                                                <Image source={{ uri: item.image_url }} style={styles.menuImage} resizeMode="cover" />
                                                <View style={styles.menuPriceFloat}>
                                                    <Text style={styles.menuPriceFloatText}>{formatPrice(item.price)}</Text>
                                                </View>
                                            </View>
                                        ) : (
                                            <View style={[styles.menuImageWrap, styles.menuPlaceholder]}>
                                                <Ionicons name="fast-food-outline" size={34} color={palette.orange} />
                                                <View style={styles.menuPriceFloat}>
                                                    <Text style={styles.menuPriceFloatText}>{formatPrice(item.price)}</Text>
                                                </View>
                                            </View>
                                        )}
                                        <View style={styles.menuBody}>
                                            <Text style={[styles.menuTitle, { color: colors.text }]} numberOfLines={2}>
                                                {item.title}
                                            </Text>
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
                                                    ? { backgroundColor: palette.orange, width: 18 }
                                                    : { backgroundColor: palette.gray200, width: 7 },
                                            ]}
                                        />
                                    ))}
                                </View>
                            )}

                            <View style={styles.cardHint}>
                                <Ionicons name="card-outline" size={17} color={palette.orange} />
                                <Text style={styles.cardHintText}>
                                    Présente ta carte étudiante pour bénéficier de ces prix
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* À propos */}
                    {restaurant.description && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>À propos</Text>
                            <Text style={styles.descText}>{restaurant.description}</Text>
                        </View>
                    )}

                    {/* Avis */}
                    <View style={styles.section}>
                        <View style={styles.sectionHead}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Avis {stats.total > 0 ? `(${stats.total})` : ""}
                            </Text>
                            <TouchableOpacity onPress={handleAddReview} style={styles.addReviewBtn} activeOpacity={0.85}>
                                <Ionicons name="add" size={17} color={palette.white} />
                                <Text style={styles.addReviewBtnText}>Avis</Text>
                            </TouchableOpacity>
                        </View>

                        {stats.total > 0 && <ReviewStats average={stats.average} total={stats.total} />}

                        {showReviewForm && (
                            <ReviewForm
                                restaurantId={id!}
                                existingReview={userReview}
                                onSuccess={handleReviewSuccess}
                                onCancel={() => setShowReviewForm(false)}
                            />
                        )}

                        {reviews.length === 0 && !showReviewForm && (
                            <View style={styles.noReviews}>
                                <View style={styles.noReviewsIcon}>
                                    <Ionicons name="chatbubble-ellipses-outline" size={32} color={palette.orange} />
                                </View>
                                <Text style={[styles.noReviewsTitle, { color: colors.text }]}>Aucun avis pour le moment</Text>
                                <Text style={styles.noReviewsSub}>Sois le premier à partager ton expérience !</Text>
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
                                <Text style={styles.showMoreText}>
                                    {showAllReviews ? "Voir moins" : `Voir les ${reviews.length} avis`}
                                </Text>
                                <Ionicons name={showAllReviews ? "chevron-up" : "chevron-down"} size={16} color={palette.orange} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Signaler une erreur */}
                    <TouchableOpacity onPress={handleReportError} style={styles.reportBtn} activeOpacity={0.7}>
                        <Ionicons name="flag-outline" size={15} color={palette.gray500} />
                        <Text style={styles.reportText}>Une info est incorrecte ? Signale-le</Text>
                    </TouchableOpacity>
                </ScrollView>
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
    scrollContent: {
        paddingBottom: 40,
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

    // Image card
    imageCard: {
        height: 230,
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 24,
        overflow: "hidden",
        position: "relative",
        backgroundColor: palette.orangeSoft,
    },
    heroImage: {
        width: "100%",
        height: "100%",
    },
    imageGradient: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: "55%",
    },
    imageActions: {
        position: "absolute",
        top: 12,
        right: 12,
        flexDirection: "row",
        gap: 10,
    },
    imageBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "center",
        alignItems: "center",
    },
    ratingPill: {
        position: "absolute",
        bottom: 14,
        left: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "rgba(255,255,255,0.95)",
        paddingHorizontal: 11,
        paddingVertical: 6,
        borderRadius: 20,
    },
    ratingPillScore: {
        fontSize: 13.5,
        fontWeight: "800",
        color: "#1C1917",
    },
    ratingPillCount: {
        fontSize: 12.5,
        fontWeight: "500",
        color: palette.gray500,
    },

    // Title
    titleBlock: {
        paddingHorizontal: 20,
        paddingTop: 18,
        gap: 7,
    },
    name: {
        fontSize: 26,
        fontWeight: "800",
        letterSpacing: -0.6,
        lineHeight: 31,
    },
    addressRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    addressText: {
        fontSize: 14,
        fontWeight: "500",
        color: palette.gray500,
        flex: 1,
    },
    tagsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 7,
        marginTop: 4,
    },
    catChip: {
        backgroundColor: palette.orangeSoft,
        paddingHorizontal: 11,
        paddingVertical: 6,
        borderRadius: 20,
    },
    catChipText: {
        fontSize: 12.5,
        fontWeight: "700",
        color: "#9A3412",
    },
    tagChip: {
        backgroundColor: "#F1F5F9",
        paddingHorizontal: 11,
        paddingVertical: 6,
        borderRadius: 20,
    },
    tagChipText: {
        fontSize: 12.5,
        fontWeight: "600",
        color: "#475569",
    },
    hoursLabelRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 3,
        flexWrap: "wrap",
    },
    openPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
    },
    openDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    openPillText: {
        fontSize: 11.5,
        fontWeight: "700",
    },
    hoursList: {
        marginTop: 4,
        gap: 3,
    },
    hoursDayRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    hoursDay: {
        fontSize: 13.5,
        color: palette.gray500,
        fontWeight: "500",
        width: 44,
    },
    hoursVal: {
        fontSize: 13.5,
        color: palette.gray500,
        fontWeight: "500",
        flex: 1,
        textAlign: "right",
    },
    hoursToday: {
        color: "#1C1917",
        fontWeight: "800",
    },
    reportBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 16,
        marginTop: 8,
    },
    reportText: {
        fontSize: 13,
        fontWeight: "600",
        color: palette.gray500,
        textDecorationLine: "underline",
    },

    // Actions
    actionRow: {
        flexDirection: "row",
        gap: 10,
        paddingHorizontal: 20,
        marginTop: 18,
    },
    actionBtnPrimary: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: 16,
        backgroundColor: palette.orange,
    },
    actionBtnPrimaryText: {
        color: palette.white,
        fontSize: 15,
        fontWeight: "700",
    },
    actionBtnSecondary: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: 16,
        backgroundColor: palette.white,
        borderWidth: 1.5,
        borderColor: palette.orangeSoft,
    },
    actionBtnSecondaryText: {
        color: palette.orange,
        fontSize: 15,
        fontWeight: "700",
    },

    // Info card
    infoCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 13,
        marginHorizontal: 20,
        marginTop: 22,
        padding: 16,
        backgroundColor: palette.white,
        borderRadius: 18,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    infoIcon: {
        width: 42,
        height: 42,
        borderRadius: 13,
        backgroundColor: palette.orangeSoft,
        justifyContent: "center",
        alignItems: "center",
    },
    infoLabel: {
        fontSize: 11.5,
        fontWeight: "700",
        color: palette.gray400,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 3,
    },
    infoValue: {
        fontSize: 14.5,
        fontWeight: "600",
    },

    // Sections
    section: {
        marginTop: 28,
        paddingHorizontal: 20,
    },
    sectionHead: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 19,
        fontWeight: "800",
        letterSpacing: -0.4,
    },
    sectionCount: {
        fontSize: 13,
        fontWeight: "600",
        color: palette.gray400,
    },

    // Menu carousel
    menuCarousel: {
        paddingRight: 20,
        paddingBottom: 4,
    },
    menuCard: {
        width: MENU_CARD_WIDTH,
        marginRight: MENU_CARD_SPACING,
        backgroundColor: palette.white,
        borderRadius: 18,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 3,
    },
    menuImageWrap: {
        width: "100%",
        height: 130,
        position: "relative",
    },
    menuImage: {
        width: "100%",
        height: "100%",
    },
    menuPlaceholder: {
        backgroundColor: palette.orangeSoft,
        justifyContent: "center",
        alignItems: "center",
    },
    menuPriceFloat: {
        position: "absolute",
        bottom: 10,
        right: 10,
        backgroundColor: palette.orange,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 11,
    },
    menuPriceFloatText: {
        color: palette.white,
        fontSize: 15.5,
        fontWeight: "800",
    },
    menuBody: {
        padding: 13,
    },
    menuTitle: {
        fontSize: 14.5,
        fontWeight: "700",
        lineHeight: 19,
        minHeight: 38,
    },
    dotRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 5,
        marginTop: 14,
    },
    dot: {
        height: 7,
        borderRadius: 4,
    },
    cardHint: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 16,
        padding: 13,
        backgroundColor: palette.orangeSoft,
        borderRadius: 14,
    },
    cardHintText: {
        fontSize: 12.5,
        flex: 1,
        lineHeight: 17,
        fontWeight: "500",
        color: "#9A3412",
    },

    // Description
    descText: {
        fontSize: 14.5,
        lineHeight: 23,
        color: palette.gray500,
    },

    // Avis
    addReviewBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: palette.orange,
    },
    addReviewBtnText: {
        color: palette.white,
        fontSize: 13.5,
        fontWeight: "700",
    },
    noReviews: {
        alignItems: "center",
        paddingVertical: 28,
        gap: 8,
    },
    noReviewsIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: palette.orangeSoft,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 4,
    },
    noReviewsTitle: {
        fontSize: 15.5,
        fontWeight: "700",
    },
    noReviewsSub: {
        fontSize: 13.5,
        color: palette.gray400,
        textAlign: "center",
    },
    showMoreBtn: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: palette.orangeSoft,
        marginTop: 6,
    },
    showMoreText: {
        fontSize: 14,
        fontWeight: "700",
        color: palette.orange,
    },
})
