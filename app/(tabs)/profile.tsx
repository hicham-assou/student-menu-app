import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useColorScheme } from '@/components/useColorScheme.web'
import { Colors } from '@/constants/Colors'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'

export default function ProfileScreen() {
    const colorScheme = useColorScheme() ?? 'light'
    const colors = Colors[colorScheme]
    const router = useRouter()
    const { user, signOut } = useAuth()

    const handleSignOut = async () => {
        Alert.alert(
            'Déconnexion',
            'Veux-tu vraiment te déconnecter ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Déconnexion',
                    style: 'destructive',
                    onPress: async () => {
                        await signOut()
                        router.replace('/')
                    },
                },
            ]
        )
    }

    if (!user) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.emptyContainer}>
                    <Ionicons name="person-circle-outline" size={80} color={colors.textSecondary} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>
                        Non connecté
                    </Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                        Connecte-toi pour accéder à ton profil
                    </Text>
                    <Button
                        title="Se connecter"
                        onPress={() => router.push('/auth/login')}
                        style={styles.button}
                    />
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
                            <Ionicons name="person" size={40} color="#FFFFFF" />
                        </View>
                        <Text style={[styles.email, { color: colors.text }]}>{user.email}</Text>
                    </View>

                    {/* Menu options */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                            GESTION
                        </Text>

                        {/* Mes restaurants */}
                        <TouchableOpacity
                            onPress={() => router.push('/owner/restaurants')}
                            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        >
                            <View style={styles.menuItemLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
                                    <Ionicons name="restaurant" size={20} color={colors.primary} />
                                </View>
                                <Text style={[styles.menuItemText, { color: colors.text }]}>
                                    Mes restaurants
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>

                        {/* Mes favoris */}
                        <TouchableOpacity
                            onPress={() => router.push('/(tabs)/favorites')}
                            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        >
                            <View style={styles.menuItemLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: '#FEE2E220' }]}>
                                    <Ionicons name="heart" size={20} color="#EF4444" />
                                </View>
                                <Text style={[styles.menuItemText, { color: colors.text }]}>
                                    Mes favoris
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>

                        {/* Mes avis */}
                        <TouchableOpacity
                            onPress={() => Alert.alert('Bientôt disponible', 'Cette fonctionnalité arrive bientôt')}
                            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        >
                            <View style={styles.menuItemLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: '#FEF3C720' }]}>
                                    <Ionicons name="star" size={20} color="#F59E0B" />
                                </View>
                                <Text style={[styles.menuItemText, { color: colors.text }]}>
                                    Mes avis
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Paramètres */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                            PARAMÈTRES
                        </Text>

                        <TouchableOpacity
                            onPress={() => Alert.alert('Bientôt disponible', 'Cette fonctionnalité arrive bientôt')}
                            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        >
                            <View style={styles.menuItemLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
                                    <Ionicons name="notifications" size={20} color={colors.primary} />
                                </View>
                                <Text style={[styles.menuItemText, { color: colors.text }]}>
                                    Notifications
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Déconnexion */}
                    <TouchableOpacity
                        onPress={handleSignOut}
                        style={[styles.signOutButton, { borderColor: '#EF4444' }]}
                    >
                        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                        <Text style={styles.signOutText}>Se déconnecter</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    email: {
        fontSize: 18,
        fontWeight: '600',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 8,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuItemText: {
        fontSize: 16,
        fontWeight: '500',
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 16,
    },
    signOutText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        gap: 12,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    emptySubtitle: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        minWidth: 200,
    },
})