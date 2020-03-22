// Details section displayed on the recipe-specific page.
// Data: author, source, total time, difficulty, date added.
import React from 'react';
import PageTitle from "./PageTitle";
import seconds_to_string from "../scripts/seconds_to_string";
import RecipeListItem from "./RecipeListItem";
import RecipeStartEnd from "./RecipeStartEnd";
import LoadingIcon from "./LoadingIcon";

class RecipeDetailSummary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recipeData: {},
            hasData: false,
            hasSteps: false
        };

        this.updateRecipeState = this.updateRecipeState.bind(this);
    }

    componentDidMount() {
        // Get the recipe details from the backend
        fetch("http://localhost:5000/api/v1/recipe/" + this.props.recipeId)
            .then(response => response.json())
            .then(result => {
                if (result.message === "Success") {
                    console.log("Recipe details successfully retrieved from backend.");
                    this.setState({
                        recipeData: result.data,
                        hasData: true,
                        hasSteps: result.data.steps.length > 0
                    });
                    console.log("State updated with recipe details.")
                    // console.log("Recipe:", result);
                } else {
                    console.log("Error retrieving Recipe details from backend.");
                    console.log(result.body)
                }
            })
    }

    updateRecipeState(newStateData) {
        console.log("Called updateRecipeState for id=" + this.state.recipeData.id);

        this.setState({recipeData: newStateData})
    }

    render() {
        let stepComponentList = {};
        if (this.state.hasData && this.state.hasSteps) {
            stepComponentList = this.state.recipeData.steps.map(
                step => <RecipeListItem key={step.number}
                                        id={step.number}
                                        text={step.text}
                                        when={step.when}
                                        then_wait={step.then_wait}
                                        note={step.note}/>
            )
        }

        return (
            <div className="recipe-detail-summary">
                <PageTitle title={this.state.recipeData.name}/>
                <hr/>
                <table className="recipe-detail-summary-table">
                    <tbody>
                    <tr>
                        <td className="recipe-detail-summary-table-label">Difficulty:</td>
                        <td className="recipe-detail-summary-table-value">
                            {this.state.hasData ?
                                this.state.recipeData.difficulty :
                                <LoadingIcon cssClass="loading-icon-table"/>
                            }
                        </td>
                        <td className="recipe-detail-summary-table-label">Source:</td>
                        <td className="recipe-detail-summary-table-value">
                            {this.state.hasData ?
                                this.state.recipeData.source :
                                <LoadingIcon cssClass="loading-icon-table"/>
                            }
                        </td>
                    </tr>
                    <tr>
                        <td className="recipe-detail-summary-table-label">Total Time:</td>
                        <td className="recipe-detail-summary-table-value">
                            {this.state.hasData ?
                                seconds_to_string(this.state.recipeData.length, true) :
                                <LoadingIcon cssClass="loading-icon-table"/>
                            }
                        </td>
                        <td className="recipe-detail-summary-table-label">Author:</td>
                        <td className="recipe-detail-summary-table-value">
                            {this.state.hasData ?
                                this.state.recipeData.author :
                                <LoadingIcon cssClass="loading-icon-table"/>
                            }
                        </td>
                    </tr>
                    </tbody>
                </table>

                <RecipeStartEnd solve_for_start={true} length={this.state.recipeData.length} />
            </div>
        )
    }
}

export default RecipeDetailSummary;
