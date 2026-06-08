import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, type ViewStyle } from "react-native"
import { Colors } from "@/constants/Colors"

interface ButtonProps {
    title: string
    onPress: () => void
    variant?: "primary" | "secondary" | "outline"
    loading?: boolean
    disabled?: boolean
    style?: ViewStyle
}

export function Button({ title, onPress, variant = "primary", loading = false, disabled = false, style }: ButtonProps) {
    const colors = Colors.light
    const isPrimary = variant === "primary"

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.button,
                isPrimary
                    ? { backgroundColor: colors.primary }
                    : { backgroundColor: "#FFFFFF", borderWidth: 1.5, borderColor: colors.border },
                (disabled || loading) && styles.disabled,
                style,
            ]}
            activeOpacity={0.85}
        >
            {loading ? (
                <ActivityIndicator color={isPrimary ? "#FFFFFF" : colors.primary} />
            ) : (
                <Text style={[styles.text, { color: isPrimary ? "#FFFFFF" : colors.text }]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 52,
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        fontSize: 16,
        fontWeight: "700",
    },
})
