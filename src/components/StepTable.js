import React from 'react';

function StepTable(props) {
    return (
        <table className="step-table">
            <thead className="table-header-row">
            <tr>
                <th>Step</th>
                <th>When</th>
                <th>Action</th>
                <th className="step-table-list-item-then-wait-header">Then Wait...</th>
                <th>Notes</th>
            </tr>
            </thead>

            <tbody className="step-table-list">
            {props.steps}
            </tbody>
        </table>
    )
}

export default StepTable;
