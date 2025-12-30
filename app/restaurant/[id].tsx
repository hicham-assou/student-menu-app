"use client"

import {
    Alert,
    Dimensions,
    Image,
    Linking,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import {SafeAreaView} from "react-native-safe-area-context"
import {useLocalSearchParams, useNavigation, useRouter} from "expo-router"
import {Ionicons} from "@expo/vector-icons"
import {useCallback, useEffect, useState} from "react"
import {useColorScheme} from "@/components/useColorScheme.web"
import {Colors} from "@/constants/Colors"
import {useAuth} from "@/contexts/AuthContext"
import {getRestaurants} from "@/lib/api"
import {isFavorite as checkFavorite, toggleFavorite} from "@/lib/favorites"
import {getRestaurantReviews, getRestaurantReviewStats, getUserReview} from "@/lib/reviews"
import {isRestaurantOwner} from "@/lib/restaurants"
import {trackEvent} from "@/lib/analytics"
import {ReviewStats} from "@/components/reviews/ReviewStats"
import {ReviewForm} from "@/components/reviews/ReviewForm"
import {ReviewCard} from "@/components/reviews/ReviewCard"
import {AuthModal} from "@/components/ui/AutoModal"
import type {Restaurant, Review} from "@/types"

const {width} = Dimensions.get("window")
const MENU_CARD_WIDTH = width * 0.85

export default function RestaurantDetailScreen() {
    const colorScheme = useColorScheme() ?? "light"
    const colors = Colors[colorScheme]
    const {id} = useLocalSearchParams<{ id: string }>()
    const router = useRouter()
    const navigation = useNavigation()
    const {user} = useAuth()

    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
    const [reviews, setReviews] = useState<Review[]>([])
    const [stats, setStats] = useState({average: 0, total: 0, distribution: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}})
    const [userReview, setUserReview] = useState<Review | null>(null)
    const [isFav, setIsFav] = useState(false)
    const [loading, setLoading] = useState(true)
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [showAllReviews, setShowAllReviews] = useState(false)
    const [isOwner, setIsOwner] = useState(false)

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
            navigation.setOptions({
                title: restaurant.name,
            })
        }
    }, [restaurant, navigation])

    useEffect(() => {
        if (id) {
            trackEvent(id, "view")
        }
    }, [id])

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
            Alert.alert("Erreur", "Impossible de modifier le favori")
        }
    }

    const handleAddReview = () => {
        if (!user) {
            setShowAuthModal(true)
            return
        }
        setShowReviewForm(true)
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

    if (loading || !restaurant) {
        return (
            <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
                <View style={styles.loading}>
                    <Text style={{color: colors.textSecondary}}>Chargement...</Text>
                </View>
            </SafeAreaView>
        )
    }

    const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3)

    return (
        <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={["bottom"]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={loadData}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
            >
                {/* Image et boutons */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{
                            uri:
                                restaurant.image ||
                                `https://placehold.co/800x400/F97316/FFFFFF?text=${encodeURIComponent(restaurant.name)}`,
                        }}
                        style={styles.image}
                        resizeMode="cover"
                    />

                    <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
                        <Ionicons name={isFav ? "heart" : "heart-outline"} size={24}
                                  color={isFav ? "#EF4444" : "#FFFFFF"}/>
                    </TouchableOpacity>

                    {/* Bouton de modification pour les propriétaires */}
                    {isOwner && (
                        <TouchableOpacity onPress={() => router.push(`/owner/edit/${id}`)} style={styles.editButton}>
                            <Ionicons name="create-outline" size={24} color="#FFFFFF"/>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Contenu */}
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={[styles.name, {color: colors.text}]}>{restaurant.name}</Text>

                        {stats.total > 0 && (
                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={18} color="#F59E0B"/>
                                <Text
                                    style={[styles.ratingText, {color: colors.text}]}>{stats.average.toFixed(1)}</Text>
                                <Text
                                    style={[styles.reviewCount, {color: colors.textSecondary}]}>({stats.total} avis)</Text>
                            </View>
                        )}

                        <View style={styles.infoRow}>
                            <Ionicons name="location" size={16} color={colors.textSecondary}/>
                            <Text style={[styles.infoText, {color: colors.textSecondary}]}>
                                {restaurant.address}, {restaurant.city}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Ionicons name="time" size={16} color={colors.textSecondary}/>
                            <Text
                                style={[styles.infoText, {color: colors.textSecondary}]}>{restaurant.opening_hours}</Text>
                        </View>
                    </View>

                    {/* Boutons d'action */}
                    <View style={styles.actions}>
                        {restaurant.phone && (
                            <TouchableOpacity onPress={handleCall}
                                              style={[styles.actionButton, {backgroundColor: colors.primary}]}>
                                <Ionicons name="call" size={20} color="#FFFFFF"/>
                                <Text style={styles.actionButtonText}>Appeler</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={handleDirections}
                            style={[styles.actionButton, {backgroundColor: colors.primary}]}
                        >
                            <Ionicons name="navigate" size={20} color="#FFFFFF"/>
                            <Text style={styles.actionButtonText}>Itineraire</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Menu étudiant premium design - LA STAR DE L'APP */}
                    {restaurant.student_menu && restaurant.student_menu.length > 0 && (
                        <View style={styles.menuSection}>
                            {/* En-tête avec badge */}
                            <View style={styles.menuHeader}>
                                <View style={styles.menuTitleRow}>
                                    <Ionicons name="school" size={24} color={colors.primary}/>
                                    <Text style={[styles.menuSectionTitle, {color: colors.text}]}>Menus Étudiants</Text>
                                </View>
                                <View style={[styles.studentBadge, {backgroundColor: colors.primary}]}>
                                    <Ionicons name="star" size={12} color="#FFFFFF"/>
                                    <Text style={styles.studentBadgeText}>Offre spéciale</Text>
                                </View>
                            </View>

                            {/* Scroll horizontal des menus */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                snapToInterval={MENU_CARD_WIDTH + 16}
                                decelerationRate="fast"
                                contentContainerStyle={styles.menuScrollContent}
                            >
                                {restaurant.student_menu.map((item, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.premiumMenuCard,
                                            {
                                                backgroundColor: colors.surface,
                                                borderColor: colors.primary,
                                            },
                                        ]}
                                    >
                                        {/* Badge numéro */}
                                        <View style={[styles.menuNumber, {backgroundColor: colors.primary}]}>
                                            <Text style={styles.menuNumberText}>#{index + 1}</Text>
                                        </View>

                                        {/* Icône centrale */}
                                        <View
                                            style={[styles.menuIconContainer, {backgroundColor: `${colors.primary}15`}]}>
                                            <Ionicons name="restaurant" size={40} color={colors.primary}/>
                                        </View>

                                        {/* Titre du menu */}
                                        <Text
                                            style={[styles.premiumMenuTitle, {color: colors.text}]}>{item.title}</Text>

                                        {/* Séparateur */}
                                        <View style={[styles.menuDivider, {backgroundColor: colors.border}]}/>

                                        {/* Prix avec badge */}
                                        <View style={styles.priceContainer}>
                                            <Text style={[styles.priceLabel, {color: colors.textSecondary}]}>Prix
                                                étudiant</Text>
                                            <View style={[styles.premiumPriceBadge, {backgroundColor: colors.primary}]}>
                                                <Text style={styles.premiumPriceText}>{item.price}</Text>
                                            </View>
                                        </View>

                                        {/* Badge "Bon plan" */}
                                        <View style={styles.dealBadge}>
                                            <Ionicons name="flash" size={14} color="#F59E0B"/>
                                            <Text style={styles.dealBadgeText}>Bon plan</Text>
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>

                            {/* Info supplémentaire */}
                            <View
                                style={[
                                    styles.menuFooter,
                                    {
                                        backgroundColor: `${colors.primary}10`,
                                        borderColor: colors.primary,
                                    },
                                ]}
                            >
                                <Ionicons name="information-circle" size={18} color={colors.primary}/>
                                <Text style={[styles.menuFooterText, {color: colors.text}]}>
                                    Présente ta carte étudiante pour bénéficier de ces prix
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Description */}
                    {restaurant.description && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, {color: colors.text}]}>Description</Text>
                            <Text style={[styles.description, {color: colors.text}]}>{restaurant.description}</Text>
                        </View>
                    )}

                    {/* Section Avis */}
                    <View style={styles.section}>
                        <View style={styles.reviewsHeader}>
                            <Text style={[styles.sectionTitle, {color: colors.text}]}>
                                Avis {stats.total > 0 && `(${stats.total})`}
                            </Text>
                            <TouchableOpacity
                                onPress={handleAddReview}
                                style={[styles.addReviewButton, {backgroundColor: colors.primary}]}
                            >
                                <Ionicons name="add" size={16} color="#FFFFFF"/>
                            </TouchableOpacity>
                        </View>

                        {stats.total > 0 && <ReviewStats average={stats.average} total={stats.total}/>}

                        {showReviewForm && (
                            <ReviewForm
                                restaurantId={id!}
                                existingReview={userReview}
                                onSuccess={handleReviewSuccess}
                                onCancel={() => setShowReviewForm(false)}
                            />
                        )}

                        {reviews.length === 0 && !showReviewForm && (
                            <Text style={[styles.noReviews, {color: colors.textSecondary}]}>
                                Aucun avis pour le moment. Sois le premier a en laisser un !
                            </Text>
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
                                style={[styles.showMoreButton, {borderColor: colors.border}]}
                            >
                                <Text style={[styles.showMoreText, {color: colors.primary}]}>
                                    {showAllReviews ? "Voir moins" : `Voir tous les avis (${reviews.length})`}
                                </Text>
                                <Ionicons name={showAllReviews ? "chevron-up" : "chevron-down"} size={18}
                                          color={colors.primary}/>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </ScrollView>

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
    imageContainer: {
        position: "relative",
    },
    image: {
        width: "100%",
        height: 250,
    },
    favoriteButton: {
        position: "absolute",
        top: 50,
        right: 16,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        borderRadius: 20,
        padding: 8,
    },
    editButton: {
        position: "absolute",
        top: 50,
        right: 70,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        borderRadius: 20,
        padding: 8,
    },
    content: {
        padding: 20,
    },
    header: {
        marginBottom: 20,
    },
    name: {
        fontSize: 26,
        fontWeight: "700",
        marginBottom: 12,
    },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 12,
    },
    ratingText: {
        fontSize: 16,
        fontWeight: "600",
    },
    reviewCount: {
        fontSize: 14,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        flex: 1,
    },
    actions: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 12,
        borderRadius: 10,
    },
    actionButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
    },
    menuSection: {
        marginBottom: 32,
    },
    menuHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    menuTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    menuSectionTitle: {
        fontSize: 22,
        fontWeight: "700",
    },
    studentBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    studentBadgeText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "700",
        textTransform: "uppercase",
    },
    menuScrollContent: {
        paddingRight: 20,
        paddingBottom: 4,
    },
    premiumMenuCard: {
        width: MENU_CARD_WIDTH,
        borderWidth: 2,
        borderRadius: 20,
        padding: 24,
        marginRight: 16,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
        position: "relative",
    },
    menuNumber: {
        position: "absolute",
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    menuNumberText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
    },
    menuIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        marginBottom: 16,
    },
    premiumMenuTitle: {
        fontSize: 20,
        fontWeight: "700",
        textAlign: "center",
        lineHeight: 26,
        marginBottom: 16,
        minHeight: 52,
    },
    menuDivider: {
        height: 1,
        marginBottom: 16,
    },
    priceContainer: {
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    priceLabel: {
        fontSize: 12,
        fontWeight: "500",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    premiumPriceBadge: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    premiumPriceText: {
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: "800",
    },
    dealBadge: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: "#FEF3C7",
        borderRadius: 12,
        alignSelf: "center",
    },
    dealBadgeText: {
        color: "#92400E",
        fontSize: 12,
        fontWeight: "700",
    },
    menuFooter: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 16,
    },
    menuFooterText: {
        fontSize: 13,
        flex: 1,
        lineHeight: 18,
    },
    reviewsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    addReviewButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    noReviews: {
        fontSize: 14,
        textAlign: "center",
        fontStyle: "italic",
        marginVertical: 20,
    },
    showMoreButton: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderRadius: 10,
        marginTop: 8,
    },
    showMoreText: {
        fontSize: 14,
        fontWeight: "600",
    },
})
