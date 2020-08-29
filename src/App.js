import React from 'react';
import {Switch, Route} from 'react-router-dom';
import Navbar from './components/Navbar';
import PageTitle from './components/PageTitle';
import RecipeListContainer from './components/RecipeListContainer';
import RecipePageContainer from './components/RecipePageContainer';
import AddRecipe from './components/AddRecipe';
import ConvertTextPageContainer from './components/ConvertTextPageContainer';
import Footer from './components/Footer';
import 'react-datepicker/dist/react-datepicker.css';
import './styles.sass';

class App extends React.Component {
    constructor() {
        super();
        this.state = {
            allRecipes: [],
            hasData: false
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
                console.log(result.data);
            })
            .catch(error => console.log("Error retrieving data for all recipes:", error));
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
            body: JSON.stringify(updatedRecipe)
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
            .catch(error => console.log("PUT failed:", error));
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
                    console.log("Delete failed, details:", response.body);
                    return Promise.reject(response.statusText)
                }
            })
            .catch(error => console.log("Delete failed:", error));
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
                <header className="header-container">
                    <Navbar />
                </header>
                <main className="content-container">
                    <Switch>
                        <Route exact path="/convert">
                            <PageTitle
                                title="Convert Recipe Text"
                                includeHr={false}/>
                            <ConvertTextPageContainer/>
                        </Route>

                        <Route path="/:recipeId">
                            <RecipePageContainer
                                allRecipes={this.state.allRecipes}
                                updateOneRecipe={this.updateOneRecipe}
                                updateRecipeLength={this.updateRecipeLength}
                                updateMasterRecipeList={this.getAllRecipes}/>
                        </Route>

                        <Route exact path="/">
                            <PageTitle
                                title="Recipes"
                                includeHr={true}/>
                            <RecipeListContainer
                                allRecipes={this.state.allRecipes}
                                addRecipeToState={this.addRecipeToState}
                                deleteRecipe={this.deleteRecipe}/>
                            <AddRecipe
                                addRecipeToState={this.addRecipeToState}/>
                        </Route>
                    </Switch>
                </main>
                <p className="color-test test-border"><span>border</span><span>#979AA0</span><span>151,154,160</span></p>
                <p className="color-test test-border-2"><span>border-darker</span><span>#696c72</span><span>105,108,114</span></p>
                <p className="color-test test1"><span>c1</span><span>#c7c1ab</span><span>199,193,171</span></p>
                <p className="color-test test2"><span>c2</span><span>#ecece8</span><span>236,236,232</span></p>
                <p className="color-test test3"><span>c3</span><span>#f7ebdd</span><span>247,235,221</span></p>
                <p className="color-test test4"><span>c4</span><span>#dbb37e</span><span>219,179,126</span></p>
                <p className="color-test test5"><span>c5</span><span>#935614</span><span>147,86,20</span></p>
                <p className="color-test test6"><span>c6</span><span>#612c00</span><span>97,44,0</span></p>
                <p className="color-test test7"><span>c7</span><span>#370300</span><span>55,3,0</span></p>
                <p className="color-test test8"><span>c8</span><span>#160000</span><span>22,0,0</span></p>
                <Footer/>
            </div>
        )
    }
}

export default App;
