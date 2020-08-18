import React from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import {LinkContainer} from 'react-router-bootstrap';
import NavRecipeMenu from './NavRecipeMenu';

function NavBar(props) {
    return (
        <Navbar sticky="top"
                bg="dark"
                variant="dark"
                className="navbar-custom-container">
            <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav>
                    <LinkContainer to="/">
                        <Nav.Link className="navbar-custom-link">Home</Nav.Link>
                    </LinkContainer>

                    <NavRecipeMenu allRecipes={props.allRecipes}/>

                    <LinkContainer to="/convert">
                        <Nav.Link className="navbar-custom-link">Convert</Nav.Link>
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
