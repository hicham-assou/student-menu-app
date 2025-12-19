import React, {createContext, useContext, useEffect, useState} from 'react'
import {supabase} from "@/lib/supabase";
import {getCurrentUser} from "@/lib/auth";
import type {AuthUser} from "@/types";
import {Session} from '@supabase/supabase-js'

interface AuthContextType {
    user: AuthUser | null
    session: Session | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<void>
    signUp: (email: string, password: string, fullName?: string) => Promise<void>
    signOut: () => Promise<void>
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({children}: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Récupérer la session initiale
        supabase.auth.getSession().then(({data: {session}}) => {
            setSession(session)
            if (session) {
                loadUser()
            } else {
                setLoading(false)
            }
        })

        // Écouter les changements d'auth
        const {data: {subscription}} = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            if (session) {
                loadUser()
            } else {
                setUser(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const loadUser = async () => {
        try {
            const currentUser = await getCurrentUser()
            setUser(currentUser)
        } catch (error) {
            console.error('Error loading user:', error)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    const signIn = async (email: string, password: string) => {
        const {data, error} = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (error) throw error
        await loadUser()
    }

    const signUp = async (email: string, password: string, fullName?: string) => {
        const {data, error} = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        })
        if (error) throw error
        await loadUser()
    }

    const signOut = async () => {
        const {error} = await supabase.auth.signOut()
        if (error) throw error
        setUser(null)
        setSession(null)
    }

    const refreshUser = async () => {
        await loadUser()
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                loading,
                signIn,
                signUp,
                signOut,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}