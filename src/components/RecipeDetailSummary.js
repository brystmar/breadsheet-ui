// Details section displayed on the recipe-specific page.
// Data: author, source, total time, difficulty, date added.
import React from 'react';
import PageTitle from "./PageTitle";
import seconds_to_string from "../scripts/seconds_to_string";

class RecipeDetailSummary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recipeId: 0,
            recipeData: {}
        };
    }

    componentDidMount() {
        console.log("recipeId:", this.props.recipeId);

        // Get the recipe details from the backend
        fetch("http://localhost:5000/api/v1/recipe/" + this.props.recipeId, {
            method: "GET"
        })
            .then(response => response.json())
            .then(result => this.setState({
                    recipeId: result.data.id,
                    recipeData: result.data
                }
            ));
    }

    render() {
        return (
            <div className="recipe-detail-summary">
                <PageTitle title={this.state.recipeData.name}/>
                <hr/>

                <table className="recipe-detail-summary-table">
                    <tbody>
                    <tr>
                        <td className="recipe-detail-summary-table-label">Difficulty:</td>
                        <td className="recipe-detail-summary-table-value">{this.state.recipeData.difficulty}</td>
                        <td className="recipe-detail-summary-table-label">Source:</td>
                        <td className="recipe-detail-summary-table-value">{this.state.recipeData.source}</td>
                    </tr>
                    <tr>
                        <td className="recipe-detail-summary-table-label">Total Time:</td>
                        <td className="recipe-detail-summary-table-value">{seconds_to_string(this.state.recipeData.length, true)}</td>
                        <td className="recipe-detail-summary-table-label">Author:</td>
                        <td className="recipe-detail-summary-table-value">{this.state.recipeData.author}</td>
                    </tr>
                    </tbody>
                </table>

            </div>
        )
    }
}

export default RecipeDetailSummary;
