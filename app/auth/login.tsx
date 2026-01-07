import {KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native"
import {SafeAreaView} from "react-native-safe-area-context"
import {useState} from "react"
import {useRouter} from "expo-router"
import {Colors} from "@/constants/Colors"
import {useAuth} from "@/contexts/AuthContext"
import {Input} from "@/components/ui/Input"
import {Button} from "@/components/ui/Button"
import {CustomAlertManager} from "@/components/customAlert/CustomAlert";
import {supabase} from "@/lib/supabase";

export default function LoginScreen() {
    const colors = Colors.light
    const router = useRouter()
    const {signIn} = useAuth()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        if (!email || !password) {
            CustomAlertManager.alert("Erreur", "Merci de remplir tous les champs", "error")
            return
        }

        try {
            setLoading(true)
            const {error} = await signIn(email, password)

            if (error) {
                let errorMessage = error.message
                if (error.message.includes("Invalid login credentials")) {
                    errorMessage = "Email ou mot de passe incorrect"
                } else if (error.message.includes("Email not confirmed")) {
                    errorMessage = "Merci de confirmer ton email avant de te connecter"
                } else if (error.message.includes("Invalid email")) {
                    errorMessage = "Format d'email invalide"
                }

                CustomAlertManager.alert("Erreur de connexion", errorMessage, "error")
                return
            }

            router.back()
        } catch (error: any) {
            CustomAlertManager.alert("Erreur de connexion", "Une erreur est survenue", "error")
        } finally {
            setLoading(false)
        }
    }

    const handleForgotPassword = async () => {
        if (!email) {
            CustomAlertManager.alert(
                "Email requis",
                "Merci d'entrer ton email pour recevoir le lien de réinitialisation",
                "info",
            )
            return
        }

        try {
            const {error} = await supabase.auth.resetPasswordForEmail(email)

            if (error) {
                let errorMessage = error.message
                if (error.message.includes("Invalid email")) {
                    errorMessage = "Format d'email invalide"
                } else if (error.message.includes("not found")) {
                    errorMessage = "Aucun compte ne correspond à cet email"
                }
                throw new Error(errorMessage)
            }

            CustomAlertManager.alert(
                "Email envoyé !",
                "Consulte ta boîte mail pour réinitialiser ton mot de passe",
                "success",
            )
        } catch (error: any) {
            CustomAlertManager.alert("Erreur", error.message, "error")
        }
    }

    return (
        <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <Text style={[styles.title, {color: colors.text}]}>Connexion</Text>
                        <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
                            Connecte-toi pour accéder à tes favoris
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <Input
                            label="Email"
                            placeholder="ton-email@exemple.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />

                        <Input
                            label="Mot de passe"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
                            <Text style={[styles.forgotPasswordText, {color: colors.primary}]}>Mot de passe oublié
                                ?</Text>
                        </TouchableOpacity>

                        <Button
                            title={loading ? "Connexion..." : "Se connecter"}
                            onPress={handleLogin}
                            loading={loading}
                            style={styles.button}
                        />

                        <View style={styles.footer}>
                            <Text style={[styles.footerText, {color: colors.textSecondary}]}>Pas encore de compte
                                ?</Text>
                            <Button
                                title="S'inscrire"
                                onPress={() => router.push("/auth/signup")}
                                variant="outline"
                                style={styles.linkButton}
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
    },
    form: {
        gap: 16,
    },
    forgotPassword: {
        alignSelf: "flex-end",
        marginTop: -8,
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: "600",
    },
    button: {
        marginTop: 8,
    },
    footer: {
        marginTop: 24,
        alignItems: "center",
        gap: 12,
    },
    footerText: {
        fontSize: 14,
    },
    linkButton: {
        width: "100%",
    },
})
