import React from 'react';
import moment from 'moment';
import DatePicker from 'react-datepicker/es';

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

        // Update state on RecipePage with the new start time
        this.props.handleUpdateStartTime(newStartTime);
    }

    handleStartFinishToggle() {
        // console.log("Called handleStartFinishToggle(). Now:", !this.state.solveForStart);
        this.setState({
            solveForStart: !this.state.solveForStart
        })

        // Update state on RecipePage
        this.props.handleStartFinishToggle();
    }

    render() {
        return (
            <div className="start-finish-container">
                <span className="recipe-start-finish-table-label">
                    <label className="start-finish-toggle-label"
                           id="start-finish-toggle"
                           onClick={this.handleStartFinishToggle}>
                        {this.state.solveForStart ? "Start at:" : "Finish at:"}
                    </label>
                </span>

                <span className="recipe-start-finish-table-datepicker">
                    <DatePicker
                        selected={this.state.solveForStart  // `selected`: the value for this object
                            ? this.state.startTime
                            : this.state.finishTime}
                        onChange={this.handleDateChange}
                        className="start-finish-datepicker"
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={30}
                        timeCaption="Time"
                        todayButton="Today"
                        useWeekdaysShort={true}
                        dateFormat="MMM dd, yyyy HH:mm"/>
                </span>

                <button type="button"
                        name="updateRecipe"
                        className="btn btn-save"
                        onClick={this.props.saveRecipe}>Save</button>
            </div>
        )
    }
}

export default RecipeStartEnd;
