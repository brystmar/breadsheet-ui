import React from 'react';
import {CSSTransition} from 'react-transition-group';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import convert_text_using_provided_list from '../scripts/convert_text_functions';

class ConvertTextControls extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            inputIngredients: "",
            inputDirections: "",
            outputIngredients: "",
            outputDirections: "",
            transition: false
        }

        this.handleChange = this.handleChange.bind(this);
        this.clipboardConfirmation = this.clipboardConfirmation.bind(this);
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
            // Convert the relevant text
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

    clipboardConfirmation() {
        // Briefly display a confirmation that text was copied to the clipboard
        // Consider some epic CSS animations from https://daneden.github.io/animate.css/
        this.setState({
            transition: !this.state.transition
        })
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
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                </tr>
                <tr className="text-conversion-table-textarea">
                    <td>
                        <textarea name="inputIngredients"
                                  value={this.state.inputIngredients}
                                  placeholder="Input"
                                  onChange={this.handleChange}
                                  autoFocus={true}
                                  tabIndex={1}
                                  rows={12}
                                  cols={50}/>
                    </td>
                    <th className="text-conversion-table-arrow">
                        -->
                    </th>
                    <td>
                        <textarea name="outputIngredients"
                                  value={this.state.outputIngredients}
                                  placeholder="Output"
                                  disabled={true}
                                  rows={12}
                                  cols={50}/>
                    </td>
                </tr>
                <tr>
                    <td>&nbsp;</td>
                </tr>

                <tr className="text-conversion-table-label">
                    <td>
                        <label>
                            Directions
                        </label>
                    </td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                </tr>
                <tr className="text-conversion-table-textarea">
                    <td>
                        <textarea name="inputDirections"
                                  value={this.state.inputDirections}
                                  placeholder="Input"
                                  onChange={this.handleChange}
                                  tabIndex={2}
                                  rows={12}
                                  cols={50}/>
                    </td>
                    <th className="text-conversion-table-arrow">
                        -->
                    </th>
                    <td>
                        <textarea name="outputDirections"
                                  value={this.state.outputDirections}
                                  placeholder="Output"
                                  disabled={true}
                                  rows={12}
                                  cols={50}/>
                    </td>
                </tr>

                <tr className="text-conversion-table-buttons">
                    <td>
                        <CopyToClipboard
                            text={(this.state.outputIngredients + "\n\n" + this.state.outputDirections).trim()}
                            onCopy={this.clipboardConfirmation}>
                            <button name="copyToClipboard"
                                    className="button-clipboard"
                                    tabIndex={3}>
                                <i className="far fa-copy"/> Copy to Clipboard
                            </button>
                        </CopyToClipboard>

                        <CSSTransition in={this.state.transition}
                                       timeout={1000}
                                       classNames="clipboard-confirmation"
                                       onEntered={this.clipboardConfirmation}>
                            <span className="clipboard-confirmation">
                                Copied!
                            </span>
                        </CSSTransition>
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

ConvertTextControls.defaultProps = {
    ingredientsList: [],
    directionsList: []
}

export default ConvertTextControls;
