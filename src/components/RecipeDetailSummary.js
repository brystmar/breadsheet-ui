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

        this.findHighestStep = this.findHighestStep.bind(this);
        this.handleStepLengthChange = this.handleStepLengthChange.bind(this);
        this.saveUpdatedRecipe = this.saveUpdatedRecipe.bind(this);
        this.addStepToRecipe = this.addStepToRecipe.bind(this);
        this.deleteStep = this.deleteStep.bind(this);
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
                        hasSteps: result.data.steps.length > 0,
                        nextStep: this.findHighestStep(result.data.steps) + 1
                    });
                } else {
                    console.log("Error retrieving recipe data from backend.");
                    console.log(result.body);
                    return Promise.reject(result.status);
                }
            })
            .catch(rejection => console.log(rejection));
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!prevState.hasData && this.state.hasData) {
            console.log("State updated with recipe data.")
        }
    }

    findHighestStep(stepList) {
        // From a list of provided steps, return the highest step number (int)
        let highestStep = 0;
        if (stepList.length > 0) {
            stepList.forEach((step) => {
                if (step.number > highestStep) {
                    highestStep = step.number
                }
            })
        }
        return highestStep;
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

    saveUpdatedRecipe(newState) {
        // Update this recipe (and the component's state) in the database
        console.log("Called saveUpdatedRecipe for recipe_id:", newState.recipeData.id);

        fetch("http://localhost:5000/api/v1/recipe/" + newState.recipeData.id, {
            method: "PUT",
            body: JSON.stringify(newState.recipeData)
        })
            .then(response => {
                console.log("PUT response:", response.ok ? "Success" : "Error", response.status);

                if (response.ok) {
                    return response.json();
                } else {
                    console.log("Error updating the recipe in the database.");
                    console.log(response.body);
                    return Promise.reject(response.statusText);
                }
            })
            .then(() => {
                // Update state with the new recipe (and step) data
                console.log("Recipe updated successfully.");
                this.setState(newState)
            })
            .catch(something => console.log("Caught:", something));
    }

    addStepToRecipe(newStep) {
        console.log("Called addStepToRecipe for step:", newStep);
        let updatedRecipe = this.state.recipeData;

        // Add a new step to the list
        updatedRecipe.steps.push(newStep);

        // Sort by step.number
        // console.log("New steps before sort:", updatedRecipe.steps);
        updatedRecipe.steps.sort((a, b) => parseFloat(a.number) - parseFloat(b.number));
        // console.log("New steps after sort:", updatedRecipe.steps);

        this.saveUpdatedRecipe({
            recipeData: updatedRecipe,
            hasData: true,
            hasSteps: true,
            nextStep: this.findHighestStep(updatedRecipe.steps) + 1
        })
    }

    deleteStep(stepId) {
        console.log("Called deleteStep for step_id:", stepId);

        // Create a new representation of recipeData
        let newRecipeData = this.state.recipeData;
        newRecipeData.steps = newRecipeData.steps.filter(
            function (terminator) {
                return terminator.step_id !== stepId
            });

        // Update the backend, then update state
        this.saveUpdatedRecipe({
            recipeData: newRecipeData,
            hasSteps: newRecipeData.steps.length > 0,
            nextStep: this.findHighestStep(newRecipeData.steps) + 1
        });
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
                           hasData={this.state.hasData}
                           handleStepLengthChange={this.handleStepLengthChange}
                           deleteStep={this.deleteStep}/>
                <AddStep nextStep={this.state.nextStep} addStepToRecipe={this.addStepToRecipe}/>

                {/*<StepTable steps={this.state.recipeData.steps}*/}
                {/*           handleStepLengthChange={this.handleStepLengthChange}/>*/}
                {/*<AddStep nextStep={this.state.nextStep} addStepToRecipe={this.addStepToRecipe}/>*/}
            </div>
        )
    }
}

export default RecipeDetailSummary;
