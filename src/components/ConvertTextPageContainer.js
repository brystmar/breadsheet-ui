import React, {useState, useEffect} from 'react';
import ConvertTextControls from './ConvertTextControls';
import ConversionListContainer from './ConversionListContainer';
import {defaultTextConversionState} from "../data/defaultValues";
import "../styles/text-conversion.sass";

// TODO: Add imperial-to-metric weight conversion
function ConvertTextPageContainer() {
    let [state, updateState] = useState(defaultTextConversionState);

    useEffect(() => {
        fetch(process.env.REACT_APP_BACKEND_URL + "/api/v1/replacements/all")
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    console.log("Error retrieving replacements:", response.status, response.statusText);
                    console.log(response.json());
                    return Promise.reject(response.statusText);
                }
            })
            .then(result => {
                if (result.message === "Success") {
                    updateState({
                        ingredients: result.data.ingredients,
                        directions: result.data.directions,
                        hasData: true
                    })
                } else {
                    console.log("Retrieved replacement text data, but unable to parse",
                        result.data)
                    return Promise.reject(result.body);
                }
            })
            .catch(rejection => {
                console.log("Caught error querying for replacements:", rejection)
                return Promise.reject(rejection.status)
            });
    }, [])

    return (
        <div className="text-conversion-container">
            <ConvertTextControls ingredientsList={state.ingredients}
                                 directionsList={state.directions}
                                 updateReplacementList={updateState}
                                 hasData={state.hasData}
            />
            <ConversionListContainer ingredientsList={state.ingredients}
                                     directionsList={state.directions}
                                     updateReplacementList={updateState}
                                     hasData={state.hasData}
            />
        </div>
    )
}

export default ConvertTextPageContainer;
