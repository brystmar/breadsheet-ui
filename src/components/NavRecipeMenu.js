import React from 'react';
import { LinkContainer } from 'react-router-bootstrap'
import NavDropdown from 'react-bootstrap/NavDropdown';

function NavRecipeMenu(props) {
    let allRecipes = props.allRecipes.map(recipe =>
            <LinkContainer to={`/${recipe.id}`} key={recipe.id}>
                <NavDropdown.Item>
                    {recipe.name}
                </NavDropdown.Item>
            </LinkContainer>
    )

    return (
        <NavDropdown title="Recipes" id="collapsible-nav-dropdown">
            {allRecipes}
        </NavDropdown>
    )
}

export default NavRecipeMenu;
