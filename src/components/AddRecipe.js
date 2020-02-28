import React from 'react';

class AddRecipe extends React.Component {
    constructor() {
        super();
        this.state = {
            recipeName: "",
            recipeDifficulty: "Intermediate",
            recipeAuthor: "",
            recipeSource: ""
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        const {name, value} = event.target;
        this.setState({
            [name]: value
        })
    }

    handleSubmit(event) {
        let recipe_data = {
            name: this.state.recipeName,
            difficulty: this.state.recipeDifficulty,
            author: this.state.recipeAuthor,
            source: this.state.recipeSource
        };

        console.log("About to POST the state object: ", recipe_data);

        // Don't refresh the page yet
        event.preventDefault();

        // Send a POST request to the API
        fetch("http://localhost:5000/api/v1/recipes", {
            method: "POST",
            body: JSON.stringify(recipe_data)
        })
            .then(response => {
                console.log("POST complete!");
                console.log(JSON.stringify(recipe_data))
            });

        // Now we can refresh the page
        window.location.reload(true);
    }

    render() {
        return (
            <div className="add-recipe">
                <form className="add-recipe-form" onSubmit={this.handleSubmit}>
                    <label>Name &nbsp;
                        <input type="text"
                               name="recipeName"
                               placeholder="Recipe Name"
                               value={this.state.recipeName}
                               onChange={this.handleChange}
                               required={true}
                        />
                    </label>
                    <br/>
                    <label>
                        Difficulty &nbsp;
                        <select value={this.state.recipeDifficulty} onChange={this.handleChange}
                                required={true}>
                            <option value="Beginner">Beginner</option>
                            <option defaultValue="Intermediate" value="Intermediate">Intermediate
                            </option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </label>
                    <br/>
                    {/*<label>*/}
                    {/*    Length &nbsp;*/}
                    {/*    <input type="text"*/}
                    {/*           name="recipeLength"*/}
                    {/*           placeholder="Automatic"*/}
                    {/*           disabled={true}*/}
                    {/*    />*/}
                    {/*</label>*/}
                    {/*<br/>*/}
                    <label>
                        Author &nbsp;
                        <input type="text"
                               name="recipeAuthor"
                               placeholder="Author"
                               value={this.state.recipeAuthor}
                               onChange={this.handleChange}
                        />
                    </label>
                    <br/>
                    <label>
                        Source &nbsp;
                        <input type="text"
                               name="recipeSource"
                               placeholder="Source"
                               value={this.state.recipeSource}
                               onChange={this.handleChange}
                        />
                    </label>
                    <br/>
                    <input type="submit" value="Submit"/>
                </form>
            </div>
        )
    }
}

export default AddRecipe;
