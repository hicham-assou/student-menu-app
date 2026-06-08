import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/Colors'
import { useAuth } from '@/contexts/AuthContext'
import { getFavoriteRestaurants, toggleFavorite as toggleFav } from '@/lib/favorites'
import { RestaurantCard } from '@/components/restaurant/RestaurantCard'
import { Button } from '@/components/ui/Button'
import type { Restaurant } from '@/types'

export default function FavoritesScreen() {
    const colors = Colors.light
    const router = useRouter()
    const { user } = useAuth()

    const [favorites, setFavorites] = useState<Restaurant[]>([])
    const [loading, setLoading] = useState(true)

    const loadFavorites = useCallback(async () => {
        if (!user) {
            setFavorites([])
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            const data = await getFavoriteRestaurants()
            setFavorites(data)
        } catch (error) {
            console.error('Error loading favorites:', error)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        loadFavorites()
    }, [loadFavorites])

    const handleToggleFavorite = async (restaurantId: string) => {
        if (!user) return
        try {
            await toggleFav(restaurantId)
            await loadFavorites()
        } catch (error) {
            console.error('Error toggling favorite:', error)
        }
    }

    const renderEmpty = (title: string, subtitle: string, cta: { label: string; onPress: () => void }) => (
        <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
                <RefreshControl
                    refreshing={loading}
                    onRefresh={loadFavorites}
                    tintColor={colors.primary}
                    colors={[colors.primary]}
                />
            }
        >
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                    <Ionicons name="heart-outline" size={40} color={colors.primary} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
                <Button title={cta.label} onPress={cta.onPress} style={styles.button} />
            </View>
        </ScrollView>
    )

    // Non connecté
    if (!user) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Mes Favoris</Text>
                </View>
                {renderEmpty(
                    'Pas encore de favoris',
                    'Connecte-toi pour sauvegarder tes restaurants préférés',
                    { label: 'Se connecter', onPress: () => router.push('/auth/login') },
                )}
            </SafeAreaView>
        )
    }

    // Connecté, aucun favori
    if (!loading && favorites.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Mes Favoris</Text>
                </View>
                {renderEmpty(
                    'Aucun favori',
                    'Ajoute des restaurants en favoris pour les retrouver ici',
                    { label: 'Découvrir des restaurants', onPress: () => router.push('/(tabs)/') },
                )}
            </SafeAreaView>
        )
    }

    // Liste des favoris
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Mes Favoris</Text>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                    {favorites.length} restaurant{favorites.length > 1 ? 's' : ''}
                </Text>
            </View>

            <FlatList
                data={favorites}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <RestaurantCard
                        restaurant={item}
                        isFavorite={true}
                        onToggleFavorite={() => handleToggleFavorite(item.id)}
                    />
                )}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={loadFavorites}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
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
        paddingTop: 8,
        paddingBottom: 14,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 13.5,
        fontWeight: '500',
        marginTop: 2,
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 110,
        gap: 14,
    },
    scrollContent: {
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingBottom: 60,
        gap: 12,
    },
    emptyIconCircle: {
        width: 84,
        height: 84,
        borderRadius: 42,
        backgroundColor: '#FFF1E8',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    emptySubtitle: {
        fontSize: 14.5,
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: 16,
    },
    button: {
        minWidth: 220,
    },
})
