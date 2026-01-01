"use client"

import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native"
import {SafeAreaView} from "react-native-safe-area-context"
import {useRouter} from "expo-router"
import {Ionicons} from "@expo/vector-icons"
import {Colors} from "@/constants/Colors"
import {useAuth} from "@/contexts/AuthContext"
import {Button} from "@/components/ui/Button"
import * as ImagePicker from "expo-image-picker"
import {useState} from "react"
import {supabase} from "@/lib/supabase"
import {CustomAlertManager} from "@/components/CustomAlert"

const APP_VERSION = "1.0.0"

export default function ProfileScreen() {
    const router = useRouter()
    const {user, profile, signOut} = useAuth()
    const [uploading, setUploading] = useState(false)

    const pickAndUploadAvatar = async () => {
        try {
            const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync()

            if (status !== "granted") {
                CustomAlertManager.alert("Permission refusée", "Nous avons besoin d'accéder à ta galerie", undefined, "warning")
                return
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            })

            if (!result.canceled && result.assets[0]) {
                setUploading(true)
                const imageUri = result.assets[0].uri

                // Upload vers Supabase Storage
                const fileExt = imageUri.split(".").pop()
                const fileName = `${user?.id}-${Date.now()}.${fileExt}`
                const filePath = `${fileName}`

                const formData = new FormData()
                formData.append("file", {
                    uri: imageUri,
                    name: fileName,
                    type: `image/${fileExt}`,
                } as any)

                const {data: uploadData, error: uploadError} = await supabase.storage
                    .from("restaurant-images")
                    .upload(filePath, formData)

                if (uploadError) throw uploadError

                // Récupérer l'URL publique
                const {
                    data: {publicUrl},
                } = supabase.storage.from("restaurant-images").getPublicUrl(filePath)

                // Mettre à jour le profil
                const {error: updateError} = await supabase
                    .from("profiles")
                    .update({avatar_url: publicUrl})
                    .eq("id", user?.id)

                if (updateError) throw updateError

                CustomAlertManager.alert("Succès", "Ta photo de profil a été mise à jour", undefined, "success")
                // Recharger le profil
                window.location.reload()
            }
        } catch (error) {
            console.error("Error uploading avatar:", error)
            CustomAlertManager.alert("Erreur", "Impossible d'uploader la photo", undefined, "error")
        } finally {
            setUploading(false)
        }
    }

    if (!user) {
        return (
            <SafeAreaView style={[styles.container, {backgroundColor: Colors.light.background}]}>
                <View style={styles.emptyContainer}>
                    <Ionicons name="person-circle-outline" size={80} color={Colors.light.textSecondary}/>
                    <Text style={[styles.emptyTitle, {color: Colors.light.text}]}>Non connecté</Text>
                    <Text style={[styles.emptySubtitle, {color: Colors.light.textSecondary}]}>
                        Connecte-toi pour accéder à ton profil
                    </Text>
                    <Button title="Se connecter" onPress={() => router.push("/auth/login")} style={styles.button}/>
                </View>
            </SafeAreaView>
        )
    }

    const displayName = profile?.full_name || user.email?.split("@")[0] || "Utilisateur"
    const isOwner = profile?.role === "restaurant_owner"

    return (
        <SafeAreaView style={[styles.container, {backgroundColor: Colors.light.background}]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={pickAndUploadAvatar} disabled={uploading}>
                            {profile?.avatar_url ? (
                                <Image source={{uri: profile.avatar_url}} style={styles.avatarImage}/>
                            ) : (
                                <View style={[styles.avatarContainer, {backgroundColor: Colors.light.primary}]}>
                                    <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
                                </View>
                            )}
                            <View style={[styles.editIconContainer, {backgroundColor: Colors.light.primary}]}>
                                <Ionicons name="camera" size={16} color="#FFFFFF"/>
                            </View>
                        </TouchableOpacity>

                        <Text style={[styles.name, {color: Colors.light.text}]}>{displayName}</Text>
                        <Text style={[styles.email, {color: Colors.light.textSecondary}]}>{user.email}</Text>

                        {/* Badge du type d'utilisateur */}
                        <View
                            style={[styles.badge, {backgroundColor: isOwner ? "#F59E0B20" : Colors.light.primary + "20"}]}>
                            <Ionicons
                                name={isOwner ? "business" : "school"}
                                size={14}
                                color={isOwner ? "#F59E0B" : Colors.light.primary}
                            />
                            <Text style={[styles.badgeText, {color: isOwner ? "#F59E0B" : Colors.light.primary}]}>
                                {isOwner ? "Gérant" : "Étudiant"}
                            </Text>
                        </View>
                    </View>

                    {/* Menu options */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, {color: Colors.light.textSecondary}]}>GESTION</Text>

                        {isOwner && (
                            <TouchableOpacity
                                onPress={() => router.push("/owner/restaurants")}
                                style={[styles.menuItem, {
                                    backgroundColor: Colors.light.surface,
                                    borderColor: Colors.light.border
                                }]}
                            >
                                <View style={styles.menuItemLeft}>
                                    <View
                                        style={[styles.iconContainer, {backgroundColor: `${Colors.light.primary}20`}]}>
                                        <Ionicons name="restaurant" size={20} color={Colors.light.primary}/>
                                    </View>
                                    <Text style={[styles.menuItemText, {color: Colors.light.text}]}>Mes
                                        restaurants</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary}/>
                            </TouchableOpacity>
                        )}

                        {/* Mes favoris */}
                        <TouchableOpacity
                            onPress={() => router.push("/(tabs)/favorites")}
                            style={[styles.menuItem, {
                                backgroundColor: Colors.light.surface,
                                borderColor: Colors.light.border
                            }]}
                        >
                            <View style={styles.menuItemLeft}>
                                <View style={[styles.iconContainer, {backgroundColor: "#FEE2E220"}]}>
                                    <Ionicons name="heart" size={20} color="#EF4444"/>
                                </View>
                                <Text style={[styles.menuItemText, {color: Colors.light.text}]}>Mes favoris</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary}/>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push("/profile/reviews")}
                            style={[styles.menuItem, {
                                backgroundColor: Colors.light.surface,
                                borderColor: Colors.light.border
                            }]}
                        >
                            <View style={styles.menuItemLeft}>
                                <View style={[styles.iconContainer, {backgroundColor: "#FEF3C720"}]}>
                                    <Ionicons name="star" size={20} color="#F59E0B"/>
                                </View>
                                <Text style={[styles.menuItemText, {color: Colors.light.text}]}>Mes avis</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary}/>
                        </TouchableOpacity>
                    </View>

                    {/* Paramètres */}
                    <View style={styles.section}>
                        {/*<Text style={[styles.sectionTitle, {color: Colors.light.textSecondary}]}>PARAMÈTRES</Text>

                         <TouchableOpacity
              onPress={() => router.push("/profile/notifications")}
              style={[styles.menuItem, { backgroundColor: Colors.light.surface, borderColor: Colors.light.border }]}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: `${Colors.light.primary}20` }]}>
                  <Ionicons name="notifications" size={20} color={Colors.light.primary} />
                </View>
                <Text style={[styles.menuItemText, { color: Colors.light.text }]}>Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary} />
            </TouchableOpacity> */}
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, {color: Colors.light.textSecondary}]}>À PROPOS</Text>

                        <TouchableOpacity
                            onPress={() => router.push("/legal/mentions")}
                            style={[styles.menuItem, {
                                backgroundColor: Colors.light.surface,
                                borderColor: Colors.light.border
                            }]}
                        >
                            <View style={styles.menuItemLeft}>
                                <View
                                    style={[styles.iconContainer, {backgroundColor: `${Colors.light.textSecondary}20`}]}>
                                    <Ionicons name="document-text" size={20} color={Colors.light.textSecondary}/>
                                </View>
                                <Text style={[styles.menuItemText, {color: Colors.light.text}]}>Mentions légales</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary}/>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push("/legal/terms")}
                            style={[styles.menuItem, {
                                backgroundColor: Colors.light.surface,
                                borderColor: Colors.light.border
                            }]}
                        >
                            <View style={styles.menuItemLeft}>
                                <View
                                    style={[styles.iconContainer, {backgroundColor: `${Colors.light.textSecondary}20`}]}>
                                    <Ionicons name="shield-checkmark" size={20} color={Colors.light.textSecondary}/>
                                </View>
                                <Text style={[styles.menuItemText, {color: Colors.light.text}]}>Conditions
                                    d'utilisation</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary}/>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push("/legal/privacy")}
                            style={[styles.menuItem, {
                                backgroundColor: Colors.light.surface,
                                borderColor: Colors.light.border
                            }]}
                        >
                            <View style={styles.menuItemLeft}>
                                <View
                                    style={[styles.iconContainer, {backgroundColor: `${Colors.light.textSecondary}20`}]}>
                                    <Ionicons name="lock-closed" size={20} color={Colors.light.textSecondary}/>
                                </View>
                                <Text style={[styles.menuItemText, {color: Colors.light.text}]}>Politique de
                                    confidentialité</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary}/>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push("/legal/help")}
                            style={[styles.menuItem, {
                                backgroundColor: Colors.light.surface,
                                borderColor: Colors.light.border
                            }]}
                        >
                            <View style={styles.menuItemLeft}>
                                <View
                                    style={[styles.iconContainer, {backgroundColor: `${Colors.light.textSecondary}20`}]}>
                                    <Ionicons name="help-circle" size={20} color={Colors.light.textSecondary}/>
                                </View>
                                <Text style={[styles.menuItemText, {color: Colors.light.text}]}>Aide & Support</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary}/>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.versionContainer}>
                        <Text
                            style={[styles.versionText, {color: Colors.light.textSecondary}]}>Version {APP_VERSION}</Text>
                    </View>

                    {/* Déconnexion */}
                    <TouchableOpacity onPress={signOut} style={[styles.signOutButton, {borderColor: "#EF4444"}]}>
                        <Ionicons name="log-out-outline" size={20} color="#EF4444"/>
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
        position: "relative",
    },
    avatarContainer: {
        width: 90,
        height: 90,
        borderRadius: 45,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    avatarImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
        marginBottom: 16,
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
    editIconContainer: {
        position: "absolute",
        bottom: 16,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "#FFFFFF",
    },
})
