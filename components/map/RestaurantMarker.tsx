import { memo, useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"
import { Marker } from "react-native-maps"
import Svg, { Circle } from "react-native-svg"
import type { Restaurant } from "@/types"

export type PriceTier = "low" | "mid" | "high" | "unknown"

interface RestaurantMarkerProps {
    restaurant: Restaurant
    selected: boolean
    minPrice: number | null
    tier: PriceTier
    onPress: (restaurant: Restaurant) => void
}

const TIER_COLORS: Record<PriceTier, string> = {
    low: "#10B981",
    mid: "#F59E0B",
    high: "#EF4444",
    unknown: "#94A3B8",
}

// Boite FIXE (jamais redimensionnee) : le halo de selection est dessine
// a l'interieur, donc aucun re-layout casse sur Android.
const BOX = 36

function RestaurantMarkerInner({
    restaurant,
    selected,
    tier,
    onPress,
}: RestaurantMarkerProps) {
    const color = TIER_COLORS[tier]

    // Re-capture le bitmap brievement a l'apparition / au changement d'etat,
    // puis on coupe (perf + anti-flicker).
    const [tracks, setTracks] = useState(true)
    useEffect(() => {
        setTracks(true)
        const timer = setTimeout(() => setTracks(false), 600)
        return () => clearTimeout(timer)
    }, [selected, color])

    return (
        <Marker
            coordinate={{
                latitude: restaurant.latitude,
                longitude: restaurant.longitude,
            }}
            onPress={(e) => {
                e.stopPropagation?.()
                onPress(restaurant)
            }}
            // Point centre exactement sur les coords GPS
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={tracks}
        >
            <View collapsable={false} style={styles.box}>
                <Svg width={BOX} height={BOX} viewBox="0 0 36 36">
                    {/* Halo de selection */}
                    {selected && <Circle cx={18} cy={18} r={16} fill={color} fillOpacity={0.2} />}

                    {/* Anneau blanc */}
                    <Circle
                        cx={18}
                        cy={18}
                        r={selected ? 10.5 : 9}
                        fill="#FFFFFF"
                        stroke={selected ? color : "rgba(0,0,0,0.15)"}
                        strokeWidth={selected ? 2 : 1}
                    />

                    {/* Point colore */}
                    <Circle cx={18} cy={18} r={selected ? 7 : 6} fill={color} />
                </Svg>
            </View>
        </Marker>
    )
}

export const RestaurantMarker = memo(RestaurantMarkerInner)

const styles = StyleSheet.create({
    box: {
        width: BOX,
        height: BOX,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
    },
})
