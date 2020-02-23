// @ts-check
// ^^^ checks JS for type mismatch errors

import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import RecipeTable from "./components/RecipeTable";
import './App.css';

function App() {
    return (
        <div className="App">
            <Header/>
            <br />

            <div className="page-title">
                Recipes
            </div>
            <hr />
            <RecipeTable/>

            <br />
            <br />
            <Footer/>
        </div>
    );
}

export default App;
