// Layout for a recipe-specific page.
import React, { useState, useEffect } from "react";
import { breadsheetApis } from "../data/endpoints";
import { apiFetch } from "../data/api_fetch";
import PageTitle from "./PageTitle";
import RecipePageAttributes from "./RecipePageAttributes";
import RecipeStartFinish from "./RecipeStartFinish";
import StepContainer from "./StepContainer";

const defaultRecipeData = {
    id:         0,
    difficulty: "Intermediate",
    steps:      [{ step_id: 0, number: 0, text: "", then_wait: 0 }],
}

export default function RecipePage({ hasData = false, recipeId = 0, recipeData = defaultRecipeData, updateRecipeLength, updateMasterRecipeList }) {
    // Including the full recipe object in local state here because:
    //  - upstream, it's one item in a list of recipes
    //  - downstream, it's broken into smaller parts
    const [ recipe, updateRecipe ] = useState({
        data:     recipeData,
        hasData:  hasData,
        hasSteps: recipeData.steps ? recipeData.steps.length > 0 : false,
        nextStep: recipeData.steps ? findHighestStep(recipeData.steps) + 1 : 1
    })

    // TODO: Only retrieve recipe data from the backend when necessary
    useEffect(() => {
        async function getRecipeData(recipeId) {
            const recipeApi = `${breadsheetApis.recipes.single}/${recipeId}`;

            try {
                // Request recipe from the backend
                const updatedRecipeResponse = await apiFetch(recipeApi);
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
        if (recipeId.toString() !== "0") {
            getRecipeData(recipeId);
        }
    }, [ recipeId ])

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
            />

            <RecipeStartFinish
                start_time={recipe.data.start_time}
                solve_for_start={recipe.data.solve_for_start}
                length={recipe.data.length}
                handleUpdateStartTime={handleUpdateStartTime}
                handleStartFinishToggle={handleStartFinishToggle}
            />

            <StepContainer
                steps={recipe.data.steps}
                start_time={recipe.data.start_time}
                solve_for_start={recipe.data.solve_for_start}
                length={recipe.data.length}
                hasData={recipe.hasData}
                handleStepLengthChange={handleStepLengthChange}
            />
        </div>
    )
}


