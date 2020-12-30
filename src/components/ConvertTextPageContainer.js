import React, {useState, useEffect} from 'react';
import ConvertTextControls from './ConvertTextControls';
import ConversionListContainer from './ConversionListContainer';
import "../styles/text-conversion.sass";

// TODO: Add imperial-to-metric weight conversion
function ConvertTextPageContainer() {
    let [textList, updateTextList] = useState({
        ingredients: [],
        directions: [],
        hasData: false
    });

    function callTextConversionApi() {
        fetch(process.env.REACT_APP_BACKEND_URL + "/api/v1/replacements/all")
            .then(response => response.json())
            .then(result => {
                    if (result.message === "Success") {
                        updateTextList({
                            ingredients: result.data.ingredients,
                            directions: result.data.directions,
                            hasData: true
                        });
                    } else {
                        console.log("Error retrieving replacements.");
                        console.log(result.body);
                        return Promise.reject(result.status);
                    }
                }
            )
            .catch(rejection => console.log("Caught error querying for replacements:", rejection));
    }

    useEffect(callTextConversionApi, [])

    return <div className="text-conversion-container">
        <ConvertTextControls ingredientsList={textList.ingredients}
                             directionsList={textList.directions}
                             updateReplacementList={callTextConversionApi}
                             hasData={textList.hasData}
        />

        <ConversionListContainer ingredientsList={textList.ingredients}
                                 directionsList={textList.directions}
                                 updateReplacementList={callTextConversionApi}
                                 hasData={textList.hasData}
        />

    </div>
}

export default ConvertTextPageContainer;
