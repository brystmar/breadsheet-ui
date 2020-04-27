import React from 'react';
import BackendUrlContext from '../context/BackendUrlContext';

class AddRecipe extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            difficulty: "Intermediate",
            author: "",
            source: "",
            hidden: this.props.hidden
        };

        this.handleFormToggle = this.handleFormToggle.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.resetAddRecipeForm = this.resetAddRecipeForm.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleFormToggle() {
        this.setState({hidden: !this.state.hidden});
        this.props.toggleEditMode();
    }

    handleChange(event) {
        const {name, value} = event.target;
        this.setState({
            [name]: value
        })
    }

    resetAddRecipeForm() {
        this.setState({
            name: "",
            difficulty: "Intermediate",
            author: "",
            source: "",
            hidden: true
        })
        this.props.toggleEditMode(false);
    }

    handleSubmit(event) {
        console.log("New recipe submitted:", this.state);
        let stateCopy = this.state;
        delete stateCopy.hidden;

        // Don't refresh the page
        event.preventDefault();

        // POST new recipe to the backend
        fetch(this.context + "/api/v1/recipes", {
            method: "POST",
            body: JSON.stringify(stateCopy)
        })
            .then(response => {
                console.log("POST complete, response:", response.status, response.ok);
                return response.json();
            })
            .then(result => {
                console.log("New recipe saved:", result.data);
                // Reset form fields to their defaults
                this.resetAddRecipeForm();

                // Update state of the RecipeTable component using the provided function
                this.props.addRecipeToState(result.data);
            })
    }

    render() {
        return (
            <div className="add-recipe-parent">
                <div className="add-recipe-icon">
                    <img alt="Add recipe"
                         src="./button_plus.png"
                         className="add-recipe-toggle-button"
                         onClick={this.handleFormToggle}/>

                    <label className="add-recipe-toggle-label" onClick={this.handleFormToggle}>
                        Add Recipe
                    </label>
                </div>

                <form className="add-recipe-form"
                      hidden={this.state.hidden}
                      onSubmit={this.handleSubmit}>
                    <label className="add-recipe-form-label">
                        Name
                    </label>
                    <input className="add-recipe-form-textbox"
                           type="text"
                           name="name"
                           placeholder="Recipe Name"
                           value={this.state.name}
                           onChange={this.handleChange}
                           required={true}
                    />

                    <br/>

                    <label className="add-recipe-form-label">
                        Difficulty
                    </label>
                    <select className="add-recipe-form-picklist"
                            name="difficulty"
                            value={this.state.difficulty}
                            onChange={this.handleChange}
                            required={true}>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Iron Chef">Iron Chef</option>
                    </select>

                    <br/>

                    <label className="add-recipe-form-label">
                        Author
                    </label>
                    <input className="add-recipe-form-textbox"
                           type="text"
                           name="author"
                           placeholder="Optional"
                           value={this.state.author}
                           onChange={this.handleChange}
                    />

                    <br/>

                    <label className="add-recipe-form-label">
                        Source
                    </label>
                    <input className="add-recipe-form-textbox"
                           type="text"
                           name="source"
                           placeholder="Optional"
                           value={this.state.source}
                           onChange={this.handleChange}
                    />

                    <br/>
                    <input type="button"
                           name="cancelNewRecipe"
                           className="button-cancel"
                           value="Cancel"
                           onClick={this.resetAddRecipeForm}/>
                    <input type="submit"
                           name="saveNewRecipe"
                           className="button-submit"
                           disabled={this.state.hidden}
                           value="Submit"/>
                </form>
            </div>
        )
    }
}

AddRecipe.defaultProps = {
    difficulty: "Intermediate",
    hidden: true
}

AddRecipe.contextType = BackendUrlContext;

export default AddRecipe;
