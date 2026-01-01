import { View, Text, ScrollView, Linking, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Stack } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useColorScheme } from "@/components/useColorScheme.web"
import { Colors } from "@/constants/Colors"
import { StyleSheet } from "react-native"

export default function HelpScreen() {
    const colorScheme = useColorScheme() ?? "light"
    const colors = Colors[colorScheme]

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen options={{ title: "Aide & Support", headerBackTitle: "Retour" }} />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.title, { color: colors.text }]}>Centre d'aide</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Besoin d'aide ? Nous sommes là pour vous !
                </Text>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Questions fréquentes</Text>

                    <View style={[styles.faqCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.faqQuestion, { color: colors.text }]}>Comment créer un compte ?</Text>
                        <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                            Cliquez sur "Se connecter" puis "Créer un compte". Renseignez votre nom, email et mot de passe. Indiquez
                            si vous êtes étudiant ou gérant de restaurant.
                        </Text>
                    </View>

                    <View style={[styles.faqCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.faqQuestion, { color: colors.text }]}>Comment trouver des restaurants près de moi ?</Text>
                        <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                            Allez dans l'onglet "Carte" et autorisez la géolocalisation. Les restaurants à proximité s'afficheront
                            automatiquement avec leur distance.
                        </Text>
                    </View>

                    <View style={[styles.faqCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.faqQuestion, { color: colors.text }]}>Comment ajouter un restaurant en favori ?</Text>
                        <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                            Sur la page d'un restaurant, cliquez sur l'icône de cœur en haut à droite. Retrouvez tous vos favoris
                            dans l'onglet "Favoris".
                        </Text>
                    </View>

                    <View style={[styles.faqCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.faqQuestion, { color: colors.text }]}>
                            Je suis gérant, comment ajouter mon restaurant ?
                        </Text>
                        <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                            Créez un compte en tant que "Gérant de restaurant". Accédez ensuite à "Mes restaurants" depuis votre
                            profil et cliquez sur "Ajouter un restaurant".
                        </Text>
                    </View>

                    <View style={[styles.faqCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.faqQuestion, { color: colors.text }]}>Comment modifier les informations de mon restaurant ?</Text>
                        <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                            Dans "Mes restaurants", cliquez sur l'icône de crayon à côté du restaurant que vous souhaitez modifier.
                        </Text>
                    </View>

                    <View style={[styles.faqCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.faqQuestion, { color: colors.text }]}>Où puis-je voir les statistiques de mon restaurant ?</Text>
                        <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                            Dans "Mes restaurants", cliquez sur "Statistiques" pour voir le nombre de vues, d'itinéraires, d'appels
                            et de favoris sur différentes périodes.
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Nous contacter</Text>

                    <TouchableOpacity
                        style={[styles.contactCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => Linking.openURL("mailto:support@studentfood.be")}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
                            <Ionicons name="mail" size={24} color={colors.primary} />
                        </View>
                        <View style={styles.contactInfo}>
                            <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Email</Text>
                            <Text style={[styles.contactValue, { color: colors.text }]}>support@studentfood.be</Text>
                            <Text style={[styles.contactHours, { color: colors.textSecondary }]}>
                                Réponse sous 24-48h
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.contactCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => Linking.openURL("tel:+3222000000")}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: `#10B98120` }]}>
                            <Ionicons name="call" size={24} color="#10B981" />
                        </View>
                        <View style={styles.contactInfo}>
                            <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Téléphone</Text>
                            <Text style={[styles.contactValue, { color: colors.text }]}>+32 2 XXX XX XX</Text>
                            <Text style={[styles.contactHours, { color: colors.textSecondary }]}>
                                Lun-Ven : 9h - 18h
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Autres ressources</Text>

                    <TouchableOpacity
                        style={[styles.resourceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => Linking.openURL("https://studentfood.be/guide")}
                    >
                        <Ionicons name="book" size={20} color={colors.primary} />
                        <Text style={[styles.resourceText, { color: colors.text }]}>Guide d'utilisation</Text>
                        <Ionicons name="open-outline" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.resourceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => Linking.openURL("https://studentfood.be/blog")}
                    >
                        <Ionicons name="newspaper" size={20} color={colors.primary} />
                        <Text style={[styles.resourceText, { color: colors.text }]}>Blog & Actualités</Text>
                        <Ionicons name="open-outline" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.footer} />
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        marginBottom: 32,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 16,
    },
    faqCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    faqQuestion: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    faqAnswer: {
        fontSize: 14,
        lineHeight: 20,
    },
    contactCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    contactInfo: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    contactValue: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 2,
    },
    contactHours: {
        fontSize: 12,
    },
    resourceCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    resourceText: {
        flex: 1,
        fontSize: 15,
        fontWeight: "500",
    },
    footer: {
        height: 40,
    },
})
