import {ScrollView, StyleSheet, Text, View} from "react-native"
import {SafeAreaView} from "react-native-safe-area-context"
import {Stack} from "expo-router"
import {useColorScheme} from "@/components/useColorScheme.web"
import {Colors} from "@/constants/Colors"

export default function TermsScreen() {
    const colorScheme = useColorScheme() ?? "light"
    const colors = Colors[colorScheme]

    return (
        <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
            <Stack.Screen options={{title: "Conditions d'utilisation", headerBackTitle: "Retour"}}/>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.title, {color: colors.text}]}>Conditions Générales d'Utilisation</Text>
                <Text style={[styles.date, {color: colors.textSecondary}]}>Dernière mise à jour : Décembre 2024</Text>

                <Text style={[styles.sectionTitle, {color: colors.text}]}>1. Acceptation des conditions</Text>
                <Text style={[styles.paragraph, {color: colors.text}]}>
                    En accédant et en utilisant l'application Stud'Table, vous acceptez d'être lié par les présentes
                    conditions
                    générales d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre
                    application.
                </Text>

                <Text style={[styles.sectionTitle, {color: colors.text}]}>2. Description du service</Text>
                <Text style={[styles.paragraph, {color: colors.text}]}>
                    Stud'Table est une plateforme mobile qui connecte les étudiants avec des restaurants proposant des
                    menus
                    étudiants. L'application permet de découvrir, consulter et localiser des établissements de
                    restauration
                    offrant des tarifs préférentiels pour les étudiants.
                </Text>

                <Text style={[styles.sectionTitle, {color: colors.text}]}>3. Compte utilisateur</Text>
                <Text style={[styles.paragraph, {color: colors.text}]}>
                    Pour accéder à certaines fonctionnalités de l'application, vous devez créer un compte. Vous êtes
                    responsable
                    de maintenir la confidentialité de vos identifiants et de toutes les activités effectuées sous votre
                    compte.
                    Vous devez nous informer immédiatement de toute utilisation non autorisée de votre compte.
                </Text>

                <Text style={[styles.sectionTitle, {color: colors.text}]}>4. Utilisation acceptable</Text>
                <Text style={[styles.paragraph, {color: colors.text}]}>Vous vous engagez à :</Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>
                    • Fournir des informations exactes et à jour lors de l'inscription
                </Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>
                    • Ne pas utiliser l'application à des fins illégales ou non autorisées
                </Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>
                    • Ne pas publier de contenu offensant, diffamatoire ou inapproprié
                </Text>
                <Text style={[styles.bulletPoint, {color: colors.text}]}>
                    • Respecter les droits de propriété intellectuelle de Stud'Table et des tiers
                </Text>

                <Text style={[styles.sectionTitle, {color: colors.text}]}>5. Contenu utilisateur</Text>
                <Text style={[styles.paragraph, {color: colors.text}]}>
                    En publiant du contenu sur Stud'Table (avis, photos, commentaires), vous accordez à Stud'Table une
                    licence
                    mondiale, non exclusive, libre de redevance pour utiliser, reproduire et afficher ce contenu dans le
                    cadre du
                    service.
                </Text>

                <Text style={[styles.sectionTitle, {color: colors.text}]}>6. Restaurants partenaires</Text>
                <Text style={[styles.paragraph, {color: colors.text}]}>
                    Stud'Table agit comme intermédiaire entre les étudiants et les restaurants. Nous ne sommes pas
                    responsables
                    de la qualité des services, de la nourriture ou des prix pratiqués par les restaurants. Les offres
                    et menus
                    affichés sont fournis par les établissements et peuvent être modifiés sans préavis.
                </Text>

                <Text style={[styles.sectionTitle, {color: colors.text}]}>7. Limitation de responsabilité</Text>
                <Text style={[styles.paragraph, {color: colors.text}]}>
                    Stud'Table est fourni "tel quel" sans garantie d'aucune sorte. Nous ne garantissons pas que le
                    service sera
                    ininterrompu, sécurisé ou exempt d'erreurs. En aucun cas, Stud'Table ne sera responsable de
                    dommages directs,
                    indirects, accessoires ou consécutifs résultant de votre utilisation du service.
                </Text>

                <Text style={[styles.sectionTitle, {color: colors.text}]}>8. Modifications des conditions</Text>
                <Text style={[styles.paragraph, {color: colors.text}]}>
                    Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications seront
                    effectives dès
                    leur publication dans l'application. Votre utilisation continue de Stud'Table après ces
                    modifications
                    constitue votre acceptation des nouvelles conditions.
                </Text>

                <Text style={[styles.sectionTitle, {color: colors.text}]}>9. Résiliation</Text>
                <Text style={[styles.paragraph, {color: colors.text}]}>
                    Nous pouvons suspendre ou résilier votre accès à Stud'Table à tout moment, sans préavis, en cas de
                    violation
                    de ces conditions ou pour toute autre raison jugée nécessaire.
                </Text>

                <Text style={[styles.sectionTitle, {color: colors.text}]}>10. Contact</Text>
                <Text style={[styles.paragraph, {color: colors.text}]}>
                    Pour toute question concernant ces conditions d'utilisation, veuillez nous contacter à :
                    StudTable@outlook.com
                </Text>

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
