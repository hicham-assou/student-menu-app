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
                tabBarShowLabel: true,
                tabBarStyle: styles.tabBar,
                tabBarItemStyle: styles.tabItem,
                tabBarLabelStyle: styles.tabLabel,
                tabBarIconStyle: styles.tabIcon,
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Accueil",
                    tabBarIcon: ({color, focused}) => (
                        <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color}/>
                    ),
                }}
            />
            <Tabs.Screen
                name="map"
                options={{
                    title: "Carte",
                    tabBarIcon: ({color, focused}) => (
                        <Ionicons name={focused ? "map" : "map-outline"} size={24} color={color}/>
                    ),
                }}
            />
            <Tabs.Screen
                name="favorites"
                options={{
                    title: "Favoris",
                    tabBarIcon: ({color, focused}) => (
                        <Ionicons name={focused ? "heart" : "heart-outline"} size={24} color={color}/>
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profil",
                    tabBarIcon: ({color, focused}) => (
                        <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color}/>
                    ),
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
    tabBar: {
        position: "absolute",
        bottom: 24,
        left: 20,
        right: 20,
        height: 70,
        borderRadius: 30,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 0,
        paddingHorizontal: 8,
        paddingTop: 10,
        paddingBottom: 12,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 6},
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 12,
    },
    tabItem: {
        paddingVertical: 0,
    },
    tabIcon: {
        marginTop: 2,
    },
    tabLabel: {
        fontSize: 10.5,
        fontWeight: "600",
        marginTop: 1,
    },
})
