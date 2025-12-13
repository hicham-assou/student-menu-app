import {StyleSheet, View, ViewStyle} from 'react-native'
import {useColorScheme} from "@/components/useColorScheme.web";
import {Colors} from '@/constants/Colors'

interface CardProps {
    children: React.ReactNode
    style?: ViewStyle
}

export function Card({ children, style }: CardProps) {
    const colorScheme = useColorScheme() ?? 'light'
    const colors = Colors[colorScheme]

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                },
                style,
            ]}
        >
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        marginBottom: 12,
    },
})