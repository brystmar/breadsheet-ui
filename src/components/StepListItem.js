import React from 'react';
import seconds_to_hhmm, {pad} from '../scripts/seconds_to_hhmm';

class StepListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.padValue = this.padValue.bind(this);
        this.handleStepChange = this.handleStepChange.bind(this);
    }

    componentDidMount() {
        let [hours, minutes] = seconds_to_hhmm(this.props.then_wait);

        this.setState({
            thenWaitHH: hours,
            thenWaitMM: minutes,
            thenWait: this.props.then_wait
        })
    }

    handleStepChange(event) {
        const {name, value} = event.target;
        console.log("Called handleStepChange for", name, value);

        // When a thenWaitXX value changes, update the state on RecipeDetailSummary
        if (name === "thenWaitHH") {
            this.props.handleStepLengthChange(event, this.props.stepNumber,
                (value * 3600) + (this.state.thenWaitMM * 60));

        } else if (name === "thenWaitMM") {
            this.props.handleStepLengthChange(event, this.props.stepNumber,
                (this.state.thenWaitHH * 3600) + (value * 60));
        }
    }

    padValue(event) {
        // TODO: How to use onBlur to pad numbers when focus is lost?
        event.target.value = pad(event.target.value);
        return event.target.value;
    }

    render() {
        let [thenWaitHours, thenWaitMinutes] = seconds_to_hhmm(this.props.then_wait);
        console.log("Render StepListItem #" + this.props.stepNumber, "Len:",
            this.props.then_wait, "HH:", thenWaitHours, "MM:", thenWaitMinutes);

        return (
            <tr className="step-table-list-item"
                id={"step-table-list-item-" + this.props.stepNumber}>
                <td className="step-table-list-item-number">{this.props.stepNumber}</td>
                <td className="step-table-list-item-when">
                    {/* TODO: Set these values dynamically instead of blindly displaying the prop value */}
                    {this.props.when}
                </td>
                <td className="step-table-list-item-text">{this.props.text}</td>
                <td className="step-table-list-item-then-wait">
                    {/* TODO: Figure out how to save these values to State & update/re-calc when changed */}
                    <input type="number"
                           min="0"
                           max="99"
                           name="thenWaitHH"
                           value={thenWaitHours}
                           onChange={this.handleStepChange}
                        // onBlur={this.padValue}
                           className="then-wait-hh-input"
                           id={"step-table-then-wait-hh-input-" + this.props.stepNumber}
                    />
                    :
                    <input type="number"
                           min="0"
                           max="59"
                           name="thenWaitMM"
                           value={thenWaitMinutes}
                           onChange={this.handleStepChange}
                        // onBlur={this.padValue}
                           className="then-wait-mm-input"
                           id={"step-table-then-wait-mm-input-" + this.props.stepNumber}
                    />
                </td>
                <td className="step-table-list-item-note">{this.props.note}</td>
            </tr>
        )
    }
}

export default StepListItem;
