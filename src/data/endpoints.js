export const breadsheetApis = {
    recipes: {
        all: `${process.env.REACT_APP_BACKEND_URL}/api/v1/recipes`,
        single: `${process.env.REACT_APP_BACKEND_URL}/api/v1/recipe`
    },
    replacements: {
        all: `${process.env.REACT_APP_BACKEND_URL}/api/v1/replacements/all`,
        single: `${process.env.REACT_APP_BACKEND_URL}/api/v1/replacement`,
    }
}
