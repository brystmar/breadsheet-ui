import React from 'react';

function AddRecipeButton(props) {
    const btnText = <span>Add Recipe</span>;

    return (
        <button type="button"
                className="btn-add-recipe"
                onClick={props.onClickFn}>
            <img alt="Add recipe"
                 src="./icons/button_plus.png"
                 className="add-recipe-toggle-button icon-transparent"/>
            {btnText}
        </button>
    )
}

export default AddRecipeButton;
