import {StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {Ionicons} from '@expo/vector-icons'
import {useColorScheme} from "@/components/useColorScheme.web";
import {Colors} from '@/constants/Colors'

export default function MapScreen() {
    const colorScheme = useColorScheme() ?? 'light'
    const colors = Colors[colorScheme]

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <Ionicons name="map-outline" size={64} color={colors.textSecondary} />
                <Text style={[styles.title, { color: colors.text }]}>Carte</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Bientot disponible
                </Text>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 15,
    },
})