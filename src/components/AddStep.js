import React from 'react';
import BtnAdd from './buttons/BtnAdd';
import BtnSubmit from './buttons/BtnSubmit';
import useStep from '../hooks/useStep';
import {defaultStep} from '../data/defaultValues';
import {pad} from '../scripts/time_display_functions';
import {v4 as uuid} from 'uuid';
import reallocate_hh_mm from "../scripts/reallocate_hh_mm";

// TODO: Validate the new functional component
function AddStepNew(props) {
    const [newStep, updateStep, handleStepChange] = useStep({
        ...defaultStep,
        number: props.nextStep
    });

    function resetAddStepForm() {
        updateStep({...defaultStep, number: props.nextStep})
        props.toggleEditMode(false);
    }

    function enforceValidStepNumber(currentNumber) {
        // Replaces the step number in case the user deletes it
        if (currentNumber === ""
            || currentNumber.isNaN
            || Number(currentNumber) <= 0) {
            updateStep({
                number: props.nextStep
            })
        }
    }

    function handleSubmit(step, event) {
        // stepNumber validation
        if (step.number <= 0) {
            updateStep({number: props.nextStep})
            return false;
        }

        // Require values for step# and text/action
        if (step.number.toString() === ""
            || step.number.isNaN
            || step.text === ""
            || step.text.isNaN) {
            return false;
        }

        // Don't refresh the page
        event.preventDefault();

        // Create an object that's congruent with the Step data model
        // TODO: Move then_wait logic into the useStep hook so we don't need
        //  to create a new object that mirrors the data model
        let newStepObject = {
            step_id: uuid(),
            number: Number(step.number),
            text: step.text,
            then_wait: (Number(step.thenWaitHH) * 3600) + (Number(step.thenWaitMM) * 60),
            note: step.note
        };

        console.log("New Step:", newStepObject);

        // Send this new step to the parent so it can update the backend
        props.addStepToRecipe(newStepObject, newStepObject.then_wait);
        resetAddStepForm();
    }


    return (
        <div className="add-step-container">
            <BtnAdd btnText="New Step"
                    altText="Show or hide the 'Add new step' form"
                    onClickFn={props.toggleEditMode}/>

            {props.hidden ?
                "" :
                <form className="add-step-form"
                      id="add-step-form"
                      onSubmit={handleSubmit(newStep)}>

                        <span className="add-step-form-group">
                            <label htmlFor="number" className="add-step-form-label">
                                Step
                            </label>
                            <span className="add-step-form-input-group">
                                <input className="add-step-form-input-number"
                                       type="number"
                                       min="1"
                                       max="99"
                                       name="stepNumber"
                                       id="number"
                                       placeholder="#"
                                       value={newStep.number}
                                       onChange={handleStepChange}
                                       onBlur={enforceValidStepNumber(newStep.number)}
                                       required={true}/>
                            </span>
                        </span>

                    <span className="add-step-form-group">
                            <label htmlFor="action" className="add-step-form-label">
                                Action
                            </label>
                            <input className="add-step-form-input-group"
                                   type="text"
                                   name="text"
                                   id="action"
                                   placeholder="Mix the dough"
                                   value={newStep.text}
                                   onChange={handleStepChange}
                                   required={true}/>
                        </span>

                    <span className="add-step-form-group">
                            <label htmlFor="then-wait-hh" className="add-step-form-label">
                                Then Wait...
                            </label>
                            <span className="add-step-form-input-group">
                                <input className="then-wait-hh-input"
                                       type="number"
                                       min="0"
                                       max="99"
                                       name="thenWaitHH"
                                       id="then-wait-hh"
                                       placeholder="h"
                                       value={newStep.thenWaitHH}
                                       onChange={handleStepChange}
                                       onBlur={reallocate_hh_mm(
                                           newStep.thenWaitHH,
                                           newStep.thenWaitMM,
                                           updateStep)}/>
                                <span className="then-wait-helper-text">hrs</span>

                                <input className="then-wait-mm-input"
                                       type="number"
                                       min="0"
                                       max="59"
                                       name="thenWaitMM"
                                       id="then-wait-mm"
                                       placeholder="m"
                                       value={newStep.thenWaitMM}
                                       onChange={handleStepChange}
                                       onBlur={reallocate_hh_mm(
                                           newStep.thenWaitHH,
                                           newStep.thenWaitMM,
                                           updateStep)}/>
                                <span className="then-wait-helper-text">min</span>
                            </span>
                        </span>

                    <span className="add-step-form-group">
                            <label htmlFor="note" className="add-step-form-label">
                                Note
                            </label>
                            <input className="add-step-form-input-group"
                                   type="text"
                                   name="note"
                                   id="note"
                                   placeholder="Rest until size doubles, 2 to 4 hrs"
                                   value={newStep.note}
                                   onChange={handleStepChange}/>
                        </span>

                    <span className="add-step-form-group button-group">
                        <BtnSubmit btnName="saveNewStep"
                                   btnText="Submit"
                                   disabled={newStep.hidden}
                                   onClickFn={handleSubmit(newStep)}/>
                        </span>
                </form>
            }
        </div>
    )
}

AddStepNew.defaultProps = {
    hidden: true,
    nextStep: 0
}

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
        this.retainStep = this.retainStep.bind(this);
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

    retainStep(event) {
        // Replaces the step number if the user deletes it
        if (event.target.value === "" || event.target.value.isNaN) {
            this.setState({
                [event.target.name]: this.props.nextStep
            })
        }
    }

    padValue(event) {
        // Adds zero-padding to single-digit numbers.
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

        // Require values for step# and text/action
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
            <div className="add-step-container">
                <BtnAdd btnText="New Step"
                        altText="Show or hide the 'Add new step' form"
                        onClickFn={this.handleButtonToggle}/>

                {this.state.hidden ?
                    "" :
                    <form className="add-step-form"
                          id="add-step-form"
                          onSubmit={this.handleSubmit}>

                        <span className="add-step-form-group">
                            <label htmlFor="number" className="add-step-form-label">
                                Step
                            </label>
                            <span className="add-step-form-input-group">
                                <input className="add-step-form-input-number"
                                       type="number"
                                       min="1"
                                       max="99"
                                       name="stepNumber"
                                       id="number"
                                       placeholder="#"
                                       value={this.state.stepNumber}
                                       onChange={this.handleChange}
                                       onBlur={this.retainStep}
                                       required={true}/>
                            </span>
                        </span>

                        <span className="add-step-form-group">
                            <label htmlFor="action" className="add-step-form-label">
                                Action
                            </label>
                            <input className="add-step-form-input-group"
                                   type="text"
                                   name="text"
                                   id="action"
                                   placeholder="Mix the dough"
                                   value={this.state.text}
                                   onChange={this.handleChange}
                                   required={true}/>
                        </span>

                        <span className="add-step-form-group">
                            <label htmlFor="then-wait-hh" className="add-step-form-label">
                                Then Wait...
                            </label>
                            <span className="add-step-form-input-group">
                                <input className="then-wait-hh-input"
                                       type="number"
                                       min="0"
                                       max="99"
                                       name="thenWaitHH"
                                       id="then-wait-hh"
                                       placeholder="h"
                                       value={this.state.thenWaitHH}
                                       onChange={this.handleChange}
                                       onBlur={this.padValue}/>
                                <span className="then-wait-helper-text">hrs</span>

                                <input className="then-wait-mm-input"
                                       type="number"
                                       min="0"
                                       max="59"
                                       name="thenWaitMM"
                                       id="then-wait-mm"
                                       placeholder="m"
                                       value={this.state.thenWaitMM}
                                       onChange={this.handleChange}
                                       onBlur={this.padValue}/>
                                <span className="then-wait-helper-text">min</span>
                            </span>
                        </span>

                        <span className="add-step-form-group">
                            <label htmlFor="note" className="add-step-form-label">
                                Note
                            </label>
                            <input className="add-step-form-input-group"
                                   type="text"
                                   name="note"
                                   id="note"
                                   placeholder="Rest until size doubles, 2 to 4 hrs"
                                   value={this.state.note}
                                   onChange={this.handleChange}/>
                        </span>

                        <span className="add-step-form-group button-group">
                        <BtnSubmit btnName="saveNewStep"
                                   btnText="Submit"
                                   disabled={this.state.hidden}
                                   onClickFn={this.handleSubmit}/>
                        </span>
                    </form>
                }
            </div>
        )
    }
}

AddStep.defaultProps = {
    hidden: true,
    nextStep: 0
}

export default AddStep;
export {AddStepNew};