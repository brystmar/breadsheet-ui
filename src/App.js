import React from 'react';
import {Switch, Route} from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import PageTitle from './components/PageTitle';
import RecipeDetailContainer from './components/RecipeDetailContainer';
import RecipeListTable from './components/RecipeListTable';
import ConvertTextPageContainer from './components/ConvertTextPageContainer';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

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
    }

    componentDidMount() {
        this.getAllRecipes()
    }

    getAllRecipes() {
        // Get the recipe details from the backend
        // console.log("Calling endpoint:", process.env.REACT_APP_BACKEND_URL + "/api/v1/recipes");
        fetch(process.env.REACT_APP_BACKEND_URL + "/api/v1/recipes")
            .then(response => response.json())
            .then(result => this.setState({allRecipes: result.data}))
            .catch(error => console.log("Error retrieving data for all recipes:", error));
    }

    addRecipeToState(recipe) {
        // console.log("Called addRecipeToState for", recipe);
        let updatedRecipes = this.state.allRecipes;
        updatedRecipes.push(recipe);

        this.setState({
            allRecipes: updatedRecipes
        })
    }

    deleteRecipe(recipe_id) {
        console.log("Attempting to delete recipe", recipe_id);

        // Tell the backend to remove this recipe from the database
        // console.log("Calling endpoint: [DELETE]", process.env.REACT_APP_BACKEND_URL + "/api/v1/recipe/" + recipe_id);
        fetch(process.env.REACT_APP_BACKEND_URL + "/api/v1/recipe/" + recipe_id, {
            method: "DELETE"
        })
            .then(response => {
                if (response.ok) {
                    // Remove this recipe from local state
                    this.deleteRecipeFromState(recipe_id)
                    console.log("Delete successful!");
                } else {
                    console.log("Delete failed! Details:", response.body);
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
                <NavBar allRecipes={this.state.allRecipes}/>
                <div className="content-container">
                    <Switch>
                        <Route exact path="/">
                            <PageTitle title="Breadsheet" includeHr={false}/>
                            <RecipeListTable allRecipes={this.state.allRecipes}
                                             addRecipeToState={this.addRecipeToState}
                                             deleteRecipe={this.deleteRecipe}/>
                        </Route>

                        <Route exact path="/convert">
                            <PageTitle title="Convert Recipe Text" includeHr={true}/>
                            <ConvertTextPageContainer/>
                        </Route>

                        <Route path="/:recipeId">
                            <RecipeDetailContainer allRecipes={this.state.allRecipes}
                                                   hasData={this.state.hasData}
                                                   updateRecipeLength={this.updateRecipeLength}
                                                   updateMasterRecipeList={this.getAllRecipes}/>
                        </Route>
                    </Switch>
                </div>
                <Footer/>
            </div>
        )
    }
}

export default App;
