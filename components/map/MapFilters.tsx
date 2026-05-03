import { useState } from "react"
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"

export type PriceFilter = "all" | "low" | "mid" | "high"

export interface MapFilterState {
    search: string
    radiusEnabled: boolean
    radiusKm: number
    price: PriceFilter
}

interface MapFiltersProps {
    state: MapFilterState
    onChange: (next: MapFilterState) => void
    onToggleRadius: () => void
    resultCount: number
    canFilterByRadius: boolean
}

const PRICE_OPTIONS: { value: PriceFilter; label: string; color: string }[] = [
    { value: "low", label: "< 7€", color: "#10B981" },
    { value: "mid", label: "7-10€", color: "#F59E0B" },
    { value: "high", label: "> 10€", color: "#EF4444" },
]

export function MapFilters({
    state,
    onChange,
    onToggleRadius,
    resultCount,
    canFilterByRadius,
}: MapFiltersProps) {
    const [searchFocused, setSearchFocused] = useState(false)

    const setPrice = (price: PriceFilter) => {
        onChange({ ...state, price: state.price === price ? "all" : price })
    }

    const setRadius = (delta: number) => {
        const next = Math.max(1, Math.min(50, state.radiusKm + delta))
        onChange({ ...state, radiusKm: next })
    }

    const hasActiveFilters =
        state.search.length > 0 || state.radiusEnabled || state.price !== "all"

    const reset = () => {
        onChange({
            search: "",
            radiusEnabled: false,
            radiusKm: state.radiusKm,
            price: "all",
        })
    }

    return (
        <View style={styles.container} pointerEvents="box-none">
            {/* Search bar */}
            <View
                style={[
                    styles.searchBar,
                    searchFocused && styles.searchBarFocused,
                ]}
            >
                <Ionicons name="search" size={18} color="#94A3B8" />
                <TextInput
                    placeholder="Rechercher un restaurant..."
                    placeholderTextColor="#94A3B8"
                    value={state.search}
                    onChangeText={(t) => onChange({ ...state, search: t })}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    style={styles.searchInput}
                    returnKeyType="search"
                />
                {state.search.length > 0 && (
                    <Pressable
                        onPress={() => onChange({ ...state, search: "" })}
                        hitSlop={10}
                    >
                        <Ionicons name="close-circle" size={18} color="#CBD5E1" />
                    </Pressable>
                )}
            </View>

            {/* Filter chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
            >
                {/* Compteur */}
                <View style={[styles.chip, styles.chipCount]}>
                    <Ionicons name="restaurant" size={14} color="#FF6B35" />
                    <Text style={styles.chipCountText}>
                        {resultCount} resto{resultCount > 1 ? "s" : ""}
                    </Text>
                </View>

                {/* Rayon */}
                <TouchableOpacity
                    onPress={onToggleRadius}
                    disabled={!canFilterByRadius}
                    activeOpacity={0.85}
                    style={[
                        styles.chip,
                        state.radiusEnabled && styles.chipActive,
                        !canFilterByRadius && styles.chipDisabled,
                    ]}
                >
                    <Ionicons
                        name="locate"
                        size={14}
                        color={state.radiusEnabled ? "#FFF" : "#FF6B35"}
                    />
                    <Text
                        style={[
                            styles.chipText,
                            state.radiusEnabled && styles.chipTextActive,
                        ]}
                    >
                        {state.radiusEnabled ? `${state.radiusKm} km` : "Rayon"}
                    </Text>
                </TouchableOpacity>

                {/* Controles rayon (visible si actif) */}
                {state.radiusEnabled && (
                    <View style={styles.radiusGroup}>
                        <Pressable
                            onPress={() => setRadius(-1)}
                            style={styles.radiusBtn}
                            hitSlop={5}
                        >
                            <Ionicons name="remove" size={16} color="#1a1a1a" />
                        </Pressable>
                        <Pressable
                            onPress={() => setRadius(1)}
                            style={styles.radiusBtn}
                            hitSlop={5}
                        >
                            <Ionicons name="add" size={16} color="#1a1a1a" />
                        </Pressable>
                    </View>
                )}

                {/* Prix */}
                {PRICE_OPTIONS.map((opt) => {
                    const active = state.price === opt.value
                    return (
                        <TouchableOpacity
                            key={opt.value}
                            onPress={() => setPrice(opt.value)}
                            activeOpacity={0.85}
                            style={[
                                styles.chip,
                                active && {
                                    backgroundColor: opt.color,
                                    borderColor: opt.color,
                                },
                            ]}
                        >
                            <View
                                style={[
                                    styles.priceDot,
                                    { backgroundColor: active ? "#FFF" : opt.color },
                                ]}
                            />
                            <Text
                                style={[
                                    styles.chipText,
                                    active && styles.chipTextActive,
                                ]}
                            >
                                {opt.label}
                            </Text>
                        </TouchableOpacity>
                    )
                })}

                {/* Reset */}
                {hasActiveFilters && (
                    <TouchableOpacity
                        onPress={reset}
                        activeOpacity={0.85}
                        style={[styles.chip, styles.chipReset]}
                    >
                        <Ionicons name="refresh" size={13} color="#64748B" />
                        <Text style={[styles.chipText, { color: "#64748B" }]}>
                            Reset
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: 10,
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#FFF",
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: "transparent",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
    },
    searchBarFocused: {
        borderColor: "#FF6B35",
    },
    searchInput: {
        flex: 1,
        fontSize: 14.5,
        color: "#1a1a1a",
        padding: 0,
    },
    chipsRow: {
        flexDirection: "row",
        gap: 8,
        paddingRight: 16,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 13,
        paddingVertical: 9,
        borderRadius: 22,
        backgroundColor: "#FFF",
        borderWidth: 1.5,
        borderColor: "transparent",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 2,
    },
    chipActive: {
        backgroundColor: "#FF6B35",
        borderColor: "#FF6B35",
    },
    chipDisabled: {
        opacity: 0.45,
    },
    chipText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#1a1a1a",
    },
    chipTextActive: {
        color: "#FFF",
    },
    chipCount: {
        backgroundColor: "#FFF5F0",
    },
    chipCountText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#1a1a1a",
    },
    chipReset: {
        backgroundColor: "#F1F5F9",
    },
    radiusGroup: {
        flexDirection: "row",
        gap: 6,
    },
    radiusBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#FFF",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 2,
    },
    priceDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
})
