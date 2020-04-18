// Details section displayed on the recipe-specific page.
// Data: author, source, total time, difficulty, date added.
import React from 'react';
import PageTitle from './PageTitle';
import RecipeDetailAttributes from './RecipeDetailAttributes';
import RecipeStartEnd from './RecipeStartEnd';
import StepTable from './StepTable';
import AddStep from './AddStep';

class RecipeDetailSummary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recipeData: {
                id: "",
                name: "",
                author: "",
                source: "",
                difficulty: "",
                date_added: new Date(0).getTime(),
                start_time: new Date(0).getTime(),
                solve_for_start: true,
                steps: [],
                length: 0
            },
            hasData: false,
            hasSteps: false,
            nextStep: 1
        };

        this.findHighestStep = this.findHighestStep.bind(this);
        this.handleStepLengthChange = this.handleStepLengthChange.bind(this);
        this.handleStartFinishToggle = this.handleStartFinishToggle.bind(this);
        this.handleUpdateStartTime = this.handleUpdateStartTime.bind(this);
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

        newRecipe.steps[stepNumber - 1].then_wait = newThenWait;

        // Re-calculate the total recipe length
        newRecipe.steps.forEach(step => newLength += step.then_wait);
        newRecipe.length = newLength;

        this.setState({
            recipeData: newRecipe
        })
    }

    handleStartFinishToggle() {
        let newRecipeData = this.state.recipeData;
        newRecipeData.solve_for_start = !newRecipeData.solve_for_start;

        this.setState({
            recipeData: newRecipeData
        })
    }

    handleUpdateStartTime(newStartTime) {
        console.log("Called handleUST:", newStartTime);

        let newRecipeData = this.state.recipeData;
        newRecipeData.start_time = newStartTime;

        this.setState({
            recipeData: newRecipeData
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
        updatedRecipe.steps.sort((a, b) => parseFloat(a.number) - parseFloat(b.number));

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
        return (
            <div className="recipe-detail-summary">
                <PageTitle title={this.state.recipeData.name}
                           includeHr={true}/>

                <RecipeDetailAttributes difficulty={this.state.recipeData.difficulty}
                                        source={this.state.recipeData.source}
                                        author={this.state.recipeData.author}
                                        length={this.state.recipeData.length}/>

                <RecipeStartEnd start_time={this.state.recipeData.start_time}
                                solve_for_start={this.state.recipeData.solve_for_start}
                                length={this.state.recipeData.length}
                                handleUpdateStartTime={this.handleUpdateStartTime}
                                handleStartFinishToggle={this.handleStartFinishToggle}/>

                <StepTable steps={this.state.recipeData.steps}
                           start_time={this.state.recipeData.start_time}
                           solve_for_start={this.state.recipeData.solve_for_start}
                           length={this.state.recipeData.length}
                           hasData={this.state.hasData}
                           handleStepLengthChange={this.handleStepLengthChange}
                           deleteStep={this.deleteStep}/>

                <AddStep nextStep={this.state.nextStep}
                         addStepToRecipe={this.addStepToRecipe}/>

            </div>
        )
    }
}

export default RecipeDetailSummary;
