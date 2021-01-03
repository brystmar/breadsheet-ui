import React, {useEffect} from 'react';
import BtnAdd from './buttons/BtnAdd';
import BtnSubmit from './buttons/BtnSubmit';
import useStep from '../hooks/useStep';
import reallocate_hh_mm from "../scripts/reallocate_hh_mm";

// TODO: Validate the new functional component
function AddStep(props) {
    const [state, dispatch] = useStep(props.nextStep);

    // Update nextStep when we receive the final props
    useEffect(() => dispatch({
        type: "UPDATE_STEP_NUMBER",
        payload: props.nextStep
    }), [props, dispatch])

    function enforceValidStepNumber(currentNumber) {
        // Replaces the step number in case the user deletes it
        if (currentNumber === ""
            || currentNumber.isNaN
            || Number(currentNumber) <= 0) {
            dispatch({
                type: "UPDATE_STEP_NUMBER",
                payload: {nextStepNumber: props.nextStep}
            });
        }
    }

    return (
        <div className="add-step-container">
            <BtnAdd btnText="New Step"
                    altText="Toggles display of the 'Add new step' form"
                    onClickFn={props.toggleEditMode}
            />

            <form className={props.hidden ? "add-step-form hidden" : "add-step-form"}
                  id="add-step-form"
                  onSubmit={(event) => {
                      console.log("AddStep Form submitted via BtnSubmit button.");

                      // Don't refresh the page
                      event.preventDefault();

                      // Call the submit function
                      dispatch({
                          type: "HANDLE_SUBMIT",
                          payload: {
                              nextStepNumber: props.nextStep,
                              addStepToRecipe: props.addStepToRecipe
                          }
                      });

                      // Ensure edit mode on the parent is false
                      props.toggleEditMode(false);
                  }}
            >
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
                               value={state.number}
                               onChange={(event) =>
                                   dispatch({
                                       type: "HANDLE_NUMBER_CHANGE",
                                       payload: event.target.value
                                   })}
                               onBlur={() => enforceValidStepNumber(state.number)}
                               required={true}
                        />
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
                           value={state.text}
                           onChange={(event) =>
                               dispatch({type: "HANDLE_TEXT_CHANGE", payload: event.target.value})}
                           required={true}
                    />
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
                               value={state.thenWaitHH}
                               onChange={(event) =>
                                   dispatch({
                                       type: "HANDLE_HH_CHANGE",
                                       payload: event.target.value
                                   })}
                               onBlur={(event) => {
                                   dispatch({
                                       type: "HANDLE_HHMM_CHANGE",
                                       payload: reallocate_hh_mm(event, state.thenWaitHH, state.thenWaitMM)
                                   })
                               }}
                        />
                        <span className="then-wait-helper-text">hrs</span>

                        <input className="then-wait-mm-input"
                               type="number"
                               min="0"
                               max="59"
                               name="thenWaitMM"
                               id="then-wait-mm"
                               placeholder="m"
                               value={state.thenWaitMM}
                               onChange={(event) =>
                                   dispatch({
                                       type: "HANDLE_MM_CHANGE",
                                       payload: event.target.value
                                   })}
                               onBlur={(event) => {
                                   dispatch({
                                       type: "HANDLE_HHMM_CHANGE",
                                       payload: reallocate_hh_mm(event, state.thenWaitHH, state.thenWaitMM)
                                   })
                               }}
                        />
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
                           value={state.note}
                           onChange={(event) =>
                               dispatch({type: "HANDLE_NOTE_CHANGE", payload: event.target.value})}
                    />
                </span>

                <span className="add-step-form-group button-group">
                    <BtnSubmit btnName="saveNewStep"
                               btnText="Submit"
                               disabled={state.hidden}
                    />
                </span>
            </form>
        </div>
    )
}

// AddStepNew.defaultProps = {
//     hidden: true,
//     nextStep: 0
// }

// class AddStep extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             stepNumber: 1,
//             thenWaitHH: pad(0),
//             thenWaitMM: pad(0),
//             text: "",
//             note: "",
//             hidden: this.props.hidden
//         };
//
//         this.handleButtonToggle = this.handleButtonToggle.bind(this);
//         this.handleChange = this.handleChange.bind(this);
//         this.retainStep = this.retainStep.bind(this);
//         this.padValue = this.padValue.bind(this);
//         this.resetAddStepForm = this.resetAddStepForm.bind(this);
//         this.handleSubmit = this.handleSubmit.bind(this);
//     }
//
//     componentDidUpdate(prevProps, prevState, snapshot) {
//         if (prevProps.nextStep !== this.props.nextStep) {
//             this.setState({
//                 stepNumber: this.props.nextStep
//             })
//         }
//     }
//
//     handleButtonToggle() {
//         this.setState({
//             hidden: !this.state.hidden
//         });
//     }
//
//     handleChange(event) {
//         const {name, value} = event.target;
//         this.setState({
//             [name]: value
//         });
//     }
//
//     retainStep(event) {
//         // Replaces the step number if the user deletes it
//         if (event.target.value === "" || event.target.value.isNaN) {
//             this.setState({
//                 [event.target.name]: this.props.nextStep
//             })
//         }
//     }
//
//     padValue(event) {
//         // Adds zero-padding to single-digit numbers.
//         // Also re-calculates hours & minutes if ThenWaitMM >= 60.
//         const {name, value} = event.target;
//         const numValue = Number(value);
//
//         // Re-allocate minutes if ThenWaitMM value is >= 60
//         if (name === "thenWaitMM" && numValue >= 60) {
//             let hours = Math.floor(numValue / 60) + Number(this.state.thenWaitHH);
//             let minutes = numValue % 60;
//
//             this.setState({
//                 thenWaitHH: pad(hours),
//                 thenWaitMM: pad(minutes)
//             })
//         } else if (numValue >= 0 && numValue < 10) {
//             this.setState({
//                 [name]: pad(value)
//             })
//         } else if (value.length >= 3 && value.toString().charAt(0) === "0") {
//             // In case user enters a superfluous leading zero
//             this.setState({
//                 [name]: numValue
//             })
//         }
//     }
//
//     resetAddStepForm() {
//         this.setState({
//             stepNumber: this.props.nextStep,
//             thenWaitHH: pad(0),
//             thenWaitMM: pad(0),
//             thenWait: 0,
//             text: "",
//             note: "",
//             hidden: true
//         });
//         this.props.toggleEditMode(false);
//     }
//
//     handleSubmit(event) {
//         // stepNumber validation
//         if (this.state.stepNumber <= 0) {
//             this.setState({
//                 stepNumber: this.props.nextStep
//             });
//             return false;
//         }
//
//         // Require values for step# and text/action
//         if (this.state.stepNumber === ""
//             || this.state.stepNumber.isNaN
//             || this.state.text === ""
//             || this.state.text.isNaN) {
//             return false;
//         }
//
//         // Don't refresh the page
//         event.preventDefault();
//
//         // Create an object that's congruent with the Step data model
//         let newStep = {
//             step_id: uuid(),
//             number: Number(this.state.stepNumber),
//             text: this.state.text,
//             then_wait: (Number(this.state.thenWaitHH) * 3600) + (Number(this.state.thenWaitMM) * 60),
//             note: this.state.note
//         };
//
//         console.log("New Step:", newStep);
//
//         // Send this new step to the parent so it can update the backend
//         // console.log("New step to add:", newStep);
//         this.props.addStepToRecipe(newStep, newStep.then_wait);
//         this.resetAddStepForm();
//     }
//
//     render() {
//         return (
//             <div className="add-step-container">
//                 <BtnAdd btnText="New Step"
//                         altText="Show or hide the 'Add new step' form"
//                         onClickFn={this.handleButtonToggle}/>
//
//                 {this.state.hidden ?
//                     "" :
//                     <form className="add-step-form"
//                           id="add-step-form"
//                           onSubmit={this.handleSubmit}>
//
//                         <span className="add-step-form-group">
//                             <label htmlFor="number" className="add-step-form-label">
//                                 Step
//                             </label>
//                             <span className="add-step-form-input-group">
//                                 <input className="add-step-form-input-number"
//                                        type="number"
//                                        min="1"
//                                        max="99"
//                                        name="stepNumber"
//                                        id="number"
//                                        placeholder="#"
//                                        value={this.state.stepNumber}
//                                        onChange={this.handleChange}
//                                        onBlur={this.retainStep}
//                                        required={true}/>
//                             </span>
//                         </span>
//
//                         <span className="add-step-form-group">
//                             <label htmlFor="action" className="add-step-form-label">
//                                 Action
//                             </label>
//                             <input className="add-step-form-input-group"
//                                    type="text"
//                                    name="text"
//                                    id="action"
//                                    placeholder="Mix the dough"
//                                    value={this.state.text}
//                                    onChange={this.handleChange}
//                                    required={true}/>
//                         </span>
//
//                         <span className="add-step-form-group">
//                             <label htmlFor="then-wait-hh" className="add-step-form-label">
//                                 Then Wait...
//                             </label>
//                             <span className="add-step-form-input-group">
//                                 <input className="then-wait-hh-input"
//                                        type="number"
//                                        min="0"
//                                        max="99"
//                                        name="thenWaitHH"
//                                        id="then-wait-hh"
//                                        placeholder="h"
//                                        value={this.state.thenWaitHH}
//                                        onChange={this.handleChange}
//                                        onBlur={this.padValue}/>
//                                 <span className="then-wait-helper-text">hrs</span>
//
//                                 <input className="then-wait-mm-input"
//                                        type="number"
//                                        min="0"
//                                        max="59"
//                                        name="thenWaitMM"
//                                        id="then-wait-mm"
//                                        placeholder="m"
//                                        value={this.state.thenWaitMM}
//                                        onChange={this.handleChange}
//                                        onBlur={this.padValue}/>
//                                 <span className="then-wait-helper-text">min</span>
//                             </span>
//                         </span>
//
//                         <span className="add-step-form-group">
//                             <label htmlFor="note" className="add-step-form-label">
//                                 Note
//                             </label>
//                             <input className="add-step-form-input-group"
//                                    type="text"
//                                    name="note"
//                                    id="note"
//                                    placeholder="Rest until size doubles, 2 to 4 hrs"
//                                    value={this.state.note}
//                                    onChange={this.handleChange}/>
//                         </span>
//
//                         <span className="add-step-form-group button-group">
//                         <BtnSubmit btnName="saveNewStep"
//                                    btnText="Submit"
//                                    disabled={this.state.hidden}
//                                    onClickFn={this.handleSubmit}/>
//                         </span>
//                     </form>
//                 }
//             </div>
//         )
//     }
// }

AddStep.defaultProps = {
    hidden: true,
    nextStep: 0
}

export default AddStep;
// export {AddStepNew};