import {Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View} from "react-native"
import {SafeAreaView} from "react-native-safe-area-context"
import {useEffect, useState} from "react"
import {useRouter} from "expo-router"
import {Colors} from "@/constants/Colors"
import {Input} from "@/components/ui/Input"
import {Button} from "@/components/ui/Button"
import {CustomAlertManager} from "@/components/customAlert/CustomAlert";
import {supabase} from "@/lib/supabase";

export default function ResetPasswordScreen() {
    const colors = Colors.light
    const router = useRouter()

    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [isValidSession, setIsValidSession] = useState(false)

    useEffect(() => {
        // Vérifier si l'utilisateur a une session de récupération valide
        supabase.auth.getSession().then(({data: {session}}) => {
            if (session) {
                setIsValidSession(true)
            } else {
                CustomAlertManager.alert(
                    "Lien invalide",
                    "Le lien de réinitialisation est invalide ou a expiré. Merci de demander un nouveau lien.",
                    "error",
                )
                router.replace("/auth/login")
            }
        })
    }, [])

    const validatePassword = (password: string): { isValid: boolean; message?: string } => {
        if (password.length < 8) {
            return {isValid: false, message: "Le mot de passe doit contenir au moins 8 caractères"}
        }
        if (!/[A-Z]/.test(password)) {
            return {isValid: false, message: "Le mot de passe doit contenir au moins une majuscule"}
        }
        if (!/[a-z]/.test(password)) {
            return {isValid: false, message: "Le mot de passe doit contenir au moins une minuscule"}
        }
        if (!/[0-9]/.test(password)) {
            return {isValid: false, message: "Le mot de passe doit contenir au moins un chiffre"}
        }
        if (!/[!@#$%^&*(),.?":{}|<>_-]/.test(password)) {
            return {
                isValid: false,
                message: 'Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*(),.?":{}|<>_-)',
            }
        }
        return {isValid: true}
    }

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            CustomAlertManager.alert("Erreur", "Merci de remplir tous les champs", "error")
            return
        }

        if (newPassword !== confirmPassword) {
            CustomAlertManager.alert("Erreur", "Les mots de passe ne correspondent pas", "error")
            return
        }

        const validation = validatePassword(newPassword)
        if (!validation.isValid) {
            CustomAlertManager.alert("Mot de passe invalide", validation.message || "", "error")
            return
        }

        try {
            setLoading(true)
            const {error} = await supabase.auth.updateUser({password: newPassword})

            if (error) {
                throw error
            }

            CustomAlertManager.alert(
                "Succès !",
                "Ton mot de passe a été réinitialisé avec succès. Tu peux maintenant te connecter.",
                "success",
            )

            // Déconnexion et redirection vers login
            await supabase.auth.signOut()
            router.replace("/auth/login")
        } catch (error: any) {
            CustomAlertManager.alert("Erreur", error.message || "Une erreur est survenue", "error")
        } finally {
            setLoading(false)
        }
    }

    if (!isValidSession) {
        return (
            <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
                <View style={styles.centerContent}>
                    <Text style={[styles.title, {color: colors.text}]}>Chargement...</Text>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.logoContainer}>
                        <Image source={require("@/assets/images/logo.png")} style={styles.logo} resizeMode="contain"/>
                    </View>

                    <View style={styles.header}>
                        <Text style={[styles.title, {color: colors.text}]}>Nouveau mot de passe</Text>
                        <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
                            Choisis un nouveau mot de passe sécurisé pour ton compte
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <Input
                            label="Nouveau mot de passe"
                            placeholder="••••••••"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                        />

                        <View style={styles.passwordHint}>
                            <Text style={[styles.hintText, {color: colors.textSecondary}]}>
                                Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un
                                chiffre et un
                                caractère spécial.
                            </Text>
                        </View>

                        <Input
                            label="Confirmer le mot de passe"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                        />

                        <Button
                            title={loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
                            onPress={handleResetPassword}
                            loading={loading}
                            style={styles.button}
                        />
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
    centerContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    logoContainer: {
        alignItems: "center",
        marginVertical: 32,
    },
    logo: {
        width: 120,
        height: 120,
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
        lineHeight: 22,
    },
    form: {
        gap: 16,
    },
    passwordHint: {
        marginTop: -8,
    },
    hintText: {
        fontSize: 13,
        lineHeight: 18,
    },
    button: {
        marginTop: 8,
    },
})
