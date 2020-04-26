import React from 'react';
import StepListItem from './StepListItem';
import LoadingIcon from './LoadingIcon';

function StepTable(props) {
    return (
        <table className="step-table">
            <thead className="table-header-row">
            <tr>
                <th hidden={props.hidden}>&nbsp;</th>
                <th>Step</th>
                <th>When</th>
                <th>Action</th>
                <th className="step-table-list-item-then-wait-header">Then Wait...</th>
                <th>Notes</th>
            </tr>
            </thead>

            <tbody className="step-table-list">
            {props.hasData ?
                BuildStepComponentList(props) :
                <tr>
                    <td><LoadingIcon cssClass="loading-icon-table"/></td>
                </tr>
            }
            </tbody>
        </table>
    )
}

function BuildStepComponentList(props) {
    // Transforms a list of recipe steps into a list of StepListItem components.
    // Needs to be its own function because we calculate `when` differently if solving for start.
    let stepList = props.steps;
    let stepComponentList = [];

    if (props.solve_for_start) {
        // Using the provided start date, add time for each step
        //  to determine when the next step should start.
        let stepStartTime = props.start_time;
        let prevStepLength = 0;

        for (let i = 0; i < stepList.length; i++) {
            // Increment the start time for this step
            stepStartTime += prevStepLength * 1000;  // Convert milliseconds to seconds for JS
            // console.log("SfS = true |", stepList[i].number, moment(stepStartTime).toISOString());

            stepComponentList.push(
                <StepListItem key={stepList[i].number}
                              step_id={stepList[i].step_id}
                              when={stepStartTime}
                              stepNumber={stepList[i].number}
                              text={stepList[i].text}
                              then_wait={stepList[i].then_wait}
                              note={stepList[i].note}
                              hidden={props.hidden}
                              deleteStep={props.deleteStep}
                              handleStepLengthChange={props.handleStepLengthChange}/>);

            // Update prevStepLength for the next step
            prevStepLength = stepList[i].then_wait;
        }
    } else {
        // Add total recipe length to the provided start date, then work backwards
        //  to determine when the next step should start.
        let stepFinishTime = props.start_time + (props.length * 1000);
        // let nextStepLength = 0;

        for (let i = stepList.length - 1; i >= 0; i--) {
            // console.log("SfS = false |", stepList[i].number, moment(stepFinishTime).toISOString());

            // Set the start time for the next step
            stepFinishTime -= stepList[i].then_wait * 1000;  // Convert milliseconds to seconds for JS

            stepComponentList.push(
                <StepListItem key={stepList[i].number}
                              step_id={stepList[i].step_id}
                              when={stepFinishTime}
                              stepNumber={stepList[i].number}
                              text={stepList[i].text}
                              then_wait={stepList[i].then_wait}
                              note={stepList[i].note}
                              hidden={props.hidden}
                              deleteStep={props.deleteStep}
                              handleStepLengthChange={props.handleStepLengthChange}/>);

            // Update prevStepLength for the next step
            // nextStepLength = stepList[i].then_wait;
        }

        // Since we started with the last step working backwards, reverse the order
        stepComponentList.reverse();
    }

    // console.log("Finished BuildStepComponentList:", stepComponentList);
    return stepComponentList;
}

StepTable.defaultProps = {
    hidden: true,
    hasData: false,
    steps: []
}

export default StepTable;
