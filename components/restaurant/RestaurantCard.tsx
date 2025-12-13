import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {Ionicons} from '@expo/vector-icons'
import {useRouter} from 'expo-router'
import {useColorScheme} from "@/components/useColorScheme.web";
import {Colors} from '@/constants/Colors'
import type {Restaurant} from '@/types'

interface RestaurantCardProps {
    restaurant: Restaurant
    isFavorite?: boolean
    onToggleFavorite?: () => void
}

export function RestaurantCard({
                                   restaurant,
                                   isFavorite = false,
                                   onToggleFavorite,
                               }: RestaurantCardProps) {
    const colorScheme = useColorScheme() ?? 'light'
    const colors = Colors[colorScheme]
    const router = useRouter()

    const lowestPrice = restaurant.student_menu?.[0]?.price || 'N/A'

    const handlePress = () => {
        router.push(`/restaurant/${restaurant.id}`)
    }

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.8}
            style={[
                styles.card,
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                },
            ]}
        >
            {/* Image */}
            <Image
                source={{
                    uri: restaurant.image || `https://placehold.co/400x200/F97316/FFFFFF?text=${encodeURIComponent(restaurant.name)}`,
                }}
                style={styles.image}
                resizeMode="cover"
            />

            {/* Bouton favori */}
            {onToggleFavorite && (
                <TouchableOpacity
                    onPress={onToggleFavorite}
                    style={styles.favoriteButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons
                        name={isFavorite ? 'heart' : 'heart-outline'}
                        size={24}
                        color={isFavorite ? '#EF4444' : '#FFFFFF'}
                    />
                </TouchableOpacity>
            )}

            {/* Contenu */}
            <View style={styles.content}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                    {restaurant.name}
                </Text>

                <View style={styles.row}>
                    <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.address, { color: colors.textSecondary }]} numberOfLines={1}>
                        {restaurant.address}, {restaurant.city}
                    </Text>
                </View>

                <View style={styles.footer}>
                    <View style={styles.priceContainer}>
                        <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
                            Menu dès
                        </Text>
                        <Text style={[styles.price, { color: colors.primary }]}>
                            {lowestPrice}
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                        <Text style={[styles.hours, { color: colors.textSecondary }]} numberOfLines={1}>
                            {restaurant.opening_hours}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 140,
        backgroundColor: '#E2E8F0',
    },
    favoriteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        padding: 6,
    },
    content: {
        padding: 14,
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 6,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    address: {
        fontSize: 13,
        flex: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    priceLabel: {
        fontSize: 12,
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
    },
    hours: {
        fontSize: 12,
        maxWidth: 120,
    },
})