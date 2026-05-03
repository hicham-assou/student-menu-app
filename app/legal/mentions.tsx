import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Stack } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useColorScheme } from "@/components/useColorScheme.web"
import { Colors } from "@/constants/Colors"

export default function MentionsScreen() {
    const colorScheme = useColorScheme() ?? "light"
    const colors = Colors[colorScheme]

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen options={{ title: "Mentions légales", headerBackTitle: "Retour" }} />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.title, { color: colors.text }]}>Mentions Légales</Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Éditeur de l'application</Text>
                <Text style={[styles.paragraph, { color: colors.text }]}>
                    Raison sociale : AAD Services SRL{"\n"}
                    Siège social : Rue des Quatre-Vents 108, 1080 Bruxelles, Belgique{"\n"}
                    Numéro d'entreprise : BE 1016.041.643{"\n"}
                    Email : StudTable@outlook.com{"\n"}
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Hébergement</Text>

                <Text style={[styles.paragraph, { color: colors.text }]}>
                    Base de données hébergée par :{"\n"}
                    Supabase Inc.{"\n"}
                    970 Toa Payoh North, #07-04{"\n"}
                    Singapore 318992{"\n"}
                    Site web : aad-services.com
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Propriété intellectuelle</Text>
                <Text style={[styles.paragraph, { color: colors.text }]}>
                    L'ensemble du contenu de l'application Stud'Table (textes, images, logos, icônes, code source) est
                    la
                    propriété exclusive de AAD Services SRL, sauf mention contraire.{"\n\n"}
                    Toute reproduction, distribution, modification ou utilisation à des fins commerciales sans
                    autorisation
                    préalable est strictement interdite et constitue une contrefaçon sanctionnée par le Code de droit
                    économique
                    belge.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Protection des données personnelles</Text>
                <Text style={[styles.paragraph, { color: colors.text }]}>
                    Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi belge du 30
                    juillet 2018,
                    vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données
                    personnelles.{"\n\n"}
                    Pour exercer ces droits, contactez notre délégué à la protection des données :{"\n"}
                    Email : StudTable@outlook.com
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Responsabilité</Text>
                <Text style={[styles.paragraph, { color: colors.text }]}>
                    Stud'Table s'efforce de fournir des informations précises et à jour. Toutefois, nous ne
                    garantissons pas
                    l'exactitude, l'exhaustivité ou la pertinence des informations diffusées.{"\n\n"}
                    Stud'Table ne peut être tenu responsable des erreurs, omissions, ou résultats obtenus par
                    l'utilisation de
                    ces informations. Les informations sur les restaurants (menus, prix, horaires) sont fournies par les
                    établissements eux-mêmes.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>6. Liens hypertextes</Text>
                <Text style={[styles.paragraph, { color: colors.text }]}>
                    L'application peut contenir des liens vers des sites externes. Stud'Table n'exerce aucun contrôle
                    sur ces
                    sites et décline toute responsabilité quant à leur contenu.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>7. Droit applicable</Text>
                <Text style={[styles.paragraph, { color: colors.text }]}>
                    Les présentes mentions légales sont régies par le droit belge. Tout litige relatif à l'utilisation
                    de
                    l'application Stud'Table sera soumis à la compétence exclusive des tribunaux de Bruxelles.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>8. Contact</Text>
                <TouchableOpacity
                    style={[styles.contactCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => Linking.openURL("mailto:StudTable@outlook.com")}
                >
                    <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
                        <Ionicons name="mail" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.contactInfo}>
                        <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Email</Text>
                        <Text style={[styles.contactValue, { color: colors.text }]}>StudTable@outlook.com</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
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
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginTop: 24,
        marginBottom: 12,
    },
    paragraph: {
        fontSize: 15,
        lineHeight: 24,
        marginBottom: 12,
    },
    contactCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 12,
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
    },
    footer: {
        height: 40,
    },
})
