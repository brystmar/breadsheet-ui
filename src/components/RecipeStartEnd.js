import React from 'react';
import DatePicker from 'react-datepicker/es';
// import Moment from 'react-moment';
import moment from "moment";

class RecipeStartEnd extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startTime: new Date(0).getTime(),
            finishTime: new Date(0).getTime(),
            solveForStart: true
        };

        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleStartFinishToggle = this.handleStartFinishToggle.bind(this);
    }

    componentDidMount() {
        // Initialize state from inherited props
        this.setState({
            startTime: moment(this.props.start_time).valueOf(),
            finishTime: moment(this.props.start_time).add(this.props.length, 'seconds').valueOf(),
            solveForStart: this.props.solve_for_start
        })
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        // console.log("shouldCU?", this.props !== nextProps);
        // console.log("ThisProps", this.props)
        // console.log("nextProps", nextProps);
        if (this.props !== nextProps) {
            // console.log("SCU: yes (props)");
            this.setState({
                startTime: moment(nextProps.start_time).valueOf(),
                finishTime: moment(nextProps.start_time).add(nextProps.length, 'seconds').valueOf(),
                solveForStart: nextProps.solve_for_start
            })

            return true;
        } else if (this.state !== nextState) {
            // console.log("SCU: yes (state)");
            return true;
        } else {
            // console.log("SCU: no");
            return this.state !== nextState;
        }
    }

    handleDateChange(newDate) {
        // console.log("Called handleDateChange(" + newDate.getTime() + ").");
        let newStartTime;

        if (this.props.solve_for_start) {
            // User modified startTime, so determine the new finishTime
            newStartTime = newDate.getTime();

            this.setState({
                startTime: newStartTime,
                finishTime: newStartTime + (this.props.length * 1000),
            });
        } else {
            // User modified finishTime, so determine the new startTime
            newStartTime = newDate.getTime() - (this.props.length * 1000);

            this.setState({
                startTime: newStartTime,
                finishTime: newDate.getTime(),
            });
        }

        // Update state on RecipeDetailSummary with the new start time
        this.props.handleUpdateStartTime(newStartTime);
    }

    handleStartFinishToggle() {
        // console.log("Called handleStartFinishToggle(). Now:", !this.state.solveForStart);
        this.setState({
            solveForStart: !this.state.solveForStart
        })

        // Update state on RecipeDetailSummary
        this.props.handleStartFinishToggle();
    }

    render() {
        // console.log("Raw start time:", this.props.start_time, moment(this.props.start_time).valueOf());
        return (
            <div className="recipe-start-finish">
                <table className="recipe-start-finish-table">
                    <tr>
                        <td className="recipe-start-finish-table-label">
                            <label className="start-finish-toggle-label"
                                   id="start-finish-toggle"
                                   onClick={this.handleStartFinishToggle}>
                                {this.state.solveForStart ? "Start at" : "Finish at"}
                            </label>
                        </td>
                        <td className="recipe-start-finish-table-datepicker">
                            <DatePicker
                                selected={this.state.solveForStart ?  // `selected`: the value for this object
                                    this.state.startTime :
                                    this.state.finishTime}
                                onChange={this.handleDateChange}
                                className="start-finish-datepicker"
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={30}
                                timeCaption="Time"
                                todayButton="Today"
                                useWeekdaysShort={true}
                                dateFormat="MMM dd, yyyy HH:mm"/>
                        </td>
                    </tr>
                </table>
            </div>
        )
    }
}

export default RecipeStartEnd;
