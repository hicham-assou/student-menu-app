"use client"

import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useState } from "react"
import { useRouter } from "expo-router"
import { Colors } from "@/constants/Colors"
import { useAuth } from "@/contexts/AuthContext"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { CustomAlertManager} from "@/components/CustomAlert";

export default function LoginScreen() {
    const colors = Colors.light
    const router = useRouter()
    const { signIn } = useAuth()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        if (!email || !password) {
            CustomAlertManager.alert("Erreur", "Veuillez remplir tous les champs", "error")
            return
        }

        try {
            setLoading(true)
            await signIn(email, password)
            router.back()
        } catch (error: any) {
            CustomAlertManager.alert("Erreur de connexion", error.message, "error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.content}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>Connexion</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Connecte-toi pour acceder a tes favoris
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

                    <Button
                        title={loading ? "Connexion..." : "Se connecter"}
                        onPress={handleLogin}
                        loading={loading}
                        style={styles.button}
                    />

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: colors.textSecondary }]}>Pas encore de compte ?</Text>
                        <Button
                            title="S'inscrire"
                            onPress={() => router.push("/auth/signup")}
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
