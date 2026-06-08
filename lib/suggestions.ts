import { supabase } from "./supabase"
import type { Suggestion } from "@/types"

/**
 * Enregistre une suggestion (nouveau resto) ou un signalement d'erreur.
 * Fonctionne aussi pour les utilisateurs non connectés.
 */
export async function submitSuggestion(payload: Suggestion): Promise<boolean> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        const { error } = await supabase.from("suggestions").insert({
            type: payload.type,
            restaurant_id: payload.restaurant_id ?? null,
            restaurant_name: payload.restaurant_name ?? null,
            address: payload.address ?? null,
            city: payload.city ?? null,
            message: payload.message ?? null,
            contact_email: payload.contact_email ?? null,
            user_id: user?.id ?? null,
        })

        if (error) throw error
        return true
    } catch (error) {
        console.error("Error submitting suggestion:", error)
        return false
    }
}
