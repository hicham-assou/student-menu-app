// Gestion centralisée des prix.
//
// Objectif : stocker les prix en NUMÉRIQUE (ex: 6.5) et non plus en texte
// ("6,50€"). Les helpers acceptent quand même l'ancien format texte pour
// rester robustes pendant la migration des données.

type RawPrice = number | string | null | undefined

/** Convertit un prix (nombre OU ancien texte "6,50€") en nombre, sinon null. */
export function priceToNumber(price: RawPrice): number | null {
    if (price == null) return null
    if (typeof price === "number") return Number.isFinite(price) ? price : null
    const cleaned = String(price).replace("€", "").replace(",", ".").trim()
    const n = Number.parseFloat(cleaned)
    return Number.isNaN(n) ? null : n
}

/** Formate un prix pour l'affichage : 6.5 -> "6,50€". Renvoie "" si invalide. */
export function formatPrice(price: RawPrice): string {
    const n = priceToNumber(price)
    if (n == null) return ""
    return `${n.toFixed(2).replace(".", ",")}€`
}

/** Prix minimum d'une liste de menus (en nombre), ou null si aucun. */
export function minMenuPrice(menus?: { price: RawPrice }[] | null): number | null {
    if (!menus || menus.length === 0) return null
    const nums = menus
        .map((m) => priceToNumber(m.price))
        .filter((n): n is number => n != null)
    return nums.length > 0 ? Math.min(...nums) : null
}
