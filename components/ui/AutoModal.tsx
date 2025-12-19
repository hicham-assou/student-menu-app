import {Modal, StyleSheet, Text, View} from 'react-native'
import {Ionicons} from '@expo/vector-icons'
import {useRouter} from 'expo-router'
import {useColorScheme} from "@/components/useColorScheme.web";
import {Colors} from '@/constants/Colors'
import {Button} from './Button'

interface AuthModalProps {
    visible: boolean
    onClose: () => void
    message?: string
}

export function AuthModal({visible, onClose, message}: AuthModalProps) {
    const colorScheme = useColorScheme() ?? 'light'
    const colors = Colors[colorScheme]
    const router = useRouter()

    const handleLogin = () => {
        onClose()
        router.push('/auth/login')
    }

    const handleSignup = () => {
        onClose()
        router.push('/auth/signup')
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.modal, {backgroundColor: colors.background}]}>
                    <Ionicons name="lock-closed" size={48} color={colors.primary}/>

                    <Text style={[styles.title, {color: colors.text}]}>
                        Connexion requise
                    </Text>

                    <Text style={[styles.message, {color: colors.textSecondary}]}>
                        {message || 'Connecte-toi pour acceder a cette fonctionnalite'}
                    </Text>

                    <Button
                        title="Se connecter"
                        onPress={handleLogin}
                        style={styles.button}
                    />

                    <Button
                        title="Creer un compte"
                        onPress={handleSignup}
                        variant="outline"
                        style={styles.button}
                    />

                    <Button
                        title="Annuler"
                        onPress={onClose}
                        variant="secondary"
                        style={styles.button}
                    />
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modal: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
    },
    button: {
        width: '100%',
        marginBottom: 12,
    },
})