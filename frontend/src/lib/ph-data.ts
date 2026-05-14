// Comprehensive sample of PH regions, provinces, and cities for prototype
// Note: In a production app, these should be fetched via an API like PSGC
export const PH_DATA: Record<string, { cities: Record<string, string[]> }> = {
  "Metro Manila": {
    cities: {
      "Makati": ["Poblacion", "Bel-Air", "San Lorenzo", "Guadalupe Nuevo"],
      "Quezon City": ["Batasan Hills", "Commonwealth", "Loyola Heights", "Socorro"],
      "Manila": ["Binondo", "Ermita", "Malate", "Sampaloc"],
      "Taguig": ["BGC", "Fort Bonifacio", "Western Bicutan", "Ususan"],
    }
  },
  "Misamis Oriental": {
    cities: {
      "Cagayan de Oro": ["Nazareth", "Macasandig", "Carmen", "Kauswagan", "Lumbia"],
      "Gingoog": ["Agaman", "Baga", "Lunao"],
      "El Salvador": ["Amorong", "Bolisong", "Cogon"],
    }
  },
  "Cebu": {
    cities: {
      "Cebu City": ["Lahug", "Mabolo", "Pardo", "Guadalupe"],
      "Mandaue": ["Bakilid", "Banilad", "Casuntingan"],
      "Lapu-Lapu": ["Marigondon", "Pajac", "Punta Engaño"],
    }
  },
  "Davao del Sur": {
    cities: {
      "Davao City": ["Buhangin", "Talomo", "Agdao", "Toril"],
      "Digos": ["Aplaya", "Dawis", "Matti"],
    }
  },
  "Cavite": {
    cities: {
      "Bacoor": ["Molino I", "Molino II", "Molino III"],
      "Imus": ["Anabu I", "Anabu II", "Bucandala"],
      "Tagaytay": ["Maitim 2nd", "Sungay", "Iruhin"],
    }
  }
};
