// Catégories de cuisine et tags utilisés pour le filtrage / la découverte.

export interface CategoryDef {
    id: string
    label: string
    emoji: string
}

export const CATEGORIES: CategoryDef[] = [
    { id: "kebab", label: "Kebab", emoji: "🥙" },
    { id: "pizza", label: "Pizza", emoji: "🍕" },
    { id: "burger", label: "Burger", emoji: "🍔" },
    { id: "asian", label: "Asiatique", emoji: "🍜" },
    { id: "sandwich", label: "Sandwich", emoji: "🥪" },
    { id: "healthy", label: "Healthy", emoji: "🥗" },
    { id: "pasta", label: "Pâtes", emoji: "🍝" },
    { id: "tacos", label: "Tacos", emoji: "🌮" },
    { id: "sushi", label: "Sushi", emoji: "🍣" },
    { id: "chicken", label: "Poulet", emoji: "🍗" },
    { id: "bakery", label: "Boulangerie", emoji: "🥐" },
    { id: "other", label: "Autre", emoji: "🍽️" },
]

export interface TagDef {
    id: string
    label: string
}

export const TAGS: TagDef[] = [
    { id: "halal", label: "Halal" },
    { id: "vegetarian", label: "Végé" },
    { id: "vegan", label: "Vegan" },
]

export function getCategory(id?: string | null): CategoryDef | undefined {
    if (!id) return undefined
    return CATEGORIES.find((c) => c.id === id)
}

export function getTag(id: string): TagDef | undefined {
    return TAGS.find((t) => t.id === id)
}

// Jours de la semaine (index = getDay() : 0 = dimanche)
export const DAY_SHORT = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
export const DAY_LABELS = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
]
// Ordre d'affichage : lundi -> dimanche
export const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]
