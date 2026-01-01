"use client"

import {useEffect, useState} from "react"
import * as Notifications from "expo-notifications"
import {Platform} from "react-native"
import {supabase} from "@/lib/supabase"
import {useAuth} from "@/contexts/AuthContext"

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
})

export function useNotifications() {
    const {user} = useAuth()
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null)
    const [notification, setNotification] = useState<Notifications.Notification | null>(null)

    useEffect(() => {
        registerForPushNotificationsAsync()

        const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
            setNotification(notification)
        })

        const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
            // TODO: Gérer la navigation selon les données de la notification
        })

        return () => {
            notificationListener.remove()
            responseListener.remove()
        }
    }, [])

    useEffect(() => {
        if (expoPushToken && user) {
            savePushTokenToDatabase(expoPushToken, user.id)
        }
    }, [expoPushToken, user])

    async function registerForPushNotificationsAsync() {
        let token

        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#F97316",
            })
        }

        const {status: existingStatus} = await Notifications.getPermissionsAsync()
        let finalStatus = existingStatus

        if (existingStatus !== "granted") {
            const {status} = await Notifications.requestPermissionsAsync()
            finalStatus = status
        }

        if (finalStatus !== "granted") {
            return
        }

        try {
            const tokenData = await Notifications.getDevicePushTokenAsync()
            token = tokenData.data
            setExpoPushToken(token)
        } catch (error) {
            console.error("Error getting push token:", error)
        }

        return token
    }

    async function savePushTokenToDatabase(token: string, userId: string) {
        try {
            const {error} = await supabase.from("profiles").update({push_token: token}).eq("id", userId)

            if (error) {
                console.error("Error saving push token:", error)
            }
        } catch (error) {
            console.error("Error saving push token:", error)
        }
    }

    return {
        expoPushToken,
        notification,
    }
}
