// @ts-check
// ^^^ checks JS for type mismatch errors

import React from 'react';
import {Switch, Route} from 'react-router-dom';
import NavBar from './components/NavBar';
import Header from './components/Header';
import Footer from './components/Footer';
import PageTitle from './components/PageTitle';
import RecipeTable from './components/RecipeTable';
import RecipeDetailContainer from './components/RecipeDetailContainer';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';

function App() {
    return (
        <div className="App">
            <NavBar />

            <Switch>
                <Route exact path="/">
                    <Header />
                    <br/>

                    <PageTitle title="Recipes" />

                    <hr/>
                    <RecipeTable />
                    <br/>
                </Route>

                <Route path="/recipe/:recipeId">
                    <RecipeDetailContainer />
                </Route>

                <Route path="/convert">
                    <PageTitle title="Paprika Text Conversion" />
                </Route>

            </Switch>

            <Footer />
        </div>
    );
}

export default App;
