import React from 'react';
import {CSSTransition} from 'react-transition-group';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import convert_text_using_provided_list from '../scripts/convert_text_functions';

// TODO: Refactor to functional component
class ConvertTextControls extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            inputIngredients: "",
            inputDirections: "",
            outputIngredients: "",
            outputDirections: "",
            transition: false,
            textboxRows: 8,
            textboxCols: 8
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
        //   Epic CSS animations, anyone? https://daneden.github.io/animate.css/
        this.setState({
            transition: !this.state.transition
        })
    }

    resetForm() {
        this.setState({
            inputIngredients: "",
            inputDirections: "",
            outputIngredients: "",
            outputDirections: "",
            textboxRows: 8,
            textboxCols: 10
        })
    }

    render() {
        const inputIngredientsPlaceholder = "2.25 grams yeast\n1 1/2 teaspoons table salt...";
        const outputIngredientsPlaceholder = "2¼ g yeast\n1½ tsp table salt...";
        const inputDirectionsPlaceholder = "Preheat the oven to 350 degrees.\n\n" +
            "Meanwhile, melt 3 tablespoons butter in a 12-inch skillet over medium heat...";
        const outputDirectionsPlaceholder = "Preheat the oven to 350°.\n\n" +
            "Meanwhile, melt 3 tbsp butter in a 12\" skillet over **medium** heat...";

        return (
            <div className="text-conversion-inputs-container">
                <span className="text-conversion-group">
                    <label htmlFor="inputIngredients" className="text-conversion-label">
                        Ingredients Input
                    </label>
                    <textarea name="inputIngredients"
                              id="inputIngredients"
                              className="text-conversion-box text-conversion-input"
                              value={this.state.inputIngredients}
                              placeholder={inputIngredientsPlaceholder}
                              onChange={this.handleChange}
                              autoFocus={true}
                              tabIndex={1}
                              rows={this.state.textboxRows}
                              cols={this.state.textboxCols}/>
                </span>

                <span className="text-conversion-group">
                    <label htmlFor="outputIngredients" className="text-conversion-label">
                        Ingredients Output
                    </label>
                    <textarea name="outputIngredients"
                              id="outputIngredients"
                              className="text-conversion-box text-conversion-output"
                              value={this.state.outputIngredients}
                              placeholder={outputIngredientsPlaceholder}
                              readOnly={true}
                              rows={this.state.textboxRows}
                              cols={this.state.textboxCols}/>
                </span>

                <span className="text-conversion-group">
                    <label htmlFor="inputDirections" className="text-conversion-label">
                        Directions Input
                    </label>
                    <textarea name="inputDirections"
                              id="inputDirections"
                              className="text-conversion-box text-conversion-input"
                              value={this.state.inputDirections}
                              placeholder={inputDirectionsPlaceholder}
                              onChange={this.handleChange}
                              tabIndex={2}
                              rows={this.state.textboxRows}
                              cols={this.state.textboxCols}/>
                </span>

                <span className="text-conversion-group">
                    <label htmlFor="outputDirections" className="text-conversion-label">
                        Directions Output
                    </label>
                    <textarea name="outputDirections"
                              id="outputDirections"
                              className="text-conversion-box text-conversion-output"
                              value={this.state.outputDirections}
                              placeholder={outputDirectionsPlaceholder}
                              readOnly={true}
                              rows={this.state.textboxRows}
                              cols={this.state.textboxCols}/>
                </span>

                <span className="button-group">
                    <CopyToClipboard
                        text={(this.state.outputIngredients + "\n\n" + this.state.outputDirections).trim()}
                        onCopy={this.clipboardConfirmation}>
                        <button type="button"
                                name="copyToClipboard"
                                className="btn btn-save btn-clipboard"
                                tabIndex={3}>
                            Copy to Clipboard
                        </button>
                    </CopyToClipboard>

                    <CSSTransition in={this.state.transition}
                                   timeout={500}
                                   classNames="clipboard-confirmation"
                                   onEntered={this.clipboardConfirmation}>
                        <span className="clipboard-confirmation">
                            Copied!
                        </span>
                    </CSSTransition>
                </span>

                <span className="button-group">
                    <button type="button"
                            name="resetForm"
                            className="btn btn-default btn-reset"
                            onClick={this.resetForm}
                            tabIndex={4}>
                        Reset
                    </button>
                </span>
            </div>
        )
    }
}

ConvertTextControls.defaultProps = {
    ingredientsList: [],
    directionsList: []
}

export default ConvertTextControls;
