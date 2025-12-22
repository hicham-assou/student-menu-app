import {StyleSheet, Text, View} from 'react-native'
import {Ionicons} from '@expo/vector-icons'
import {useColorScheme} from "@/components/useColorScheme.web";
import {Colors} from '@/constants/Colors'

interface ReviewStatsProps {
    average: number
    total: number
}

export function ReviewStats({average, total}: ReviewStatsProps) {
    const colorScheme = useColorScheme() ?? 'light'
    const colors = Colors[colorScheme]

    if (total === 0) return null

    return (
        <View style={[styles.container, {backgroundColor: colors.surface, borderColor: colors.border}]}>
            <View style={styles.rating}>
                <Text style={[styles.averageNumber, {color: colors.text}]}>
                    {average.toFixed(1)}
                </Text>
                <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                            key={star}
                            name={star <= Math.round(average) ? 'star' : 'star-outline'}
                            size={16}
                            color="#F59E0B"
                        />
                    ))}
                </View>
                <Text style={[styles.totalText, {color: colors.textSecondary}]}>
                    {total} avis
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
    },
    rating: {
        alignItems: 'center',
        gap: 6,
    },
    averageNumber: {
        fontSize: 36,
        fontWeight: '700',
    },
    stars: {
        flexDirection: 'row',
        gap: 2,
    },
    totalText: {
        fontSize: 13,
    },
})