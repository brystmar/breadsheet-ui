import React, { useState } from 'react';
import BtnAdd from './buttons/BtnAdd';
import BtnSubmit from './buttons/BtnSubmit';
import { v4 as uuid } from 'uuid';
import map_difficulty_to_icon from '../scripts/map_difficulty_to_icon';
import { defaultRecipe } from "../data/defaultValues";


function AddRecipeNew(props) {
    const [ state, updateState ] = useState(defaultRecipe)
    const [ isHidden, toggleIsHidden ] = useState(props.hidden)

    function handleChange() {
        // TODO: Modify function
    }

    function handleSubmit() {
        // TODO: Modify function
    }

    return (
        <div className="add-recipe-container">
            <BtnAdd
                btnText="New Recipe"
                altText="Toggles display of the 'Add new recipe' form"
                isCollapsed={!isHidden}
                onClickFn={toggleIsHidden(!isHidden)}
            />

            {state.hidden ?
                "" :
                <form
                    className="add-recipe-form"
                    id="add-recipe-form"
                    onSubmit={handleSubmit}
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
                                onChange={(event) =>
                                    updateState({ name: event.target.value, ...state })}
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
                            <BtnSubmit
                                btnName="saveNewRecipe"
                                btnText="Submit"
                                disabled={state.hidden}
                                onClickFn={handleSubmit}
                            />
                        </span>
                </form>
            }
        </div>
    )
}

AddRecipeNew.defaultProps = {
    name:       "",
    difficulty: "Beginner",
    author:     "",
    source:     "",
    url:        "",
    hidden:     true
}

// TODO: Refactor to functional component
class AddRecipe extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name:       "",
            difficulty: "Beginner",
            author:     "",
            source:     "",
            url:        "",
            hidden:     this.props.hidden
        };

        this.handleButtonToggle = this.handleButtonToggle.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.resetAddRecipeForm = this.resetAddRecipeForm.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleButtonToggle() {
        this.setState({
            hidden: !this.state.hidden
        });
    }

    handleChange(event) {
        const { name, value } = event.target;
        this.setState({
            [name]: value
        })
    }

    resetAddRecipeForm() {
        this.setState({
            name:       "",
            difficulty: "Beginner",
            author:     "",
            source:     "",
            url:        "",
            hidden:     true
        })
        // this.props.toggleEditMode(false);
    }

    handleSubmit(event) {
        // console.log("New recipe submitted:", this.state);
        let stateCopy = { ...this.state };
        stateCopy.id = uuid();
        delete stateCopy.hidden;
        // console.log("StateCopy:", stateCopy);

        // Don't refresh the page
        event.preventDefault();

        // POST new recipe to the backend
        // console.log("Calling endpoint: [POST]", process.env.REACT_APP_BACKEND_URL + "/api/v1/recipes")
        fetch(process.env.REACT_APP_BACKEND_URL + "/api/v1/recipes", {
            method: "POST",
            body:   JSON.stringify(stateCopy)
        })
            .then(response => {
                // console.log("POST complete, response:", response.status, response.ok);
                return response.json();
            })
            .then(result => {
                console.log("New recipe saved:", result.data);
                // Reset form fields to their defaults
                this.resetAddRecipeForm();

                // Update state of the RecipeListContainer component using the provided function
                this.props.addRecipeToState(result.data);
            })
            .catch(error => console.log("Error submitting new recipe:", error))
    }

    render() {
        return (
            <div className="add-recipe-container">
                <BtnAdd
                    btnText="New Recipe"
                    altText="Show or hide the 'Add new recipe' form"
                    isCollapsed={!this.state.hidden}
                    onClickFn={this.handleButtonToggle}
                />

                {this.state.hidden ?
                    "" :
                    <form
                        className="add-recipe-form"
                        id="add-recipe-form"
                        onSubmit={this.handleSubmit}
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
                                value={this.state.name}
                                onChange={this.handleChange}
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
                                    value={this.state.difficulty}
                                    onChange={this.handleChange}
                                    required={true}
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                    <option value="Iron Chef">Iron Chef</option>
                                </select>
                                {map_difficulty_to_icon(this.state.difficulty)}
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
                                value={this.state.author}
                                onChange={this.handleChange}
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
                                value={this.state.source}
                                onChange={this.handleChange}
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
                                value={this.state.url}
                                onChange={this.handleChange}
                            />
                        </span>

                        <span className="add-recipe-form-group button-group">
                            <BtnSubmit
                                btnName="saveNewRecipe"
                                btnText="Submit"
                                disabled={this.state.hidden}
                                onClickFn={this.handleSubmit}
                            />
                        </span>
                    </form>
                }
            </div>
        )
    }
}

AddRecipe.defaultProps = {
    name:       "",
    difficulty: "Beginner",
    author:     "",
    source:     "",
    url:        "",
    hidden:     true
}

export default AddRecipe;
export { AddRecipeNew };
