"use client"

import {ScrollView, StyleSheet, Switch, Text, View} from "react-native"
import {SafeAreaView} from "react-native-safe-area-context"
import {useRouter} from "expo-router"
import {Ionicons} from "@expo/vector-icons"
import {Colors} from "@/constants/Colors"
import {useState} from "react"
import {useAuth} from "@/contexts/AuthContext"

export default function NotificationsScreen() {
    const router = useRouter()
    const {profile} = useAuth()

    const [notifications, setNotifications] = useState({
        newMenus: true,
        promos: true,
        favorites: false,
        reviews: true,
        stats: true,
        subscription: true,
    })

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications((prev) => ({...prev, [key]: !prev[key]}))
    }

    const NotificationItem = ({
                                  icon,
                                  title,
                                  description,
                                  value,
                                  onToggle,
                              }: {
        icon: string
        title: string
        description: string
        value: boolean
        onToggle: () => void
    }) => (
        <View
            style={[styles.notificationItem, {backgroundColor: Colors.light.surface, borderColor: Colors.light.border}]}
        >
            <View style={styles.notificationLeft}>
                <View style={[styles.iconContainer, {backgroundColor: `${Colors.light.primary}20`}]}>
                    <Ionicons name={icon as any} size={20} color={Colors.light.primary}/>
                </View>
                <View style={styles.notificationText}>
                    <Text style={[styles.notificationTitle, {color: Colors.light.text}]}>{title}</Text>
                    <Text
                        style={[styles.notificationDescription, {color: Colors.light.textSecondary}]}>{description}</Text>
                </View>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{false: Colors.light.border, true: Colors.light.primary}}
            />
        </View>
    )

    const isOwner = profile?.role === "restaurant_owner"

    return (
        <SafeAreaView style={[styles.container, {backgroundColor: Colors.light.background}]}>
            <ScrollView contentContainerStyle={styles.content}>
                {isOwner && <Text style={[styles.sectionTitle, {color: Colors.light.textSecondary}]}>GÉNÉRAL</Text>}

                <NotificationItem
                    icon="restaurant"
                    title="Nouveaux menus"
                    description="Alertes pour les nouveaux menus étudiants"
                    value={notifications.newMenus}
                    onToggle={() => toggleNotification("newMenus")}
                />

                <NotificationItem
                    icon="pricetag"
                    title="Promotions"
                    description="Promos spéciales à proximité"
                    value={notifications.promos}
                    onToggle={() => toggleNotification("promos")}
                />

                <NotificationItem
                    icon="heart"
                    title="Favoris"
                    description="Nouveautés dans tes restaurants favoris"
                    value={notifications.favorites}
                    onToggle={() => toggleNotification("favorites")}
                />

                {isOwner && (
                    <>
                        <Text style={[styles.sectionTitle, {
                            color: Colors.light.textSecondary,
                            marginTop: 32
                        }]}>GÉRANT</Text>

                        <NotificationItem
                            icon="star"
                            title="Nouveaux avis"
                            description="Alerte pour les avis sur tes restaurants"
                            value={notifications.reviews}
                            onToggle={() => toggleNotification("reviews")}
                        />

                        <NotificationItem
                            icon="stats-chart"
                            title="Statistiques"
                            description="Rapport hebdomadaire de performances"
                            value={notifications.stats}
                            onToggle={() => toggleNotification("stats")}
                        />

                        <NotificationItem
                            icon="card"
                            title="Abonnement"
                            description="Rappels d'expiration d'abonnement"
                            value={notifications.subscription}
                            onToggle={() => toggleNotification("subscription")}
                        />
                    </>
                )}

                <View
                    style={[
                        styles.infoBox,
                        {backgroundColor: `${Colors.light.primary}10`, borderColor: `${Colors.light.primary}30`},
                    ]}
                >
                    <Ionicons name="information-circle" size={20} color={Colors.light.primary}/>
                    <Text style={[styles.infoText, {color: Colors.light.primary}]}>
                        Les notifications push seront activées dans une prochaine mise à jour
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    notificationItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 8,
    },
    notificationLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    notificationText: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 2,
    },
    notificationDescription: {
        fontSize: 13,
    },
    infoBox: {
        flexDirection: "row",
        gap: 12,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 24,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
})
