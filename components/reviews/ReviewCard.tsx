import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {Ionicons} from '@expo/vector-icons'
import {useColorScheme} from "@/components/useColorScheme.web";
import {Colors} from '@/constants/Colors'
import {useAuth} from '@/contexts/AuthContext'
import {deleteReview} from '@/lib/reviews'
import type {Review} from '@/types'

interface ReviewCardProps {
    review: Review
    onDeleted?: () => void
    onEdit?: () => void
}

export function ReviewCard({review, onDeleted, onEdit}: ReviewCardProps) {
    const colorScheme = useColorScheme() ?? 'light'
    const colors = Colors[colorScheme]
    const {user} = useAuth()

    const isOwner = user?.id === review.user_id

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return 'Aujourd\'hui'
        if (diffDays === 1) return 'Hier'
        if (diffDays < 7) return `Il y a ${diffDays} jours`
        if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`
        return date.toLocaleDateString('fr-FR', {day: 'numeric', month: 'long', year: 'numeric'})
    }

    const handleDelete = () => {
        Alert.alert(
            'Supprimer l\'avis',
            'Es-tu sur de vouloir supprimer ton avis ?',
            [
                {text: 'Annuler', style: 'cancel'},
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await deleteReview(review.id)
                        if (success) {
                            Alert.alert('Succes', 'Ton avis a ete supprime')
                            onDeleted?.()
                        } else {
                            Alert.alert('Erreur', 'Impossible de supprimer l\'avis')
                        }
                    },
                },
            ]
        )
    }

    return (
        <View style={[styles.card, {backgroundColor: colors.surface, borderColor: colors.border}]}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Ionicons name="person-circle" size={40} color={colors.primary}/>
                </View>

                <View style={styles.headerInfo}>
                    <Text style={[styles.name, {color: colors.text}]}>
                        {review.user?.full_name || 'Utilisateur'}
                    </Text>
                    <View style={styles.ratingContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons
                                key={star}
                                name={star <= review.rating ? 'star' : 'star-outline'}
                                size={14}
                                color="#F59E0B"
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.headerRight}>
                    <Text style={[styles.date, {color: colors.textSecondary}]}>
                        {formatDate(review.created_at)}
                    </Text>
                    {isOwner && (
                        <View style={styles.actions}>
                            {onEdit && (
                                <TouchableOpacity onPress={onEdit} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                                    <Ionicons name="pencil" size={18} color={colors.primary}/>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={handleDelete}
                                              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                                <Ionicons name="trash-outline" size={18} color="#EF4444"/>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            {review.comment && (
                <Text style={[styles.comment, {color: colors.text}]}>
                    {review.comment}
                </Text>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 14,
        marginBottom: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    avatar: {
        marginRight: 10,
    },
    headerInfo: {
        flex: 1,
    },
    name: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        gap: 2,
    },
    headerRight: {
        alignItems: 'flex-end',
        gap: 8,
    },
    date: {
        fontSize: 12,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    comment: {
        fontSize: 14,
        lineHeight: 20,
    },
})