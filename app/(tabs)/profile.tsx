import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "@/constants/Colors"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/Button"
import * as ImagePicker from "expo-image-picker"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { CustomAlertManager } from "@/components/customAlert/CustomAlert"

const APP_VERSION = "1.0.0"
const colors = Colors.light

interface MenuRowProps {
    icon: keyof typeof Ionicons.glyphMap
    iconColor: string
    iconBg: string
    label: string
    onPress: () => void
    isLast?: boolean
}

function MenuRow({ icon, iconColor, iconBg, label, onPress, isLast }: MenuRowProps) {
    return (
        <TouchableOpacity onPress={onPress} style={[styles.menuItem, !isLast && styles.menuItemBorder]} activeOpacity={0.6}>
            <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
                    <Ionicons name={icon} size={19} color={iconColor} />
                </View>
                <Text style={[styles.menuItemText, { color: colors.text }]}>{label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={19} color="#C7C0B8" />
        </TouchableOpacity>
    )
}

export default function ProfileScreen() {
    const router = useRouter()
    const { user, profile, signOut, deleteAccount, refreshProfile } = useAuth()
    const [uploading, setUploading] = useState(false)

    const pickAndUploadAvatar = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

            if (status !== "granted") {
                CustomAlertManager.alert("Permission refusée", "Nous avons besoin d'accéder à ta galerie", "warning")
                return
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            })

            if (!result.canceled && result.assets[0]) {
                setUploading(true)
                const imageUri = result.assets[0].uri

                const fileExt = imageUri.split(".").pop()
                const fileName = `${user?.id}-${Date.now()}.${fileExt}`
                const filePath = `${fileName}`

                const formData = new FormData()
                formData.append("file", {
                    uri: imageUri,
                    name: fileName,
                    type: `image/${fileExt}`,
                } as any)

                const { error: uploadError } = await supabase.storage
                    .from("restaurant-images")
                    .upload(filePath, formData)

                if (uploadError) throw uploadError

                const {
                    data: { publicUrl },
                } = supabase.storage.from("restaurant-images").getPublicUrl(filePath)

                const { error: updateError } = await supabase
                    .from("profiles")
                    .update({ avatar_url: publicUrl })
                    .eq("id", user?.id)

                if (updateError) throw updateError

                CustomAlertManager.alert("Succès", "Ta photo de profil a été mise à jour", "success")
                await refreshProfile()
            }
        } catch (error) {
            console.error("Error uploading avatar:", error)
            CustomAlertManager.alert("Erreur", "Impossible d'uploader la photo", "error")
        } finally {
            setUploading(false)
        }
    }

    const handleSignOut = () => {
        CustomAlertManager.alert("Déconnexion", "Es-tu sûr de vouloir te déconnecter ?", "confirm", [
            { text: "Annuler", style: "cancel" },
            { text: "Me déconnecter", onPress: signOut, style: "destructive" },
        ])
    }

    const handleDeleteAccount = () => {
        CustomAlertManager.alert(
            "Supprimer mon compte",
            "Cette action est définitive. Ton compte, tes favoris et tes avis seront supprimés et ne pourront pas être récupérés.",
            "confirm",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer définitivement",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteAccount()
                            CustomAlertManager.alert("Compte supprimé", "Ton compte a bien été supprimé.", "success")
                        } catch (error) {
                            console.error("Error deleting account:", error)
                            CustomAlertManager.alert(
                                "Erreur",
                                "Impossible de supprimer le compte pour le moment. Réessaie ou écris-nous à StudTable@outlook.com.",
                                "error",
                            )
                        }
                    },
                },
            ],
        )
    }

    const renderPublicSection = () => (
        <>
            <Text style={styles.sectionTitle}>À PROPOS</Text>
            <View style={styles.group}>
                <MenuRow
                    icon="document-text-outline"
                    iconColor="#78716C"
                    iconBg="#F5F5F4"
                    label="Mentions légales"
                    onPress={() => router.push("/legal/mentions")}
                />
                <MenuRow
                    icon="shield-checkmark-outline"
                    iconColor="#78716C"
                    iconBg="#F5F5F4"
                    label="Conditions d'utilisation"
                    onPress={() => router.push("/legal/terms")}
                />
                <MenuRow
                    icon="lock-closed-outline"
                    iconColor="#78716C"
                    iconBg="#F5F5F4"
                    label="Politique de confidentialité"
                    onPress={() => router.push("/legal/privacy")}
                />
                <MenuRow
                    icon="help-circle-outline"
                    iconColor="#78716C"
                    iconBg="#F5F5F4"
                    label="Aide & Support"
                    onPress={() => router.push("/legal/help")}
                    isLast
                />
            </View>

            <View style={styles.versionContainer}>
                <Text style={styles.versionText}>Version {APP_VERSION}</Text>
            </View>
        </>
    )

    if (!user) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                    <View style={styles.notLoggedInHeader}>
                        <View style={styles.notLoggedInAvatar}>
                            <Ionicons name="person-outline" size={44} color={colors.primary} />
                        </View>
                        <Text style={[styles.name, { color: colors.text }]}>Non connecté</Text>
                        <Text style={[styles.notLoggedInSubtitle, { color: colors.textSecondary }]}>
                            Connecte-toi pour accéder à ton profil
                        </Text>
                        <Button title="Se connecter" onPress={() => router.push("/auth/login")} style={styles.loginButton} />
                    </View>

                    {renderPublicSection()}
                </ScrollView>
            </SafeAreaView>
        )
    }

    const displayName = profile?.full_name || user.email?.split("@")[0] || "Utilisateur"
    const isOwner = profile?.role === "restaurant_owner"

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Header profil */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={pickAndUploadAvatar} disabled={uploading} activeOpacity={0.8}>
                        {profile?.avatar_url ? (
                            <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
                        ) : (
                            <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
                                <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
                            </View>
                        )}
                        <View style={[styles.editIconContainer, { backgroundColor: colors.primary }]}>
                            <Ionicons name="camera" size={15} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>

                    <Text style={[styles.name, { color: colors.text }]}>{displayName}</Text>
                    <Text style={[styles.email, { color: colors.textSecondary }]}>{user.email}</Text>

                    <View style={[styles.badge, { backgroundColor: isOwner ? "#FEF3C7" : "#FFF1E8" }]}>
                        <Ionicons
                            name={isOwner ? "business" : "school"}
                            size={13}
                            color={isOwner ? "#D97706" : colors.primary}
                        />
                        <Text style={[styles.badgeText, { color: isOwner ? "#D97706" : colors.primary }]}>
                            {isOwner ? "Gérant" : "Étudiant"}
                        </Text>
                    </View>
                </View>

                {/* Gestion */}
                <Text style={styles.sectionTitle}>GESTION</Text>
                <View style={styles.group}>
                    {isOwner && (
                        <MenuRow
                            icon="restaurant-outline"
                            iconColor={colors.primary}
                            iconBg="#FFF1E8"
                            label="Mes restaurants"
                            onPress={() => router.push("/owner/restaurants")}
                        />
                    )}
                    <MenuRow
                        icon="heart-outline"
                        iconColor="#EF4444"
                        iconBg="#FEE2E2"
                        label="Mes favoris"
                        onPress={() => router.push("/(tabs)/favorites")}
                    />
                    <MenuRow
                        icon="star-outline"
                        iconColor="#D97706"
                        iconBg="#FEF3C7"
                        label="Mes avis"
                        onPress={() => router.push("/profile/reviews")}
                        isLast
                    />
                </View>

                {renderPublicSection()}

                {/* Déconnexion */}
                <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton} activeOpacity={0.7}>
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    <Text style={styles.signOutText}>Se déconnecter</Text>
                </TouchableOpacity>

                {/* Suppression de compte (exigence Play Store) */}
                <TouchableOpacity onPress={handleDeleteAccount} style={styles.deleteAccountButton} activeOpacity={0.6}>
                    <Ionicons name="trash-outline" size={16} color="#A8A29E" />
                    <Text style={styles.deleteAccountText}>Supprimer mon compte</Text>
                </TouchableOpacity>
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
        paddingBottom: 110,
    },
    header: {
        alignItems: "center",
        paddingVertical: 24,
        position: "relative",
    },
    avatarContainer: {
        width: 92,
        height: 92,
        borderRadius: 46,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 14,
    },
    avatarImage: {
        width: 92,
        height: 92,
        borderRadius: 46,
        marginBottom: 14,
        borderWidth: 3,
        borderColor: "#FFFFFF",
    },
    avatarText: {
        fontSize: 38,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    editIconContainer: {
        position: "absolute",
        bottom: 14,
        right: 0,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "#FAFAF9",
    },
    name: {
        fontSize: 23,
        fontWeight: "800",
        marginBottom: 3,
        letterSpacing: -0.4,
    },
    email: {
        fontSize: 14,
        marginBottom: 12,
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 13,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badgeText: {
        fontSize: 12.5,
        fontWeight: "700",
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 0.8,
        color: "#A8A29E",
        marginBottom: 10,
        marginLeft: 4,
        marginTop: 24,
    },
    group: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 14,
        paddingVertical: 14,
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: "#F2EEE9",
    },
    menuItemLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 13,
    },
    iconContainer: {
        width: 38,
        height: 38,
        borderRadius: 11,
        justifyContent: "center",
        alignItems: "center",
    },
    menuItemText: {
        fontSize: 15.5,
        fontWeight: "600",
    },
    versionContainer: {
        alignItems: "center",
        paddingVertical: 20,
    },
    versionText: {
        fontSize: 13,
        fontWeight: "500",
        color: "#A8A29E",
    },
    signOutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 15,
        borderRadius: 16,
        backgroundColor: "#FEF2F2",
        marginTop: 8,
    },
    signOutText: {
        color: "#EF4444",
        fontSize: 15.5,
        fontWeight: "700",
    },
    deleteAccountButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 14,
        marginTop: 4,
    },
    deleteAccountText: {
        color: "#A8A29E",
        fontSize: 13.5,
        fontWeight: "600",
        textDecorationLine: "underline",
    },
    notLoggedInHeader: {
        alignItems: "center",
        paddingVertical: 32,
        paddingHorizontal: 20,
        gap: 10,
    },
    notLoggedInAvatar: {
        width: 92,
        height: 92,
        borderRadius: 46,
        backgroundColor: "#FFF1E8",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 6,
    },
    notLoggedInSubtitle: {
        fontSize: 14.5,
        textAlign: "center",
        marginBottom: 14,
    },
    loginButton: {
        minWidth: 220,
    },
})
