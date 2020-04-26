import React from 'react';
import {Switch, Route, useParams} from 'react-router-dom';
import BackendUrlContext from './components/BackendUrlContext';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import PageTitle from './components/PageTitle';
import RecipeTable from './components/RecipeTable';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
// import './accompany-bootstrap.css';

import ConvertTextPageContainer from './components/ConvertTextPageContainer';
import RecipeDetailSummary from './components/RecipeDetailSummary';

function App() {
    return (
        <div className="App">
            <BackendUrlContext.Provider value="http://breadsheet.wl.r.appspot.com">
            <NavBar/>
            <div className="content">
                <Switch>
                    <Route exact path="/">
                        <PageTitle title="Breadsheet" includeHr={false}/>
                        <RecipeTable/>
                    </Route>

                    {/*TODO: Fix routing issues */}
                    <Route exact path="/convert">
                        <PageTitle title="Convert Recipe Text" includeHr={true}/>
                        <ConvertTextPageContainer/>
                    </Route>

                    <Route exact path="/:recipeId">
                        <RecipeContainer/>
                    </Route>
                </Switch>
            </div>
            <Footer/>
            </BackendUrlContext.Provider>
        </div>
    )
}

function RecipeContainer() {
    let {recipeId} = useParams();
    return <RecipeDetailSummary recipeId={recipeId}/>
}

export default App;
