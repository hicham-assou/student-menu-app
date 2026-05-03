import { memo } from "react"
import { StyleSheet, View } from "react-native"
import { Marker } from "react-native-maps"
import Svg, { Circle, Path } from "react-native-svg"
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

// Dimensions du pin (viewBox SVG 24x32)
const PIN_W = 32
const PIN_H = 42
const PIN_W_SEL = 40
const PIN_H_SEL = 52

function RestaurantMarkerInner({
    restaurant,
    selected,
    tier,
    onPress,
}: RestaurantMarkerProps) {
    const color = TIER_COLORS[tier]
    const w = selected ? PIN_W_SEL : PIN_W
    const h = selected ? PIN_H_SEL : PIN_H

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
            // Anchor en bas-centre : la pointe du pin pointe sur les coords GPS
            anchor={{ x: 0.5, y: 1 }}
            tracksViewChanges={true}
        >
            {/* Container EXACTEMENT a la taille du SVG pour que la pointe
                touche les coords GPS (anchor 0.5/1 = bas-centre de la View) */}
            <View
                collapsable={false}
                style={[styles.box, { width: w, height: h }]}
            >
                <Svg width={w} height={h} viewBox="0 0 24 32">
                    {/* Forme du pin : goutte d'eau */}
                    <Path
                        d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12z"
                        fill={color}
                        stroke="#FFFFFF"
                        strokeWidth={selected ? 2 : 1.5}
                    />
                    {/* Cercle blanc interne */}
                    <Circle cx={12} cy={12} r={4.5} fill="#FFFFFF" />
                </Svg>
            </View>
        </Marker>
    )
}

export const RestaurantMarker = memo(RestaurantMarkerInner)

const styles = StyleSheet.create({
    box: {
        alignItems: "center",
        justifyContent: "flex-end",
        backgroundColor: "transparent",
    },
})
