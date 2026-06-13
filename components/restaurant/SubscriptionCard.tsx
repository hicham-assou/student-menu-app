import { StyleSheet, Text, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { formatPrice } from "@/lib/price"
import type { Restaurant } from "@/types"

const STATUS: Record<string, { label: string; bg: string; fg: string }> = {
    active: { label: "Actif", bg: "#DCFCE7", fg: "#15803D" },
    trial: { label: "Essai", bg: "#FEF3C7", fg: "#B45309" },
    inactive: { label: "Inactif", bg: "#F1F5F9", fg: "#64748B" },
    expired: { label: "Expiré", bg: "#FEE2E2", fg: "#B91C1C" },
}

function formatDate(value?: string | null): string | null {
    if (!value) return null
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return null
    return d.toLocaleDateString("fr-BE", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function daysLeft(value?: string | null): number | null {
    if (!value) return null
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return null
    return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

interface Props {
    restaurant: Restaurant
}

export function SubscriptionCard({ restaurant }: Props) {
    const status = STATUS[restaurant.subscription_status] ?? STATUS.inactive
    const start = formatDate(restaurant.subscription_start_date)
    const end = formatDate(restaurant.subscription_end_date)
    const remaining = daysLeft(restaurant.subscription_end_date)
    const isTrial = restaurant.subscription_status === "trial"

    const rows: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }[] = []
    if (start) rows.push({ icon: "calendar-outline", label: "Début", value: start })
    if (end)
        rows.push({
            icon: isTrial ? "hourglass-outline" : "calendar-outline",
            label: isTrial ? "Fin d'essai" : "Échéance",
            value:
                remaining != null && remaining >= 0
                    ? `${end} (dans ${remaining} j)`
                    : remaining != null
                        ? `${end} (expiré)`
                        : end,
        })
    if (restaurant.subscription_price != null) {
        const period =
            restaurant.subscription_period === "yearly"
                ? " / an"
                : restaurant.subscription_period === "monthly"
                    ? " / mois"
                    : ""
        rows.push({
            icon: "pricetag-outline",
            label: "Tarif",
            value: `${formatPrice(restaurant.subscription_price)}${period}`,
        })
    }
    if (restaurant.contact_person)
        rows.push({ icon: "person-outline", label: "Contact", value: restaurant.contact_person })
    if (restaurant.contact_email)
        rows.push({ icon: "mail-outline", label: "Email", value: restaurant.contact_email })
    const lastContact = formatDate(restaurant.last_contact_date)
    if (lastContact) rows.push({ icon: "chatbubble-ellipses-outline", label: "Dernier contact", value: lastContact })

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Ionicons name="card-outline" size={18} color="#F97316" />
                    <Text style={styles.title}>Abonnement</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.badgeText, { color: status.fg }]}>{status.label}</Text>
                </View>
            </View>

            {rows.map((r, i) => (
                <View key={i} style={styles.row}>
                    <View style={styles.rowLeft}>
                        <Ionicons name={r.icon} size={15} color="#A8A29E" />
                        <Text style={styles.rowLabel}>{r.label}</Text>
                    </View>
                    <Text style={styles.rowValue} numberOfLines={1}>
                        {r.value}
                    </Text>
                </View>
            ))}

            {restaurant.notes ? (
                <View style={styles.notes}>
                    <Text style={styles.notesLabel}>Notes</Text>
                    <Text style={styles.notesText}>{restaurant.notes}</Text>
                </View>
            ) : null}

            <Text style={styles.hint}>Visible uniquement par toi (gérant).</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 20,
        marginTop: 22,
        padding: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#F1ECE6",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
    },
    title: {
        fontSize: 16,
        fontWeight: "800",
        color: "#1C1917",
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "700",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 7,
        borderTopWidth: 1,
        borderTopColor: "#F5F2ED",
        gap: 12,
    },
    rowLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
    },
    rowLabel: {
        fontSize: 13.5,
        color: "#78716C",
        fontWeight: "500",
    },
    rowValue: {
        fontSize: 13.5,
        color: "#1C1917",
        fontWeight: "700",
        flexShrink: 1,
        textAlign: "right",
    },
    notes: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#F5F2ED",
    },
    notesLabel: {
        fontSize: 11.5,
        fontWeight: "700",
        color: "#A8A29E",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    notesText: {
        fontSize: 13.5,
        color: "#44403C",
        lineHeight: 19,
    },
    hint: {
        fontSize: 11.5,
        color: "#A8A29E",
        fontStyle: "italic",
        marginTop: 12,
    },
})
