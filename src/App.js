import React from "react";
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


// TODO: Refactor to functional component
export default class App extends React.Component {
    constructor() {
        super();
        this.state = {
            allRecipes: [],
            hasData:    false
        }

        this.getAllRecipes = this.getAllRecipes.bind(this);
        this.addRecipeToState = this.addRecipeToState.bind(this);
        this.deleteRecipe = this.deleteRecipe.bind(this);
        this.deleteRecipeFromState = this.deleteRecipeFromState.bind(this);
        this.updateRecipeLength = this.updateRecipeLength.bind(this);
        this.updateOneRecipe = this.updateOneRecipe.bind(this);
        this.sortAllRecipes = this.sortAllRecipes.bind(this);
    }

    componentDidMount() {
        this.getAllRecipes()
    }

    getAllRecipes() {
        // Get the recipe details from the backend
        console.log("Calling endpoint:", process.env.REACT_APP_BACKEND_URL + "/api/v1/recipes");
        fetch(process.env.REACT_APP_BACKEND_URL + "/api/v1/recipes")
            .then(response => response.json())
            .then(result => {
                this.setState({
                    allRecipes: this.sortAllRecipes(result.data)
                })
                // console.log("Recipes:", result.data);
            })
            .catch(error => console.error("Error retrieving data for all recipes.", error));
    }

    sortAllRecipes(recipeList) {
        // Sort the array by date_added
        recipeList.sort((a, b) => a.date_added - b.date_added);
        return recipeList;
    }

    addRecipeToState(recipe) {
        // console.log("Called addRecipeToState for", recipe);
        let updatedRecipeList = this.state.allRecipes;
        updatedRecipeList.push(recipe);

        this.setState({
            allRecipes: this.sortAllRecipes(updatedRecipeList)
        })
    }

    updateOneRecipe(recipe_id, updatedRecipe) {
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

    deleteRecipe(recipe_id) {
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

    deleteRecipeFromState(recipe_id) {
        // Remove from local state
        let newList = this.state.allRecipes.filter(
            function (terminator) {
                return terminator.id !== recipe_id
            });

        this.setState({
            allRecipes: newList
        });
    }

    updateRecipeLength(recipe_id, newLength) {
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

    render() {
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
}
