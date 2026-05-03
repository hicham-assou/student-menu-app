import { Pressable, StyleSheet, Text, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { LocationStatus } from "@/hooks/useUserLocation"

interface Props {
    status: LocationStatus
    onRequest: () => void
    onOpenSettings: () => void
    onDismiss?: () => void
}

/**
 * Banner contextuel affiche en haut de la carte selon l'etat de la geoloc.
 * Ne s'affiche que si l'utilisateur n'a pas de position utilisable.
 */
export function LocationPermissionBanner({
    status,
    onRequest,
    onOpenSettings,
    onDismiss,
}: Props) {
    if (status === "granted" || status === "idle" || status === "requesting") {
        return null
    }

    const config = getConfig(status)
    const action = config.action === "request" ? onRequest : onOpenSettings

    return (
        <View style={styles.container}>
            <View style={[styles.iconCircle, { backgroundColor: config.iconBg }]}>
                <Ionicons name={config.icon} size={18} color={config.iconColor} />
            </View>
            <View style={styles.text}>
                <Text style={styles.title}>{config.title}</Text>
                <Text style={styles.message}>{config.message}</Text>
            </View>
            <Pressable onPress={action} style={styles.cta} hitSlop={6}>
                <Text style={styles.ctaText}>{config.cta}</Text>
            </Pressable>
            {onDismiss && (
                <Pressable onPress={onDismiss} hitSlop={10} style={styles.dismiss}>
                    <Ionicons name="close" size={16} color="#94A3B8" />
                </Pressable>
            )}
        </View>
    )
}

function getConfig(status: LocationStatus) {
    switch (status) {
        case "denied":
            return {
                icon: "location-outline" as const,
                iconBg: "#FFF5F0",
                iconColor: "#FF6B35",
                title: "Localisation refusée",
                message: "Active-la dans les paramètres pour voir les restos près de toi.",
                cta: "Paramètres",
                action: "settings" as const,
            }
        case "services-off":
            return {
                icon: "navigate-outline" as const,
                iconBg: "#FFF5F0",
                iconColor: "#FF6B35",
                title: "GPS désactivé",
                message: "Active la localisation de ton téléphone.",
                cta: "Paramètres",
                action: "settings" as const,
            }
        case "error":
        default:
            return {
                icon: "alert-circle-outline" as const,
                iconBg: "#FEF3C7",
                iconColor: "#D97706",
                title: "Position indisponible",
                message: "Impossible de récupérer ta position.",
                cta: "Réessayer",
                action: "request" as const,
            }
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginHorizontal: 16,
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#FFF",
        borderRadius: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    iconCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        flex: 1,
        gap: 2,
    },
    title: {
        fontSize: 13,
        fontWeight: "700",
        color: "#1a1a1a",
    },
    message: {
        fontSize: 11.5,
        color: "#64748B",
    },
    cta: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 10,
        backgroundColor: "#FF6B35",
    },
    ctaText: {
        color: "#FFF",
        fontSize: 12.5,
        fontWeight: "700",
    },
    dismiss: {
        marginLeft: 2,
        padding: 2,
    },
})
