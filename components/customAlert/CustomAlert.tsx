import type React from "react"
import {Modal, StyleSheet, Text, TouchableOpacity, View} from "react-native"
import {Colors} from "@/constants/Colors"
import {Ionicons} from "@expo/vector-icons"

type AlertType = "success" | "error" | "info" | "warning" | "confirm"

interface AlertButton {
    text: string
    onPress?: () => void
    style?: "default" | "cancel" | "destructive"
}

interface CustomAlertProps {
    visible: boolean
    type?: AlertType
    title: string
    message?: string
    buttons?: AlertButton[]
    onClose: () => void
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
                                                            visible,
                                                            type = "info",
                                                            title,
                                                            message,
                                                            buttons = [{text: "OK"}],
                                                            onClose,
                                                        }) => {
    const getIcon = () => {
        switch (type) {
            case "success":
                return {name: "checkmark-circle", color: "#10B981"}
            case "error":
                return {name: "close-circle", color: "#EF4444"}
            case "warning":
                return {name: "warning", color: "#F59E0B"}
            case "confirm":
                return {name: "help-circle", color: Colors.light.primary}
            default:
                return {name: "information-circle", color: Colors.light.primary}
        }
    }

    const icon = getIcon()

    const handleButtonPress = (button: AlertButton) => {
        if (button.onPress) {
            button.onPress()
        }
        onClose()
    }

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <TouchableOpacity activeOpacity={1} style={styles.container}>
                    <View style={styles.iconContainer}>
                        <Ionicons name={icon.name as any} size={50} color={icon.color}/>
                    </View>

                    <Text style={styles.title}>{title}</Text>

                    {message && <Text style={styles.message}>{message}</Text>}

                    <View style={styles.buttonsContainer}>
                        {buttons.map((button, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.button,
                                    button.style === "cancel" && styles.buttonCancel,
                                    button.style === "destructive" && styles.buttonDestructive,
                                    buttons.length === 1 && styles.buttonSingle,
                                ]}
                                onPress={() => handleButtonPress(button)}
                            >
                                <Text
                                    style={[
                                        styles.buttonText,
                                        button.style === "cancel" && styles.buttonTextCancel,
                                        button.style === "destructive" && styles.buttonTextDestructive,
                                    ]}
                                >
                                    {button.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    )
}

// Hook pour utiliser facilement le CustomAlert
let alertInstance: ((props: Omit<CustomAlertProps, "visible" | "onClose">) => void) | null = null

export const setAlertInstance = (instance: (props: Omit<CustomAlertProps, "visible" | "onClose">) => void) => {
    alertInstance = instance
}

export const CustomAlertManager = {
    alert: (title: string, message?: string, type?: AlertType, buttons?: AlertButton[]) => {
        if (alertInstance) {
            alertInstance({
                title,
                message,
                buttons: buttons || [{text: "OK"}],
                type,
            })
        }
    },
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 24,
        width: "85%",
        maxWidth: 400,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 10},
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    iconContainer: {
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.light.text,
        marginBottom: 8,
        textAlign: "center",
    },
    message: {
        fontSize: 15,
        color: Colors.light.textSecondary,
        marginBottom: 24,
        textAlign: "center",
        lineHeight: 22,
    },
    buttonsContainer: {
        flexDirection: "row",
        gap: 12,
        width: "100%",
    },
    button: {
        flex: 1,
        backgroundColor: Colors.light.primary,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    buttonSingle: {
        flex: 1,
    },
    buttonCancel: {
        backgroundColor: Colors.light.surface,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    buttonDestructive: {
        backgroundColor: "#EF4444",
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    buttonTextCancel: {
        color: Colors.light.text,
    },
    buttonTextDestructive: {
        color: "#FFFFFF",
    },
})
