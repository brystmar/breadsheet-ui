export const breadsheetApis = {
    recipes: {
        all: `${import.meta.env.VITE_BACKEND_URL}/api/v1/recipes`,
        single: `${import.meta.env.VITE_BACKEND_URL}/api/v1/recipe`
    },
    replacements: {
        all: `${import.meta.env.VITE_BACKEND_URL}/api/v1/replacements/all`,
        single: `${import.meta.env.VITE_BACKEND_URL}/api/v1/replacement`,
    }
}
