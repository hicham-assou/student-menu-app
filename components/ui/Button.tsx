import {ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle} from 'react-native'
import {useColorScheme} from "@/components/useColorScheme.web";
import {Colors} from '@/constants/Colors'

interface ButtonProps {
    title: string
    onPress: () => void
    variant?: 'primary' | 'secondary' | 'outline'
    loading?: boolean
    disabled?: boolean
    style?: ViewStyle
}

export function Button({
                           title,
                           onPress,
                           variant = 'primary',
                           loading = false,
                           disabled = false,
                           style,
                       }: ButtonProps) {
    const colorScheme = useColorScheme() ?? 'light'
    const colors = Colors[colorScheme]

    const isPrimary = variant === 'primary'
    const isOutline = variant === 'outline'

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.button,
                {
                    backgroundColor: isPrimary ? colors.primary : isOutline ? 'transparent' : colors.surface,
                    borderColor: isOutline ? colors.primary : 'transparent',
                    borderWidth: isOutline ? 1.5 : 0,
                    opacity: disabled ? 0.5 : 1,
                },
                style,
            ]}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={isPrimary ? '#FFFFFF' : colors.primary} />
            ) : (
                <Text
                    style={[
                        styles.text,
                        {
                            color: isPrimary ? '#FFFFFF' : colors.primary,
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
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
    },
})