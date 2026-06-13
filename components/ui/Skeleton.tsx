import { useEffect, useRef } from "react"
import { Animated, StyleSheet, type ViewStyle } from "react-native"

interface SkeletonProps {
    style?: ViewStyle | ViewStyle[]
}

/** Bloc gris animé (pulse) pour les états de chargement. */
export function Skeleton({ style }: SkeletonProps) {
    const opacity = useRef(new Animated.Value(0.5)).current

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
            ]),
        )
        loop.start()
        return () => loop.stop()
    }, [opacity])

    return <Animated.View style={[styles.base, style, { opacity }]} />
}

const styles = StyleSheet.create({
    base: {
        backgroundColor: "#E7E1DA",
        borderRadius: 8,
    },
})
