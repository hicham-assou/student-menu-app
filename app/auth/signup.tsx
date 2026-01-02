"use client"

import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useState } from "react"
import { useRouter } from "expo-router"
import { Colors } from "@/constants/Colors"
import { useAuth } from "@/contexts/AuthContext"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { CustomAlertManager} from "@/components/customAlert/CustomAlert";

export default function SignupScreen() {
    const colors = Colors.light
    const router = useRouter()
    const { signUp } = useAuth()

    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSignup = async () => {
        if (!email || !password || !confirmPassword) {
            CustomAlertManager.alert("Erreur", "Veuillez remplir tous les champs requis", "error")
            return
        }

        if (password !== confirmPassword) {
            CustomAlertManager.alert("Erreur", "Les mots de passe ne correspondent pas", "error")
            return
        }

        if (password.length < 6) {
            CustomAlertManager.alert("Erreur", "Le mot de passe doit contenir au moins 6 caracteres", "error")
            return
        }

        try {
            setLoading(true)
            await signUp(email, password, fullName || undefined)
            CustomAlertManager.alert("Succes", "Compte cree avec succes !", "success", [
                { text: "OK", onPress: () => router.back() },
            ])
        } catch (error: any) {
            CustomAlertManager.alert("Erreur d'inscription", error.message, "error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.content}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>Inscription</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Cree ton compte pour sauvegarder tes favoris
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
                        <Text style={[styles.footerText, { color: colors.textSecondary }]}>Deja un compte ?</Text>
                        <Button
                            title="Se connecter"
                            onPress={() => router.replace("/auth/login")}
                            variant="outline"
                            style={styles.linkButton}
                        />
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
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
