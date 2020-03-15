// @ts-check
// ^^^ checks JS for type mismatch errors

import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import PageTitle from "./components/PageTitle";
import RecipeTable from "./components/RecipeTable";
import './App.css';

function App() {
    return (
        <div className="App">
            <Header/>
            <br />

            <PageTitle title="Recipes"/>

            <hr />
            <RecipeTable/>
            <br />

            <br />
            <Footer/>
        </div>
    );
}

export default App;
