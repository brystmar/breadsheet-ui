import React from 'react';

class AddRecipe extends React.Component {
    constructor() {
        super();
        this.state = {
            name: "",
            difficulty: "Intermediate",
            author: "",
            source: "",
            visible: true
        };
        this.handleFormToggle = this.handleFormToggle.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.resetDefaults = this.resetDefaults.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    static defaultProps = {
        difficulty: "Intermediate"
    };

    handleFormToggle() {
        // console.log("Clicked handleFormToggle");
        this.setState({
            visible: !this.state.visible
        });
        // console.log("State.visible is now:", this.state.visible);
        // this.state.visible ? ( do something ) : (do something else);
    }

    handleChange(event) {
        const {name, value} = event.target;
        this.setState({
            [name]: value
        })
    }

    resetDefaults() {
        this.setState({
            name: "",
            difficulty: "Intermediate",
            author: "",
            source: "",
            visible: true
        })
    }

    handleSubmit(event) {
        console.log("New recipe submitted:", this.state);
        let stateCopy = this.state;
        delete stateCopy.visible;

        // Don't refresh the page
        event.preventDefault();

        // POST new recipe to the backend
        fetch("http://localhost:5000/api/v1/recipes", {
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
                this.resetDefaults();

                // Update state of the RecipeTable component using the provided function
                this.props.render(result.data);
            })
    }

    render() {
        return (
            <div className="add-recipe-parent">
                <div className="add-recipe-icon">
                    <img alt="Add recipe"
                         src="https://breadsheet-public.s3-us-west-2.amazonaws.com/button_plus.png"
                         className="add-recipe-toggle-button"
                         onClick={this.handleFormToggle}/>

                    <label className="add-recipe-toggle-label" onClick={this.handleFormToggle}>
                        Add Recipe
                    </label>
                </div>

                <form className="add-recipe-form"
                      hidden={this.state.visible}
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
                           onClick={this.resetDefaults}/>
                    <input type="submit"
                           name="saveNewRecipe"
                           className="button-submit"
                           disabled={this.state.visible}
                           value="Submit"/>
                </form>
            </div>
        )
    }
}

export default AddRecipe;
