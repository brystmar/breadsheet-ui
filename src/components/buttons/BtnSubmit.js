import React from 'react';

function BtnSubmit(props) {
    return (
        <button type="submit"
                name={props.btnName}
                className="btn btn-submit"
                disabled={props.disabled}
                onClick={props.onClickFn}>
            {props.btnText}
        </button>
    )
}

BtnSubmit.defaultProps = {
    btnName: "",
    btnText: "",
    disabled: false
}

export default BtnSubmit;
