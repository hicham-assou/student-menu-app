import {createContext, type ReactNode, useContext, useEffect, useState} from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface OnboardingContextType {
    hasSeenOnboarding: boolean | null
    completeOnboarding: () => Promise<void>
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

const ONBOARDING_KEY = "@studTable_has_seen_onboarding"

export function OnboardingProvider({children}: { children: ReactNode }) {
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null)

    useEffect(() => {
        checkOnboardingStatus()
    }, [])

    const checkOnboardingStatus = async () => {
        try {
            const value = await AsyncStorage.getItem(ONBOARDING_KEY)
            setHasSeenOnboarding(value === "true")
        } catch (error) {
            console.error("Error checking onboarding status:", error)
            setHasSeenOnboarding(false)
        }
    }

    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem(ONBOARDING_KEY, "true")
            setHasSeenOnboarding(true)
        } catch (error) {
            console.error("Error saving onboarding status:", error)
        }
    }

    return (
        <OnboardingContext.Provider value={{hasSeenOnboarding, completeOnboarding}}>
            {children}
        </OnboardingContext.Provider>
    )
}

export function useOnboarding() {
    const context = useContext(OnboardingContext)
    if (context === undefined) {
        throw new Error("useOnboarding must be used within an OnboardingProvider")
    }
    return context
}
