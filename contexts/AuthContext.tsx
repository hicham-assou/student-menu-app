"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

interface Profile {
    id: string
    email: string
    full_name: string | null
    role: "student" | "restaurant_owner" | "admin"
    created_at: string
}

interface AuthContextType {
    user: User | null
    profile: Profile | null
    session: Session | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<{ error: any }>
    signUp: (
        email: string,
        password: string,
        fullName: string,
        role: "student" | "restaurant_owner",
    ) => Promise<{ error: any }>
    signOut: () => Promise<void>
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    signIn: async () => ({ error: null }),
    signUp: async () => ({ error: null }),
    signOut: async () => {},
    refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

            if (error) throw error
            setProfile(data)
        } catch (error) {
            console.error("Error fetching profile:", error)
            setProfile(null)
        }
    }

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id)
        }
    }

    const signIn = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            return { error }
        } catch (error) {
            return { error }
        }
    }

    const signUp = async (email: string, password: string, fullName: string, role: "student" | "restaurant_owner") => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            })

            if (error) return { error }

            // Créer le profil après inscription
            if (data.user) {
                const { error: profileError } = await supabase.from("profiles").insert({
                    id: data.user.id,
                    email: data.user.email!,
                    full_name: fullName,
                    role: role,
                })

                if (profileError) return { error: profileError }
            }

            return { error: null }
        } catch (error) {
            return { error }
        }
    }

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            }
            setLoading(false)
        })

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setProfile(null)
            }
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
        setSession(null)
    }

    return (
        <AuthContext.Provider value={{ user, profile, session, loading, signIn, signUp, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
