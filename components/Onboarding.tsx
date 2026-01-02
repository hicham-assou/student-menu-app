import {useRef, useState} from "react"
import {Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from "react-native"
import {Ionicons} from "@expo/vector-icons"
import {Colors} from "@/constants/Colors"

const {width, height} = Dimensions.get("window")

interface OnboardingSlide {
    id: string
    title: string
    description: string
    icon: keyof typeof Ionicons.glyphMap
    showLogo?: boolean
}

const slides: OnboardingSlide[] = [
    {
        id: "1",
        title: "Bienvenue sur StudentFood",
        description: "Découvre tous les restaurants près de toi qui proposent des menus étudiants à prix réduits !",
        icon: "restaurant",
        showLogo: true,
    },
    {
        id: "2",
        title: "Trouve les meilleurs plans",
        description: "Compare les prix, consulte les menus et trouve le restaurant parfait pour ton budget étudiant.",
        icon: "search",
    },
    {
        id: "3",
        title: "Garde tes favoris",
        description: "Ajoute tes restaurants préférés en favoris et retrouve-les facilement à tout moment.",
        icon: "heart",
    },
    {
        id: "4",
        title: "Itinéraires et horaires",
        description: "Consulte les horaires d'ouverture et obtiens l'itinéraire pour t'y rendre en un clic.",
        icon: "map",
    },
]

interface OnboardingProps {
    onComplete: () => void
}

export function Onboarding({onComplete}: OnboardingProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const flatListRef = useRef<FlatList>(null)

    const goToNext = () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({index: currentIndex + 1})
            setCurrentIndex(currentIndex + 1)
        } else {
            onComplete()
        }
    }

    const skip = () => {
        onComplete()
    }

    const renderItem = ({item}: { item: OnboardingSlide }) => {
        return (
            <View style={styles.slide}>
                {item.showLogo && (
                    <View style={styles.logoContainer}>
                        <Image source={require("@/assets/images/logo.png")} style={styles.logo} resizeMode="contain"/>
                    </View>
                )}

                <View style={styles.iconContainer}>
                    <Ionicons name={item.icon} size={100} color={Colors.light.primary}/>
                </View>

                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.skipButton} onPress={skip}>
                <Text style={styles.skipText}>Passer</Text>
            </TouchableOpacity>

            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / width)
                    setCurrentIndex(index)
                }}
            />

            <View style={styles.footer}>
                <View style={styles.pagination}>
                    {slides.map((_, index) => (
                        <View key={index}
                              style={[styles.paginationDot, index === currentIndex && styles.paginationDotActive]}/>
                    ))}
                </View>

                <TouchableOpacity style={styles.nextButton} onPress={goToNext}>
                    <Text
                        style={styles.nextButtonText}>{currentIndex === slides.length - 1 ? "Commencer" : "Suivant"}</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF"/>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    skipButton: {
        position: "absolute",
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10,
    },
    skipText: {
        color: Colors.light.textSecondary,
        fontSize: 16,
        fontWeight: "600",
    },
    slide: {
        width,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    logoContainer: {
        alignItems: "center",
        marginBottom: 40,
    },
    logo: {
        width: 200,
        height: 200,
    },
    logoText: {
        fontSize: 28,
        fontWeight: "bold",
        color: Colors.light.primary,
    },
    iconContainer: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: `${Colors.light.primary}10`,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 40,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        color: Colors.light.text,
        textAlign: "center",
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: Colors.light.textSecondary,
        textAlign: "center",
        lineHeight: 24,
    },
    footer: {
        paddingHorizontal: 40,
        paddingBottom: 50,
    },
    pagination: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 30,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.light.border,
        marginHorizontal: 4,
    },
    paginationDotActive: {
        width: 24,
        backgroundColor: Colors.light.primary,
    },
    nextButton: {
        flexDirection: "row",
        backgroundColor: Colors.light.primary,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    nextButtonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "600",
    },
})
