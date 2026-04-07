import React from 'react';

function BtnEdit({ onClickParam = true, onClickFn }) {
    return (
        <button className="btn btn-edit-mode"
                onClick={() => onClickFn(onClickParam ? onClickParam : "")}>
            <img src="/icons/edit-solid.svg"
                 alt="Toggle Edit Mode"
                 className="icon icon-button"/>
        </button>
    )
}

export default BtnEdit;
