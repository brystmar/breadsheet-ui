import React from 'react';
import NavRecipeMenu from './NavRecipeMenu';
import { LinkContainer } from 'react-router-bootstrap'
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

function NavBar(props) {
    return (
        <Navbar sticky="top" bg="dark" variant="dark" expand="sm" className="navbar">
            <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav>
                    <LinkContainer to="/">
                        <Nav.Link>Home</Nav.Link>
                    </LinkContainer>

                    <NavRecipeMenu allRecipes={props.allRecipes}/>

                    <LinkContainer to="/convert">
                        <Nav.Link>Convert Text</Nav.Link>
                    </LinkContainer>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    )
}

NavBar.defaultProps = {
    allRecipes: []
}

export default NavBar;
