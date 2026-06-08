import { useState } from "react"
import { StyleSheet, Text, TextInput, View } from "react-native"
import { Colors } from "@/constants/Colors"
import { DAY_ORDER, DAY_SHORT } from "@/constants/discovery"
import { parseDayHours } from "@/lib/hours"
import type { HoursPeriod, WeeklyHours } from "@/types"

const colors = Colors.light

function seed(periods?: HoursPeriod[]): string {
    if (!periods || periods.length === 0) return ""
    return periods.map((p) => `${p.open}-${p.close}`).join(", ")
}

interface Props {
    initial?: WeeklyHours | null
    onChange: (hours: WeeklyHours) => void
}

/**
 * Saisie des horaires jour par jour, sous forme de texte
 * "11:30-14:30, 18:00-22:00" (laisser vide = fermé).
 * Émet des horaires structurés via onChange.
 */
export function HoursEditor({ initial, onChange }: Props) {
    const [rows, setRows] = useState<Record<number, string>>(() => {
        const r: Record<number, string> = {}
        for (const d of DAY_ORDER) r[d] = seed(initial?.[d])
        return r
    })

    const update = (day: number, text: string) => {
        const next = { ...rows, [day]: text }
        setRows(next)
        const hours: WeeklyHours = {}
        for (const d of DAY_ORDER) {
            const periods = parseDayHours(next[d])
            if (periods.length > 0) hours[d] = periods
        }
        onChange(hours)
    }

    return (
        <View>
            <Text style={styles.hint}>
                Format : 11:30-14:30, 18:00-22:00 — laisse vide si fermé ce jour-là.
            </Text>
            {DAY_ORDER.map((d) => (
                <View key={d} style={styles.row}>
                    <Text style={styles.day}>{DAY_SHORT[d]}</Text>
                    <TextInput
                        style={styles.input}
                        value={rows[d]}
                        onChangeText={(t) => update(d, t)}
                        placeholder="Fermé"
                        placeholderTextColor="#A8A29E"
                        autoCapitalize="none"
                    />
                </View>
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    hint: {
        fontSize: 12.5,
        color: colors.textSecondary,
        marginBottom: 12,
        fontStyle: "italic",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 8,
    },
    day: {
        width: 38,
        fontSize: 14,
        fontWeight: "700",
        color: colors.text,
    },
    input: {
        flex: 1,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 14.5,
        color: colors.text,
    },
})
