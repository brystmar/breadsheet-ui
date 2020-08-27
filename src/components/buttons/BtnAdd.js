import React from 'react';

function BtnAdd(props) {
    return (
        <button type="button"
                className="btn btn-add"
                onClick={props.onClickFn}>
            {props.btnText}
        </button>
    )
}

BtnAdd.defaultProps = {
    btnText: "",
    altText: "Add a new recipe or step"
}

export default BtnAdd;
