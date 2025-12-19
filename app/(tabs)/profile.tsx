import { View, Text, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useColorScheme} from "@/components/useColorScheme.web";
import { Colors } from '@/constants/Colors'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'

export default function ProfileScreen() {
    const colorScheme = useColorScheme() ?? 'light'
    const colors = Colors[colorScheme]
    const router = useRouter()
    const { user, loading, signOut } = useAuth()

    const handleSignOut = async () => {
        Alert.alert(
            'Deconnexion',
            'Es-tu sur de vouloir te deconnecter ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Deconnecter',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut()
                            Alert.alert('Succes', 'Tu as ete deconnecte')
                        } catch (error: any) {
                            Alert.alert('Erreur', error.message)
                        }
                    },
                },
            ]
        )
    }

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loading}>
                    <Text style={{ color: colors.textSecondary }}>Chargement...</Text>
                </View>
            </SafeAreaView>
        )
    }

    // Si non connecté
    if (!user) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.content}>
                    <Ionicons name="person-circle-outline" size={80} color={colors.textSecondary} />
                    <Text style={[styles.title, { color: colors.text }]}>Pas encore connecte</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Connecte-toi pour sauvegarder tes favoris et laisser des avis
                    </Text>

                    <Button
                        title="Se connecter"
                        onPress={() => router.push('/auth/login')}
                        style={styles.button}
                    />

                    <Button
                        title="Creer un compte"
                        onPress={() => router.push('/auth/signup')}
                        variant="outline"
                        style={styles.button}
                    />
                </View>
            </SafeAreaView>
        )
    }

    // Si connecté
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Mon Profil</Text>
            </View>

            <View style={styles.content}>
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.avatar}>
                        {user.profile?.avatar_url ? (
                            <Text>Image</Text>
                        ) : (
                            <Ionicons name="person-circle" size={80} color={colors.primary} />
                        )}
                    </View>

                    <Text style={[styles.name, { color: colors.text }]}>
                        {user.profile?.full_name || 'Utilisateur'}
                    </Text>
                    <Text style={[styles.email, { color: colors.textSecondary }]}>
                        {user.email}
                    </Text>

                    <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                        <Text style={[styles.badgeText, { color: colors.primary }]}>
                            {user.profile?.role === 'student' ? 'Etudiant' : 'Restaurant'}
                        </Text>
                    </View>
                </View>

                <View style={styles.actions}>
                    <Button
                        title="Se deconnecter"
                        onPress={handleSignOut}
                        variant="outline"
                        style={styles.button}
                    />
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    card: {
        width: '100%',
        borderRadius: 16,
        borderWidth: 1,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        marginBottom: 16,
    },
    name: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        marginBottom: 16,
    },
    badge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    actions: {
        width: '100%',
    },
    button: {
        marginBottom: 12,
    },
})