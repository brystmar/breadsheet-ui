import React, { useState, useEffect } from "react";
import ConvertTextControls from "./ConvertTextControls";
import ConversionListContainer from "./ConversionListContainer";
import { defaultTextConversionState } from "../data/defaultValues";
import "../styles/text-conversion.sass";


// TODO: Parse ingredients by section (ex: ignore "Equipment"), then into qty/unit/ingredient/prep
//  Add imperial-to-metric weight conversion, perhaps even for specific ingredients?
//  See https://www.kingarthurbaking.com/learn/ingredient-weight-chart
export default function ConvertTextPageContainer() {
    let [ state, updateState ] = useState(defaultTextConversionState);

    useEffect(() => {
        async function getTextConversionData() {
            // Retrieve the full list of replacements for both ingredients and directions
            const replacementsEndpoint = process.env.REACT_APP_BACKEND_URL + "/api/v1/replacements/all";
            console.log(`Calling endpoint: ${replacementsEndpoint}`);

            try {
                const replacementsPromise = await fetch(replacementsEndpoint);
                if (replacementsPromise.ok) {
                    const result = await replacementsPromise.json();

                    if (result.message === "Success") {
                        updateState({
                            ingredients: result.data.ingredients,
                            directions:  result.data.directions,
                            hasData:     true
                        })
                        replacementsPromise.resolve("Replacements updated successfully.");
                    } else {
                        console.log("Retrieved replacement text data, but unable to parse.", result.data);
                        replacementsPromise.reject(result.body);
                    }
                } else {
                    console.error("Error requesting replacements.", replacementsPromise.status,
                        replacementsPromise.statusText);
                    replacementsPromise.reject(replacementsPromise.statusText);
                }
            } catch (error) {
                console.error(error);
            }
        }

        const getTextConversionPromise = getTextConversionData();
        console.log(`Returned Promise from getTextConversionData(): ${getTextConversionPromise}`)
    }, [])

    return (
        <div className="text-conversion-container">
            <ConvertTextControls
                ingredientsList={state.ingredients}
                directionsList={state.directions}
                updateReplacementList={updateState}
                hasData={state.hasData}
            />
            <ConversionListContainer
                ingredientsList={state.ingredients}
                directionsList={state.directions}
                updateReplacementList={updateState}
                hasData={state.hasData}
            />
        </div>
    )
}
