import {ScrollView, StyleSheet, Text, View} from "react-native"
import {SafeAreaView} from "react-native-safe-area-context"
import {Stack} from "expo-router"
import {useColorScheme} from "@/components/useColorScheme.web"
import {Colors} from "@/constants/Colors"

export default function PrivacyScreen() {
    const colorScheme = useColorScheme() ?? "light"
    const colors = Colors[colorScheme]

    return (
        <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
            <Stack.Screen options={{title: "Politique de confidentialité", headerBackTitle: "Retour"}}/>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.title, {color: colors.text}]}>Politique de Confidentialité</Text>
                <Text style={[styles.date, {color: colors.textSecondary}]}>Dernière mise à jour : Décembre 2024</Text>

                <Text style={[styles.paragraph, {color: colors.text}]}>
                    Chez StudentFood, nous prenons très au sérieux la protection de vos données personnelles. Cette
                    politique de
                    confidentialité explique comment nous collectons, utilisons et protégeons vos informations.
                </Text>

                <Text style={[styles.sectionTitle, {color: colors.text}]}>1. Données collectées</Text>
                <Text style={[styles.subtitle, {color: colors.text}]}>Informations de compte :</Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>• Nom complet</Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>• Adresse email</Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>• Mot de passe (crypté)</Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>• Statut (étudiant ou gérant de
                    restaurant)</Text>

                <Text style={[styles.subtitle, {color: colors.text}]}>Données d'utilisation :</Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>• Restaurants consultés</Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>• Favoris enregistrés</Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>• Avis et notes publiés</Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>
                    • Position géographique (avec votre consentement)
                </Text>

                <Text style={[styles.sectionTitle, {color: colors.text}]}>2. Utilisation des données</Text>
                <Text style={[styles.paragraph, {color: colors.text}]}>Nous utilisons vos données pour :</Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>• Fournir et améliorer nos services</Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>• Personnaliser votre expérience
                    utilisateur</Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>
                    • Vous montrer des restaurants à proximité de votre position
                </Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>
                    • Envoyer des notifications importantes (avec votre consentement)
                </Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>
                    • Générer des statistiques anonymisées pour les restaurants partenaires
                </Text>

                <Text style={[styles.sectionTitle, {color: colors.text}]}>3. Partage des données</Text>
                <Text style={[styles.paragraph, {color: colors.text}]}>
                    Nous ne vendons jamais vos données personnelles. Vos informations peuvent être partagées uniquement
                    dans les
                    cas suivants :
                </Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>
                    • Avec les restaurants partenaires : uniquement des statistiques anonymisées (nombre de vues, clics)
                </Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>
                    • Avec nos prestataires de services : hébergement, analytics (Supabase, Vercel)
                </Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>
                    • Si requis par la loi ou pour protéger nos droits
                </Text>

                <Text style={[styles.sectionTitle, {color: colors.text}]}>4. Sécurité des données</Text>
                <Text style={[styles.paragraph, {color: colors.text}]}>
                    Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour
                    protéger vos
                    données :
                </Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>• Chiffrement des données en transit
                    (HTTPS)</Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>
                    • Stockage sécurisé des mots de passe (hachage bcrypt)
                </Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>• Accès restreint aux données
                    personnelles</Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>• Audits réguliers de sécurité</Text>

                <Text style={[styles.sectionTitle, {color: colors.text}]}>5. Vos droits</Text>
                <Text style={[styles.paragraph, {color: colors.text}]}>
                    Conformément au RGPD, vous disposez des droits suivants :
                </Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>
                    • Droit d'accès : obtenir une copie de vos données
                </Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>
                    • Droit de rectification : corriger vos données inexactes
                </Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>
                    • Droit à l'effacement : supprimer votre compte et vos données
                </Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>
                    • Droit à la portabilité : exporter vos données
                </Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>
                    • Droit d'opposition : vous opposer au traitement de vos données
                </Text>

                <Text style={[styles.sectionTitle, {color: colors.text}]}>6. Cookies et technologies similaires</Text>
                <Text style={[styles.paragraph, {color: colors.text}]}>
                    Nous utilisons des cookies et technologies similaires pour améliorer votre expérience. Vous pouvez
                    gérer vos
                    préférences de cookies dans les paramètres de l'application.
                </Text>

                <Text style={[styles.sectionTitle, {color: colors.text}]}>7. Données de localisation</Text>
                <Text style={[styles.paragraph, {color: colors.text}]}>
                    L'accès à votre position géographique est optionnel et nécessite votre consentement explicite. Vous
                    pouvez
                    désactiver la géolocalisation à tout moment dans les paramètres de votre appareil. Les données de
                    localisation
                    ne sont jamais stockées de manière permanente.
                </Text>

                <Text style={[styles.sectionTitle, {color: colors.text}]}>8. Conservation des données</Text>
                <Text style={[styles.paragraph, {color: colors.text}]}>
                    Nous conservons vos données personnelles aussi longtemps que votre compte est actif. Si vous
                    supprimez votre
                    compte, vos données seront définitivement effacées dans un délai de 30 jours, sauf obligation légale
                    de
                    conservation.
                </Text>

                <Text style={[styles.sectionTitle, {color: colors.text}]}>9. Modifications</Text>
                <Text style={[styles.paragraph, {color: colors.text}]}>
                    Nous pouvons mettre à jour cette politique de confidentialité. Vous serez informé des changements
                    significatifs par email ou notification dans l'application.
                </Text>

                <Text style={[styles.sectionTitle, {color: colors.text}]}>10. Contact</Text>
                <Text style={[styles.paragraph, {color: colors.text}]}>
                    Pour toute question concernant cette politique ou pour exercer vos droits, contactez-nous à :
                </Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>Email : privacy@studentfood.com</Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>DPO : dpo@studentfood.com</Text>

                <View style={styles.footer}/>
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
    date: {
        fontSize: 14,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginTop: 24,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: "600",
        marginTop: 16,
        marginBottom: 8,
    },
    paragraph: {
        fontSize: 15,
        lineHeight: 24,
        marginBottom: 12,
    },
    bulletPoint: {
        fontSize: 15,
        lineHeight: 24,
        marginLeft: 8,
        marginBottom: 6,
    },
    footer: {
        height: 40,
    },
})
