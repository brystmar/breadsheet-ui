import React from 'react';
import StepListItem from './StepListItem';
import LoadingIcon from './LoadingIcon';

function StepTable(props) {
    // console.log("StepTable props:", props);
    // console.log("Rendered StepTable w/steps:", props.steps);
    let stepComponentList = props.steps.map(step =>
        <StepListItem
            key={step.number}
            step_id={step.step_id}
            stepNumber={step.number}
            text={step.text}
            when={step.when}
            then_wait={step.then_wait}
            note={step.note}
            deleteStep={props.deleteStep}
            handleStepLengthChange={props.handleStepLengthChange}/>);

    return (
        <table className="step-table">
            <thead className="table-header-row">
            <tr>
                <th>&nbsp;</th>
                <th>Step</th>
                <th>ID</th>
                <th>When</th>
                <th>Action</th>
                <th className="step-table-list-item-then-wait-header">Then Wait...</th>
                <th>Notes</th>
            </tr>
            </thead>

            <tbody className="step-table-list">
            {props.hasData ?
                stepComponentList :
                <tr><td><LoadingIcon cssClass="loading-icon-table"/></td></tr>}
            </tbody>
        </table>
    )
}

export default StepTable;
