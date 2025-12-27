import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useColorScheme } from "@/components/useColorScheme.web"
import { Colors } from "@/constants/Colors"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/Button"

const APP_VERSION = "1.0.0"

export default function ProfileScreen() {
    const colorScheme = useColorScheme() ?? "light"
    const colors = Colors[colorScheme]
    const router = useRouter()
    const { user, profile, signOut } = useAuth()

    const handleSignOut = async () => {
        Alert.alert("Déconnexion", "Veux-tu vraiment te déconnecter ?", [
            { text: "Annuler", style: "cancel" },
            {
                text: "Déconnexion",
                style: "destructive",
                onPress: async () => {
                    await signOut()
                    router.replace("/")
                },
            },
        ])
    }

    if (!user) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.emptyContainer}>
                    <Ionicons name="person-circle-outline" size={80} color={colors.textSecondary} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>Non connecté</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                        Connecte-toi pour accéder à ton profil
                    </Text>
                    <Button title="Se connecter" onPress={() => router.push("/auth/login")} style={styles.button} />
                </View>
            </SafeAreaView>
        )
    }

    const displayName = profile?.full_name || user.email?.split("@")[0] || "Utilisateur"
    const isOwner = profile?.role === "restaurant_owner"

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
                            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
                        </View>
                        <Text style={[styles.name, { color: colors.text }]}>{displayName}</Text>
                        <Text style={[styles.email, { color: colors.textSecondary }]}>{user.email}</Text>

                        {/* Badge du type d'utilisateur */}
                        <View style={[styles.badge, { backgroundColor: isOwner ? "#F59E0B20" : colors.primary + "20" }]}>
                            <Ionicons name={isOwner ? "business" : "school"} size={14} color={isOwner ? "#F59E0B" : colors.primary} />
                            <Text style={[styles.badgeText, { color: isOwner ? "#F59E0B" : colors.primary }]}>
                                {isOwner ? "Gérant" : "Étudiant"}
                            </Text>
                        </View>
                    </View>

                    {/* Menu options */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>GESTION</Text>

                        {isOwner && (
                            <TouchableOpacity
                                onPress={() => router.push("/owner/restaurants")}
                                style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            >
                                <View style={styles.menuItemLeft}>
                                    <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
                                        <Ionicons name="restaurant" size={20} color={colors.primary} />
                                    </View>
                                    <Text style={[styles.menuItemText, { color: colors.text }]}>Mes restaurants</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        )}

                        {/* Mes favoris */}
                        <TouchableOpacity
                            onPress={() => router.push("/(tabs)/favorites")}
                            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        >
                            <View style={styles.menuItemLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: "#FEE2E220" }]}>
                                    <Ionicons name="heart" size={20} color="#EF4444" />
                                </View>
                                <Text style={[styles.menuItemText, { color: colors.text }]}>Mes favoris</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>

                        {/* Mes avis */}
                        <TouchableOpacity
                            onPress={() => Alert.alert("Bientôt disponible", "Cette fonctionnalité arrive bientôt")}
                            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        >
                            <View style={styles.menuItemLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: "#FEF3C720" }]}>
                                    <Ionicons name="star" size={20} color="#F59E0B" />
                                </View>
                                <Text style={[styles.menuItemText, { color: colors.text }]}>Mes avis</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Paramètres */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PARAMÈTRES</Text>

                        <TouchableOpacity
                            onPress={() => Alert.alert("Bientôt disponible", "Cette fonctionnalité arrive bientôt")}
                            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        >
                            <View style={styles.menuItemLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
                                    <Ionicons name="notifications" size={20} color={colors.primary} />
                                </View>
                                <Text style={[styles.menuItemText, { color: colors.text }]}>Notifications</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>À PROPOS</Text>

                        <TouchableOpacity
                            onPress={() =>
                                Alert.alert(
                                    "Mentions légales",
                                    "StudentFood\n\nÉditeur: [Nom de votre entreprise]\nSiège social: [Adresse]\n\nContact: contact@studentfood.com",
                                )
                            }
                            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        >
                            <View style={styles.menuItemLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: `${colors.textSecondary}20` }]}>
                                    <Ionicons name="document-text" size={20} color={colors.textSecondary} />
                                </View>
                                <Text style={[styles.menuItemText, { color: colors.text }]}>Mentions légales</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() =>
                                Alert.alert(
                                    "Conditions d'utilisation",
                                    "En utilisant StudentFood, vous acceptez nos conditions d'utilisation.\n\nDernière mise à jour: Décembre 2024",
                                )
                            }
                            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        >
                            <View style={styles.menuItemLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: `${colors.textSecondary}20` }]}>
                                    <Ionicons name="shield-checkmark" size={20} color={colors.textSecondary} />
                                </View>
                                <Text style={[styles.menuItemText, { color: colors.text }]}>Conditions d'utilisation</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() =>
                                Alert.alert(
                                    "Politique de confidentialité",
                                    "Vos données personnelles sont protégées et ne sont jamais partagées avec des tiers.\n\nPour plus d'informations: privacy@studentfood.com",
                                )
                            }
                            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        >
                            <View style={styles.menuItemLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: `${colors.textSecondary}20` }]}>
                                    <Ionicons name="lock-closed" size={20} color={colors.textSecondary} />
                                </View>
                                <Text style={[styles.menuItemText, { color: colors.text }]}>Politique de confidentialité</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() =>
                                Alert.alert(
                                    "Aide & Support",
                                    "Besoin d'aide ?\n\nEmail: support@studentfood.com\n\nDisponible du lundi au vendredi de 9h à 18h",
                                )
                            }
                            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        >
                            <View style={styles.menuItemLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: `${colors.textSecondary}20` }]}>
                                    <Ionicons name="help-circle" size={20} color={colors.textSecondary} />
                                </View>
                                <Text style={[styles.menuItemText, { color: colors.text }]}>Aide & Support</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.versionContainer}>
                        <Text style={[styles.versionText, { color: colors.textSecondary }]}>Version {APP_VERSION}</Text>
                    </View>

                    {/* Déconnexion */}
                    <TouchableOpacity onPress={handleSignOut} style={[styles.signOutButton, { borderColor: "#EF4444" }]}>
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
        alignItems: "center",
        paddingVertical: 32,
    },
    avatarContainer: {
        width: 90,
        height: 90,
        borderRadius: 45,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    name: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        marginBottom: 12,
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "600",
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 8,
    },
    menuItemLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    menuItemText: {
        fontSize: 16,
        fontWeight: "500",
    },
    versionContainer: {
        alignItems: "center",
        paddingVertical: 12,
        marginBottom: 8,
    },
    versionText: {
        fontSize: 13,
        fontWeight: "500",
    },
    signOutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 8,
    },
    signOutText: {
        color: "#EF4444",
        fontSize: 16,
        fontWeight: "600",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
        gap: 12,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "600",
    },
    emptySubtitle: {
        fontSize: 15,
        textAlign: "center",
        marginBottom: 20,
    },
    button: {
        minWidth: 200,
    },
})
