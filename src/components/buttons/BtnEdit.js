import React from 'react';

function BtnEdit(props) {
    return (
        <button className="btn btn-edit-mode"
                onClick={() => props.onClickFn(props.onClickParam)}>
            <img src="/icons/edit-solid.svg"
                 alt="Toggle Edit Mode"
                 className="icon icon-button"/>
        </button>
    )
}

BtnEdit.defaultProps = {
    onClickParam: true
}

export default BtnEdit;
