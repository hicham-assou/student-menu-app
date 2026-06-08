import { useState, type ReactNode } from "react"
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "@/constants/Colors"
import { useAuth } from "@/contexts/AuthContext"
import { submitSuggestion } from "@/lib/suggestions"
import { CustomAlertManager } from "@/components/customAlert/CustomAlert"

const colors = Colors.light

export default function SuggestScreen() {
    const router = useRouter()
    const { user } = useAuth()
    const params = useLocalSearchParams<{
        type?: string
        restaurantId?: string
        restaurantName?: string
    }>()

    const isCorrection = params.type === "correction"

    const [name, setName] = useState("")
    const [address, setAddress] = useState("")
    const [city, setCity] = useState("")
    const [message, setMessage] = useState("")
    const [email, setEmail] = useState(user?.email ?? "")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (isCorrection) {
            if (!message.trim()) {
                CustomAlertManager.alert("Oups", "Décris l'erreur que tu as remarquée.", "error")
                return
            }
        } else {
            if (!name.trim() || !city.trim()) {
                CustomAlertManager.alert("Oups", "Indique au moins le nom du resto et la ville.", "error")
                return
            }
        }

        setLoading(true)
        const ok = await submitSuggestion({
            type: isCorrection ? "correction" : "new",
            restaurant_id: params.restaurantId ?? null,
            restaurant_name: isCorrection ? params.restaurantName : name.trim(),
            address: address.trim() || undefined,
            city: city.trim() || undefined,
            message: message.trim() || undefined,
            contact_email: email.trim() || undefined,
        })
        setLoading(false)

        if (ok) {
            CustomAlertManager.alert(
                "Merci ! 🙌",
                isCorrection
                    ? "Ton signalement a bien été envoyé. On vérifie ça au plus vite."
                    : "Ta suggestion a bien été envoyée. Merci d'enrichir Stud'Table !",
                "success",
                [{ text: "OK", onPress: () => router.back() }],
            )
        } else {
            CustomAlertManager.alert("Erreur", "Impossible d'envoyer pour le moment. Réessaie plus tard.", "error")
        }
    }

    return (
        <SafeAreaView style={styles.container} edges={["bottom"]}>
            <Stack.Screen
                options={{ title: isCorrection ? "Signaler une erreur" : "Suggérer un resto", headerBackTitle: "Retour" }}
            />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.iconCircle}>
                        <Ionicons name={isCorrection ? "flag" : "add-circle"} size={28} color={colors.primary} />
                    </View>
                    <Text style={styles.title}>
                        {isCorrection ? "Signaler une erreur" : "Suggérer un restaurant"}
                    </Text>
                    <Text style={styles.subtitle}>
                        {isCorrection
                            ? `Quelque chose est faux sur « ${params.restaurantName ?? "ce resto"} » ? Dis-nous quoi.`
                            : "Un bon plan étudiant manque à l'appel ? Aide-nous à compléter la carte."}
                    </Text>

                    {!isCorrection && (
                        <>
                            <Field label="Nom du restaurant *">
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Ex : Chez Ali"
                                    placeholderTextColor="#A8A29E"
                                />
                            </Field>
                            <Field label="Adresse">
                                <TextInput
                                    style={styles.input}
                                    value={address}
                                    onChangeText={setAddress}
                                    placeholder="Ex : Chaussée d'Ixelles 120"
                                    placeholderTextColor="#A8A29E"
                                />
                            </Field>
                            <Field label="Ville *">
                                <TextInput
                                    style={styles.input}
                                    value={city}
                                    onChangeText={setCity}
                                    placeholder="Ex : Ixelles"
                                    placeholderTextColor="#A8A29E"
                                />
                            </Field>
                        </>
                    )}

                    <Field label={isCorrection ? "Que faut-il corriger ? *" : "Infos utiles (menu, prix…)"}>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={message}
                            onChangeText={setMessage}
                            placeholder={
                                isCorrection
                                    ? "Ex : le menu étudiant est à 8€, pas 7€"
                                    : "Ex : menu étudiant à 6,50€ le midi"
                            }
                            placeholderTextColor="#A8A29E"
                            multiline
                        />
                    </Field>

                    <Field label="Ton email (optionnel)">
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="pour qu'on puisse te recontacter"
                            placeholderTextColor="#A8A29E"
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </Field>

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={loading}
                        style={[styles.submitBtn, loading && { opacity: 0.6 }]}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.submitText}>{loading ? "Envoi…" : "Envoyer"}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#FFF1E8",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        marginTop: 8,
        marginBottom: 14,
    },
    title: {
        fontSize: 22,
        fontWeight: "800",
        color: colors.text,
        textAlign: "center",
        letterSpacing: -0.4,
    },
    subtitle: {
        fontSize: 14.5,
        color: colors.textSecondary,
        textAlign: "center",
        lineHeight: 21,
        marginTop: 6,
        marginBottom: 24,
    },
    field: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13.5,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 7,
    },
    input: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 13,
        fontSize: 15,
        color: colors.text,
    },
    textArea: {
        minHeight: 96,
        textAlignVertical: "top",
        paddingTop: 13,
    },
    submitBtn: {
        backgroundColor: colors.primary,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 8,
    },
    submitText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
})
