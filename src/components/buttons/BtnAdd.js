import React from 'react';

function BtnAdd(props) {
    return (
        <button type="button"
                className="btn-add-recipe"
                onClick={props.onClickFn}>
            <img alt="Add recipe"
                 src="../../../public/icons/button_plus.png"
                 className="add-recipe-toggle-button icon-transparent"/>
            {props.btnText}
        </button>
    )
}

BtnAdd.defaultProps = {
    btnText: "",
    btnClasses: "btn-add-recipe",
    imgClasses: "add-recipe-toggle-button icon-transparent",
    imgAlt: "Add",
    imgSrc: "../../../public/icons/button_plus.png"
}

export default BtnAdd;
