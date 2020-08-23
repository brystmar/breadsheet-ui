import React from 'react';

function BtnCancel(props) {
    return (
        <button type="button"
                name={props.btnName}
                className="btn btn-cancel"
                disabled={props.disabled}
                onClick={props.onClickFn}>
            {props.btnText}
        </button>
    )
}

BtnCancel.defaultProps = {
    btnName: "",
    btnText: "",
    disabled: false
}

export default BtnCancel;
