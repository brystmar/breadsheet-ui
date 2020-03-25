import React, {useState} from 'react';

function StepListItem(props) {
    let [thenWaitHH, setThenWaitHH] = useState(props.then_wait_hh);
    let [thenWaitMM, setThenWaitMM] = useState(props.then_wait_mm);

    return (
        <tr className="step-table-list-item" id={"step-table-list-item-" + props.number}>
            <td className="step-table-list-item-number">{props.number}</td>
            <td className="step-table-list-item-when">
                {/* TODO: Set these values dynamically instead of blindly displaying the prop value */}
                {props.when}
            </td>
            <td className="step-table-list-item-text">{props.text}</td>
            <td className="step-table-list-item-then-wait">
                {/* TODO: Figure out how to save these values to State & update/re-calc when changed */}
                <input type="number"
                       value={thenWaitHH}
                       // defaultValue={props.then_wait_hh}
                       onChange={value => setThenWaitHH(value)}
                       className="then-wait-hh-input"
                       id={"step-table-then-wait-hh-input-" + props.number}
                />
                :
                <input type="number"
                       value={thenWaitMM}
                       // defaultValue={props.then_wait_mm}
                       onChange={function(value) {
                           console.log("Value:", value, typeof(value));
                           setThenWaitMM(value)
                       }}
                       //onChange={props.thenWaitHandler(props.number, 17)}
                       className="then-wait-mm-input"
                       id={"step-table-then-wait-mm-input-" + props.number}
                />
            </td>
            <td className="step-table-list-item-note">{props.note}</td>
        </tr>
    )
}

export default StepListItem;
