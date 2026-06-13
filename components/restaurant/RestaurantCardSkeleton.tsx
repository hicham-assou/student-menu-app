import { StyleSheet, View } from "react-native"
import { Skeleton } from "@/components/ui/Skeleton"

/** Placeholder animé reprenant la forme d'une RestaurantCard (210px). */
export function RestaurantCardSkeleton() {
    return (
        <View style={styles.card}>
            <Skeleton style={styles.fill} />
            <View style={styles.info}>
                <View style={{ flex: 1, gap: 8 }}>
                    <Skeleton style={styles.lineName} />
                    <Skeleton style={styles.lineCity} />
                </View>
                <Skeleton style={styles.price} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        height: 210,
        borderRadius: 24,
        overflow: "hidden",
        backgroundColor: "#F1ECE6",
    },
    fill: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 24,
    },
    info: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        padding: 16,
        gap: 10,
    },
    lineName: {
        width: "65%",
        height: 18,
        borderRadius: 6,
        backgroundColor: "#D8D0C7",
    },
    lineCity: {
        width: "40%",
        height: 12,
        borderRadius: 6,
        backgroundColor: "#D8D0C7",
    },
    price: {
        width: 64,
        height: 30,
        borderRadius: 16,
        backgroundColor: "#D8D0C7",
    },
})
