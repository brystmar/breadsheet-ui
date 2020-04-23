import React from 'react';
import convert_text_using_provided_list from '../scripts/convert_text_functions';

class ConvertTextControls extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            inputIngredients: "",
            inputDirections: "",
            outputIngredients: "",
            outputDirections: ""
        }

        this.handleChange = this.handleChange.bind(this);
        this.copyToClipboard = this.copyToClipboard.bind(this);
        this.resetForm = this.resetForm.bind(this);
    }

    handleChange(event) {
        const {name, value} = event.target;

        if (this.props.ingredientsList === [] || this.state.directionsList === []) {
            // Don't run functions until we have replacement data
            this.setState({
                [name]: value
            });
        } else {
            if (name === "inputIngredients") {
                this.setState({
                    [name]: value,
                    outputIngredients: convert_text_using_provided_list(value, this.props.ingredientsList)
                });
            } else if (name === "inputDirections") {
                this.setState({
                    [name]: value,
                    outputDirections: convert_text_using_provided_list(value, this.props.directionsList)
                })
            }
        }
    }

    copyToClipboard() {
        console.log("Copy to clipboard...");
        let clipboardPromise;
        // Add some line breaks when both outputs are used
        if (this.state.outputIngredients.length > 0 && this.state.outputDirections.length > 0) {
            clipboardPromise = navigator.clipboard.writeText(
                this.state.outputIngredients + "\n\n" + this.state.outputDirections)
        } else {
            clipboardPromise = navigator.clipboard.writeText(
                this.state.outputIngredients + this.state.outputDirections)
        }

        console.log(clipboardPromise.finally(result => console.log(result)));
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
                                          tabIndex={1}
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
                                          tabIndex={2}
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
                        <button name="copyToClipboard"
                                className="button-clipboard"
                                onClick={this.copyToClipboard}
                                tabIndex={3}>
                            <i className="far fa-copy"/> Copy to Clipboard
                        </button>
                    </td>
                    <td>

                    </td>
                    <td className="text-conversion-table-reset-button-cell">
                        <button name="resetForm"
                                className="button-reset"
                                onClick={this.resetForm}
                                tabIndex={5}>
                            Reset
                        </button>
                    </td>
                </tr>
                </tbody>
            </table>
        )
    }
}

export default ConvertTextControls;
