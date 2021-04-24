import React, { useState, useEffect } from "react";
import { Switch, Route } from "react-router-dom";
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
    // `recipeList`: list of objects
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

    const recipeListApi = `${process.env.REACT_APP_BACKEND_URL}/api/v1/recipes"`;

    //
    useEffect(() => {
        // Declare the async function for retrieving recipes
        async function getAllRecipes() {
            try {
                console.debug(`Calling endpoint: ${recipeListApi}`);

                // Make the GET request
                const recipeListResponse = await fetch(recipeListApi);

                // Parse the response
                const recipeListData = await recipeListResponse.json();

                // Response body contains a list of recipe objects
                // Update local state
                updateRecipeList(recipeListData);
                toggleHasData(true);
            } catch (error) {
                console.error(`Error retrieving recipe list: ${error}`);
            }
        }

        console.log("Retrieving list of recipes via App.useEffect")
        // Call the recipe function
        getAllRecipes();

    },
    // The function for updating `isDataStale` gets passed down to children,
    // allowing them to trigger a data refresh of all recipes when needed.
    [ isDataStale ])

    function addRecipeToState(recipe) {
        // console.log("Called addRecipeToState for", recipe);
        let updatedRecipeList = this.state.allRecipes;
        updatedRecipeList.push(recipe);

        // Sort the list by the date_added attribute
        updatedRecipeList.sort((a, b) => a.date_added - b.date_added);

        this.setState({
            allRecipes: this.sortAllRecipes(updatedRecipeList)
        })
    }

    function updateOneRecipe(recipe_id, updatedRecipe)
    {
        // When updates are saved to a recipe, replace that recipe in the master list
        // console.log("Called updateOneRecipe(" + recipe_id + "), data:");
        // console.log(updatedRecipe);
        fetch(process.env.REACT_APP_BACKEND_URL + "/api/v1/recipe/" + recipe_id, {
            method: "PUT",
            body:   JSON.stringify(updatedRecipe)
        })
            .then(response => {
                if (response.ok) {
                    // console.log("PUT successful!");
                    return response.json();
                } else {
                    console.log("PUT failed, details:", response.body);
                    return Promise.reject(response.statusText);
                }
            })
            .then(recipeResponse => {
                // Replace this recipe in local state by deleting & re-adding to the list
                this.deleteRecipeFromState(recipe_id);
                this.addRecipeToState(recipeResponse.data);
            })
            .catch(error => console.error("PUT request failed.", error));
    }

    function deleteRecipe(recipe_id)
    {
        console.log("Attempting to delete id=", recipe_id);

        // Send a DELETE request to the backend
        // console.log("Calling endpoint: [DELETE]", process.env.REACT_APP_BACKEND_URL + "/api/v1/recipe/" + recipe_id);
        fetch(process.env.REACT_APP_BACKEND_URL + "/api/v1/recipe/" + recipe_id, {
            method: "DELETE"
        })
            .then(response => {
                if (response.ok) {
                    // Remove this recipe from local state
                    this.deleteRecipeFromState(recipe_id)
                    console.log("Delete successful");
                } else {
                    console.log("Delete request failed, details:", response.body);
                    return Promise.reject(response.statusText)
                }
            })
            .catch(error => console.error("Delete request failed.", error));
    }

    function deleteRecipeFromState(recipe_id)
    {
        // Remove from local state
        let newList = this.state.allRecipes.filter(
            function (terminator) {
                return terminator.id !== recipe_id
            });

        this.setState({
            allRecipes: newList
        });
    }

    function updateRecipeLength(recipe_id, newLength)
    {
        let newList = this.state.allRecipes;

        // TODO: Change this.state.allRecipes from a list to a hash table
        for (let i = 0; i < newList.length; i++) {
            if (newList[i].id === recipe_id) {
                newList[i].length = newLength;
                break;
            }
        }

        this.setState({
            allRecipes: newList
        })
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
                            allRecipes={this.state.allRecipes}
                            updateOneRecipe={this.updateOneRecipe}
                            updateRecipeLength={this.updateRecipeLength}
                            updateMasterRecipeList={this.getAllRecipes}
                        />
                    </Route>

                    <Route exact path="/">
                        <PageTitle title="Breadsheet" includeHr={true} />
                        <RecipeListContainer
                            allRecipes={this.state.allRecipes}
                            addRecipeToState={this.addRecipeToState}
                            deleteRecipe={this.deleteRecipe}
                        />
                        <AddRecipe addRecipeToState={this.addRecipeToState} />
                    </Route>
                </Switch>
            </main>

            <Footer />
        </div>
    )
}
