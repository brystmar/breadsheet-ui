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

class RecipeDetailSummary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recipeData: {},
            hasData: false,
            hasSteps: false
        };

        this.handleThenWaitChange = this.handleThenWaitChange.bind(this);
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

    handleThenWaitChange(stepNumber, newThenWaitSeconds) {
        console.log("Called handleThenWaitChange(" + stepNumber + ", " + newThenWaitSeconds + ").");

    }

    updateRecipeState(newStateData) {
        console.log("Called updateRecipeState for id=" + this.state.recipeData.id);

        this.setState({
            recipeData: newStateData,
            hasData: this.state.hasData,
            hasSteps: this.state.hasSteps
        })
    }

    render() {
        // Until data from the backend arrives, don't render components w/props needing that data
        let output = <LoadingIcon cssClass="loading-icon-title"/>;
        if (this.state.hasData && this.state.hasSteps) {

            let stepComponentList = this.state.recipeData.steps.map(step => {
                    let [then_wait_hh, then_wait_mm] = seconds_to_hhmm(step.then_wait);

                    return <StepListItem key={step.number}
                                         number={step.number}
                                         text={step.text}
                                         when={step.when}
                                         then_wait_hh={then_wait_hh}
                                         then_wait_mm={then_wait_mm}
                                         then_wait={step.then_wait}
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
                </div>;
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
