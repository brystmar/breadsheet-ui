export const breadsheetApis = {
    recipes: {
        all: `${import.meta.env.VITE_BACKEND_URL}/api/v1/recipes`,
        single: `${import.meta.env.VITE_BACKEND_URL}/api/v1/recipe`
    },
    replacements: {
        all: `${import.meta.env.VITE_BACKEND_URL}/api/v1/replacements/all`,
        single: `${import.meta.env.VITE_BACKEND_URL}/api/v1/replacement`,
    },
    // v2 (Second Rise)
    recipesV2: {
        all:      `${import.meta.env.VITE_BACKEND_URL}/api/v2/recipes`,
        bySlug:   `${import.meta.env.VITE_BACKEND_URL}/api/v2/recipes/by-slug`,
        bySuffix: `${import.meta.env.VITE_BACKEND_URL}/api/v2/recipes/by-suffix`,
        admin:    `${import.meta.env.VITE_BACKEND_URL}/api/v2/admin/recipes`,
        community: `${import.meta.env.VITE_BACKEND_URL}/api/v2/community/recipes`
    },
    bakes: {
        all:      `${import.meta.env.VITE_BACKEND_URL}/api/v2/bakes`,
        bySuffix: `${import.meta.env.VITE_BACKEND_URL}/api/v2/bakes/by-suffix`
    },
    events: `${import.meta.env.VITE_BACKEND_URL}/api/v2/events`,
    users:`${import.meta.env.VITE_BACKEND_URL}/api/v2/users`,
    usernames: `${import.meta.env.VITE_BACKEND_URL}/api/v2/usernames`,
    session: `${import.meta.env.VITE_BACKEND_URL}/api/v2/session`,
    pairingCodes: `${import.meta.env.VITE_BACKEND_URL}/api/v2/pairing-codes`,
    connections: `${import.meta.env.VITE_BACKEND_URL}/api/v2/connections`
}
