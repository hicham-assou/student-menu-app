import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { useColorScheme } from '@/components/useColorScheme.web'
import { Colors } from '@/constants/Colors'
import { Button } from '@/components/ui/Button'
import { upsertReview } from '@/lib/reviews'
import type { Review } from '@/types'
import {CustomAlertManager} from "@/components/CustomAlert";

interface ReviewFormProps {
    restaurantId: string
    existingReview?: Review | null
    onSuccess: () => void
    onCancel?: () => void
}

export function ReviewForm({
                               restaurantId,
                               existingReview,
                               onSuccess,
                               onCancel,
                           }: ReviewFormProps) {
    const colors = Colors.light

    const [rating, setRating] = useState(existingReview?.rating || 0)
    const [comment, setComment] = useState(existingReview?.comment || "")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (rating === 0) {
            CustomAlertManager.alert("Erreur", "Selectionne une note", "error")
            return
        }

        try {
            setLoading(true)
            const result = await upsertReview(restaurantId, rating, comment)

            if (result) {
                CustomAlertManager.alert(
                    "Succes",
                    existingReview ? "Ton avis a été mis à jour" : "Ton avis a été publié",
                    "success",
                    [{text: "OK", onPress: onSuccess}],
                )
            } else {
                CustomAlertManager.alert("Erreur", "Impossible de publier l'avis", "error")
            }
        } catch (error) {
            CustomAlertManager.alert("Erreur", "Une erreur est survenue", "error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                },
            ]}
        >
            <Text style={[styles.title, { color: colors.text }]}>
                {existingReview ? "Modifier mon avis" : "Laisser un avis"}
            </Text>

            {/* ⭐ Note */}
            <View style={styles.starsContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Note</Text>
                <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity
                            key={star}
                            onPress={() => setRating(star)}
                            hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
                        >
                            <Ionicons
                                name={star <= rating ? "star" : "star-outline"}
                                size={32}
                                color={
                                    star <= rating
                                        ? "#F59E0B"
                                        : colors.textSecondary
                                }
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* 💬 Commentaire */}
            <View style={styles.commentContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Commentaire (optionnel)</Text>
                <TextInput
                    placeholder="Partage ton expérience..."
                    placeholderTextColor={colors.textSecondary}
                    value={comment}
                    onChangeText={setComment}
                    multiline
                    style={[
                        styles.textInput,
                        {
                            backgroundColor: colors.background,
                            borderColor: colors.border,
                            color: colors.text,
                        },
                    ]}
                />
            </View>

            {/* 🔘 Boutons */}
            <View style={styles.buttons}>
                {onCancel && <Button title="Annuler" onPress={onCancel} variant="secondary" style={styles.button}/>}
                <Button
                    title={existingReview ? "Mettre à jour" : "Publier"}
                    onPress={handleSubmit}
                    loading={loading}
                    style={styles.button}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 16,
    },
    starsContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        marginBottom: 8,
    },
    stars: {
        flexDirection: "row",
        gap: 8,
    },
    commentContainer: {
        marginBottom: 20,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        textAlignVertical: "top",
        minHeight: 100,
    },
    buttons: {
        flexDirection: "row",
        gap: 12,
    },
    button: {
        flex: 1,
    },
})
