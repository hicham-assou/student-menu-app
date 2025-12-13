import {StyleSheet, Text, TextInput, View, ViewStyle} from 'react-native'
import {useColorScheme} from "@/components/useColorScheme.web";
import {Colors} from '@/constants/Colors'

interface InputProps {
    placeholder?: string
    value: string
    onChangeText: (text: string) => void
    label?: string
    secureTextEntry?: boolean
    style?: ViewStyle
}

export function Input({
                          placeholder,
                          value,
                          onChangeText,
                          label,
                          secureTextEntry = false,
                          style,
                      }: InputProps) {
    const colorScheme = useColorScheme() ?? 'light'
    const colors = Colors[colorScheme]

    return (
        <View style={[styles.container, style]}>
            {label && (
                <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
            )}
            <TextInput
                placeholder={placeholder}
                placeholderTextColor={colors.textSecondary}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                style={[
                    styles.input,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.text,
                    },
                ]}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
    },
    input: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 1,
        fontSize: 16,
    },
})