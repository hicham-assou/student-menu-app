import {FlatList, RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {Ionicons} from '@expo/vector-icons'
import {useCallback, useEffect, useState} from 'react'
import {useRouter} from 'expo-router'
import {useColorScheme} from "@/components/useColorScheme.web";
import {Colors} from '@/constants/Colors'
import {useAuth} from '@/contexts/AuthContext'
import {getFavoriteRestaurants, toggleFavorite as toggleFav} from '@/lib/favorites'
import {RestaurantCard} from '@/components/restaurant/RestaurantCard'
import {Button} from '@/components/ui/Button'
import type {Restaurant} from '@/types'

export default function FavoritesScreen() {
    const colorScheme = useColorScheme() ?? 'light'
    const colors = Colors[colorScheme]
    const router = useRouter()
    const {user} = useAuth()

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

    // <CHANGE> Fonction pour retirer un favori
    const handleToggleFavorite = async (restaurantId: string) => {
        if (!user) return

        try {
            await toggleFav(restaurantId)
            // Recharger la liste des favoris
            await loadFavorites()
        } catch (error) {
            console.error('Error toggling favorite:', error)
        }
    }

    // Si non connecté
    if (!user) {
        return (
            <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
                {/* <CHANGE> Ajouter ScrollView avec RefreshControl pour pouvoir refresh */}
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
                        <Ionicons name="heart-outline" size={64} color={colors.textSecondary}/>
                        <Text style={[styles.emptyTitle, {color: colors.text}]}>
                            Pas de favoris
                        </Text>
                        <Text style={[styles.emptySubtitle, {color: colors.textSecondary}]}>
                            Connecte-toi pour sauvegarder tes restaurants favoris
                        </Text>
                        <Button
                            title="Se connecter"
                            onPress={() => router.push('/auth/login')}
                            style={styles.button}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        )
    }

    // Si connecté mais pas de favoris
    if (!loading && favorites.length === 0) {
        return (
            <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, {color: colors.text}]}>Mes Favoris</Text>
                </View>
                {/* <CHANGE> Ajouter ScrollView avec RefreshControl pour pouvoir refresh */}
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
                        <Ionicons name="heart-outline" size={64} color={colors.textSecondary}/>
                        <Text style={[styles.emptyTitle, {color: colors.text}]}>
                            Aucun favori
                        </Text>
                        <Text style={[styles.emptySubtitle, {color: colors.textSecondary}]}>
                            Ajoute des restaurants en favoris pour les retrouver ici
                        </Text>
                        <Button
                            title="Decouvrir des restaurants"
                            onPress={() => router.push('/(tabs)/')}
                            style={styles.button}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        )
    }

    // Liste des favoris
    return (
        <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, {color: colors.text}]}>Mes Favoris</Text>
                <Text style={[styles.headerSubtitle, {color: colors.textSecondary}]}>
                    {favorites.length} restaurant{favorites.length > 1 ? 's' : ''}
                </Text>
            </View>

            <FlatList
                data={favorites}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => (
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
        paddingTop: 10,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
    },
    headerSubtitle: {
        fontSize: 15,
        marginTop: 4,
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    // <CHANGE> Ajouter scrollContent pour le ScrollView
    scrollContent: {
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        gap: 12,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    emptySubtitle: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        minWidth: 200,
    },
})