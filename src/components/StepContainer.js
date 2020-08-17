import React from 'react';
import StepListItem from './StepListItem';
import ListHeaderRow from './ListHeaderRow';

function StepContainer(props) {
    return (
        <div className="step-list-container">
            <ListHeaderRow
                for="step"
                colTitles={["Step", "When", "Action", "Then Wait", "Note"]}
                onClickFn={props.toggleEditMode}
                onClickParam={props.hidden}/>
            {BuildStepComponentList(props)}
        </div>
    )
}

function BuildStepComponentList(props) {
    // Transforms a list of recipe steps into a list of StepListItem components.
    // Needs to be its own function since `when` is calculated differently solving for start vs finish.
    let stepList = props.steps;
    let stepComponentList = [];

    if (props.solve_for_start) {
        // Using the provided start date, add time for each step to find when the next step should start.
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
                              highlight={i % 2 === 0}
                              deleteStep={props.deleteStep}
                              handleStepLengthChange={props.handleStepLengthChange}/>);

            // Update prevStepLength for the next step
            prevStepLength = stepList[i].then_wait;
        }
    } else {
        // Add total recipe length to the provided start date, then work backwards to determine
        //  when the next step should start.
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
        }

        // Since we started with the last step working backwards, reverse the order
        stepComponentList.reverse();
    }

    // console.log("Finished BuildStepComponentList:", stepComponentList);
    return stepComponentList;
}

StepContainer.defaultProps = {
    hidden: true,
    hasData: false,
    steps: []
}

export default StepContainer;
