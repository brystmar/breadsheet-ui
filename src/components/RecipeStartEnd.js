import React from 'react';
import DatePicker from 'react-datepicker/es';

class RecipeStartEnd extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startTime: this.props.start_time,
            finishTime: this.props.start_time + (this.props.length * 1000),
            solveForStart: this.props.solve_for_start
        };
        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleStartFinishToggle = this.handleStartFinishToggle.bind(this);
    }

    handleDateChange(newDate) {
        console.log("Called handleDateChange(" + newDate.toISOString() + ").");
        this.setState({
            startTime: newDate.getTime(),
            finishTime: newDate.getTime() + (this.props.length * 1000),
            solveForStart: this.state.solveForStart
        });
    }

    handleStartFinishToggle() {
        console.log("Called handleStartFinishToggle(). Now:", !this.state.solveForStart);
        this.setState({
            startTime: this.state.startTime,
            finishTime: this.state.finishTime,
            solveForStart: !this.state.solveForStart
        })
    }

    render() {
        return (
            <div className="recipe-start-end">
                <label className="start-finish-toggle"
                       id="start-finish-toggle"
                       onClick={this.handleStartFinishToggle}>
                    {this.state.solveForStart ? "Start at" : "Finish at"}
                </label>

                <DatePicker
                    selected={this.state.solveForStart ? this.state.startTime : this.state.finishTime}
                    onChange={this.handleDateChange}
                    className="start-finish-datepicker"
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={30}
                    timeCaption="Time"
                    todayButton="Today"
                    useWeekdaysShort={true}
                    dateFormat="MMM dd, yyyy @ HH:mm"
                />
            </div>
        )
    }
}

export default RecipeStartEnd;
