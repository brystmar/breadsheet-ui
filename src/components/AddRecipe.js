import React from 'react';
import Button from 'react-bootstrap/Button';
import { v4 as uuid } from 'uuid';

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
        stateCopy.id = uuid();
        delete stateCopy.hidden;
        console.log("StateCopy:", stateCopy);

        // Don't refresh the page
        event.preventDefault();

        // POST new recipe to the backend
        // console.log("Calling endpoint: [POST]", process.env.REACT_APP_BACKEND_URL + "/api/v1/recipes")
        fetch(process.env.REACT_APP_BACKEND_URL + "/api/v1/recipes", {
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
                    <span className="add-recipe-toggle-text" onClick={this.handleFormToggle}>
                        <img alt="Add recipe"
                             src="./button_plus.png"
                             className="add-recipe-toggle-button"
                             onClick={this.handleFormToggle}/>
                        Add Recipe
                    </span>

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
                    <Button variant="danger"
                            name="cancelNewRecipe"
                            className="button-cancel"
                            size="sm"
                            onClick={this.resetAddRecipeForm}>Cancel</Button>
                    &nbsp;
                    <Button variant="primary"
                            type="submit"
                            name="saveNewRecipe"
                            className="button-submit"
                            disabled={this.state.hidden}
                            size="sm"
                            value="Submit">Submit</Button>
                </form>
            </div>
        )
    }
}

AddRecipe.defaultProps = {
    difficulty: "Intermediate",
    hidden: true
}

export default AddRecipe;
