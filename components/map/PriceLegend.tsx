import { StyleSheet, Text, View } from "react-native"

export function PriceLegend() {
    return (
        <View style={styles.container}>
            <View style={styles.item}>
                <View style={[styles.dot, { backgroundColor: "#10B981" }]} />
                <Text style={styles.text}>{"< 7€"}</Text>
            </View>
            <View style={styles.sep} />
            <View style={styles.item}>
                <View style={[styles.dot, { backgroundColor: "#F59E0B" }]} />
                <Text style={styles.text}>7-10€</Text>
            </View>
            <View style={styles.sep} />
            <View style={styles.item}>
                <View style={[styles.dot, { backgroundColor: "#EF4444" }]} />
                <Text style={styles.text}>{"> 10€"}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.96)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    text: {
        fontSize: 11,
        fontWeight: "700",
        color: "#333",
    },
    sep: {
        width: 1,
        height: 12,
        backgroundColor: "#E2E8F0",
    },
})
