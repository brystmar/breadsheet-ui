import React from 'react';
import seconds_to_hhmm, {pad} from '../scripts/seconds_to_hhmm';

class StepListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            thenWaitHH: 0,
            thenWaitMM: 0,
            thenWait: 0
        };

        this.handleChange = this.handleChange.bind(this);
        this.padValue = this.padValue.bind(this);
    }

    componentDidMount() {
        let [twhh, twmm] = seconds_to_hhmm(this.props.then_wait);

        this.setState({
            thenWaitHH: twhh,
            thenWaitMM: twmm,
            thenWait: this.props.then_wait
        })
    }

    handleChange(event) {
        const {name, value} = event.target;
        // console.log("name:", name, "[name]:", [name], "Type:", typeof ([name]));

        // Update this.state.thenWait along with the hours/minutes values
        if (name === "thenWaitHH") {
            this.setState({
                [name]: value,
                thenWait: (value * 3600) + (this.state.thenWaitMM * 60)
            })
        } else if (name === "thenWaitMM") {
            this.setState({
                [name]: value,
                thenWait: (this.state.thenWaitHH * 3600) + (value * 60)
            })
        } else {
            this.setState({
                [name]: value
            });
        }
    }

    padValue(event) {
        // TODO: How to use onBlur to pad numbers when focus is lost?
        event.target.value = pad(event.target.value);
        return event.target.value;
    }

    render() {
        if (this.props.stepNumber === 2) {
            console.log("Step #" + this.props.stepNumber, "then_wait:", this.props.then_wait,
                "twhh:", this.state.thenWaitHH, "twmm:", this.state.thenWaitMM);
        }


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
                           value={pad(this.state.thenWaitHH)}
                           onChange={this.handleChange}
                        // onBlur={this.padValue}
                           className="then-wait-hh-input"
                           id={"step-table-then-wait-hh-input-" + this.props.stepNumber}
                    />
                    :
                    <input type="number"
                           min="0"
                           max="59"
                           name="thenWaitMM"
                           value={pad(this.state.thenWaitMM)}
                           onChange={this.handleChange}
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
