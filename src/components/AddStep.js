import React from 'react';
import Button from 'react-bootstrap/Button';
import { pad } from '../scripts/time_display_functions';
import { v4 as uuid } from 'uuid';

class AddStep extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stepNumber: 1,
            thenWaitHH: pad(0),
            thenWaitMM: pad(0),
            text: "",
            note: "",
            hidden: this.props.hidden
        };

        this.handleButtonToggle = this.handleButtonToggle.bind(this);
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

    handleButtonToggle() {
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
        });
        this.props.toggleEditMode(false);
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
        if (this.state.stepNumber === ""
            || this.state.stepNumber.isNaN
            || this.state.text === ""
            || this.state.text.isNaN) {
            return false;
        }

        // Don't refresh the page
        event.preventDefault();

        // Create an object that's congruent with the Step data model
        let newStep = {
            step_id: uuid(),
            number: Number(this.state.stepNumber),
            text: this.state.text,
            then_wait: (Number(this.state.thenWaitHH) * 3600) + (Number(this.state.thenWaitMM) * 60),
            note: this.state.note
        };

        console.log("New Step:", newStep);

        // Send this new step to the parent so it can update the backend
        // console.log("New step to add:", newStep);
        this.props.addStepToRecipe(newStep, newStep.then_wait);
        this.resetAddStepForm();
    }

    render() {
        return (
            <div className="add-step-parent">
                <button type="button"
                        className="btn-add-recipe-or-step"
                        onClick={this.handleButtonToggle}>
                    <img alt="Add a new step"
                         src="/icons/button_plus.png"
                         className="add-recipe-or-step-toggle-button icon-transparent"/>
                    New Step
                </button>

                <form className="add-recipe-form"
                      hidden={this.state.hidden}
                      onSubmit={this.handleSubmit}>

                    <label className="add-step-form-number-label">Step #</label>
                    <input className="add-recipe-form-number"
                           type="number"
                           min="1"
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

                    <Button variant="danger"
                            type="button"
                            name="cancelNewStep"
                            className="button-cancel"
                            size="sm"
                            onClick={this.resetAddStepForm}>Cancel</Button>
                    &nbsp;
                    <Button variant="primary"
                            type="submit"
                            name="saveNewStep"
                            className="button-submit"
                            disabled={this.state.hidden}
                            size="sm"
                            onClick={this.handleSubmit}>Submit</Button>
                </form>
            </div>
        )
    }
}

AddStep.defaultProps = {
    hidden: true,
    nextStep: 0
}

export default AddStep;
