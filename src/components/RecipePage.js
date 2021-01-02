// Details section displayed on the recipe-specific page.
// Data: author, source, total time, difficulty, date added.
import React from 'react';
import PageTitle from './PageTitle';
import RecipePageAttributes from './RecipePageAttributes';
import RecipeStartFinish from './RecipeStartFinish';
import StepContainer from './StepContainer';
import AddStep from './AddStep';

// TODO: Refactor to functional component
class RecipePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recipeData: this.props.recipeData,
            hasData: this.props.hasData,
            hasSteps: false,
            nextStep: 1,
            editMode: false
        };

        this.findHighestStep = this.findHighestStep.bind(this);
        this.handleStepLengthChange = this.handleStepLengthChange.bind(this);
        this.handleStartFinishToggle = this.handleStartFinishToggle.bind(this);
        this.handleUpdateStartTime = this.handleUpdateStartTime.bind(this);
        this.handleSaveRecipe = this.handleSaveRecipe.bind(this);
        this.saveUpdatedRecipe = this.saveUpdatedRecipe.bind(this);
        this.addStepToRecipe = this.addStepToRecipe.bind(this);
        this.deleteStep = this.deleteStep.bind(this);
        this.toggleEditMode = this.toggleEditMode.bind(this);
        this.getRecipeData = this.getRecipeData.bind(this);
    }

    componentDidMount() {
        this.getRecipeData(this.props.recipeId);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.recipeId !== this.props.recipeId) {
            this.getRecipeData(this.props.recipeId);
        }
    }

    getRecipeData(recipe_id) {
        // console.log("Calling endpoint: [GET]", process.env.REACT_APP_BACKEND_URL + "/api/v1/recipe/" + recipe_id)
        fetch(process.env.REACT_APP_BACKEND_URL + "/api/v1/recipe/" + recipe_id)
            .then(response => response.json())
            .then(result => {
                if (result.message === "Success") {
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

    toggleEditMode(newEditMode = !this.state.editMode) {
        this.setState({
            editMode: newEditMode
        })
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
        let newRecipeData = this.state.recipeData;
        newRecipeData.start_time = newStartTime;

        this.setState({
            recipeData: newRecipeData
        })
    }

    handleSaveRecipe() {
        console.log("Called handleSaveRecipe w/data:", this.state.recipeData);
        this.props.updateOneRecipe(this.state.recipeData.id, this.state.recipeData);
    }

    saveUpdatedRecipe(updatedRecipe) {
        // Update this recipe (and the component's state) in the database
        // console.log("Calling endpoint: [PUT]", process.env.REACT_APP_BACKEND_URL + "/api/v1/recipe/" + updatedRecipe.recipeData.id);

        fetch(process.env.REACT_APP_BACKEND_URL + "/api/v1/recipe/" + updatedRecipe.recipeData.id, {
            method: "PUT",
            body: JSON.stringify(updatedRecipe.recipeData)
        })
            .then(response => {
                // console.log("PUT response:", response.ok ? "Success" : "Error", response.status);
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
                this.setState(updatedRecipe);

                // Update the master recipe list in App.js
                this.props.updateMasterRecipeList();
            })
            .catch(something => console.log("Caught:", something));
    }

    addStepToRecipe(newStep) {
        let updatedRecipe = this.state.recipeData;

        // Add a new step to the list
        updatedRecipe.steps.push(newStep);

        // Sort by step.number
        updatedRecipe.steps.sort((a, b) => parseFloat(a.number) - parseFloat(b.number));

        // Update the recipe length, which is newStep.then_wait
        updatedRecipe.length += newStep.then_wait;

        this.saveUpdatedRecipe({
            recipeData: updatedRecipe,
            hasData: true,
            hasSteps: true,
            nextStep: this.findHighestStep(updatedRecipe.steps) + 1
        })
    }

    deleteStep(stepId, stepLength) {
        // Create a new representation of recipeData
        let newRecipeData = this.state.recipeData;
        newRecipeData.steps = newRecipeData.steps.filter(
            function (terminator) {
                return terminator.step_id !== stepId
            });

        // Subtract the step's length from the updated recipe
        newRecipeData.length -= stepLength;

        // Update the backend, then update state
        this.saveUpdatedRecipe({
            recipeData: newRecipeData,
            hasSteps: newRecipeData.steps.length > 0,
            nextStep: this.findHighestStep(newRecipeData.steps) + 1
        });

        // Update the length on the main recipe table
        this.props.updateRecipeLength(newRecipeData.id, newRecipeData.length);
    }

    render() {
        return (
            <div className="recipe-detail-summary">
                <PageTitle title={this.state.recipeData.name}
                           includeHr={true}/>
                {/*TODO: Move the title to the header bar */}

                <RecipePageAttributes difficulty={this.state.recipeData.difficulty}
                                      source={this.state.recipeData.source}
                                      author={this.state.recipeData.author}
                                      url={this.state.recipeData.url ? this.state.recipeData.url : ""}
                                      length={this.state.recipeData.length}
                                      toggleEditMode={this.toggleEditMode}/>

                <RecipeStartFinish start_time={this.state.recipeData.start_time}
                                   solve_for_start={this.state.recipeData.solve_for_start}
                                   length={this.state.recipeData.length}
                                   handleUpdateStartTime={this.handleUpdateStartTime}
                                   handleStartFinishToggle={this.handleStartFinishToggle}
                                   saveRecipe={this.handleSaveRecipe}/>

                <StepContainer steps={this.state.recipeData.steps}
                               start_time={this.state.recipeData.start_time}
                               solve_for_start={this.state.recipeData.solve_for_start}
                               length={this.state.recipeData.length}
                               hidden={!this.state.editMode}
                               toggleEditMode={this.toggleEditMode}
                               hasData={this.state.hasData}
                               handleStepLengthChange={this.handleStepLengthChange}
                               deleteStep={this.deleteStep}/>

                <AddStep nextStep={this.state.nextStep}
                         addStepToRecipe={this.addStepToRecipe}
                         hidden={!this.state.editMode}
                         toggleEditMode={this.toggleEditMode}/>

            </div>
        )
    }
}

RecipePage.defaultProps = {
    recipeId: 0,
    recipeData: {
        id: 0,
        difficulty: "Intermediate"
    },
    hasData: false
}

export default RecipePage;
