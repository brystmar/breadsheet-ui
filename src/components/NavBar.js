import React from 'react';
import NavRecipeMenu from './NavRecipeMenu';
import {LinkContainer} from 'react-router-bootstrap'
import BackendUrlContext from './BackendUrlContext';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

class NavBar extends React.PureComponent {
    constructor() {
        super();

        this.state = {
            recipeList: []
        }
        this.getSkinnyRecipeList = this.getSkinnyRecipeList.bind(this);
    }

    componentDidMount() {
        // We should grab the list of recipes when this component mounts, even
        // if we're not displaying it initially.  This is a lightweight service
        // call, and its data is highly likely to be relevant during the session.

        this.getSkinnyRecipeList();
    }

    // shouldComponentUpdate(nextProps, nextState, nextContext) {
    //     if (this.state.recipeList !== nextState.recipeList) {
    //         // Refresh when the recipeList data changes
    //         console.log("Update NavBar? Yes (state.recipeList)")
    //         return true;
    //     } else {
    //         console.log("Update NavBar? No")
    //         return false;
    //     }
    // }

    getSkinnyRecipeList() {
        fetch(this.context + "/api/v1/recipe_list")
            .then(response => {
                if (response.ok) {
                    // console.log("Skinny recipe data retrieved!");
                    return response.json();
                } else {
                    console.log("Error grabbing skinny recipe data.");
                    console.log(response.body);
                    return Promise.reject(response.statusText);
                }
            })
            .then(result => this.setState({recipeList: result.data}))
            .catch(something => console.log("Caught:", something));
    }

    render() {
        return (
            <Navbar sticky="top" bg="dark" variant="dark" expand="lg" className="navbar">
                <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav>
                        <LinkContainer to="/">
                            <Nav.Link>Home</Nav.Link>
                        </LinkContainer>
                        {/*<Link to="/">Home</Link>*/}

                        <NavRecipeMenu recipeList={this.state.recipeList}/>

                        <LinkContainer to="/convert">
                            <Nav.Link>Convert Text</Nav.Link>
                        </LinkContainer>
                        {/*<Link to="/convert">Convert Text</Link>*/}
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        )
    }
}

NavBar.contextType = BackendUrlContext;

export default NavBar;
