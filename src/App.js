// @ts-check
// ^^^ checks JS for type mismatch errors

import React from 'react';
import {Switch, Route} from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import PageTitle from './components/PageTitle';
import RecipeTable from './components/RecipeTable';
import RecipeDetailContainer from './components/RecipeDetailContainer';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';

function App() {
    return (
        <div className="App">
            <Switch>
                <Route exact path="/">
                    <NavBar/>
                    <div className="recipe-table-container">
                        <PageTitle title="Breadsheet" includeHr={true}/>
                        <RecipeTable/>
                    </div>
                </Route>

                <Route path="/recipe/:recipeId">
                    <NavBar/>
                    <div className="recipe-detail-container">
                        <RecipeDetailContainer/>
                    </div>
                </Route>

                <Route path="/convert">
                    <NavBar/>
                    <div className="text-conversion-container">
                        <PageTitle title="Paprika Text Conversion" includeHr={true}/>
                    </div>
                </Route>

            </Switch>
            <Footer/>
        </div>
    );
}

export default App;
