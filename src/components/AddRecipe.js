import React from 'react';

class AddRecipe extends React.Component {
    constructor() {
        super();
        this.state = {
            name: "",
            difficulty: "Intermediate",
            author: "",
            source: "",
            visible: false
        };
        this.handleFormToggle = this.handleFormToggle.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleFormToggle() {
        console.log("Clicked handleFormToggle");
        this.setState({
            visible: !this.state.visible
        });
        console.log("State.visible is now:", this.state.visible);
    }

    handleChange(event) {
        const {name, value} = event.target;
        this.setState({
            [name]: value
        })
    }

    handleSubmit(event) {
        console.log("New recipe submitted:", this.state);

        // Don't refresh the page
        event.preventDefault();

        // POST new recipe to the backend
        fetch("http://localhost:5000/api/v1/recipes", {
            method: "POST",
            body: JSON.stringify(this.state)
        })
            .then(response => {
                console.log("POST complete!");
                console.log(JSON.stringify(this.state))
            });

        // Refresh the page to reflect changes
        window.location.reload(true);
    }

    render() {
        return (
            <div className="add-recipe">
                <img alt="Add recipe"
                     src="https://breadsheet-public.s3-us-west-2.amazonaws.com/button_plus.png"
                     className="add-recipe-toggle-button"
                     onClick={this.handleFormToggle}/>
                <label className="add-recipe-toggle-label"
                       onClick={this.handleFormToggle}>Add Recipe</label>

                <form className="add-recipe-form" onSubmit={this.handleSubmit}>
                    <label>Name &nbsp;
                        <input type="text"
                               name="name"
                               placeholder="Recipe Name"
                               value={this.state.name}
                               onChange={this.handleChange}
                               required={true}
                        />
                    </label>
                    <br/>
                    <label>
                        Difficulty &nbsp;
                        <select value={this.state.difficulty} onChange={this.handleChange}
                                name="difficulty" required={true}>
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
                    {/*           name="length"*/}
                    {/*           placeholder="Automatic"*/}
                    {/*           disabled={true}*/}
                    {/*    />*/}
                    {/*</label>*/}
                    {/*<br/>*/}
                    <label>
                        Author &nbsp;
                        <input type="text"
                               name="author"
                               placeholder="Optional"
                               value={this.state.author}
                               onChange={this.handleChange}
                        />
                    </label>
                    <br/>
                    <label>
                        Source &nbsp;
                        <input type="text"
                               name="source"
                               placeholder="Optional"
                               value={this.state.source}
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
