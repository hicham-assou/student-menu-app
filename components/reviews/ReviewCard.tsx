"use client"
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { Review } from "@/types"
import { Colors } from "@/constants/Colors"
import { deleteReview } from "@/lib/reviews"
import { useAuth } from "@/contexts/AuthContext"
import { CustomAlertManager } from "@/components/customAlert/CustomAlert"

interface ReviewCardProps {
    review: Review
    onDeleted?: () => void
    onEdit?: () => void
}

export function ReviewCard({ review, onDeleted, onEdit }: ReviewCardProps) {
    const { user } = useAuth()
    const colors = Colors.light
    const isOwnReview = user?.id === review.user_id

    const handleDelete = () => {
        CustomAlertManager.alert(
            "Supprimer l'avis",
            "Es-tu sûr de vouloir supprimer cet avis ?", "confirm", [
            { text: "Annuler", style: "cancel" },
            {
                text: "Supprimer",
                style: "destructive",
                onPress: async () => {
                    const success = await deleteReview(review.id)
                    if (success && onDeleted) {
                        onDeleted()
                    }
                },
            },
        ])
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))

        if (days === 0) return "Aujourd'hui"
        if (days === 1) return "Hier"
        if (days < 7) return `Il y a ${days} jours`
        if (days < 30) return `Il y a ${Math.floor(days / 7)} sem.`
        if (days < 365) return `Il y a ${Math.floor(days / 30)} mois`
        return `Il y a ${Math.floor(days / 365)} ans`
    }

    const getInitials = (name?: string) => {
        if (!name) return "?"
        const parts = name.split(" ")
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        }
        return name[0].toUpperCase()
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    {review.user?.avatar_url ? (
                        <Image source={{ uri: review.user.avatar_url }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                            <Text style={styles.avatarText}>{getInitials(review.user?.full_name)}</Text>
                        </View>
                    )}
                    <View style={styles.userDetails}>
                        <Text style={[styles.userName, { color: colors.text }]}>
                            {review.user?.full_name || "Utilisateur"}
                        </Text>
                        <Text style={[styles.date, { color: colors.textSecondary }]}>
                            {formatDate(review.created_at)}
                        </Text>
                    </View>
                </View>

                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.ratingBadgeText}>{review.rating.toFixed(1)}</Text>
                </View>
            </View>

            {review.comment ? (
                <Text style={[styles.comment, { color: colors.text }]}>{review.comment}</Text>
            ) : null}

            {isOwnReview && (
                <View style={styles.actions}>
                    <TouchableOpacity onPress={onEdit} style={styles.actionButton} activeOpacity={0.7}>
                        <Ionicons name="create-outline" size={16} color={colors.primary} />
                        <Text style={[styles.actionText, { color: colors.primary }]}>Modifier</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDelete} style={styles.actionButton} activeOpacity={0.7}>
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        <Text style={[styles.actionText, { color: "#EF4444" }]}>Supprimer</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 18,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        marginRight: 12,
    },
    avatarPlaceholder: {
        width: 42,
        height: 42,
        borderRadius: 21,
        marginRight: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: 15,
        fontWeight: "700",
        marginBottom: 2,
    },
    date: {
        fontSize: 12.5,
    },
    ratingBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        backgroundColor: "#FEF3C7",
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 20,
    },
    ratingBadgeText: {
        fontSize: 12.5,
        fontWeight: "700",
        color: "#B45309",
    },
    comment: {
        fontSize: 14.5,
        lineHeight: 21,
        marginTop: 12,
    },
    actions: {
        flexDirection: "row",
        gap: 18,
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#F2EEE9",
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    actionText: {
        fontSize: 13.5,
        fontWeight: "600",
    },
})
