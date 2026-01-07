import {KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View} from "react-native"
import {SafeAreaView} from "react-native-safe-area-context"
import {useState} from "react"
import {useRouter} from "expo-router"
import {Colors} from "@/constants/Colors"
import {useAuth} from "@/contexts/AuthContext"
import {Input} from "@/components/ui/Input"
import {Button} from "@/components/ui/Button"
import {CustomAlertManager} from "@/components/customAlert/CustomAlert";

export default function SignupScreen() {
    const colors = Colors.light
    const router = useRouter()
    const {signUp} = useAuth()

    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const validatePassword = (pwd: string): { isValid: boolean; message: string } => {
        if (pwd.length < 8) {
            return {isValid: false, message: "Le mot de passe doit contenir au moins 8 caractères"}
        }
        if (!/[A-Z]/.test(pwd)) {
            return {isValid: false, message: "Le mot de passe doit contenir au moins une majuscule"}
        }
        if (!/[a-z]/.test(pwd)) {
            return {isValid: false, message: "Le mot de passe doit contenir au moins une minuscule"}
        }
        if (!/[0-9]/.test(pwd)) {
            return {isValid: false, message: "Le mot de passe doit contenir au moins un chiffre"}
        }
        if (!/[!@#$%^&*(),.?":{}|<>_-]/.test(pwd)) {
            return {
                isValid: false,
                message: "Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*_-...)"
            }
        }
        return {isValid: true, message: ""}
    }

    const handleSignup = async () => {
        if (!email || !password || !confirmPassword) {
            CustomAlertManager.alert("Erreur", "Merci de remplir tous les champs requis", "error")
            return
        }

        const passwordValidation = validatePassword(password)
        if (!passwordValidation.isValid) {
            CustomAlertManager.alert("Mot de passe faible", passwordValidation.message, "error")
            return
        }

        if (password !== confirmPassword) {
            CustomAlertManager.alert("Erreur", "Les mots de passe ne correspondent pas", "error")
            return
        }

        try {
            setLoading(true)
            const {error} = await signUp(email, password, fullName || "", "student")

            if (error) {
                let errorMessage = error.message
                if (error.message.includes("already registered")) {
                    errorMessage = "Cet email est déjà utilisé"
                } else if (error.message.includes("Invalid email")) {
                    errorMessage = "Format d'email invalide"
                } else if (error.message.includes("Password")) {
                    errorMessage = "Le mot de passe ne respecte pas les critères de sécurité"
                }

                CustomAlertManager.alert("Erreur d'inscription", errorMessage, "error")
                return
            }

            CustomAlertManager.alert("Succès", "Compte créé avec succès !", "success", [
                {text: "OK", onPress: () => router.replace("/(tabs)/profile")},
            ])
        } catch (error: any) {
            CustomAlertManager.alert("Erreur d'inscription", "Une erreur est survenue", "error")
        } finally {
            setLoading(false)
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
                        <Text style={[styles.title, {color: colors.text}]}>Inscription</Text>
                        <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
                            Crée ton compte pour sauvegarder tes favoris
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <Input
                            label="Nom complet (optionnel)"
                            placeholder="Jean Dupont"
                            value={fullName}
                            onChangeText={setFullName}
                        />

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

                        <Text style={[styles.passwordHint, {color: colors.textSecondary}]}>
                            Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial
                        </Text>

                        <Input
                            label="Confirmer le mot de passe"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                        />

                        <Button
                            title={loading ? "Inscription..." : "S'inscrire"}
                            onPress={handleSignup}
                            loading={loading}
                            style={styles.button}
                        />

                        <View style={styles.footer}>
                            <Text style={[styles.footerText, {color: colors.textSecondary}]}>Tu as déjà un compte
                                ?</Text>
                            <Button
                                title="Se connecter"
                                onPress={() => router.replace("/auth/login")}
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
    passwordHint: {
        fontSize: 12,
        marginTop: -12,
        marginBottom: 4,
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
