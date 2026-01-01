import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import { useColorScheme } from "@/components/useColorScheme.web"
import { Colors } from "@/constants/Colors"
import { getRestaurantStats, type RestaurantStats, type TimePeriod } from "@/lib/analytics"
import type { Restaurant } from "@/types"
import { getRestaurants } from "@/lib/api"
import { LineChart } from "react-native-chart-kit"
import React from "react"

const { width } = Dimensions.get("window")
const CARD_WIDTH = (width - 48) / 2

const aggregateChartData = (dailyStats: Array<{ date: string; views: number }>, period: TimePeriod) => {
    if (dailyStats.length === 0) return { labels: [], data: [], fullDates: [], chartWidth: width - 80 }

    let aggregated: Array<{ label: string; value: number; fullDate: string }> = []
    const labelFormat = ""
    let chartWidth = width - 80

    if (period === "7days") {
        // 7 jours : Afficher chaque jour
        aggregated = dailyStats.map((d) => {
            const date = new Date(d.date)
            return {
                label: `${date.getDate()}/${date.getMonth() + 1}`,
                value: d.views,
                fullDate: date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
            }
        })
        chartWidth = width - 80
    } else if (period === "30days") {
        // 30 jours : Grouper par tranches de 3 jours
        const groupSize = 3
        for (let i = 0; i < dailyStats.length; i += groupSize) {
            const group = dailyStats.slice(i, i + groupSize)
            const totalViews = group.reduce((sum, d) => sum + d.views, 0)
            const firstDate = new Date(group[0].date)
            aggregated.push({
                label: `${firstDate.getDate()}/${firstDate.getMonth() + 1}`,
                value: Math.round(totalViews / group.length),
                fullDate: `${firstDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} - ${new Date(
                    group[group.length - 1].date,
                ).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`,
            })
        }
        chartWidth = width * 1.2
    } else if (period === "90days") {
        // 3 mois : Grouper par semaine
        const groupSize = 7
        for (let i = 0; i < dailyStats.length; i += groupSize) {
            const group = dailyStats.slice(i, i + groupSize)
            const totalViews = group.reduce((sum, d) => sum + d.views, 0)
            const firstDate = new Date(group[0].date)
            aggregated.push({
                label: `S${Math.ceil((i + 1) / 7)}`,
                value: Math.round(totalViews / group.length),
                fullDate: `Semaine du ${firstDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`,
            })
        }
        chartWidth = width * 1.5
    } else {
        // 1 an : Grouper par mois
        const monthlyData: { [key: string]: { sum: number; count: number; month: string } } = {}

        dailyStats.forEach((d) => {
            const date = new Date(d.date)
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`
            const monthLabel = date.toLocaleDateString("fr-FR", { month: "short" })

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { sum: 0, count: 0, month: monthLabel }
            }
            monthlyData[monthKey].sum += d.views
            monthlyData[monthKey].count++
        })

        aggregated = Object.entries(monthlyData).map(([key, data]) => ({
            label: data.month.charAt(0).toUpperCase() + data.month.slice(1, 3),
            value: Math.round(data.sum / data.count),
            fullDate: data.month.charAt(0).toUpperCase() + data.month.slice(1),
        }))
        chartWidth = width * 1.8
    }

    return {
        labels: aggregated.map((d) => d.label),
        data: aggregated.map((d) => d.value),
        fullDates: aggregated.map((d) => d.fullDate),
        chartWidth,
    }
}

const InfoTooltip = ({ text, colors }: { text: string; colors: any }) => {
    const [visible, setVisible] = React.useState(false)

    return (
        <View style={{ marginLeft: 6 }}>
            <TouchableOpacity onPress={() => setVisible(!visible)}>
                <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            {visible && (
                <View
                    style={[
                        styles.tooltip,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                            shadowColor: colors.text,
                        },
                    ]}
                >
                    <Text style={[styles.tooltipText, { color: colors.text }]}>{text}</Text>
                </View>
            )}
        </View>
    )
}

export default function RestaurantStatsScreen() {
    const colorScheme = useColorScheme() ?? "light"
    const colors = Colors[colorScheme]
    const { id } = useLocalSearchParams<{ id: string }>()

    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
    const [stats, setStats] = useState<RestaurantStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("30days")
    const [tooltipPos, setTooltipPos] = useState<{
        visible: boolean
        x: number
        y: number
        value: number
        label: string
    }>({
        visible: false,
        x: 0,
        y: 0,
        value: 0,
        label: "",
    })

    const periods: Array<{ key: TimePeriod; label: string }> = [
        { key: "7days", label: "7j" },
        { key: "30days", label: "30j" },
        { key: "90days", label: "3m" },
        { key: "365days", label: "1an" },
    ]

    useEffect(() => {
        loadData()
    }, [id, selectedPeriod])

    const loadData = async () => {
        if (!id) return

        try {
            setLoading(true)
            const restaurants = await getRestaurants()
            const found = restaurants.find((r) => r.id === id)
            setRestaurant(found || null)

            const statsData = await getRestaurantStats(id, selectedPeriod)
            setStats(statsData)
        } catch (error) {
            console.error("Error loading stats:", error)
        } finally {
            setLoading(false)
        }
    }

    const StatCard = ({
                          icon,
                          label,
                          value,
                          color,
                          subtitle,
                      }: {
        icon: string
        label: string
        value: string | number
        color: string
        subtitle?: string
    }) => (
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.statHeader}>
                <View style={[styles.statIconContainer, { backgroundColor: color }]}>
                    <Ionicons name={icon as any} size={28} color="#FFFFFF" />
                </View>
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
            {subtitle && <Text style={[styles.statSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
        </View>
    )

    if (loading || !restaurant || !stats) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loading}>
                    <Text style={{ color: colors.textSecondary }}>Chargement...</Text>
                </View>
            </SafeAreaView>
        )
    }

    const growthColor = stats.growthPercentage >= 0 ? "#10B981" : "#EF4444"
    const growthIcon = stats.growthPercentage >= 0 ? "trending-up" : "trending-down"

    const engagementRate =
        stats.totalViews > 0
            ? (((stats.totalDirections + stats.totalCalls + stats.totalFavorites) / stats.totalViews) * 100).toFixed(1)
            : "0"

    const engagementExplanation = `Sur 100 étudiants qui voient ton restaurant, ${engagementRate} effectuent une action (itinéraire, appel ou ajout en favori)`

    const { labels, data, fullDates, chartWidth } = aggregateChartData(stats.dailyStats, selectedPeriod)

    const chartData = {
        labels,
        datasets: [
            {
                data: data.length > 0 ? data : [0],
                color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                strokeWidth: 3,
            },
        ],
    }

    const chartConfig = {
        backgroundColor: colors.surface,
        backgroundGradientFrom: colors.surface,
        backgroundGradientTo: colors.surface,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        labelColor: (opacity = 1) =>
            colorScheme === "dark" ? `rgba(255, 255, 255, ${opacity * 0.7})` : `rgba(0, 0, 0, ${opacity * 0.7})`,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: "5",
            strokeWidth: "2",
            stroke: "#3B82F6",
        },
        propsForBackgroundLines: {
            strokeDasharray: "",
            stroke: colors.border,
            strokeWidth: 1,
        },
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.headerContent}>
                            <Ionicons name="stats-chart" size={32} color="#FFFFFF" />
                            <Text style={styles.headerTitle}>{restaurant.name}</Text>
                            <Text style={styles.headerSubtitle}>Tableau de bord analytique</Text>
                        </View>
                    </View>

                    <View style={styles.periodSelector}>
                        <Text style={[styles.periodTitle, { color: colors.text }]}>Période</Text>
                        <View style={styles.periodButtons}>
                            {periods.map((period) => (
                                <TouchableOpacity
                                    key={period.key}
                                    onPress={() => setSelectedPeriod(period.key)}
                                    style={[
                                        styles.periodButton,
                                        selectedPeriod === period.key && {
                                            backgroundColor: colors.primary,
                                        },
                                        { borderColor: colors.border },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.periodButtonText,
                                            {
                                                color: selectedPeriod === period.key ? "#FFFFFF" : colors.textSecondary,
                                            },
                                        ]}
                                    >
                                        {period.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={[styles.growthCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.growthContent}>
                            <View style={[styles.growthIconBox, { backgroundColor: `${growthColor}15` }]}>
                                <Ionicons name={growthIcon} size={32} color={growthColor} />
                            </View>
                            <View style={styles.growthInfo}>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <Text style={[styles.growthLabel, { color: colors.textSecondary }]}>Évolution des vues</Text>
                                    <InfoTooltip
                                        text={`Compare les vues de la période sélectionnée avec la période précédente équivalente`}
                                        colors={colors}
                                    />
                                </View>
                                <Text style={[styles.growthValue, { color: growthColor }]}>
                                    {stats.growthPercentage > 0 ? "+" : ""}
                                    {stats.growthPercentage.toFixed(1)}%
                                </Text>
                                <Text style={[styles.growthSubtext, { color: colors.textSecondary }]}>
                                    {stats.growthPercentage >= 0 ? "En progression" : "En baisse"}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {stats.dailyStats && stats.dailyStats.length > 0 && (
                        <View style={[styles.graphCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <View style={styles.graphHeader}>
                                <Text style={[styles.graphTitle, { color: colors.text }]}>Évolution des vues</Text>
                                <View style={[styles.periodBadge, { backgroundColor: `${colors.primary}20` }]}>
                                    <Text style={[styles.periodBadgeText, { color: colors.primary }]}>
                                        {periods.find((p) => p.key === selectedPeriod)?.label}
                                    </Text>
                                </View>
                            </View>

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={true}
                                style={styles.chartScroll}
                                contentContainerStyle={{ paddingRight: 40 }}
                            >
                                <LineChart
                                    data={chartData}
                                    width={chartWidth}
                                    height={220}
                                    chartConfig={chartConfig}
                                    bezier
                                    style={{
                                        marginVertical: 8,
                                        borderRadius: 16,
                                    }}
                                    withInnerLines={true}
                                    withOuterLines={true}
                                    withVerticalLines={false}
                                    withHorizontalLines={true}
                                    withVerticalLabels={true}
                                    withHorizontalLabels={true}
                                    withDots={true}
                                    withShadow={false}
                                    fromZero={true}
                                    segments={4}
                                    onDataPointClick={(data) => {
                                        setTooltipPos({
                                            visible: true,
                                            x: data.x,
                                            y: data.y,
                                            value: data.value,
                                            label: fullDates?.[data.index] || labels[data.index],
                                        })
                                        setTimeout(() => setTooltipPos((prev) => ({ ...prev, visible: false })), 3000)
                                    }}
                                />
                            </ScrollView>

                            {tooltipPos.visible && (
                                <View style={[styles.tooltip, { backgroundColor: colors.primary }]}>
                                    <Text style={styles.tooltipLabel}>{tooltipPos.label}</Text>
                                    <Text style={styles.tooltipValue}>{tooltipPos.value} vues</Text>
                                </View>
                            )}

                            <View style={styles.chartLegend}>
                                <Ionicons name="information-circle" size={16} color={colors.textSecondary} />
                                <Text style={[styles.chartLegendText, { color: colors.textSecondary }]}>
                                    {selectedPeriod === "7days" && "Données journalières"}
                                    {selectedPeriod === "30days" && "Moyenne sur 3 jours"}
                                    {selectedPeriod === "90days" && "Moyenne hebdomadaire"}
                                    {selectedPeriod === "365days" && "Moyenne mensuelle"}
                                </Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Indicateurs clés</Text>
                            <View style={[styles.badge, { backgroundColor: `${colors.primary}20` }]}>
                                <Text style={[styles.badgeText, { color: colors.primary }]}>En direct</Text>
                            </View>
                        </View>
                        <View style={styles.statsRow}>
                            <View style={styles.statCardWrapper}>
                                <StatCard
                                    icon="eye"
                                    label="Vues totales"
                                    value={stats.totalViews}
                                    color="#3B82F6"
                                    subtitle={`${stats.weeklyViews} cette semaine`}
                                />
                            </View>
                            <View style={styles.statCardWrapper}>
                                <StatCard icon="people" label="Étudiants uniques" value={stats.uniqueUsers} color="#8B5CF6" />
                            </View>
                        </View>
                    </View>

                    <View
                        style={[styles.engagementCard, { backgroundColor: `${colors.primary}10`, borderColor: colors.primary }]}
                    >
                        <View style={styles.engagementHeader}>
                            <Ionicons name="pulse" size={24} color={colors.primary} />
                            <Text style={[styles.engagementTitle, { color: colors.text }]}>Taux d'interaction</Text>
                            <InfoTooltip text={engagementExplanation} colors={colors} />
                        </View>
                        <Text style={[styles.engagementValue, { color: colors.primary }]}>{engagementRate}%</Text>
                        <Text style={[styles.engagementSubtext, { color: colors.textSecondary }]}>
                            des visiteurs passent à l'action
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Actions des étudiants</Text>
                            <Ionicons name="flash" size={20} color={colors.primary} />
                        </View>
                        <View style={styles.statsRow}>
                            <View style={styles.statCardWrapper}>
                                <StatCard
                                    icon="navigate"
                                    label="Itinéraires"
                                    value={stats.totalDirections}
                                    color="#F97316"
                                    subtitle="Étudiants venus"
                                />
                            </View>
                            <View style={styles.statCardWrapper}>
                                <StatCard icon="call" label="Appels" value={stats.totalCalls} color="#10B981" subtitle="Réservations" />
                            </View>
                        </View>
                        <View style={styles.statsRow}>
                            <View style={styles.statCardWrapper}>
                                <StatCard
                                    icon="heart"
                                    label="Favoris"
                                    value={stats.totalFavorites}
                                    color="#EF4444"
                                    subtitle="Clients fidèles"
                                />
                            </View>
                            <View style={styles.statCardWrapper}>
                                <StatCard
                                    icon="star"
                                    label="Note moyenne"
                                    value={stats.averageRating.toFixed(1)}
                                    color="#F59E0B"
                                    subtitle={`${stats.totalReviews} avis`}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={[styles.valueCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={[styles.valueIconBox, { backgroundColor: `${colors.primary}15` }]}>
                            <Ionicons name="trophy" size={40} color={colors.primary} />
                        </View>
                        <Text style={[styles.valueTitle, { color: colors.text }]}>Impact StudentFood</Text>
                        <Text style={[styles.valueText, { color: colors.textSecondary }]}>
                            Grâce à StudentFood, <Text style={{ fontWeight: "700" }}>{stats.uniqueUsers} étudiants</Text> ont
                            découvert ton restaurant et <Text style={{ fontWeight: "700" }}>{stats.totalDirections}</Text> se sont
                            dirigés vers toi !
                        </Text>
                        <View style={styles.valueStats}>
                            <View style={styles.valueStat}>
                                <Text style={[styles.valueStatNumber, { color: colors.primary }]}>{stats.totalViews}</Text>
                                <Text style={[styles.valueStatLabel, { color: colors.textSecondary }]}>Impressions</Text>
                            </View>
                            <View style={[styles.valueDivider, { backgroundColor: colors.border }]} />
                            <View style={styles.valueStat}>
                                <Text style={[styles.valueStatNumber, { color: colors.primary }]}>{engagementRate}%</Text>
                                <Text style={[styles.valueStatLabel, { color: colors.textSecondary }]}>Engagement</Text>
                            </View>
                            <View style={[styles.valueDivider, { backgroundColor: colors.border }]} />
                            <View style={styles.valueStat}>
                                <Text style={[styles.valueStatNumber, { color: colors.primary }]}>
                                    {stats.averageRating.toFixed(1)}
                                </Text>
                                <Text style={[styles.valueStatLabel, { color: colors.textSecondary }]}>Note</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loading: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        paddingBottom: 20,
    },
    header: {
        backgroundColor: "#F97316",
        padding: 24,
        paddingTop: 40,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        marginBottom: 20,
    },
    headerContent: {
        alignItems: "center",
        gap: 8,
    },
    headerTitle: {
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: "700",
    },
    headerSubtitle: {
        color: "#FFFFFF",
        fontSize: 14,
        opacity: 0.9,
    },
    periodSelector: {
        marginHorizontal: 20,
        marginBottom: 20,
    },
    periodTitle: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 12,
    },
    periodButtons: {
        flexDirection: "row",
        gap: 8,
    },
    periodButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: "center",
    },
    periodButtonText: {
        fontSize: 13,
        fontWeight: "600",
    },
    growthCard: {
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 20,
        borderWidth: 2,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    growthContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    growthIconBox: {
        width: 64,
        height: 64,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    growthInfo: {
        flex: 1,
    },
    growthLabel: {
        fontSize: 13,
        fontWeight: "500",
        marginBottom: 4,
    },
    growthValue: {
        fontSize: 32,
        fontWeight: "800",
        marginBottom: 2,
    },
    growthSubtext: {
        fontSize: 12,
    },
    section: {
        marginHorizontal: 20,
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "600",
    },
    statsRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 12,
    },
    statCardWrapper: {
        flex: 1,
    },
    statCard: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    statIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    statValue: {
        fontSize: 32,
        fontWeight: "800",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 4,
    },
    statSubtitle: {
        fontSize: 11,
        fontWeight: "500",
    },
    engagementCard: {
        marginHorizontal: 20,
        padding: 24,
        borderRadius: 20,
        borderWidth: 2,
        alignItems: "center",
        marginBottom: 24,
    },
    engagementHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    engagementTitle: {
        fontSize: 16,
        fontWeight: "600",
    },
    engagementValue: {
        fontSize: 48,
        fontWeight: "800",
        marginBottom: 8,
    },
    engagementSubtext: {
        fontSize: 13,
        textAlign: "center",
    },
    graphCard: {
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    graphHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    graphTitle: {
        fontSize: 16,
        fontWeight: "700",
    },
    periodBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    periodBadgeText: {
        fontSize: 12,
        fontWeight: "700",
    },
    chartScroll: {
        marginHorizontal: -20,
        paddingHorizontal: 20,
    },
    chartLegend: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.05)",
    },
    chartLegendText: {
        fontSize: 12,
        fontStyle: "italic",
    },
    tooltip: {
        position: "absolute",
        top: 25,
        right: -10,
        backgroundColor: "white",
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        width: 200,
        zIndex: 1000,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 5,
    },
    tooltipText: {
        fontSize: 12,
        lineHeight: 16,
    },
    valueCard: {
        marginHorizontal: 20,
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: "center",
        gap: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    valueIconBox: {
        width: 80,
        height: 80,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    valueTitle: {
        fontSize: 22,
        fontWeight: "800",
    },
    valueText: {
        fontSize: 15,
        textAlign: "center",
        lineHeight: 22,
    },
    valueStats: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        width: "100%",
        marginTop: 8,
    },
    valueStat: {
        alignItems: "center",
        flex: 1,
    },
    valueStatNumber: {
        fontSize: 24,
        fontWeight: "800",
    },
    valueStatLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    valueDivider: {
        width: 1,
        height: 40,
    },
})
