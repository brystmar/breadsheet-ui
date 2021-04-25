import React, { useState, useEffect } from "react";
import { Switch, Route } from "react-router-dom";
import { breadsheetApis } from "./data/endpoints";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PageTitle from "./components/PageTitle";
import RecipeListContainer from "./components/RecipeListContainer";
import RecipePageContainer from "./components/RecipePageContainer";
import AddRecipe from "./components/AddRecipe";
import ConvertTextPageContainer from "./components/ConvertTextPageContainer";
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
    const [ isDataStale, toggleIsDataStale ] = useState(false);

    // Retrieve the data for all recipes from the backend
    useEffect(() => {
            // Declare an async function for retrieving recipes
            async function getAllRecipes() {
                try {
                    console.debug(`Calling endpoint: ${breadsheetApis.recipes.all}`);

                    // Make the GET request
                    const recipeListRequest = await fetch(breadsheetApis.recipes.all);

                    // Parse the response, which is a list of recipe objects
                    const recipeListResponse = await recipeListRequest.json();

                    // Update local state
                    updateRecipeList(recipeListResponse.data);
                    toggleHasData(true);

                } catch (error) {
                    console.error(`Error retrieving or parsing recipe list: ${error}`);
                }
            }

            console.info("Retrieving list of recipes via App.useEffect")
            getAllRecipes();
        },
        // The function for updating `isDataStale` gets passed down to children,
        // allowing them to trigger a data refresh of all recipes when needed.
        [ isDataStale ])

    function addRecipeToState(recipe) {
        console.debug("Called addRecipeToState for", recipe);
        let newRecipeList = recipeList;
        newRecipeList.push(recipe);

        // Sort the list by date_added
        newRecipeList.sort((a, b) => a.date_added - b.date_added);

        // Update local state
        updateRecipeList(newRecipeList);
    }

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

    async function updateOneRecipe(recipeId, updatedRecipe) {
        // When updates are saved to a recipe, replace that recipe in the master list
        console.debug(`Called updateOneRecipe(${recipeId}) w/data: ${updatedRecipe}`);

        try {
            const requestArgs = {
                method: "PUT",
                body:   JSON.stringify(updatedRecipe)
            }

            // Make the PUT request
            console.debug(`Calling endpoint: ${breadsheetApis.recipes.single}/${recipeId}`);
            const updateRecipeRequest = await fetch(`${breadsheetApis.recipes.single}/${recipeId}`, requestArgs);

            // Parse the response
            const updateRecipeResponse = await updateRecipeRequest.json();

            // Replace this recipe in local state by deleting & re-adding to the list
            deleteRecipeFromState(recipeId);
            addRecipeToState(updateRecipeResponse.data);
            toggleHasData(true);

        } catch (error) {
            console.error(`PUT request failed: ${error}`);
        }
    }

    async function deleteRecipe(recipeId) {
        // Deletes the specified recipe from the database, then removes it from local state
        console.info(`Attempting to delete recipe: ${recipeId}`);

        try {
            const requestArgs = { method: "DELETE" };

            // Make the DELETE request
            console.debug(`Calling endpoint: ${breadsheetApis.recipes.single}/${recipeId}`);
            const deleteRecipeRequest = await fetch(`${breadsheetApis.recipes.single}/${recipeId}`, requestArgs);

            // Parse the response
            const deleteRecipeResponse = await deleteRecipeRequest.json();

            if (deleteRecipeResponse.message === "Success") {
                console.debug("Delete successful");

                // Remove this recipe from local state
                deleteRecipeFromState(recipeId);
            } else if (deleteRecipeResponse.message === "Not Found") {
                console.debug(`Unable to delete; recipe ${recipeId} was not found.`);

                // Local data must be stale and needs to be replaced
                toggleIsDataStale(true);
            }

        } catch (error) {
            console.error(`DELETE request failed: ${error}`);
        }
    }

    function deleteRecipeFromState(recipeId) {
        // Removes the specified recipe from local state
        let newRecipeList = recipeList.filter((recipe) => recipe.id !== recipeId)

        updateRecipeList(newRecipeList);
    }

    return (
        <div className="app-container">
            <Header />

            <main className="content-container">
                <Switch>
                    <Route exact path="/convert">
                        <PageTitle title="Convert Text" includeHr={true} />
                        <ConvertTextPageContainer />
                    </Route>

                    <Route path="/:recipeId">
                        <RecipePageContainer
                            recipeList={recipeList}
                            hasData={hasData}
                            updateOneRecipe={updateOneRecipe}
                            updateRecipeLength={updateRecipeLength}
                            updateMasterRecipeList={isDataStale}
                        />
                    </Route>

                    <Route exact path="/">
                        <PageTitle title="Breadsheet" includeHr={true} />
                        <RecipeListContainer
                            recipeList={recipeList}
                            addRecipeToState={addRecipeToState}
                            deleteRecipe={deleteRecipe}
                        />
                        <AddRecipe addRecipeToState={addRecipeToState} />
                    </Route>
                </Switch>
            </main>

            <Footer />
        </div>
    )
}
