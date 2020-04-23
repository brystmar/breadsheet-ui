import React from 'react';
import {seconds_to_hhmm, pad} from '../scripts/time_display_functions';
import Moment from 'react-moment';

class StepListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            thenWaitHH: pad(0),
            thenWaitMM: pad(0),
            thenWait: 0
        };

        this.padValue = this.padValue.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        let [hours, minutes] = seconds_to_hhmm(this.props.then_wait);

        this.setState({
            thenWaitHH: pad(hours),
            thenWaitMM: pad(minutes),
            thenWait: this.props.then_wait
        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // console.log("Updated SLI", this.props.stepNumber);
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        // console.log("Step", this.props.stepNumber.toString() + ":", "thisP:", this.props.then_wait,
        //     "nextP:", nextProps.then_wait, "thisSt:", this.state.thenWait, "nextSt:",
        //     nextState.thenWait);

        if (this.state !== nextState
            || this.props.step_id !== nextProps.step_id
            || this.props.stepNumber !== nextProps.stepNumber
            || this.props.when !== nextProps.when
            || this.props.text !== nextProps.text
            || this.props.then_wait !== nextProps.then_wait
            || this.props.note !== nextProps.note) {
            return true
        } else {
            return false
        }
    }

    handleChange(event) {
        const {name, value} = event.target;
        this.setState({
            [name]: Number(value)
        });

        // If a thenWaitXX value changes, update the state on RecipeDetailSummary
        if (name === "thenWaitHH") {
            this.props.handleStepLengthChange(event, this.props.stepNumber,
                (value * 3600) + (this.state.thenWaitMM * 60));

        } else if (name === "thenWaitMM") {
            this.props.handleStepLengthChange(event, this.props.stepNumber,
                (this.state.thenWaitHH * 3600) + (value * 60));
        }
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

    render() {
        return (
            <tr className="step-table-list-item">
                <td className="delete-recipe-button-column">
                    <img alt={"Delete step " + this.props.stepNumber}
                         src="./button_minus.png"
                         className="delete-recipe-button"
                         onClick={() => this.props.deleteStep(this.props.step_id, this.props.then_wait)}/>
                </td>

                <td className="step-table-list-item-number">
                    {this.props.stepNumber}
                </td>

                <td className="step-table-list-item-when">
                    <Moment format="ddd HH:mm">{this.props.when}</Moment>
                </td>

                <td className="step-table-list-item-text">{this.props.text}</td>

                <td className="step-table-list-item-then-wait">
                    <input type="number"
                           min="00"
                           max="99"
                           name="thenWaitHH"
                           value={this.state.thenWaitHH}
                           onChange={this.handleChange}
                           onBlur={this.padValue}
                           className="then-wait-hh-input"
                    />
                    :
                    <input type="number"
                           min="00"
                           max="59"
                           name="thenWaitMM"
                           value={this.state.thenWaitMM}
                           onChange={this.handleChange}
                           onBlur={this.padValue}
                           className="then-wait-mm-input"
                    />
                </td>

                <td className="step-table-list-item-note">
                    {this.props.note === "None" ? "" : this.props.note}
                </td>

                <td className="step-table-list-item-id">
                    {/*TODO: Remove once Prod data is updated. */}
                    {this.props.step_id ? this.props.step_id.slice(0, 4) : "n/a"}
                </td>
            </tr>
        )
    }
}

export default StepListItem;
