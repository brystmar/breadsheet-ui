import React from 'react';

function BtnAdd(props) {
    return (
        <button type="button"
                className="btn btn-add"
                onClick={props.onClickFn}>
            <img alt={props.altText}
                 src="/icons/button_plus.png"
                 className="icon-add icon-transparent"/>
            {props.btnText}
        </button>
    )
}

BtnAdd.defaultProps = {
    btnText: "",
    altText: "Add a new recipe or step"
}

export default BtnAdd;
