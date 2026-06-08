import { StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/Colors'

interface ReviewStatsProps {
    average: number
    total: number
}

export function ReviewStats({ average, total }: ReviewStatsProps) {
    const colors = Colors.light

    if (total === 0) return null

    return (
        <View style={styles.container}>
            <View style={styles.scoreBlock}>
                <Text style={styles.score}>{average.toFixed(1)}</Text>
                <Text style={styles.scoreMax}>/5</Text>
            </View>

            <View style={styles.right}>
                <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                            key={star}
                            name={
                                star <= Math.round(average)
                                    ? 'star'
                                    : star - 0.5 <= average
                                        ? 'star-half'
                                        : 'star-outline'
                            }
                            size={18}
                            color="#F59E0B"
                        />
                    ))}
                </View>
                <Text style={[styles.totalText, { color: colors.textSecondary }]}>
                    Basé sur {total} avis
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 18,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 18,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    scoreBlock: {
        flexDirection: 'row',
        alignItems: 'baseline',
        paddingRight: 18,
        borderRightWidth: 1,
        borderRightColor: '#F2EEE9',
    },
    score: {
        fontSize: 40,
        fontWeight: '800',
        color: '#1C1917',
        letterSpacing: -1,
    },
    scoreMax: {
        fontSize: 16,
        fontWeight: '600',
        color: '#A8A29E',
        marginLeft: 1,
    },
    right: {
        gap: 6,
    },
    stars: {
        flexDirection: 'row',
        gap: 3,
    },
    totalText: {
        fontSize: 13.5,
        fontWeight: '500',
    },
})
