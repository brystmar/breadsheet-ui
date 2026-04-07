import React from 'react';

function BtnCancel({ btnName = "", btnText = "", disabled = false, onClickFn }) {
    return (
        <button type="button"
                name={btnName}
                className="btn btn-cancel"
                disabled={disabled}
                onClick={onClickFn}>
            {btnText}
        </button>
    )
}

export default BtnCancel;
