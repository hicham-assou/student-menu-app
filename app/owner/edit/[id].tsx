"use client"

import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image,
    ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import { useColorScheme } from "@/components/useColorScheme.web"
import { Colors } from "@/constants/Colors"
import { useAuth } from "@/contexts/AuthContext"
import { getRestaurants } from "@/lib/api"
import { isRestaurantOwner } from "@/lib/restaurants"
import { Button } from "@/components/ui/Button"
import type { Restaurant, WeeklyHours } from "@/types"
import { getCategory, getTag } from "@/constants/discovery"
import { priceToNumber } from "@/lib/price"
import { useRestaurantStore } from "@/stores/restaurants"
import { HoursEditor } from "@/components/owner/HoursEditor"
import { CategoryRegimeModal } from "@/components/discovery/CategoryRegimeModal"
import * as ImagePicker from "expo-image-picker"
import { supabase } from "@/lib/supabase"
import FormData from "form-data"
import { CustomAlertManager } from "@/components/customAlert/CustomAlert"

export default function EditRestaurantScreen() {
    const colorScheme = useColorScheme() ?? "light"
    const colors = Colors[colorScheme]
    const { id } = useLocalSearchParams<{ id: string }>()
    const router = useRouter()
    const { user } = useAuth()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isOwner, setIsOwner] = useState(false)
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
    const [image, setImage] = useState("")
    const [studentMenus, setStudentMenus] = useState<Array<{ title: string; price: string; image_url?: string }>>([])
    const [uploading, setUploading] = useState(false)
    const [name, setName] = useState("")
    const [address, setAddress] = useState("")
    const [city, setCity] = useState("")
    const [phone, setPhone] = useState("")
    const [website, setWebsite] = useState("")
    const [description, setDescription] = useState("")
    const [isGeocodingAddress, setIsGeocodingAddress] = useState(false)
    const [studentMenuConditions, setStudentMenuConditions] = useState("")
    const [categories, setCategories] = useState<string[]>([])
    const [tags, setTags] = useState<string[]>([])
    const [hours, setHours] = useState<WeeklyHours>({})
    const [showCatModal, setShowCatModal] = useState(false)

    useEffect(() => {
        loadRestaurant()
        requestPermissions()
    }, [id])

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== "granted") {
            CustomAlertManager.alert(
                "Permission requise",
                "Nous avons besoin de la permission pour accéder à ta galerie.",
                "warning",
            )
        }
    }

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.8,
            })

            if (!result.canceled && result.assets[0]) {
                await uploadImage(result.assets[0])
            }
        } catch (error) {
            console.error("Error picking image:", error)
            CustomAlertManager.alert("Erreur", "Impossible de sélectionner l'image", "error")
        }
    }

    const uploadImage = async (asset: ImagePicker.ImagePickerAsset) => {
        setUploading(true)
        try {
            const fileName = `restaurant-${id}-${Date.now()}.jpg`
            const filePath = `restaurants/${fileName}`

            const formData = new FormData()
            formData.append("file", {
                uri: asset.uri,
                name: fileName,
                type: "image/jpeg",
            } as any)

            const { data, error } = await supabase.storage.from("restaurant-images").upload(filePath, formData, {
                contentType: "image/jpeg",
                upsert: true,
            })

            if (error) throw error

            const { data: urlData } = supabase.storage.from("restaurant-images").getPublicUrl(filePath)
            setImage(urlData.publicUrl)

            CustomAlertManager.alert("Succès", "Image uploadée avec succès", "success")
        } catch (error) {
            console.error("Error uploading image:", error)
            CustomAlertManager.alert("Erreur", "Impossible d'uploader l'image", "error")
        } finally {
            setUploading(false)
        }
    }

    const loadRestaurant = async () => {
        if (!id || !user) return

        try {
            setLoading(true)

            const ownerStatus = await isRestaurantOwner(id)
            setIsOwner(ownerStatus)

            if (!ownerStatus) {
                CustomAlertManager.alert("Accès refusé", "Tu n'es pas le propriétaire de ce restaurant", "error")
                router.back()
                return
            }

            const restaurants = await getRestaurants()
            const found = restaurants.find((r) => r.id === id)

            if (found) {
                setRestaurant(found)
                setName(found.name || "")
                setAddress(found.address || "")
                setCity(found.city || "")
                setPhone(found.phone || "")
                setWebsite(found.website || "")
                setDescription(found.description || "")
                setImage(found.image || "")
                setStudentMenus(
                    found.student_menu?.map((menu) => ({
                        title: menu.title,
                        price: priceToNumber(menu.price)?.toString() ?? "", // nombre -> texte pour l'edition
                        image_url: menu.image_url || "",
                    })) || [],
                )
                setStudentMenuConditions(found.student_menu_conditions || "")
                setCategories(found.categories || [])
                setTags(found.tags || [])
                setHours(found.hours || {})
            } else {
                CustomAlertManager.alert("Erreur", "Restaurant introuvable", "error")
                router.back()
            }
        } catch (error) {
            console.error("Error loading restaurant:", error)
            CustomAlertManager.alert("Erreur", "Impossible de charger le restaurant", "error")
            router.back()
        } finally {
            setLoading(false)
        }
    }

    const handleAddMenu = () => {
        setStudentMenus([...studentMenus, { title: "", price: "", image_url: "" }])
    }

    const handleRemoveMenu = (index: number) => {
        setStudentMenus(studentMenus.filter((_, i) => i !== index))
    }

    const handleMenuChange = (index: number, field: "title" | "price" | "image_url", value: string) => {
        const newMenus = [...studentMenus]
        newMenus[index][field] = value
        setStudentMenus(newMenus)
    }

    const pickMenuImage = async (menuIndex: number) => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

            if (!permissionResult.granted) {
                CustomAlertManager.alert("Permission refusée", "Vous devez autoriser l'accès à la galerie", "error")
                return
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            })

            if (!result.canceled && result.assets[0]) {
                setUploading(true)
                const imageUri = result.assets[0].uri
                const fileName = `menu-${id}-${menuIndex}-${Date.now()}.jpg`

                const formData = new FormData()
                formData.append("file", {
                    uri: imageUri,
                    name: fileName,
                    type: "image/jpeg",
                } as any)

                const { data, error } = await supabase.storage.from("restaurant-images").upload(fileName, formData)

                if (error) {
                    console.error("Upload error:", error)
                    CustomAlertManager.alert("Erreur", "Impossible d'uploader l'image", "error")
                    return
                }

                const {
                    data: { publicUrl },
                } = supabase.storage.from("restaurant-images").getPublicUrl(fileName)

                handleMenuChange(menuIndex, "image_url", publicUrl)
                CustomAlertManager.alert("Succès", "Image uploadée avec succès", "success")
            }
        } catch (error) {
            console.error("Error picking menu image:", error)
            CustomAlertManager.alert("Erreur", "Impossible de sélectionner l'image", "error")
        } finally {
            setUploading(false)
        }
    }

    const handleSave = async () => {
        if (!id || !isOwner) return

        if (!name.trim()) {
            CustomAlertManager.alert("Erreur", "Le nom du restaurant est requis", "error")
            return
        }

        if (!address.trim() || !city.trim()) {
            CustomAlertManager.alert("Erreur", "L'adresse complète est requise", "error")
            return
        }

        const validMenus = studentMenus.filter((menu) => menu.title.trim() && menu.price.trim())

        const fullAddress = `${address.trim()}, ${city.trim()}`
        const coordinates = await geocodeAddress(fullAddress)

        if (!coordinates) {
            CustomAlertManager.alert(
                "Adresse introuvable",
                "Impossible de géolocaliser l'adresse. Vérifie qu'elle est correcte.",
                "warning",
                [
                    { text: "Annuler", style: "cancel" },
                    {
                        text: "Continuer quand même",
                        onPress: async () => {
                            await saveRestaurant(validMenus, restaurant?.latitude, restaurant?.longitude)
                        },
                    },
                ],
            )
            return
        }

        await saveRestaurant(validMenus, coordinates.latitude, coordinates.longitude)
    }

    const saveRestaurant = async (
        validMenus: Array<{ title: string; price: string; image_url?: string }>,
        newLatitude?: number,
        newLongitude?: number,
    ) => {
        try {
            setSaving(true)

            const formattedMenus = validMenus.map((menu) => ({
                title: menu.title,
                price: priceToNumber(menu.price) ?? 0, // stocke un nombre
                image_url: menu.image_url || "",
            }))

            const updates = {
                name,
                address,
                city,
                phone,
                website,
                hours: Object.keys(hours).length > 0 ? hours : null,
                categories,
                tags,
                description,
                student_menu: formattedMenus,
                student_menu_conditions: studentMenuConditions,
                image: image,
                ...(newLatitude && newLongitude ? { latitude: newLatitude, longitude: newLongitude } : {}),
            }

            const { data, error } = await supabase.from("restaurants").update(updates).eq("id", id).select()

            if (error) throw error

            if (data && data.length > 0) {
                // Invalide le cache pour que les changements apparaissent partout
                useRestaurantStore.getState().fetch(true)
                CustomAlertManager.alert("Succès", "Restaurant mis à jour avec succès", "success", [
                    { text: "OK", onPress: () => router.back() },
                ])
            } else {
                CustomAlertManager.alert("Erreur", "Impossible de mettre à jour le restaurant", "error")
            }
        } catch (error) {
            console.error("Error saving restaurant:", error)
            CustomAlertManager.alert("Erreur", "Une erreur est survenue lors de la sauvegarde", "error")
        } finally {
            setSaving(false)
        }
    }

    const geocodeAddress = async (fullAddress: string) => {
        try {
            setIsGeocodingAddress(true)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`,
                {
                    headers: {
                        "User-Agent": "StudentFood/1.0 (Restaurant Management App)",
                    },
                },
            )

            if (!response.ok) {
                console.error("[v0] Geocoding API error:", response.status)
                return null
            }

            const data = await response.json()

            if (data && data.length > 0) {
                return {
                    latitude: Number.parseFloat(data[0].lat),
                    longitude: Number.parseFloat(data[0].lon),
                }
            }
            return null
        } catch (error) {
            console.error("Error geocoding address:", error)
            return null
        } finally {
            setIsGeocodingAddress(false)
        }
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

    if (!isOwner || !restaurant) {
        return null
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["bottom"]}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Informations de base */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Informations générales</Text>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Nom du restaurant *</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.surface,
                                        color: colors.text,
                                        borderColor: colors.border,
                                    },
                                ]}
                                value={name}
                                onChangeText={setName}
                                placeholder="Ex: Le Bistrot Étudiant"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Adresse *</Text>
                            <View style={{ position: "relative" }}>
                                <TextInput
                                    style={[
                                        styles.input,
                                        {
                                            backgroundColor: colors.surface,
                                            color: colors.text,
                                            borderColor: colors.border,
                                        },
                                    ]}
                                    value={address}
                                    onChangeText={setAddress}
                                    placeholder="Ex: 12 Rue de la République"
                                    placeholderTextColor={colors.textSecondary}
                                />
                                {isGeocodingAddress && (
                                    <ActivityIndicator
                                        size="small"
                                        color={colors.primary}
                                        style={{ position: "absolute", right: 12, top: 12 }}
                                    />
                                )}
                            </View>
                            <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                                L'adresse sera géolocalisée pour être affichée sur la carte
                            </Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Ville *</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.surface,
                                        color: colors.text,
                                        borderColor: colors.border,
                                    },
                                ]}
                                value={city}
                                onChangeText={setCity}
                                placeholder="Ex: Paris"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Téléphone</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.surface,
                                        color: colors.text,
                                        borderColor: colors.border,
                                    },
                                ]}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="Ex: 01 23 45 67 89"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Site web</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.surface,
                                        color: colors.text,
                                        borderColor: colors.border,
                                    },
                                ]}
                                value={website}
                                onChangeText={setWebsite}
                                placeholder="Ex: https://monresto.be"
                                placeholderTextColor={colors.textSecondary}
                                autoCapitalize="none"
                                keyboardType="url"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Horaires d'ouverture</Text>
                            <HoursEditor initial={hours} onChange={setHours} />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Image du restaurant</Text>

                            <TouchableOpacity
                                style={[styles.imagePickerContainer, { borderColor: colors.border }]}
                                onPress={pickImage}
                                disabled={uploading}
                            >
                                {image ? (
                                    <Image source={{ uri: image }} style={styles.imagePreview} />
                                ) : (
                                    <View style={[styles.imagePlaceholder, { backgroundColor: colors.surface }]}>
                                        <Ionicons name="image-outline" size={48} color={colors.textSecondary} />
                                        <Text style={[styles.imagePlaceholderText, { color: colors.textSecondary }]}>
                                            Choisir une image
                                        </Text>
                                    </View>
                                )}
                                {uploading && (
                                    <View style={styles.uploadingOverlay}>
                                        <ActivityIndicator size="large" color="#FFFFFF" />
                                    </View>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity onPress={pickImage} disabled={uploading} style={styles.changeImageButton}>
                                <Ionicons name="camera-outline" size={20} color={colors.primary} />
                                <Text style={[styles.changeImageText, { color: colors.primary }]}>
                                    {uploading ? "Upload en cours..." : image ? "Changer la photo" : "Ajouter une photo"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
                            <TextInput
                                style={[
                                    styles.textArea,
                                    {
                                        backgroundColor: colors.surface,
                                        color: colors.text,
                                        borderColor: colors.border,
                                    },
                                ]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Décris ton restaurant..."
                                placeholderTextColor={colors.textSecondary}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    {/* Catégorie & régime */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Catégorie & régime</Text>
                        <TouchableOpacity
                            style={[styles.selectorBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
                            onPress={() => setShowCatModal(true)}
                            activeOpacity={0.7}
                        >
                            {categories.length === 0 && tags.length === 0 ? (
                                <Text style={[styles.selectorPlaceholder, { color: colors.textSecondary }]}>
                                    Choisir les catégories et régimes
                                </Text>
                            ) : (
                                <Text style={[styles.selectorValue, { color: colors.text }]} numberOfLines={2}>
                                    {[
                                        ...categories.map((id) => getCategory(id)?.label).filter(Boolean),
                                        ...tags.map((id) => getTag(id)?.label).filter(Boolean),
                                    ].join(", ")}
                                </Text>
                            )}
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Conditions pour les menus étudiants */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Conditions pour les menus étudiants</Text>
                        <TextInput
                            style={[
                                styles.input,
                                styles.textArea,
                                {
                                    backgroundColor: colors.background,
                                    color: colors.text,
                                    borderColor: colors.border,
                                },
                            ]}
                            value={studentMenuConditions}
                            onChangeText={setStudentMenuConditions}
                            placeholder="Ex: Sur présentation de la carte étudiante valide"
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    {/* Menus étudiants */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Menus Étudiants</Text>
                        {studentMenus.map((menu, index) => (
                            <View key={index} style={styles.menuItem}>
                                <View style={styles.menuHeader}>
                                    <Text style={[styles.menuNumber, { color: colors.primary }]}>Menu {index + 1}</Text>
                                    {studentMenus.length > 1 && (
                                        <TouchableOpacity onPress={() => handleRemoveMenu(index)}>
                                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <View style={styles.menuFields}>
                                    <View style={styles.menuField}>
                                        <Text style={[styles.label, { color: colors.text }]}>Image du menu (optionnelle)</Text>
                                        <TouchableOpacity
                                            style={[
                                                styles.imagePickerButton,
                                                {
                                                    backgroundColor: colors.background,
                                                    borderColor: colors.border,
                                                },
                                            ]}
                                            onPress={() => pickMenuImage(index)}
                                            disabled={uploading}
                                        >
                                            {menu.image_url ? (
                                                <Image source={{ uri: menu.image_url }} style={styles.menuImagePreview} />
                                            ) : (
                                                <View style={styles.imagePlaceholder}>
                                                    <Ionicons name="image-outline" size={40} color={colors.textSecondary} />
                                                    <Text style={[styles.imagePlaceholderText, { color: colors.textSecondary }]}>
                                                        Choisir une image
                                                    </Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.menuField}>
                                        <Text style={[styles.label, { color: colors.text }]}>Nom du menu</Text>
                                        <TextInput
                                            style={[
                                                styles.input,
                                                {
                                                    backgroundColor: colors.background,
                                                    color: colors.text,
                                                    borderColor: colors.border,
                                                },
                                            ]}
                                            value={menu.title}
                                            onChangeText={(value) => handleMenuChange(index, "title", value)}
                                            placeholder="Ex: Menu Étudiant Midi"
                                            placeholderTextColor={colors.textSecondary}
                                        />
                                    </View>

                                    <View style={styles.menuField}>
                                        <Text style={[styles.label, { color: colors.text }]}>Prix</Text>
                                        <View style={styles.priceInputContainer}>
                                            <TextInput
                                                style={[
                                                    styles.input,
                                                    styles.priceInput,
                                                    {
                                                        backgroundColor: colors.background,
                                                        color: colors.text,
                                                        borderColor: colors.border,
                                                    },
                                                ]}
                                                value={menu.price}
                                                onChangeText={(value) => handleMenuChange(index, "price", value)}
                                                placeholder="8.50"
                                                placeholderTextColor={colors.textSecondary}
                                                keyboardType="decimal-pad"
                                            />
                                            <Text style={[styles.euroSymbol, { color: colors.text }]}>€</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}

                        <TouchableOpacity
                            style={[styles.addButton, { backgroundColor: `${colors.primary}20` }]}
                            onPress={handleAddMenu}
                        >
                            <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                            <Text style={[styles.addButtonText, { color: colors.primary }]}>Ajouter un menu</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Bouton de sauvegarde */}
                    <Button
                        title={saving ? "Sauvegarde en cours..." : "Enregistrer les modifications"}
                        onPress={handleSave}
                        disabled={saving}
                        style={styles.saveButton}
                    />
                </ScrollView>
            </KeyboardAvoidingView>

            <CategoryRegimeModal
                visible={showCatModal}
                initialCategories={categories}
                initialTags={tags}
                onClose={() => setShowCatModal(false)}
                onApply={(c, t) => {
                    setCategories(c)
                    setTags(t)
                }}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loading: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    menuTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        minHeight: 80,
        textAlignVertical: "top",
        paddingTop: 12,
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
    emptyMenuText: {
        fontSize: 14,
        fontStyle: "italic",
        textAlign: "center",
        marginVertical: 20,
    },
    menuCard: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    menuCardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    menuCardTitle: {
        fontSize: 16,
        fontWeight: "600",
    },
    saveButton: {
        marginTop: 8,
    },
    imagePickerContainer: {
        width: "100%",
        height: 200,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 2,
        borderStyle: "dashed",
        marginBottom: 12,
    },
    imagePreview: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    uploadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    changeImageButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
        gap: 8,
    },
    changeImageText: {
        fontSize: 14,
        fontWeight: "600",
    },
    helperText: {
        fontSize: 12,
        marginTop: 4,
        fontStyle: "italic",
    },
    priceInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    priceInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
    },
    euroSymbol: {
        fontSize: 18,
        fontWeight: "600",
    },
    menuItem: {
        marginBottom: 16,
    },
    menuHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    menuNumber: {
        fontSize: 16,
        fontWeight: "600",
    },
    menuFields: {
        flexDirection: "column",
    },
    menuField: {
        marginBottom: 8,
    },
    menuImagePreview: {
        width: "100%",
        height: 150,
        borderRadius: 8,
    },
    imagePlaceholder: {
        width: "100%",
        height: 150,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
        borderWidth: 2,
        borderStyle: "dashed",
    },
    imagePlaceholderText: {
        marginTop: 8,
        fontSize: 14,
    },
    imagePickerButton: {
        borderRadius: 8,
        borderWidth: 1,
        overflow: "hidden",
    },
    selectorBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    selectorPlaceholder: {
        flex: 1,
        fontSize: 15,
    },
    selectorValue: {
        flex: 1,
        fontSize: 15,
        fontWeight: "600",
    },
})
