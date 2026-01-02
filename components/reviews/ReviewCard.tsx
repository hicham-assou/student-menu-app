"use client"
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { Review } from "@/types"
import { Colors } from "@/constants/Colors"
import { deleteReview } from "@/lib/reviews"
import { useAuth } from "@/contexts/AuthContext"
import { CustomAlertManager } from "@/components/customAlert/CustomAlert"
import {supabase} from "@/lib/supabase";

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
            {text: "Annuler", style: "cancel"},
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
        if (days < 30) return `Il y a ${Math.floor(days / 7)} semaines`
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
        <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
                        <Text style={[styles.userName, { color: colors.text }]}>{review.user?.full_name || "Utilisateur"}</Text>
                        <Text style={[styles.date, { color: colors.textSecondary }]}>{formatDate(review.created_at)}</Text>
                    </View>
                </View>

                <View style={styles.ratingContainer}>
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Ionicons
                            key={index}
                            name={index < review.rating ? "star" : "star-outline"}
                            size={16}
                            color={index < review.rating ? "#FFA500" : colors.border}
                        />
                    ))}
                </View>
            </View>

            {review.comment && <Text style={[styles.comment, { color: colors.text }]}>{review.comment}</Text>}

            {isOwnReview && (
                <View style={styles.actions}>
                    <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
                        <Ionicons name="create-outline" size={18} color={colors.primary} />
                        <Text style={[styles.actionText, { color: colors.primary }]}>Modifier</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        <Text style={[styles.actionText, { color: "#EF4444" }]}>Supprimer</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 2,
    },
    date: {
        fontSize: 12,
    },
    ratingContainer: {
        flexDirection: "row",
        gap: 2,
    },
    comment: {
        fontSize: 14,
        lineHeight: 20,
        marginTop: 8,
    },
    actions: {
        flexDirection: "row",
        gap: 16,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    actionText: {
        fontSize: 14,
        fontWeight: "500",
    },
})
