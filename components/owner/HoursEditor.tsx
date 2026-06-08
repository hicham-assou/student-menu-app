import { useState } from "react"
import { FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "@/constants/Colors"
import { DAY_ORDER, DAY_SHORT } from "@/constants/discovery"
import type { WeeklyHours } from "@/types"

const colors = Colors.light
const ITEM_H = 48

// Toutes les heures par tranche de 15 min ("00:00" → "23:45")
const TIMES: string[] = (() => {
    const arr: string[] = []
    for (let h = 0; h < 24; h++) {
        for (const m of [0, 15, 30, 45]) {
            arr.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
        }
    }
    return arr
})()

interface Props {
    initial?: WeeklyHours | null
    onChange: (hours: WeeklyHours) => void
}

interface PickerTarget {
    day: number
    index: number
    field: "open" | "close"
}

/**
 * Éditeur d'horaires : on choisit les heures dans une liste (pas de saisie
 * texte), donc aucune erreur de format possible. Plusieurs créneaux par jour.
 */
export function HoursEditor({ initial, onChange }: Props) {
    const [hours, setHours] = useState<WeeklyHours>(() => {
        const h: WeeklyHours = {}
        for (const d of DAY_ORDER) {
            if (initial?.[d]?.length) h[d] = initial[d].map((p) => ({ ...p }))
        }
        return h
    })
    const [picker, setPicker] = useState<PickerTarget | null>(null)

    const commit = (next: WeeklyHours) => {
        setHours(next)
        onChange(next)
    }

    const addPeriod = (day: number) => {
        commit({ ...hours, [day]: [...(hours[day] || []), { open: "12:00", close: "14:00" }] })
    }

    const removePeriod = (day: number, index: number) => {
        const periods = (hours[day] || []).filter((_, i) => i !== index)
        const next = { ...hours }
        if (periods.length) next[day] = periods
        else delete next[day]
        commit(next)
    }

    const setTime = (day: number, index: number, field: "open" | "close", value: string) => {
        const periods = (hours[day] || []).map((p, i) => (i === index ? { ...p, [field]: value } : p))
        commit({ ...hours, [day]: periods })
    }

    const currentValue =
        picker != null ? hours[picker.day]?.[picker.index]?.[picker.field] ?? "12:00" : "12:00"
    const currentIndex = Math.max(0, TIMES.indexOf(currentValue))

    return (
        <View>
            {DAY_ORDER.map((day) => {
                const periods = hours[day] || []
                return (
                    <View key={day} style={styles.dayBlock}>
                        <View style={styles.dayHeader}>
                            <Text style={styles.dayLabel}>{DAY_SHORT[day]}</Text>
                            {periods.length === 0 && <Text style={styles.closed}>Fermé</Text>}
                        </View>

                        {periods.map((p, i) => (
                            <View key={i} style={styles.periodRow}>
                                <TouchableOpacity
                                    style={styles.timeBtn}
                                    onPress={() => setPicker({ day, index: i, field: "open" })}
                                >
                                    <Ionicons name="time-outline" size={14} color={colors.primary} />
                                    <Text style={styles.timeText}>{p.open}</Text>
                                </TouchableOpacity>
                                <Text style={styles.dash}>–</Text>
                                <TouchableOpacity
                                    style={styles.timeBtn}
                                    onPress={() => setPicker({ day, index: i, field: "close" })}
                                >
                                    <Ionicons name="time-outline" size={14} color={colors.primary} />
                                    <Text style={styles.timeText}>{p.close}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => removePeriod(day, i)}
                                    style={styles.removeBtn}
                                    hitSlop={8}
                                >
                                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        ))}

                        <TouchableOpacity style={styles.addBtn} onPress={() => addPeriod(day)} activeOpacity={0.7}>
                            <Ionicons name="add" size={16} color={colors.primary} />
                            <Text style={styles.addText}>
                                {periods.length ? "Ajouter un créneau" : "Ajouter des horaires"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )
            })}

            {/* Sélecteur d'heure */}
            <Modal visible={picker != null} transparent animationType="fade" onRequestClose={() => setPicker(null)}>
                <Pressable style={styles.backdrop} onPress={() => setPicker(null)} />
                <View style={styles.pickerSheet}>
                    <Text style={styles.pickerTitle}>
                        {picker?.field === "open" ? "Heure d'ouverture" : "Heure de fermeture"}
                    </Text>
                    <FlatList
                        data={TIMES}
                        keyExtractor={(t) => t}
                        getItemLayout={(_, i) => ({ length: ITEM_H, offset: ITEM_H * i, index: i })}
                        initialScrollIndex={currentIndex}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => {
                            const selected = item === currentValue
                            return (
                                <TouchableOpacity
                                    style={[styles.timeOption, selected && styles.timeOptionActive]}
                                    onPress={() => {
                                        if (picker) setTime(picker.day, picker.index, picker.field, item)
                                        setPicker(null)
                                    }}
                                >
                                    <Text style={[styles.timeOptionText, selected && styles.timeOptionTextActive]}>
                                        {item}
                                    </Text>
                                    {selected && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                                </TouchableOpacity>
                            )
                        }}
                    />
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    dayBlock: {
        marginBottom: 14,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F2EEE9",
    },
    dayHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 8,
    },
    dayLabel: {
        fontSize: 14.5,
        fontWeight: "800",
        color: colors.text,
    },
    closed: {
        fontSize: 13,
        color: "#A8A29E",
        fontStyle: "italic",
    },
    periodRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    timeBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: "#FFF1E8",
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 12,
    },
    timeText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#9A3412",
    },
    dash: {
        fontSize: 15,
        color: colors.textSecondary,
        fontWeight: "700",
    },
    removeBtn: {
        marginLeft: "auto",
    },
    addBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        alignSelf: "flex-start",
        paddingVertical: 4,
    },
    addText: {
        fontSize: 13.5,
        fontWeight: "700",
        color: colors.primary,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    pickerSheet: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "55%",
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 16,
    },
    pickerTitle: {
        fontSize: 17,
        fontWeight: "800",
        color: colors.text,
        textAlign: "center",
        marginBottom: 8,
    },
    timeOption: {
        height: ITEM_H,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    timeOptionActive: {
        backgroundColor: "#FFF1E8",
    },
    timeOptionText: {
        fontSize: 16,
        color: colors.text,
        fontWeight: "600",
    },
    timeOptionTextActive: {
        color: colors.primary,
        fontWeight: "800",
    },
})
