import {Tabs} from "expo-router"
import {Ionicons} from "@expo/vector-icons"
import {useOnboarding} from "@/contexts/OnboardingContext"
import {Onboarding} from "@/components/Onboarding"
import {ActivityIndicator, StyleSheet, View} from "react-native"
import {Colors} from "@/constants/Colors"

export default function TabLayout() {
    const colors = Colors.light

    const {hasSeenOnboarding, completeOnboarding} = useOnboarding()

    if (hasSeenOnboarding === null) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary}/>
            </View>
        )
    }

    if (!hasSeenOnboarding) {
        return <Onboarding onComplete={completeOnboarding}/>
    }

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.tabIconDefault,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                },
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Accueil",
                    tabBarIcon: ({color, size}) => <Ionicons name="home" size={size} color={color}/>,
                }}
            />
            <Tabs.Screen
                name="map"
                options={{
                    title: "Carte",
                    tabBarIcon: ({color, size}) => <Ionicons name="map" size={size} color={color}/>,
                }}
            />
            <Tabs.Screen
                name="favorites"
                options={{
                    title: "Favoris",
                    tabBarIcon: ({color, size}) => <Ionicons name="heart" size={size} color={color}/>,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profil",
                    tabBarIcon: ({color, size}) => <Ionicons name="person" size={size} color={color}/>,
                }}
            />
        </Tabs>
    )
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.light.background,
    },
})
