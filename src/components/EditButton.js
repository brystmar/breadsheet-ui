import React from 'react';

function EditButton(props) {
    return (
        <button className="btn btn-edit-mode"
                onClick={() => props.onClickFn(props.onClickParam)}>
            <img src="./icons/edit-solid.svg"
                 alt="Toggle Edit Mode"
                 className="icon icon-button"/>
        </button>
    )
}

EditButton.defaultProps = {
    onClickParam: true
}

export default EditButton;
