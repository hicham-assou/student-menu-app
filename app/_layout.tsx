import {Stack} from 'expo-router'
import {AuthProvider} from "@/contexts/AuthContext";

export default function RootLayout() {
    return (
        <AuthProvider>
            <Stack>
                <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
                <Stack.Screen
                    name="restaurant/[id]"
                    options={{headerShown: false}}
                />

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
            </Stack>
        </AuthProvider>
    )
}