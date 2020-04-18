import React from 'react';
import WebsiteTitle from './WebsiteTitle';
import NavRecipeMenu from './NavRecipeMenu';
import {Link} from 'react-router-dom';

class NavBar extends React.Component {
    constructor(props) {
        super(props);

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

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (this.props.includeRecipeList !== nextProps.includeRecipeList || this.props.includeHeader !== nextProps.includeHeader) {
            // Refresh when props change
            console.log("sCU: true (props)")
            return true;
        } else if (this.state.recipeList !== nextState.recipeList) {
            // Refresh when the recipeList data changes
            console.log("sCU: true (state.recipeList)")
            return true;
        } else {
            console.log("sCU: false")
            return false;
        }
    }

    getSkinnyRecipeList() {
        fetch("http://localhost:5000/api/v1/recipe_list")
            .then(response => {
                if (response.ok) {
                    console.log("Skinny recipe data retrieved!");
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
            <header className="header">
                <nav className="navbar">
                    <Link to="/">
                        <WebsiteTitle/>
                    </Link>

                    <Link to="/">
                        <NavRecipeMenu recipeList={this.state.recipeList}/>
                    </Link>

                    <Link to="/convert">
                        Convert Text
                    </Link>
                </nav>
            </header>
        )
    }
}

export default NavBar;
