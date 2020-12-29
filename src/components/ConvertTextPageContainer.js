import React from 'react';
import ConvertTextControls from './ConvertTextControls';
import ConversionListContainer from './ConversionListContainer';
import LoadingIcon from "./LoadingIcon";
import "../styles/text-conversion.sass"

// TODO: Refactor to functional component
class ConvertTextPageContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            repListIngredients: [],
            repListDirections: [],
            hasData: false
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
        // console.log("Calling endpoint:", process.env.REACT_APP_BACKEND_URL + "/api/v1/replacements/" + scope)
        fetch(process.env.REACT_APP_BACKEND_URL + "/api/v1/replacements/" + scope)
            .then(response => response.json())
            .then(result => {
                    if (result.message === "Success") {
                        // console.log("Successfully retrieved list of", scope);
                        if (scope === "ingredients") {
                            this.setState({
                                repListIngredients: result.data,
                                hasData: true
                            });
                        } else if (scope === "directions") {
                            this.setState({
                                repListDirections: result.data,
                                hasData: true
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
                {this.state.hasData ?
                    <>
                        <ConvertTextControls ingredientsList={this.state.repListIngredients}
                                             directionsList={this.state.repListDirections}
                                             updateReplacementList={this.getReplacements}/>
                        <br/>
                        <ConversionListContainer ingredientsList={this.state.repListIngredients}
                                                 directionsList={this.state.repListDirections}
                                                 updateReplacementList={this.getReplacements}/>
                    </> :
                    <LoadingIcon cssClass="replacement-list-container"/>}

            </div>
        )
    }
}

export default ConvertTextPageContainer;
