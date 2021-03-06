import React from 'react';

function BtnAdd(props) {
    return (
        <button type="button"
                className={props.isCollapsed ? "btn btn-add btn-collapsed" : "btn btn-add"}
                onClick={props.onClickFn}
        >
            {props.btnText}
        </button>
    )
}

BtnAdd.defaultProps = {
    btnText: "",
    altText: "",
    isCollapsed: true
}

export default BtnAdd;
