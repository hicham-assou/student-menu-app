/**
 * Style custom pour Google Maps (Android) qui cache les POI metier
 * (restaurants concurrents, magasins, musees, etc.) pour ne pas distraire
 * de nos propres markers.
 *
 * `showsPointsOfInterest={false}` ne fonctionne pas de maniere fiable sur
 * Android — un customMapStyle est plus efficace.
 */
export const cleanMapStyle = [
    {
        // Cache TOUS les POI (icones de business, attractions, etc.)
        featureType: "poi",
        stylers: [{ visibility: "off" }],
    },
    {
        // Garde quand meme les parcs visibles (utile pour se reperer)
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ visibility: "on" }],
    },
    {
        // Mais cache leurs labels
        featureType: "poi.park",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
    },
    {
        // Cache les icones de transport (metro, bus, etc.)
        featureType: "transit",
        elementType: "labels.icon",
        stylers: [{ visibility: "off" }],
    },
]
