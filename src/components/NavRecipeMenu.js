import React from 'react';
import {Link} from "react-router-dom";

function NavRecipeMenu(props) {
    let recipeList = props.recipeList.map(recipe =>
        <Link to={`/recipe/${recipe.id}`} key={recipe.id}>{recipe.name}</Link>
    )

    return (
        <div className="nav-dropdown">
            <label className="nav-dropdown-label">
                Recipes <i className="fa fa-caret-down"/>
            </label>
            <div className="nav-dropdown-content">
                {recipeList}
            </div>
        </div>
    )
}

export default NavRecipeMenu;
