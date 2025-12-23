import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useLocalSearchParams, useRouter} from 'expo-router'
import {Ionicons} from '@expo/vector-icons'
import {useEffect, useState} from 'react'
import {useColorScheme} from '@/components/useColorScheme.web'
import {Colors} from '@/constants/Colors'
import {useAuth} from '@/contexts/AuthContext'
import {getRestaurants} from '@/lib/api'
import {isRestaurantOwner, updateRestaurant} from '@/lib/restaurants'
import {Button} from '@/components/ui/Button'
import type {Restaurant} from '@/types'

export default function EditRestaurantScreen() {
    const colorScheme = useColorScheme() ?? 'light'
    const colors = Colors[colorScheme]
    const {id} = useLocalSearchParams<{ id: string }>()
    const router = useRouter()
    const {user} = useAuth()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isOwner, setIsOwner] = useState(false)
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)

    // États du formulaire
    const [name, setName] = useState('')
    const [address, setAddress] = useState('')
    const [city, setCity] = useState('')
    const [phone, setPhone] = useState('')
    const [openingHours, setOpeningHours] = useState('')
    const [description, setDescription] = useState('')
    const [image, setImage] = useState('')
    const [studentMenus, setStudentMenus] = useState<Array<{ title: string; price: string }>>([])

    useEffect(() => {
        loadRestaurant()
    }, [id])

    const loadRestaurant = async () => {
        if (!id || !user) return

        try {
            setLoading(true)

            // Vérifier que l'utilisateur est propriétaire
            const ownerStatus = await isRestaurantOwner(id)
            setIsOwner(ownerStatus)

            if (!ownerStatus) {
                Alert.alert('Accès refusé', 'Tu n\'es pas le propriétaire de ce restaurant')
                router.back()
                return
            }

            // Charger les données du restaurant
            const restaurants = await getRestaurants()
            const found = restaurants.find((r) => r.id === id)

            if (found) {
                setRestaurant(found)
                setName(found.name || '')
                setAddress(found.address || '')
                setCity(found.city || '')
                setPhone(found.phone || '')
                setOpeningHours(found.opening_hours || '')
                setDescription(found.description || '')
                setImage(found.image || '')
                setStudentMenus(found.student_menu || [])
            } else {
                Alert.alert('Erreur', 'Restaurant introuvable')
                router.back()
            }
        } catch (error) {
            console.error('Error loading restaurant:', error)
            Alert.alert('Erreur', 'Impossible de charger le restaurant')
            router.back()
        } finally {
            setLoading(false)
        }
    }

    const handleAddMenu = () => {
        setStudentMenus([...studentMenus, {title: '', price: ''}])
    }

    const handleRemoveMenu = (index: number) => {
        setStudentMenus(studentMenus.filter((_, i) => i !== index))
    }

    const handleMenuChange = (index: number, field: 'title' | 'price', value: string) => {
        const newMenus = [...studentMenus]
        newMenus[index][field] = value
        setStudentMenus(newMenus)
    }

    const handleSave = async () => {
        if (!id || !isOwner) return

        // Validation
        if (!name.trim()) {
            Alert.alert('Erreur', 'Le nom du restaurant est requis')
            return
        }

        if (!address.trim() || !city.trim()) {
            Alert.alert('Erreur', 'L\'adresse complète est requise')
            return
        }

        // Valider les menus
        const validMenus = studentMenus.filter((menu) => menu.title.trim() && menu.price.trim())

        try {
            setSaving(true)

            const success = await updateRestaurant(id, {
                name: name.trim(),
                address: address.trim(),
                city: city.trim(),
                phone: phone.trim(),
                opening_hours: openingHours.trim(),
                description: description.trim(),
                image: image.trim(),
                student_menu: validMenus,
            })

            if (success) {
                Alert.alert('Succès', 'Restaurant mis à jour avec succès', [
                    {text: 'OK', onPress: () => router.back()},
                ])
            } else {
                Alert.alert('Erreur', 'Impossible de mettre à jour le restaurant')
            }
        } catch (error) {
            console.error('Error saving restaurant:', error)
            Alert.alert('Erreur', 'Une erreur est survenue lors de la sauvegarde')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
                <View style={styles.loading}>
                    <Text style={{color: colors.textSecondary}}>Chargement...</Text>
                </View>
            </SafeAreaView>
        )
    }

    if (!isOwner || !restaurant) {
        return null
    }

    return (
        <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['bottom']}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text}/>
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, {color: colors.text}]}>Modifier le restaurant</Text>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Informations de base */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, {color: colors.text}]}>Informations générales</Text>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, {color: colors.text}]}>Nom du restaurant *</Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: colors.surface,
                                    color: colors.text,
                                    borderColor: colors.border
                                }]}
                                value={name}
                                onChangeText={setName}
                                placeholder="Ex: Le Bistrot Étudiant"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, {color: colors.text}]}>Adresse *</Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: colors.surface,
                                    color: colors.text,
                                    borderColor: colors.border
                                }]}
                                value={address}
                                onChangeText={setAddress}
                                placeholder="Ex: 12 Rue de la République"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, {color: colors.text}]}>Ville *</Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: colors.surface,
                                    color: colors.text,
                                    borderColor: colors.border
                                }]}
                                value={city}
                                onChangeText={setCity}
                                placeholder="Ex: Paris"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, {color: colors.text}]}>Téléphone</Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: colors.surface,
                                    color: colors.text,
                                    borderColor: colors.border
                                }]}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="Ex: 01 23 45 67 89"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, {color: colors.text}]}>Horaires d'ouverture</Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: colors.surface,
                                    color: colors.text,
                                    borderColor: colors.border
                                }]}
                                value={openingHours}
                                onChangeText={setOpeningHours}
                                placeholder="Ex: Lun-Ven 11h-15h, 18h-22h"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, {color: colors.text}]}>Image URL</Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: colors.surface,
                                    color: colors.text,
                                    borderColor: colors.border
                                }]}
                                value={image}
                                onChangeText={setImage}
                                placeholder="https://exemple.com/image.jpg"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="url"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, {color: colors.text}]}>Description</Text>
                            <TextInput
                                style={[styles.textArea, {
                                    backgroundColor: colors.surface,
                                    color: colors.text,
                                    borderColor: colors.border
                                }]}
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

                    {/* Menus étudiants */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.menuTitleRow}>
                                <Ionicons name="school" size={20} color={colors.primary}/>
                                <Text style={[styles.sectionTitle, {color: colors.text}]}>Menus Étudiants</Text>
                            </View>
                            <TouchableOpacity
                                onPress={handleAddMenu}
                                style={[styles.addButton, {backgroundColor: colors.primary}]}
                            >
                                <Ionicons name="add" size={20} color="#FFFFFF"/>
                                <Text style={styles.addButtonText}>Ajouter</Text>
                            </TouchableOpacity>
                        </View>

                        {studentMenus.length === 0 && (
                            <Text style={[styles.emptyMenuText, {color: colors.textSecondary}]}>
                                Aucun menu étudiant. Clique sur "Ajouter" pour en créer un.
                            </Text>
                        )}

                        {studentMenus.map((menu, index) => (
                            <View
                                key={index}
                                style={[styles.menuCard, {backgroundColor: colors.surface, borderColor: colors.border}]}
                            >
                                <View style={styles.menuCardHeader}>
                                    <Text style={[styles.menuCardTitle, {color: colors.text}]}>Menu {index + 1}</Text>
                                    <TouchableOpacity onPress={() => handleRemoveMenu(index)}>
                                        <Ionicons name="trash-outline" size={20} color="#EF4444"/>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, {color: colors.text}]}>Titre du menu</Text>
                                    <TextInput
                                        style={[styles.input, {
                                            backgroundColor: colors.background,
                                            color: colors.text,
                                            borderColor: colors.border
                                        }]}
                                        value={menu.title}
                                        onChangeText={(value) => handleMenuChange(index, 'title', value)}
                                        placeholder="Ex: Plat + Boisson + Dessert"
                                        placeholderTextColor={colors.textSecondary}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, {color: colors.text}]}>Prix</Text>
                                    <TextInput
                                        style={[styles.input, {
                                            backgroundColor: colors.background,
                                            color: colors.text,
                                            borderColor: colors.border
                                        }]}
                                        value={menu.price}
                                        onChangeText={(value) => handleMenuChange(index, 'price', value)}
                                        placeholder="Ex: 8,50€"
                                        placeholderTextColor={colors.textSecondary}
                                    />
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Bouton de sauvegarde */}
                    <Button
                        title={saving ? 'Sauvegarde en cours...' : 'Enregistrer les modifications'}
                        onPress={handleSave}
                        disabled={saving}
                        style={styles.saveButton}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    menuTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
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
        minHeight: 100,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyMenuText: {
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
        marginVertical: 20,
    },
    menuCard: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    menuCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    menuCardTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        marginTop: 8,
    },
})