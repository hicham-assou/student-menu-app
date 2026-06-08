import type { HoursPeriod, WeeklyHours } from "@/types"
import { DAY_ORDER, DAY_SHORT } from "@/constants/discovery"

const toMinutes = (t: string): number => {
    const [h, m] = t.split(":").map(Number)
    return (h || 0) * 60 + (m || 0)
}

const pad = (n: string) => n.padStart(2, "0")

/**
 * Parse une saisie type "11:30-14:30, 18h-22h" en créneaux structurés.
 * Tolère les séparateurs ":" ou "h" et les minutes manquantes.
 */
export function parseDayHours(input: string): HoursPeriod[] {
    if (!input || !input.trim()) return []
    return input
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((range): HoursPeriod | null => {
            const m = range.match(/^(\d{1,2})\s*[:hH]\s*(\d{0,2})\s*-\s*(\d{1,2})\s*[:hH]\s*(\d{0,2})$/)
            if (!m) return null
            const open = `${pad(m[1])}:${pad(m[2] || "00")}`
            const close = `${pad(m[3])}:${pad(m[4] || "00")}`
            return { open, close }
        })
        .filter((p): p is HoursPeriod => p !== null)
}

/** "11:30-14:30, 18:00-22:00" ou "Fermé" */
export function formatPeriods(periods?: HoursPeriod[]): string {
    if (!periods || periods.length === 0) return "Fermé"
    return periods.map((p) => `${p.open} - ${p.close}`).join(", ")
}

/** Vrai si au moins un jour a des créneaux. */
export function hasAnyHours(hours?: WeeklyHours | null): boolean {
    if (!hours) return false
    return Object.values(hours).some((periods) => periods && periods.length > 0)
}

/** Le resto est-il ouvert à l'instant `now` ? */
export function isOpenNow(hours?: WeeklyHours | null, now: Date = new Date()): boolean {
    if (!hours) return false
    const day = now.getDay()
    const cur = now.getHours() * 60 + now.getMinutes()

    for (const p of hours[day] || []) {
        const o = toMinutes(p.open)
        const c = toMinutes(p.close)
        if (c > o) {
            if (cur >= o && cur < c) return true
        } else {
            // créneau qui passe minuit (ex: 18:00-02:00)
            if (cur >= o || cur < c) return true
        }
    }
    // créneau de la veille qui déborde après minuit
    const prev = (day + 6) % 7
    for (const p of hours[prev] || []) {
        const o = toMinutes(p.open)
        const c = toMinutes(p.close)
        if (c <= o && cur < c) return true
    }
    return false
}

export interface OpenStatus {
    isOpen: boolean
    /** Texte court : "Ferme à 22:00", "Ouvre à 18:00", "Ouvre Lun 11:30" ou "" */
    detail: string
}

/** Statut ouvert/fermé + prochaine bascule (pour le badge). */
export function getOpenStatus(hours?: WeeklyHours | null, now: Date = new Date()): OpenStatus | null {
    if (!hasAnyHours(hours)) return null
    const day = now.getDay()
    const cur = now.getHours() * 60 + now.getMinutes()
    const open = isOpenNow(hours, now)

    if (open) {
        // Trouver l'heure de fermeture du créneau en cours
        for (const p of hours![day] || []) {
            const o = toMinutes(p.open)
            const c = toMinutes(p.close)
            const inSameDay = c > o && cur >= o && cur < c
            const inOvernight = c <= o && cur >= o
            if (inSameDay || inOvernight) {
                return { isOpen: true, detail: `Ferme à ${p.close}` }
            }
        }
        return { isOpen: true, detail: "" }
    }

    // Prochaine ouverture aujourd'hui ?
    const todayPeriods = (hours![day] || [])
        .map((p) => toMinutes(p.open))
        .filter((o) => o > cur)
        .sort((a, b) => a - b)
    if (todayPeriods.length > 0) {
        const next = todayPeriods[0]
        const hh = pad(String(Math.floor(next / 60)))
        const mm = pad(String(next % 60))
        return { isOpen: false, detail: `Ouvre à ${hh}:${mm}` }
    }

    // Sinon, prochain jour avec des créneaux
    for (let i = 1; i <= 7; i++) {
        const d = (day + i) % 7
        const periods = hours![d] || []
        if (periods.length > 0) {
            return { isOpen: false, detail: `Ouvre ${DAY_SHORT[d]} ${periods[0].open}` }
        }
    }
    return { isOpen: false, detail: "" }
}

/** Résumé lisible (lundi -> dimanche) pour le champ texte `opening_hours`. */
export function weeklyHoursToString(hours?: WeeklyHours | null): string {
    if (!hasAnyHours(hours)) return ""
    const parts: string[] = []
    for (const d of DAY_ORDER) {
        const periods = hours![d] || []
        if (periods.length > 0) {
            parts.push(`${DAY_SHORT[d]} ${formatPeriods(periods)}`)
        }
    }
    return parts.join(" · ")
}
