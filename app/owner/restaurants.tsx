import {Alert, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View,} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useRouter} from 'expo-router'
import {Ionicons} from '@expo/vector-icons'
import {useCallback, useEffect, useState} from 'react'
import {useColorScheme} from '@/components/useColorScheme.web'
import {Colors} from '@/constants/Colors'
import {useAuth} from '@/contexts/AuthContext'
import {getMyRestaurants} from '@/lib/restaurants'
import {Button} from '@/components/ui/Button'
import type {Restaurant} from '@/types'

export default function MyRestaurantsScreen() {
    const colorScheme = useColorScheme() ?? 'light'
    const colors = Colors[colorScheme]
    const router = useRouter()
    const {user} = useAuth()

    const [restaurants, setRestaurants] = useState<Restaurant[]>([])
    const [loading, setLoading] = useState(true)

    const loadRestaurants = useCallback(async () => {
        if (!user) {
            setRestaurants([])
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            const data = await getMyRestaurants()
            setRestaurants(data)
        } catch (error) {
            console.error('Error loading restaurants:', error)
            Alert.alert('Erreur', 'Impossible de charger les restaurants')
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        loadRestaurants()
    }, [loadRestaurants])

    if (!user) {
        return (
            <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
                <View style={styles.emptyContainer}>
                    <Ionicons name="business-outline" size={64} color={colors.textSecondary}/>
                    <Text style={[styles.emptyTitle, {color: colors.text}]}>
                        Connexion requise
                    </Text>
                    <Text style={[styles.emptySubtitle, {color: colors.textSecondary}]}>
                        Connecte-toi pour gérer tes restaurants
                    </Text>
                    <Button
                        title="Se connecter"
                        onPress={() => router.push('/auth/login')}
                        style={styles.button}
                    />
                </View>
            </SafeAreaView>
        )
    }

    if (!loading && restaurants.length === 0) {
        return (
            <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text}/>
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, {color: colors.text}]}>Mes Restaurants</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Ionicons name="restaurant-outline" size={64} color={colors.textSecondary}/>
                    <Text style={[styles.emptyTitle, {color: colors.text}]}>
                        Aucun restaurant
                    </Text>
                    <Text style={[styles.emptySubtitle, {color: colors.textSecondary}]}>
                        Tu n'as pas encore de restaurant enregistré
                    </Text>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text}/>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, {color: colors.text}]}>Mes Restaurants</Text>
            </View>

            <FlatList
                data={restaurants}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => (
                    <TouchableOpacity
                        onPress={() => router.push(`/owner/edit/${item.id}`)}
                        style={[styles.restaurantCard, {backgroundColor: colors.surface, borderColor: colors.border}]}
                    >
                        <Image
                            source={{
                                uri: item.image || `https://placehold.co/200x150/F97316/FFFFFF?text=${encodeURIComponent(item.name)}`,
                            }}
                            style={styles.restaurantImage}
                            resizeMode="cover"
                        />
                        <View style={styles.restaurantInfo}>
                            <Text style={[styles.restaurantName, {color: colors.text}]}>{item.name}</Text>
                            <View style={styles.restaurantDetail}>
                                <Ionicons name="location" size={14} color={colors.textSecondary}/>
                                <Text style={[styles.restaurantAddress, {color: colors.textSecondary}]}>
                                    {item.address}, {item.city}
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary}/>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={loadRestaurants}
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
    },
    list: {
        padding: 16,
    },
    restaurantCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        gap: 12,
    },
    restaurantImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    restaurantInfo: {
        flex: 1,
        gap: 6,
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: '600',
    },
    restaurantDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    restaurantAddress: {
        fontSize: 13,
        flex: 1,
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