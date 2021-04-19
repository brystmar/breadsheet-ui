// Layout for a recipe-specific page.
import React, { useState, useEffect } from "react";
import PageTitle from "./PageTitle";
import RecipePageAttributes from "./RecipePageAttributes";
import RecipeStartFinish from "./RecipeStartFinish";
import StepContainer from "./StepContainer";
import AddStep from "./AddStep";

export default function RecipePage(props) {
    // Including the full recipe object in local state here because:
    //  - upstream, it's one item in a list of recipes
    //  - downstream, it's broken into smaller parts
    const [ recipe, updateRecipe ] = useState({
        data:     props.recipeData,
        hasData:  props.hasData,
        hasSteps: props.recipeData.steps ? props.recipeData.steps.length > 0 : false,
        nextStep: props.recipeData.steps ? findHighestStep(props.recipeData.steps) + 1 : 1
    })

    // Tracks whether the app is currently in edit mode
    const [ editMode, toggleEditMode ] = useState(false);

    // TODO: Only retrieve recipe data from the backend when necessary
    useEffect(() => {
        async function getRecipeData(recipeId) {
            const recipeApi = `${process.env.REACT_APP_BACKEND_URL}/api/v1/recipe/${recipeId}`;

            try {
                // Request recipe from the backend
                const updatedRecipeResponse = await fetch(recipeApi);
                // Parse the response into json
                const updatedRecipeData = await updatedRecipeResponse.json();

                // Update local state
                updateRecipe({
                    data:     updatedRecipeData.data,
                    hasData:  true,
                    hasSteps: updatedRecipeData.data.steps ?
                                  updatedRecipeData.data.steps.length > 0 : false,
                    nextStep: updatedRecipeData.data.steps ?
                                  findHighestStep(updatedRecipeData.data.steps) + 1 : 1
                })
            } catch (error) {
                console.error(`Error in getRecipeData request: ${error}`);
            }
        }

        // Don't call the backend unless there's a real recipe_id to retrieve
        if (props.recipeId.toString() !== "0") {
            getRecipeData(props.recipeId);
        }
    }, [ props.recipeId ])

    function findHighestStep(stepList) {
        // Given a list of steps, return the highest step number as `int`
        let highestStep = 0;

        if (stepList.length > 0) {
            stepList.forEach((step) => {
                // Iterate through steps, updating highestStep when we find a higher step
                if (step.number > highestStep) {
                    highestStep = step.number
                }
            })
        }
        return highestStep;
    }

    // TODO: Consolidate handleStepLengthChange, handleStartFinishToggle, handleUpdateStartTime
    //  into a single update function
    function handleStepLengthChange(event, stepNumber, newThenWait) {
        // When the length of any step changes, the total recipe length must be updated
        // console.log("Called RDS.handleStepLengthChange(" + stepNumber + ").");

        let newRecipe = recipe.data;
        let newLength = 0;

        // Update then_wait for the relevant step
        newRecipe.steps[stepNumber - 1].then_wait = newThenWait;

        // Re-calculate the total recipe length
        newRecipe.steps.forEach(step => newLength += step.then_wait);
        newRecipe.length = newLength;

        // Replace the recipe object in local state
        updateRecipe({
            ...recipe,
            data: newRecipe
        })
    }

    function handleStartFinishToggle() {
        // Toggle the recipe `bool` solve_for_start
        let newRecipe = recipe.data;
        newRecipe.solve_for_start = !newRecipe.solve_for_start;

        updateRecipe({
            ...recipe,
            data: newRecipe
        })
    }

    function handleUpdateStartTime(newStartTime) {
        // Update the recipe's start time with the provided value
        // console.log(`Called handleUpStartTime w/${newStartTime}`);
        let newRecipe = recipe.data;
        newRecipe.start_time = newStartTime;

        updateRecipe({
            ...recipe,
            data: newRecipe
        })
    }

    function handleSaveRecipe() {
        console.log(`Called handleSaveRecipe w/data: ${recipe.data}`);
        props.updateOneRecipe(recipe.data.id, recipe.data);
    }

    // TODO: This async/await saveUpdatedRecipe code should replace the code on App.js
    // async function saveUpdatedRecipe(recipeToSave) {
    //     Save/update this recipe in the database
    //     console.log("Calling endpoint: [PUT]", process.env.REACT_APP_BACKEND_URL + "/api/v1/recipe/" + updatedrecipe.data.id);
    //
    //     const recipeApi = `${process.env.REACT_APP_BACKEND_URL}/api/v1/recipe/${recipeToSave.recipeData.id}`;
    //     const fetchParams = {
    //         method: "PUT",
    //         body:   JSON.stringify(recipeToSave.recipeData)
    //     }
    //
    //     try {
    //         // Make the PUT request
    //         const updatedRecipeResponse = await fetch(recipeApi, fetchParams);
    //         // Parse the response into json
    //         const updatedRecipeData = await updatedRecipeResponse.json();
    //
    //         // Response body contains the updated recipe
    //         // Update local state
    //         updateRecipe({
    //             data:     updatedRecipeData.data,
    //             hasData:  true,
    //             hasSteps: updatedRecipeData.data.steps ?
    //                           updatedRecipeData.data.steps.length > 0 : false,
    //             nextStep: updatedRecipeData.data.steps ?
    //                           findHighestStep(updatedRecipeData.data.steps) + 1 : 1
    //         })
    //
    //         // Update this recipe in the master list on App.js
    //         props.updateOneRecipe(recipeToSave.data.id, recipeToSave);
    //     } catch (error) {
    //         console.error(`Error in saveUpdatedRecipe request: ${error}`);
    //     }
    // }

    function addStepToRecipe(newStep) {
        let newRecipe = recipe.data;

        // Enforce unique step numbers
        if (newRecipe.steps.map((step) => step.number).includes(newStep.number)) {
            console.log(`Step #${newStep.number} already exists`);
            return
        }

        // Add this new step to the list
        newRecipe.steps.push(newStep);

        // Sort by step.number
        newRecipe.steps.sort((a, b) => parseFloat(a.number) - parseFloat(b.number));

        // Update the recipe length by adding then_wait from the new step
        newRecipe.length += newStep.then_wait;

        // Update this recipe in the database
        props.updateOneRecipe(newRecipe.id, newRecipe);
    }

    function deleteStep(stepId, stepLength) {
        // Create a new representation of recipeData
        let newRecipe = recipe.data;
        newRecipe.steps = newRecipe.steps.filter((step) => step.step_id !== stepId);

        // Subtract the step's length from the updated recipe
        newRecipe.length -= stepLength;

        // Update local state
        updateRecipe({
            data:     newRecipe,
            hasData:  true,
            hasSteps: true,
            nextStep: findHighestStep(newRecipe.steps) + 1
        })

        // Update the length on the main recipe table
        props.updateRecipeLength(newRecipe.id, newRecipe.length);

        // Update this recipe in the database
        props.updateOneRecipe(newRecipe.id, newRecipe);
    }

    return (
        <div className="recipe-detail-summary">
            <PageTitle
                title={recipe.data.name}
                includeHr={true}
            />

            <RecipePageAttributes
                difficulty={recipe.data.difficulty}
                source={recipe.data.source}
                author={recipe.data.author}
                url={recipe.data.url ? recipe.data.url : ""}
                length={recipe.data.length}
                toggleEditMode={toggleEditMode}
            />

            <RecipeStartFinish
                start_time={recipe.data.start_time}
                solve_for_start={recipe.data.solve_for_start}
                length={recipe.data.length}
                handleUpdateStartTime={handleUpdateStartTime}
                handleStartFinishToggle={handleStartFinishToggle}
                saveRecipe={handleSaveRecipe}
            />

            <StepContainer
                steps={recipe.data.steps}
                start_time={recipe.data.start_time}
                solve_for_start={recipe.data.solve_for_start}
                length={recipe.data.length}
                hidden={!editMode}
                toggleEditMode={toggleEditMode}
                hasData={recipe.hasData}
                handleStepLengthChange={handleStepLengthChange}
                deleteStep={deleteStep}
            />

            <AddStep
                nextStep={recipe.nextStep}
                addStepToRecipe={addStepToRecipe}
                hidden={!editMode}
                toggleEditMode={toggleEditMode}
            />
        </div>
    )
}

RecipePage.defaultProps = {
    hasData:    false,
    recipeId:   0,
    recipeData: {
        id:         0,
        difficulty: "Intermediate",
        steps:      [
            {
                step_id:   0,
                number:    0,
                text:      "",
                then_wait: 0
            }
        ],
    }
}
