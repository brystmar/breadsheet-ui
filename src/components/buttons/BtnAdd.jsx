import React from 'react';

function BtnAdd({ btnText = "", altText = "", isCollapsed = true, onClickFn }) {
    return (
        <button type="button"
                className={isCollapsed ? "btn btn-add btn-collapsed" : "btn btn-add"}
                onClick={onClickFn}
        >
            {btnText}
        </button>
    )
}

export default BtnAdd;
