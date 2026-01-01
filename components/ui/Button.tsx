import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, type ViewStyle } from "react-native"
import { Colors } from "@/constants/Colors"

interface ButtonProps {
    title: string
    onPress: () => void
    variant?: "primary" | "secondary"
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
                {
                    backgroundColor: isPrimary ? colors.primary : colors.surface,
                    borderColor: colors.border,
                },
                (disabled || loading) && styles.disabled,
                style,
            ]}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={isPrimary ? "#FFFFFF" : colors.primary} />
            ) : (
                <Text
                    style={[
                        styles.text,
                        {
                            color: isPrimary ? "#FFFFFF" : colors.text,
                        },
                    ]}
                >
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 48,
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        fontSize: 16,
        fontWeight: "600",
    },
})
