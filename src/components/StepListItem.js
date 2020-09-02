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
        // console.log("Step", this.props.stepNumber.toString() + ":", "thisP:", this.props.hidden,
        //     "nextP:", nextProps.hidden, "thisSt:", this.state.hidden, "nextSt:",
        //     nextState.hidden);

        if (this.state !== nextState
            || this.props.step_id !== nextProps.step_id
            || this.props.stepNumber !== nextProps.stepNumber
            || this.props.when !== nextProps.when
            || this.props.text !== nextProps.text
            || this.props.then_wait !== nextProps.then_wait
            || this.props.note !== nextProps.note
            || this.props.hidden !== nextProps.hidden) {
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

        // If a thenWaitXX value changes, update the state on RecipePage
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
        let divClass = "step-list-row";
        if (this.props.highlight) {
            divClass += " list-row-highlighted"
        }

        return (
            <div className={divClass}>
                <span className="step-list-cell right-justify col-step">
                    {this.props.stepNumber}.
                </span>

                <span className="step-list-cell col-when">
                    <Moment format="ddd HH:mm">{this.props.when}</Moment>
                </span>

                <span className="step-list-cell col-action">
                    {this.props.text}
                </span>

                <span className="step-list-cell col-then">
                    <input type="number"
                           min="00"
                           max="99"
                           name="thenWaitHH"
                           value={this.state.thenWaitHH}
                           onChange={this.handleChange}
                           onBlur={this.padValue}
                           className="then-wait-hh-input"/>
                    :
                    <input type="number"
                           min="00"
                           max="59"
                           name="thenWaitMM"
                           value={this.state.thenWaitMM}
                           onChange={this.handleChange}
                           onBlur={this.padValue}
                           className="then-wait-mm-input"/>
                </span>

                <span className="step-list-cell col-note">
                    {this.props.note}
                </span>
            </div>
        )
    }
}

StepListItem.defaultProps = {
    step_id: 0,
    stepNumber: 0,
    text: "",
    then_wait: 0,
    note: "",
    hidden: true
}

export default StepListItem;
