// Details section displayed on the recipe-specific page.
// Data: author, source, total time, difficulty, date added.
import React from 'react';
import PageTitle from './PageTitle';
import seconds_to_string from '../scripts/seconds_to_string';
import StepListItem from './StepListItem';
import RecipeStartEnd from './RecipeStartEnd';
import LoadingIcon from './LoadingIcon';
import StepTable from './StepTable';
import seconds_to_hhmm, {pad} from '../scripts/seconds_to_hhmm';
import AddStep from "./AddStep";

class RecipeDetailSummary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recipeData: {},
            hasData: false,
            hasSteps: false,
            nextStep: 1
        };

        this.handleThenWaitChange = this.handleThenWaitChange.bind(this);
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

                    this.setState({
                        recipeData: {},
                        hasData: false,
                        hasSteps: false,
                        nextStep: 1
                    });
                }
            })
    }

    handleThenWaitChange(stepNumber, newThenWaitSeconds) {
        console.log("Called handleThenWaitChange(" + stepNumber + ", " + newThenWaitSeconds + ").");

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
                console.log("POST complete, response:", response.status, response.ok);
                return response.json();
            })
            .then(result => {
                console.log("New recipe saved:", result.data);
                // Reset form fields to their defaults
                this.resetDefaults();

                // Update state of the RecipeTable component using the provided function
                this.props.render(result.data);
            });

        this.setState({
            recipeData: updatedRecipe,
            hasData: true,
            hasSteps: true
        })
    }

    render() {
        // Until data from the backend arrives, don't render components w/props needing that data
        let output = <LoadingIcon cssClass="loading-icon-title"/>;

        if (this.state.hasData && this.state.hasSteps) {
            let stepComponentList = this.state.recipeData.steps.map(step => {
                    let [then_wait_hh, then_wait_mm] = seconds_to_hhmm(step.then_wait);

                    step.step_id = step.step_id ? step.step_id : "iso";

                    return <StepListItem key={step.number}
                                         step_id={step.step_id}
                                         number={step.number}
                                         text={step.text}
                                         when={step.when}
                                         then_wait={step.then_wait}
                                         then_wait_hh={then_wait_hh}
                                         then_wait_mm={then_wait_mm}
                                         note={step.note}
                                         thenWaitHandler={this.handleThenWaitChange}/>
                }
            );

            output =
                <div>
                    <RecipeStartEnd start_time={Date.parse(this.state.recipeData.start_time)}
                                    solve_for_start={true}
                                    length={this.state.recipeData.length}/>
                    <StepTable steps={stepComponentList}/>
                    <AddStep nextStep={this.state.nextStep} addStepToRecipe={this.addStepToRecipe}/>
                </div>;
        } else if (this.state.hasData) {
            output = <AddStep nextStep={this.state.nextStep} addStepToRecipe={this.addStepToRecipe}/>
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

                {output}
            </div>
        )
    }
}

export default RecipeDetailSummary;
