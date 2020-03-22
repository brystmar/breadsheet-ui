import React from 'react';
import DatePicker from 'react-datepicker/es';

class RecipeStartEnd extends React.Component {
    constructor(props) {
        super(props);
        this.state = {finishTime: Date.now()};
        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleStartFinishToggle = this.handleStartFinishToggle.bind(this);
    }

    componentDidMount() {
        let now = Date.now();  // Storing time as an epoch

        this.setState({
            startTime: now,
            finishTime: now,
            solveForStart: true
        });
    }

    handleDateChange(newDate) {
        console.log("Called handleDateChange(" + newDate.toISOString() + ").");
        console.log(this.state.finishTime, typeof(this.state.finishTime));
        this.setState({
            startTime: newDate.getTime(),
            finishTime: newDate.getTime() + (this.props.length * 1000),
            solveForStart: this.state.solveForStart
        })
    }

    handleStartFinishToggle() {
        console.log("Called handleStartFinishToggle(). Was:", this.state.solveForStart);
        this.setState({
            startTime: this.state.startTime,
            finishTime: this.state.finishTime,
            solveForStart: !this.state.solveForStart
        })
    }

    render() {
        return (
            <div className="recipe-start-end">
                <label className="start-finish-selector"
                       id="start-finish-selector"
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

                <p>
                    Start: {JSON.stringify(this.state.startTime)}
                    <br/>
                    Finish: {JSON.stringify(this.state.finishTime)}
                </p>
            </div>
        )
    }
}

export default RecipeStartEnd;
