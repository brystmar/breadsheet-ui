import React from 'react';
import ConvertTextControls from './ConvertTextControls';
import ConversionListContainer from './ConversionListContainer';

class ConvertTextPageContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            repListIngredients: [],
            repListDirections: []
        }
        this.getReplacements = this.getReplacements.bind(this);
    }

    componentDidMount() {
        // console.log(this.state);
        console.log("Starting on the /convert page.")
        console.log("App running in", process.env.NODE_ENV, "mode.")
        console.log("Backend URL:", process.env.REACT_APP_BACKEND_URL)
        console.log("Public URL:", process.env.PUBLIC_URL)
        console.log("Window origin, href:", window.location.origin, window.location.href)

        this.getReplacements("ingredients");
        this.getReplacements("directions");
    }

    getReplacements(scope) {
        // Get the list of replacements
        console.log("Calling endpoint:", process.env.REACT_APP_BACKEND_URL + "/api/v1/replacements/" + scope)
        fetch(process.env.REACT_APP_BACKEND_URL + "/api/v1/replacements/" + scope)
            .then(response => response.json())
            .then(result => {
                    if (result.message === "Success") {
                        // console.log("Successfully retrieved list of", scope);
                        if (scope === "ingredients") {
                            this.setState({
                                repListIngredients: result.data,
                            });
                        } else if (scope === "directions") {
                            this.setState({
                                repListDirections: result.data,
                            });
                        }
                    } else {
                        console.log("Error retrieving", scope, "Replacements.");
                        console.log(result.body);
                        return Promise.reject(result.status);
                    }
                }
            )
            .catch(rejection => console.log(rejection));
    }

    render() {
        return (
            <div className="text-conversion-container">
                <ConvertTextControls ingredientsList={this.state.repListIngredients}
                                     directionsList={this.state.repListDirections}
                                     updateReplacementList={this.getReplacements}/>
                <br/>
                {this.state.repListDirections.length > 10 ?
                <ConversionListContainer ingredientsList={this.state.repListIngredients}
                                         directionsList={this.state.repListDirections}
                                         updateReplacementList={this.getReplacements}/>
                : "waiting for data"}

            </div>
        )
    }
}

export default ConvertTextPageContainer;
