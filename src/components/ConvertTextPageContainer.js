import React, {useState, useEffect} from 'react';
import ConvertTextControls from './ConvertTextControls';
import ConversionListContainer from './ConversionListContainer';
import {getTextConversionData} from "../services/textConversionApi";
import {defaultTextConversionState} from "../data/defaultValues";
import "../styles/text-conversion.sass";

// TODO: Add imperial-to-metric weight conversion
function ConvertTextPageContainer() {
    let [state, updateState] = useState(defaultTextConversionState);

    useEffect(() => getTextConversionData(updateState), [])

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
