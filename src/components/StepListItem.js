import React from 'react';
import seconds_to_hhmm, {pad} from '../scripts/seconds_to_hhmm';

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
        // TODO: It's updating multiple times because I'm calling componentDidUpdate after it's already updated
        //   Find the replacement for componentWillUpdate and implement it instead.
        console.log("Updated SLI", this.props.stepNumber) // , "| state:", this.state);

        // let [hours, minutes] = seconds_to_hhmm(this.props.then_wait);
        //
        // this.setState({
        //     thenWaitHH: hours,
        //     thenWaitMM: minutes,
        //     thenWait: this.props.then_wait
        // })
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        // console.log("Step", this.props.stepNumber.toString() + ":", "thisP:", this.props.then_wait,
        //     "nextP:", nextProps.then_wait, "thisSt:", this.state.thenWait, "nextSt:",
        //     nextState.thenWait);

        // Only update if upcoming props or state change
        if (this.props.then_wait !== nextProps.then_wait || this.state.thenWait !== nextState.thenWait) {
            return true
        } else {
            return false
        }
    }

    handleChange(event) {
        const {name, value} = event.target;


        // If a thenWaitXX value changes, update the state on RecipeDetailSummary
        if (name === "thenWaitHH") {
            if (Number(value) < 10) {
                this.setState({
                    [name]: pad(value)
                });
            } else {
                this.setState({
                    [name]: Number(value)
                });
            }

            this.props.handleStepLengthChange(event, this.props.stepNumber,
                (value * 3600) + (this.state.thenWaitMM * 60));

        } else if (name === "thenWaitMM") {
            if (Number(value) < 10) {
                this.setState({
                    [name]: pad(value)
                });
            } else {
                this.setState({
                    [name]: Number(value)
                });
            }

            this.props.handleStepLengthChange(event, this.props.stepNumber,
                (this.state.thenWaitHH * 3600) + (value * 60));
        } else {
            this.setState({
                [name]: value
            });
        }
    }

    padValue(event) {
        const {name, value} = event.target;

        // console.log("Value:", value, "| Len:", value.length);
        if (Number(value) < 10) {
            this.setState({
                [name]: pad(value)
            })
        } else if (Number(value) >= 10 && value.length >= 3) {
            this.setState({
                [name]: Number(value)
            })
        }
    }

    render() {
        return (
            <tr className="step-table-list-item"
                id={"step-table-list-item-" + this.props.stepNumber}>
                <td className="delete-recipe-button-column">
                    <img alt={"Delete step " + this.props.stepNumber}
                         src="https://breadsheet-public.s3-us-west-2.amazonaws.com/button_minus.png"
                         className="delete-recipe-button"
                         onClick={() => this.props.deleteStep(this.props.step_id)}/>
                </td>
                <td className="step-table-list-item-number">
                    {this.props.stepNumber}
                </td>
                <td className="step-table-list-item-number">
                    {/*TODO: Remove once Prod data is updated. */}
                    {this.props.step_id ? this.props.step_id.slice(0, 4) : "n/a"}
                </td>
                <td className="step-table-list-item-when">
                    {/* TODO: Set these values dynamically instead of blindly displaying the prop value */}
                    {this.props.when}
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
                           id={"step-table-then-wait-hh-input-" + this.props.stepNumber}
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
                           id={"step-table-then-wait-mm-input-" + this.props.stepNumber}
                    />
                </td>
                <td className="step-table-list-item-note">
                    {this.props.note === "None" ? "" : this.props.note}
                </td>
            </tr>
        )
    }
}

export default StepListItem;
