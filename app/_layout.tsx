import {Stack} from "expo-router"
import {AuthProvider} from "@/contexts/AuthContext"
import {StatusBar} from "expo-status-bar"
import {AlertProvider} from "@/components/customAlert/AlertProvider"
import {OnboardingProvider} from "@/contexts/OnboardingContext";
// import { NotificationManager } from "@/components/NotificationManager"

export default function RootLayout() {
    return (
        <OnboardingProvider>
            <AuthProvider>
                <AlertProvider>
                    <StatusBar style="dark"/>
                    <Stack>
                        <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
                        <Stack.Screen
                            name="auth/login"
                            options={{
                                presentation: 'modal',
                                title: 'Connexion',
                            }}
                        />
                        <Stack.Screen
                            name="auth/signup"
                            options={{
                                presentation: 'modal',
                                title: 'Inscription',
                            }}
                        />
                        <Stack.Screen name="restaurant/[id]" options={{title: "Restaurant"}}/>
                        <Stack.Screen name="owner/restaurants" options={{title: "Mes Restaurants"}}/>
                        <Stack.Screen name="owner/stats/[id]" options={{title: "Statistiques"}}/>
                        <Stack.Screen name="owner/edit/[id]" options={{title: "Modifier le restaurant"}}/>
                        <Stack.Screen name="profile/reviews" options={{title: "Mes avis"}}/>
                        <Stack.Screen name="profile/notifications" options={{title: "Notifications"}}/>
                    </Stack>
                </AlertProvider>
            </AuthProvider>
        </OnboardingProvider>
    )
}
