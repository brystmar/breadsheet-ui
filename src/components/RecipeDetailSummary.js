// Details section displayed on the recipe-specific page.
// Data: author, source, total time, difficulty, date added.
import React from 'react';
import PageTitle from './PageTitle';
import seconds_to_string from '../scripts/seconds_to_string';
import RecipeStartEnd from './RecipeStartEnd';
import LoadingIcon from './LoadingIcon';
import StepTable from './StepTable';
import AddStep from "./AddStep";

class RecipeDetailSummary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recipeData: {
                steps: [],
                length: 0,
                solve_for_start: true,
                start_time: Date()
            },
            hasData: false,
            hasSteps: false,
            nextStep: 1
        };

        this.handleStepLengthChange = this.handleStepLengthChange.bind(this);
        this.updateRecipeState = this.updateRecipeState.bind(this);
        this.addStepToRecipe = this.addStepToRecipe.bind(this);
    }

    componentDidMount() {
        // Get the recipe details from the backend
        fetch("http://localhost:5000/api/v1/recipe/" + this.props.recipeId)
            .then(response => response.json())
            .then(result => {
                if (result.message === "Success") {
                    console.log("Recipe details successfully retrieved from backend.");

                    // Determine the largest step number
                    let largestStep = 0;
                    if (result.data.steps.length > 0) {
                        result.data.steps.forEach((step) => {
                            if (step.number > largestStep) {
                                largestStep = step.number
                            }
                        })
                    }
                    this.setState({
                        recipeData: result.data,
                        hasData: true,
                        hasSteps: result.data.steps.length > 0,
                        nextStep: largestStep + 1
                    });
                    console.log("State updated with recipe details. nextStep:", largestStep + 1)
                } else {
                    console.log("Error retrieving Recipe details from backend.");
                    console.log(result.body);
                }
            })
    }

    handleStepLengthChange(event, stepNumber, newThenWait) {
        // console.log("Called RDS.handleStepLengthChange(" + stepNumber + ").");
        let newRecipe = this.state.recipeData;
        let newLength = 0;
        console.log("RDS.hSLC Value:", event.target.value, "Step #" + stepNumber, "NewTW:", newThenWait);

        newRecipe.steps[stepNumber - 1].then_wait = newThenWait;

        // Re-calculate the total recipe length
        newRecipe.steps.forEach(step => newLength += step.then_wait);
        newRecipe.length = newLength;

        this.setState({
            recipeData: newRecipe
        })
    }

    updateRecipeState(newStateData) {
        console.log("Called updateRecipeState for id=" + this.state.recipeData.id);
        this.setState({recipeData: newStateData})
    }

    addStepToRecipe(newStep) {
        console.log("Called addStepToRecipe for step:", newStep);
        let updatedRecipe = this.state.recipeData;

        // Add a new step to the list
        updatedRecipe.steps.push(newStep);

        // Sort by step.number
        console.log("New steps before sort:", updatedRecipe.steps);
        updatedRecipe.steps.sort((a, b) => parseFloat(a.number) - parseFloat(b.number));
        console.log("New steps after sort:", updatedRecipe.steps);

        // Update this recipe in the database
        fetch("http://localhost:5000/api/v1/recipe/" + updatedRecipe.id, {
            method: "PUT",
            body: JSON.stringify(updatedRecipe)
        })
            .then(response => {
                console.log("PUT response:", response.ok ? "Success" : "Error", response.status);

                if (response.ok) {
                    return response.json();
                }
                else {
                    return Promise.reject(response.statusText);
                }
            })
            .then(result => {
                console.log("New recipe saved:", result.data);

                // Update state with the new recipe (and step) data
                this.setState({
                    recipeData: result.data,
                    hasData: true,
                    hasSteps: true,
                    nextStep: this.state.nextStep + 1
                })
            })
            .catch(something => console.log("Caught:", something));
    }

    render() {
        // Until data from the backend arrives, don't render components w/props needing that data
        // let output = <LoadingIcon cssClass="loading-icon-title"/>;

        // <AddStep nextStep={this.state.nextStep} addStepToRecipe={this.addStepToRecipe}/>

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

                <RecipeStartEnd start_time={Date.parse(this.state.recipeData.start_time)}
                                solve_for_start={this.state.recipeData.solve_for_start}
                                length={this.state.recipeData.length}/>
                <StepTable steps={this.state.recipeData.steps}
                           handleStepLengthChange={this.handleStepLengthChange}
                           hasData={this.state.hasData}/>
                <AddStep nextStep={this.state.nextStep} addStepToRecipe={this.addStepToRecipe}/>

                {/*<StepTable steps={this.state.recipeData.steps}*/}
                {/*           handleStepLengthChange={this.handleStepLengthChange}/>*/}
                {/*<AddStep nextStep={this.state.nextStep} addStepToRecipe={this.addStepToRecipe}/>*/}
            </div>
        )
    }
}

export default RecipeDetailSummary;
