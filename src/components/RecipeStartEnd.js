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
            this.setState({
                startTime: moment(nextProps.start_time).valueOf(),
                finishTime: moment(nextProps.start_time).add(nextProps.length, 'seconds').valueOf(),
                solveForStart: nextProps.solve_for_start
            })
            // console.log("SCU: yes (props)");
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
        this.setState({
            startTime: newDate.getTime(),
            finishTime: newDate.getTime() + (this.props.length * 1000),
            solveForStart: this.state.solveForStart
        });

        // Update state on RecipeDetailSummary with the new time
        this.props.handleUST(newDate.getTime());
    }

    handleStartFinishToggle() {
        // console.log("Called handleStartFinishToggle(). Now:", !this.state.solveForStart);
        this.setState({
            solveForStart: !this.state.solveForStart
        })
    }

    render() {
        // console.log("Raw start time:", this.props.start_time, moment(this.props.start_time).valueOf());
        return (
            <div className="recipe-start-end">
                <label className="start-finish-toggle"
                       id="start-finish-toggle"
                       onClick={this.handleStartFinishToggle}>
                    {this.state.solveForStart ? "Start at" : "Finish at"}
                </label>

                <DatePicker
                    selected={this.state.solveForStart ?
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
                    dateFormat="MMM dd, yyyy HH:mm"
                />
            </div>
        )
    }
}

export default RecipeStartEnd;
