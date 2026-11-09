import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router";
import { breadsheetApis } from "./data/endpoints";
import { apiFetch } from "./data/api_fetch";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PageTitle from "./components/PageTitle";
import RecipeListContainer from "./components/RecipeListContainer";
import RecipePageContainer from "./components/RecipePageContainer";
import RecipePathContainer from "./components/RecipePathContainer";
import BakePathContainer from "./components/bake/BakePathContainer";
import ActiveBakeBar from "./components/bake/ActiveBakeBar";
import { ActiveBakesProvider } from "./hooks/useActiveBakes";
import NewRecipePage from "./components/recipe/NewRecipePage";
import MyRecipesPage from "./components/recipes/MyRecipesPage";
import CommunityPage from "./components/recipes/CommunityPage";
import ConvertTextPageContainer from "./components/ConvertTextPageContainer";
import FormRegister from "./components/identity/FormRegister";
import FormSignin from "./components/identity/FormSignin";
import KeyLink from "./components/identity/KeyLink";
import PrivacyPage from "./components/PrivacyPage";
import Profile from "./components/identity/Profile";
import AdminRoute from "./components/admin/AdminRoute";
import AdminRecipesPage from "./components/admin/AdminRecipesPage";
import AdminRecipeEdit from "./components/admin/AdminRecipeEdit";
import AdminUsersPage from "./components/admin/AdminUsersPage";
import AdminMetricsPage from "./components/admin/AdminMetricsPage";
import useFeatureLevel from "./hooks/useFeatureLevel";
import "react-datepicker/dist/react-datepicker.css";
import "./styles/styles.sass";
import "./styles/recipe-and-step-lists.sass";

export default function App() {
    // `recipeList`: list of all recipe objects
    // Local state variable which holds the list of all recipe objects and their data
    // Serves as the local source of truth for all recipes
    const [ recipeList, updateRecipeList ] = useState([]);

    // `hasData`: bool
    // Local state variable to indicate whether we have data or not
    const [ hasData, toggleHasData ] = useState(false);

    // `isDataStale`: bool
    // Toggle passed down to child components, allowing them to trigger a data refresh when needed
    // Dependency variable for the useEffect --> getAllRecipes function
    const [ isDataStale ] = useState(false);

    // Which milestone's screens to show (see helpers/feature_levels.js)
    const { atLeast } = useFeatureLevel()
    const atM2 = atLeast("m2")

    // Count client-side route changes in GoatCounter
    // The script counts the initial page load itself, so only count when the path changes.
    // Tracking the last counted path (instead of a first-render flag) keeps StrictMode's
    // double-run effects from counting the initial load twice.
    const location = useLocation()
    const currentPath = location.pathname + location.search
    const lastCountedPath = useRef(currentPath)

    useEffect(() => {
        if (currentPath === lastCountedPath.current) return
        lastCountedPath.current = currentPath

        // Key links are never counted (index.html skips them on page load, too)
        if (location.pathname === "/k") return

        // Guard against the script being blocked or not loaded yet
        window.goatcounter?.count?.({ path: currentPath })
    }, [ currentPath ])

    // Retrieve the data for all recipes from the backend (M1). From M2 the home page loads its own lists.
    useEffect(() => {
            // Declare an async function for retrieving recipes
            async function getAllRecipes() {
                try {
                    console.debug(`Calling endpoint: ${breadsheetApis.recipes.all}`);

                    // Make the GET request
                    const recipeListRequest = await apiFetch(breadsheetApis.recipes.all);

                    // Parse the response, which is a list of recipe objects
                    const recipeListResponse = await recipeListRequest.json();

                    // Update local state
                    updateRecipeList(recipeListResponse.data);
                    toggleHasData(true);

                } catch (error) {
                    console.error(`Error retrieving or parsing recipe list: ${error}`);
                }
            }

            if (atM2) return
            console.debug("Retrieving list of recipes via App.useEffect")
            getAllRecipes();
        },
        // The function for updating `isDataStale` gets passed down to children,
        // allowing them to trigger a data refresh of all recipes when needed.
        [ isDataStale, atM2 ])

    function updateRecipeLength(recipeId, newLength) {
        // Updates the length of a specified recipe in local state
        let newRecipeList = recipeList;

        // TODO: Convert recipeList to a hash table
        // Find the correct recipe to update
        for (let i = 0; i < newRecipeList.length; i++) {
            if (newRecipeList[i].id === recipeId) {
                // Update the length
                newRecipeList[i].length = newLength;
                break;
            }
        }

        // Replace the recipeList in local state
        updateRecipeList(newRecipeList);
    }

    return (
        <ActiveBakesProvider>
            <div className="app-container">
                <Header />
                {atM2 && <ActiveBakeBar />}

                <main className="content-container">
                    <Routes>
                        {/* Key links sign in at every feature level: a new device starts at the default */}
                        <Route path="/k" element={<KeyLink />} />

                        {/* What breadsheet collects, at every feature level (breadsheet#34) */}
                        <Route path="/privacy" element={<PrivacyPage />} />

                        {/* Identity screens (M2). At M1 these paths fall through to the recipe route, as before. */}
                        {atLeast("m2") && <Route path="/register" element={<FormRegister />} />}
                        {atLeast("m2") && <Route path="/signin" element={<FormSignin />} />}
                        {atLeast("m2") && <Route path="/profile" element={<Profile />} />}
                        {/* The old Devices page became the profile page; keep its links working */}
                        {atLeast("m2") && <Route path="/devices" element={<Navigate to="/profile" replace />} />}

                        {/* Admin (breadsheet-ui#65): signed-in admins only; everyone else goes home */}
                        {atM2 && <Route path="/admin" element={<Navigate to="/admin/recipes" replace />} />}
                        {atM2 && <Route path="/admin/recipes" element={<AdminRoute><AdminRecipesPage /></AdminRoute>} />}
                        {atM2 && <Route path="/admin/recipes/new" element={<AdminRoute><AdminRecipeEdit /></AdminRoute>} />}
                        {atM2 && <Route path="/admin/recipes/:recipeId" element={<AdminRoute><AdminRecipeEdit /></AdminRoute>} />}
                        {atM2 && <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />}
                        {atM2 && <Route path="/admin/metrics" element={<AdminRoute><AdminMetricsPage /></AdminRoute>} />}

                        <Route path="/convert" element={
                            <>
                                <PageTitle title="Convert Text" includeHr={true} />
                                <ConvertTextPageContainer />
                            </>
                        } />

                        {/* Public recipe URLs (M2): /recipes/<slug>, or /recipes/<slug>-<suffix> for personal recipes */}
                        {atM2 && <Route path="/community" element={<CommunityPage />} />}
                        {atM2 && <Route path="/recipes/new" element={<NewRecipePage />} />}
                        {atM2 && <Route path="/recipes/:recipePath" element={<RecipePathContainer />} />}
                        {atM2 && <Route path="/recipes/:recipePath/start" element={<RecipePathContainer view="start" />} />}
                        {atM2 && <Route path="/recipes/:recipePath/edit" element={<RecipePathContainer view="edit" />} />}
                        {atM2 && <Route path="/bakes/:suffix" element={<BakePathContainer />} />}

                        {/* M1 opens recipes by internal id. From M2 those old URLs go to the homepage. */}
                        <Route path="/:recipeId" element={atM2 ? <Navigate to="/" replace /> :
                            <RecipePageContainer
                                recipeList={recipeList}
                                hasData={hasData}
                                updateRecipeLength={updateRecipeLength}
                                updateMasterRecipeList={isDataStale}
                            />
                        } />

                        {/* M2: active bakes, your recipes, and the defaults; M1: the recipe table */}
                        <Route path="/" element={atM2 ? <MyRecipesPage /> :
                            <>
                                <PageTitle title="Recipes" includeHr={true} />
                                <RecipeListContainer recipeList={recipeList} />
                            </>
                        } />
                    </Routes>
                </main>

                <Footer />
            </div>
        </ActiveBakesProvider>
    )
}
