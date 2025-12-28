import {Stack} from "expo-router"
import {AuthProvider} from "@/contexts/AuthContext"

export default function RootLayout() {
    return (
        <AuthProvider>
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
                <Stack.Screen name="restaurant/[id]" options={{headerShown: false}}/>
                <Stack.Screen name="owner/restaurants" options={{title: "Mes Restaurants"}}/>
                <Stack.Screen name="owner/stats/[id]" options={{title: "Statistiques"}}/>
                <Stack.Screen name="owner/edit/[id]" options={{title: "Modifier le restaurant"}}/>
            </Stack>
        </AuthProvider>
    )
}