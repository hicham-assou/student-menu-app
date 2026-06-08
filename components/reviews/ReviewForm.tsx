import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { Colors } from "@/constants/Colors"
import { upsertReview } from "@/lib/reviews"
import type { Review } from "@/types"
import { CustomAlertManager } from "@/components/customAlert/CustomAlert"

interface ReviewFormProps {
    restaurantId: string
    existingReview?: Review | null
    onSuccess: () => void
    onCancel?: () => void
}

const RATING_LABELS = ["", "Décevant", "Moyen", "Correct", "Très bien", "Excellent !"]

export function ReviewForm({ restaurantId, existingReview, onSuccess, onCancel }: ReviewFormProps) {
    const colors = Colors.light

    const [rating, setRating] = useState(existingReview?.rating || 0)
    const [comment, setComment] = useState(existingReview?.comment || "")
    const [loading, setLoading] = useState(false)
    const [focused, setFocused] = useState(false)

    const handleSubmit = async () => {
        if (rating === 0) {
            CustomAlertManager.alert("Erreur", "Sélectionne une note", "error")
            return
        }

        try {
            setLoading(true)
            const result = await upsertReview(restaurantId, rating, comment)

            if (result) {
                CustomAlertManager.alert(
                    "Succès",
                    existingReview ? "Ton avis a été mis à jour" : "Ton avis a été publié",
                    "success",
                    [{ text: "OK", onPress: onSuccess }],
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
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={[styles.title, { color: colors.text }]}>
                    {existingReview ? "Modifier mon avis" : "Donne ton avis"}
                </Text>
                {onCancel && (
                    <TouchableOpacity onPress={onCancel} hitSlop={10}>
                        <Ionicons name="close" size={22} color="#A8A29E" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Étoiles */}
            <View style={styles.starsBlock}>
                <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity
                            key={star}
                            onPress={() => setRating(star)}
                            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={star <= rating ? "star" : "star-outline"}
                                size={38}
                                color={star <= rating ? "#F59E0B" : "#E7E1DA"}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
                <Text style={[styles.ratingLabel, { color: rating > 0 ? colors.primary : "#A8A29E" }]}>
                    {rating > 0 ? RATING_LABELS[rating] : "Touche les étoiles pour noter"}
                </Text>
            </View>

            {/* Commentaire */}
            <TextInput
                placeholder="Partage ton expérience (optionnel)..."
                placeholderTextColor="#A8A29E"
                value={comment}
                onChangeText={setComment}
                multiline
                style={[styles.textInput, focused && styles.textInputFocused]}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
            />

            {/* Bouton publier */}
            <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                activeOpacity={0.85}
            >
                <Text style={styles.submitText}>
                    {loading ? "Envoi..." : existingReview ? "Mettre à jour" : "Publier mon avis"}
                </Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 14,
        elevation: 3,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: "800",
        letterSpacing: -0.3,
    },
    starsBlock: {
        alignItems: "center",
        gap: 8,
        marginBottom: 18,
    },
    stars: {
        flexDirection: "row",
        gap: 10,
    },
    ratingLabel: {
        fontSize: 14,
        fontWeight: "700",
    },
    textInput: {
        backgroundColor: "#FAFAF9",
        borderWidth: 1.5,
        borderColor: "#ECE7E1",
        borderRadius: 14,
        padding: 14,
        fontSize: 14.5,
        color: "#1C1917",
        textAlignVertical: "top",
        minHeight: 100,
        marginBottom: 16,
    },
    textInputFocused: {
        borderColor: "#F97316",
        backgroundColor: "#FFFFFF",
    },
    submitBtn: {
        backgroundColor: "#F97316",
        borderRadius: 16,
        paddingVertical: 15,
        alignItems: "center",
        justifyContent: "center",
    },
    submitBtnDisabled: {
        opacity: 0.6,
    },
    submitText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
})
