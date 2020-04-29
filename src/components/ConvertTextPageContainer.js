import React from 'react';
import ConvertTextControls from './ConvertTextControls';
import ConversionListContainer from './ConversionListContainer';
import BackendUrlContext from '../context/BackendUrlContext';

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
        this.getReplacements("ingredients");
        this.getReplacements("directions");
    }

    getReplacements(scope) {
        // Get the list of replacements
        fetch(this.context + "/api/v1/replacements/" + scope)
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

ConvertTextPageContainer.contextType = BackendUrlContext;

export default ConvertTextPageContainer;
