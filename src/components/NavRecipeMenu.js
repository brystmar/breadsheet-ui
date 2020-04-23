import React from 'react';
import {Link} from "react-router-dom";

function NavRecipeMenu(props) {
    let recipeList = props.recipeList.map(recipe =>
        <Link to={`/${recipe.id}`} key={recipe.id}>{recipe.name}</Link>
    )

    return (
        <div className="nav-dropdown">
            <Link to="/">
                Recipes <i className="fa fa-caret-down"/>
            </Link>
            <div className="nav-dropdown-content">
                {recipeList}
            </div>
        </div>
    )
}

export default NavRecipeMenu;
