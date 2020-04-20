import React from 'react';

class ConvertText extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            inputIngredients: "",
            inputDirections: "",
            outputIngredients: "",
            outputDirections: "",
            repList: []
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.copyToClipboard = this.copyToClipboard.bind(this);
        this.resetForm = this.resetForm.bind(this);
    }

    componentDidMount() {
        // Retrieve the list of replacements from the backend
        fetch("http://localhost:5000/api/v1/replacements/all")
            .then(response => response.json())
            .then(result => {
                if (result.message === "Success") {
                    console.log("Replacements successfully retrieved.");

                    this.setState({
                        repList: result.data,
                    });
                } else {
                    console.log("Error retrieving Replacements.");
                    console.log(result.body);
                    return Promise.reject(result.status);
                }
            })
            .catch(rejection => console.log(rejection));
    }

    handleChange(event) {
        const {name, value} = event.target;
        this.setState({
            [name]: value
        })
    }

    handleSubmit(event) {
        console.log("Submitted!");
        console.log(event);

        // Don't refresh the page
        event.preventDefault();
    }

    copyToClipboard() {
        console.log("Copy to clipboard...");
        console.log(this.state);
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
                <form onSubmit={this.handleSubmit}>
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
                                <input type="submit"
                                       name="buttonConvert"
                                       value="Convert"
                                       className="button-submit"/>
                                <input type="button"
                                       name="buttonCopy"
                                       value="Copy to Clipboard"
                                       className="button-clipboard"
                                       onClick={this.copyToClipboard}/>
                                <input type="button"
                                       name="resetForm"
                                       className="button-cancel"
                                       value="Reset"
                                       onClick={this.resetForm}/>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </form>
            </div>
        )
    }
}

export default ConvertText;
