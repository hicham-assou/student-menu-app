import {supabase} from './supabase'
import type {AuthUser, Profile} from "@/types";

// Inscription
export async function signUp(email: string, password: string, fullName?: string) {
    const {data, error} = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {full_name: fullName},
        },
    })
    if (error) throw error

    return data
}


// Connexion
export async function signIn(email: string, password: string) {
    const {data, error} = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) throw error
    return data
}

// Déconnexion
export async function signOut() {
    const {error} = await supabase.auth.signOut()
    if (error) throw error
}

// Récupérer le profil
export async function getProfile(userId: string): Promise<Profile | null> {
    const {data, error} = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) {
        console.error('Error fetching profile:', error)
        return null
    }

    return data
}

// Mettre à jour le profil
export async function updateProfile(userId: string, updates: Partial<Profile>) {
    const {data, error} = await supabase
        .from('profiles')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

    if (error) throw error
    return data
}

// Récupérer l'utilisateur actuel
export async function getCurrentUser(): Promise<AuthUser | null> {
    const {data: {user}} = await supabase.auth.getUser()

    if (!user) return null

    const profile = await getProfile(user.id)

    return {
        id: user.id,
        email: user.email!,
        profile: profile || undefined,
    }
}