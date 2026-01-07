import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, type TextInputProps } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "@/constants/Colors"

interface InputProps extends TextInputProps {
    label?: string
    error?: string
}

export function Input({ label, error, secureTextEntry, style, ...props }: InputProps) {
    const colors = Colors.light
    const [showPassword, setShowPassword] = useState(false)
    const isPasswordField = secureTextEntry

    return (
        <View style={styles.container}>
            {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
            <View style={styles.inputContainer}>
                <TextInput
                    style={[
                        styles.input,
                        {
                            backgroundColor: colors.background,
                            color: colors.text,
                            borderColor: error ? colors.error : colors.border,
                        },
                        isPasswordField && styles.inputWithIcon,
                        style,
                    ]}
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry={isPasswordField && !showPassword}
                    {...props}
                />
                {isPasswordField && (
                    <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 6,
    },
    inputContainer: {
        position: "relative",
    },
    input: {
        height: 48,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 15,
        borderWidth: 1,
    },
    inputWithIcon: {
        paddingRight: 48,
    },
    eyeButton: {
        position: "absolute",
        right: 12,
        top: 0,
        bottom: 0,
        justifyContent: "center",
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
    },
})
