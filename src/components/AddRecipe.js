import React, { useState } from "react";
import BtnAdd from "./buttons/BtnAdd";
import { v4 as uuid } from "uuid";
import map_difficulty_to_icon from "../helpers/map_difficulty_to_icon";
import { defaultRecipe } from "../data/defaultValues";
import { breadsheetApis } from "../data/endpoints";

export default function AddRecipe(props) {
    const [ state, updateState ] = useState(defaultRecipe)
    const [ isHidden, toggleIsHidden ] = useState(props.hidden)

    function handleChange(event) {
        updateState({
            ...state,
            [event.target.name]: event.target.value
        })
    }

    function handleSubmit(event) {
        // Don't refresh the page
        event.preventDefault();

        if (!state.name || state.name === "") {
            // Recipe name can't be null
            return
        }

        // Build the new object, starting with the required attributes
        let newRecipe = {
            name:       state.name,
            difficulty: state.difficulty,
            id:         uuid()
        }

        // Only include the optional attributes when provided
        if (state.author) {
            newRecipe.author = state.author;
        }

        if (state.source) {
            newRecipe.source = state.source;
        }

        if (state.url) {
            newRecipe.url = state.url;
        }

        // Reset form fields to their defaults
        updateState(defaultRecipe);

        // POST new recipe to the backend
        // TODO: When adding a single recipe, why are we POSTing to the "all" endpoint?
        console.log(`Calling endpoint: [POST] ${breadsheetApis.recipes.all}`)
        fetch(breadsheetApis.recipes.all, {
            method: "POST",
            body:   JSON.stringify(newRecipe)
        })
            .then(response => {
                // console.log("POST complete, response:", response.status, response.ok);
                return response.json();
            })
            .then(result => {
                // console.log("New recipe saved:", result.data);
                // Update state of the App --> RecipeListContainer using the provided function
                props.addRecipeToState(result.data);
            })
            .catch(error => console.error("Error submitting new recipe.", error))
    }

    return (
        <div className="add-recipe-container">
            <BtnAdd
                btnText="New Recipe"
                altText="Toggles display of the 'Add new recipe' form"
                isCollapsed={!isHidden}
                onClickFn={() => toggleIsHidden(!isHidden)}
            />

            {isHidden ?
                null :
                <form
                    className="add-recipe-form"
                    id="add-recipe-form"
                    // onSubmit={handleSubmit}
                >
                        <span className="add-recipe-form-group">
                            <label htmlFor="name" className="add-recipe-form-label">
                                Recipe Name
                            </label>
                            <input
                                className="add-recipe-form-input-group"
                                type="text"
                                name="name"
                                id="name"
                                placeholder="Neapolitan Pizza Dough"
                                value={state.name}
                                onChange={handleChange}
                                required={true}
                            />
                        </span>

                    <span className="add-recipe-form-group">
                            <label htmlFor="difficulty" className="add-recipe-form-label">
                                Difficulty
                            </label>
                            <span className="add-recipe-form-input-group picklist-group">
                                <select
                                    className="input-picklist"
                                    name="difficulty"
                                    id="difficulty"
                                    value={state.difficulty}
                                    onChange={handleChange}
                                    required={true}
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                    <option value="Iron Chef">Iron Chef</option>
                                </select>
                                {map_difficulty_to_icon(state.difficulty)}
                            </span>
                        </span>

                    <span className="add-recipe-form-group">
                            <label htmlFor="author" className="add-recipe-form-label">
                                Author
                            </label>
                            <input
                                className="add-recipe-form-input-group"
                                type="text"
                                name="author"
                                id="author"
                                placeholder="Kenji Lopez-Alt"
                                value={state.author}
                                onChange={handleChange}
                            />
                        </span>

                    <span className="add-recipe-form-group">
                            <label htmlFor="source" className="add-recipe-form-label">
                                Source
                            </label>
                            <input
                                className="add-recipe-form-input-group"
                                type="text"
                                name="source"
                                id="source"
                                placeholder="Serious Eats"
                                value={state.source}
                                onChange={handleChange}
                            />

                        </span>

                    <span className="add-recipe-form-group">
                            <label htmlFor="url" className="add-recipe-form-label">
                                URL
                            </label>
                            <input
                                className="add-recipe-form-input-group"
                                type="text"
                                name="url"
                                id="url"
                                placeholder="https://www.seriouseats.com/...."
                                value={state.url}
                                onChange={handleChange}
                            />
                        </span>

                    <span className="add-recipe-form-group button-group">
                        <button
                            type="submit"
                            name="saveNewRecipe"
                            className="btn btn-submit"
                            disabled={isHidden}
                            onClick={handleSubmit}
                        >
                            Submit
                        </button>
                    </span>
                </form>
            }
        </div>
    )
}

AddRecipe.defaultProps = {
    name:       "",
    difficulty: "Beginner",
    author:     "",
    source:     "",
    url:        "",
    hidden:     true
}
