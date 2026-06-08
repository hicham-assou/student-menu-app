import { useEffect, useState } from "react"
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "@/constants/Colors"
import { CATEGORIES, TAGS } from "@/constants/discovery"

const colors = Colors.light

interface Props {
    visible: boolean
    initialCategories: string[]
    initialTags: string[]
    onClose: () => void
    onApply: (categories: string[], tags: string[]) => void
}

export function CategoryRegimeModal({ visible, initialCategories, initialTags, onClose, onApply }: Props) {
    const [cats, setCats] = useState<string[]>(initialCategories)
    const [tags, setTags] = useState<string[]>(initialTags)

    // Re-synchronise à chaque ouverture
    useEffect(() => {
        if (visible) {
            setCats(initialCategories)
            setTags(initialTags)
        }
    }, [visible]) // eslint-disable-line react-hooks/exhaustive-deps

    const toggle = (list: string[], setList: (v: string[]) => void, id: string) => {
        setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
    }

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose} />
            <View style={styles.sheet}>
                <View style={styles.handle} />
                <View style={styles.header}>
                    <Text style={styles.title}>Catégories & régime</Text>
                    <TouchableOpacity onPress={onClose} hitSlop={10}>
                        <Ionicons name="close" size={24} color="#A8A29E" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
                    <Text style={styles.sectionLabel}>Type de cuisine</Text>
                    <Text style={styles.sectionHint}>Tu peux en choisir plusieurs</Text>
                    <View style={styles.chipsWrap}>
                        {CATEGORIES.map((c) => {
                            const active = cats.includes(c.id)
                            return (
                                <TouchableOpacity
                                    key={c.id}
                                    onPress={() => toggle(cats, setCats, c.id)}
                                    activeOpacity={0.8}
                                    style={[styles.chip, active && styles.chipActive]}
                                >
                                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                                        {c.emoji} {c.label}
                                    </Text>
                                    {active && <Ionicons name="checkmark" size={15} color="#FFFFFF" />}
                                </TouchableOpacity>
                            )
                        })}
                    </View>

                    <Text style={[styles.sectionLabel, { marginTop: 22 }]}>Régime</Text>
                    <View style={styles.chipsWrap}>
                        {TAGS.map((t) => {
                            const active = tags.includes(t.id)
                            return (
                                <TouchableOpacity
                                    key={t.id}
                                    onPress={() => toggle(tags, setTags, t.id)}
                                    activeOpacity={0.8}
                                    style={[styles.chip, active && styles.chipActive]}
                                >
                                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{t.label}</Text>
                                    {active && <Ionicons name="checkmark" size={15} color="#FFFFFF" />}
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.applyBtn}
                        activeOpacity={0.85}
                        onPress={() => {
                            onApply(cats, tags)
                            onClose()
                        }}
                    >
                        <Text style={styles.applyText}>Valider</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    sheet: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: "80%",
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 10,
    },
    handle: {
        alignSelf: "center",
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#E7E1DA",
        marginBottom: 8,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    title: {
        fontSize: 19,
        fontWeight: "800",
        color: colors.text,
        letterSpacing: -0.4,
    },
    body: {
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 2,
    },
    sectionHint: {
        fontSize: 12.5,
        color: colors.textSecondary,
        marginBottom: 12,
    },
    chipsWrap: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 8,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 22,
        backgroundColor: "#F5F5F4",
        borderWidth: 1.5,
        borderColor: "transparent",
    },
    chipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    chipText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.text,
    },
    chipTextActive: {
        color: "#FFFFFF",
    },
    footer: {
        padding: 16,
        paddingBottom: 28,
        borderTopWidth: 1,
        borderTopColor: "#F2EEE9",
    },
    applyBtn: {
        backgroundColor: colors.primary,
        borderRadius: 16,
        paddingVertical: 15,
        alignItems: "center",
    },
    applyText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
})
