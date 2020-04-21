import React from 'react';
import replace_text from '../scripts/replace_text';

class ConvertText extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            inputIngredients: "",
            inputDirections: "",
            outputIngredients: "",
            outputDirections: "",
            repListIngredients: [],
            repListDirections: []
        }

        this.getReplacements = this.getReplacements.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.copyToClipboard = this.copyToClipboard.bind(this);
        this.resetForm = this.resetForm.bind(this);
    }

    componentDidMount() {
        this.getReplacements("ingredients");
        this.getReplacements("directions");
    }

    getReplacements(scope) {
        // Get the list of replacements
        fetch("http://localhost:5000/api/v1/replacements/" + scope)
            .then(response => response.json())
            .then(result => {
                    if (result.message === "Success") {
                        console.log("Successfully retrieved list of", scope);

                        if (scope === "ingredients") {
                            this.setState({
                                repListIngredients: result.data,
                            });
                        } else if (scope === "directions") {
                            this.setState({
                                repListDirections: result.data,
                            });
                        }
                    } else {
                        console.log("Error retrieving", scope, "Replacements.");
                        console.log(result.body);
                        return Promise.reject(result.status);
                    }
                }
            )
            .catch(rejection => console.log(rejection));
    }

    handleChange(event) {
        const {name, value} = event.target;

        if (this.state.repListIngredients === [] || this.state.repListDirections === []) {
            // Don't run functions until we have replacement data
            this.setState({
                [name]: value
            });
        } else {
            // console.log("I:", this.state.repListIngredients);
            // console.log("D:", this.state.repListDirections);
            // Don't run functions until we have replacement data
            if (name === "inputIngredients") {
                this.setState({
                    [name]: value,
                    outputIngredients: replace_text(value, this.state.repListIngredients)
                });
            } else if (name === "inputDirections") {
                this.setState({
                    [name]: value,
                    outputDirections: replace_text(value, this.state.repListDirections)
                })
            }
        }
    }

    copyToClipboard() {
        console.log("Copy to clipboard...");
        // TODO: Figure this out
    }

    resetForm() {
        this.setState({
            inputIngredients: "",
            inputDirections: "",
            outputIngredients: "",
            outputDirections: ""
        })
    }

    render() {
        return (
            <div className="text-conversion-container">
                <table className="text-conversion-table">
                    <tbody>
                    <tr className="text-conversion-table-label">
                        <td>
                            <label>
                                Ingredients
                            </label>
                        </td>
                        <td>
                            &nbsp;
                        </td>
                        <td>

                        </td>
                    </tr>
                    <tr className="text-conversion-table-textarea">
                        <td>
                                <textarea name="inputIngredients"
                                          value={this.state.inputIngredients}
                                          placeholder="Input"
                                          onChange={this.handleChange}
                                          autoFocus={true}
                                          rows={15}
                                          cols={60}/>
                        </td>
                        <td>
                            -->
                        </td>
                        <td>
                                <textarea name="outputIngredients"
                                          value={this.state.outputIngredients}
                                          placeholder="Output"
                                          disabled={true}
                                          rows={15}
                                          cols={60}/>
                        </td>
                    </tr>

                    <tr>
                        <td>
                            &nbsp;
                        </td>
                    </tr>

                    <tr className="text-conversion-table-label">
                        <td>
                            <label>
                                Directions
                            </label>
                        </td>
                        <td>
                            &nbsp;
                        </td>
                        <td>

                        </td>
                    </tr>
                    <tr className="text-conversion-table-textarea">
                        <td>
                                <textarea name="inputDirections"
                                          value={this.state.inputDirections}
                                          placeholder="Input"
                                          onChange={this.handleChange}
                                          rows={15}
                                          cols={60}/>
                        </td>
                        <td>
                            -->
                        </td>
                        <td>
                                <textarea name="outputDirections"
                                          value={this.state.outputDirections}
                                          placeholder="Output"
                                          disabled={true}
                                          rows={15}
                                          cols={60}/>
                        </td>
                    </tr>

                    <tr className="text-conversion-table-buttons">
                        <td>
                            <label
                                className="button-clipboard"
                                onClick={this.copyToClipboard}>
                                <i className="far fa-copy"/>
                            </label>
                        </td>
                        <td>

                        </td>
                        <td>
                            <input type="button"
                                   name="resetForm"
                                   className="button-reset"
                                   value="Reset"
                                   onClick={this.resetForm}/>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}

export default ConvertText;
