import React from 'react';
import {pad} from "../scripts/seconds_to_hhmm";

class AddStep extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stepNumber: 0,
            thenWaitHH: pad(0),
            thenWaitMM: pad(0),
            text: "",
            note: "",
            hidden: false
        };

        this.handleFormToggle = this.handleFormToggle.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.padValue = this.padValue.bind(this);
        this.resetAddStepForm = this.resetAddStepForm.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.nextStep !== this.props.nextStep) {
            this.setState({
                stepNumber: this.props.nextStep
            })
        }
    }

    handleFormToggle() {
        // console.log("Clicked handleFormToggle. State.hidden is now:", !this.state.hidden);
        this.setState({
            hidden: !this.state.hidden
        });
    }

    handleChange(event) {
        const {name, value} = event.target;
        this.setState({
            [name]: value
        });
    }

    padValue(event) {
        // Adds zero-padding to single digit numbers.
        // Also re-calculates hours & minutes if ThenWaitMM >= 60.
        const {name, value} = event.target;
        const numValue = Number(value);

        // Re-allocate minutes if ThenWaitMM value is >= 60
        if (name === "thenWaitMM" && numValue >= 60) {
            let hours = Math.floor(numValue / 60) + Number(this.state.thenWaitHH);
            let minutes = numValue % 60;

            this.setState({
                thenWaitHH: pad(hours),
                thenWaitMM: pad(minutes)
            })
        } else if (numValue >= 0 && numValue < 10) {
            this.setState({
                [name]: pad(value)
            })
        } else if (value.length >= 3 && value.toString().charAt(0) === "0") {
            // In case user enters a superfluous leading zero
            this.setState({
                [name]: numValue
            })
        }
    }

    resetAddStepForm() {
        this.setState({
            stepNumber: this.props.nextStep,
            thenWaitHH: pad(0),
            thenWaitMM: pad(0),
            thenWait: 0,
            text: "",
            note: "",
            hidden: true
        })
    }

    handleSubmit(event) {
        // stepNumber validation
        if (this.state.stepNumber <= 0) {
            this.setState({
                stepNumber: this.props.nextStep
            });
            return false;
        }

        // Require values for step# and text
        if (this.state.stepNumber === "" || this.state.stepNumber.isNaN ||
            this.state.text === "" || this.state.text.isNaN) {
            return false;
        }

        // Don't refresh the page
        event.preventDefault();

        // Create an object that's congruent with the Step data model
        let newStep = {
            number: this.state.stepNumber,
            text: this.state.text,
            then_wait: (Number(this.state.thenWaitHH) * 3600) + (Number(this.state.thenWaitMM) * 60),
            note: this.state.note
        };

        // Send this new step to the parent so it can update the backend
        // console.log("New step to add:", newStep);
        this.props.addStepToRecipe(newStep);
    }

    render() {
        return (
            <div className="add-step-parent">
                <div className="add-step-icon">
                    <img alt="Add recipe"
                         src="https://breadsheet-public.s3-us-west-2.amazonaws.com/button_plus.png"
                         className="add-recipe-toggle-button"
                         onClick={this.handleFormToggle}/>

                    <label className="add-recipe-toggle-label" onClick={this.handleFormToggle}>
                        Add Step
                    </label>
                </div>

                <form className="add-recipe-form"
                      hidden={this.state.hidden}
                      onSubmit={this.handleSubmit}>

                    <label className="add-step-form-number-label">Step #</label>
                    <input className="add-recipe-form-number"
                           type="number"
                           min="0"
                           max="99"
                           name="stepNumber"
                           placeholder="#"
                           value={this.state.stepNumber}
                           onChange={this.handleChange}
                           required={true}/>

                    <br/>

                    <label className="add-recipe-form-label">Text</label>
                    <input className="add-recipe-form-textbox"
                           type="text"
                           name="text"
                           placeholder="Text"
                           value={this.state.text}
                           onChange={this.handleChange}
                           required={true}/>

                    <br/>

                    <label className="add-recipe-form-label">Then Wait...</label>
                    <input className="then-wait-hh-input"
                           type="number"
                           min="0"
                           max="99"
                           name="thenWaitHH"
                           placeholder="h"
                           value={this.state.thenWaitHH}
                           onChange={this.handleChange}
                           onBlur={this.padValue}/>
                    :
                    <input className="then-wait-mm-input"
                           type="number"
                           min="0"
                           max="59"
                           name="thenWaitMM"
                           placeholder="m"
                           value={this.state.thenWaitMM}
                           onChange={this.handleChange}
                           onBlur={this.padValue}/>
                    <br/>

                    <label className="add-recipe-form-label">Note</label>
                    <input className="add-recipe-form-textbox"
                           type="text"
                           name="note"
                           placeholder="Optional"
                           value={this.state.note}
                           onChange={this.handleChange}/>
                    <br/>
                    <input type="button"
                           name="cancelNewStep"
                           className="button-cancel"
                           value="Cancel"
                           onClick={this.resetAddStepForm}/>
                    <input type="submit"
                           name="saveNewStep"
                           className="button-submit"
                           disabled={this.state.hidden}
                           value="Submit"
                           onClick={this.handleSubmit}/>
                </form>
            </div>
        )
    }
}

export default AddStep;
