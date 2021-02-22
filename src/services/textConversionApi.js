export async function getTextConversionData(updateState) {
    // Retrieves the full list of replacements for both ingredients and directions
    const replacementsApi = process.env.REACT_APP_BACKEND_URL + "/api/v1/replacements/all";
    console.log(`Calling endpoint: ${replacementsApi}`);

    try {
        const replacementsPromise = await fetch(replacementsApi);
        if (replacementsPromise.ok) {
            const result = await replacementsPromise.json();

            if (result.message === "Success") {
                updateState({
                    ingredients: result.data.ingredients,
                    directions:  result.data.directions,
                    hasData:     true
                })
                return Promise.resolve("Replacements updated successfully.");
            } else {
                console.log("Retrieved replacement text data, but unable to parse", result.data);
                return Promise.reject(result.body);
            }
        } else {
            console.error("Error requesting replacements.", replacementsPromise.status,
                replacementsPromise.statusText);
        }
    } catch (error) {
        console.error(error);
    }

    // fetch(process.env.REACT_APP_BACKEND_URL + "/api/v1/replacements/all")
    //     .then(response => {
    //         if (response.ok) {
    //             return response.json();
    //         } else {
    //             console.log("Error retrieving replacements:", response.status, response.statusText);
    //             console.log(response.json());
    //             return Promise.reject(response.statusText);
    //         }
    //     })
    //     .then(result => {
    //         if (result.message === "Success") {
    //             updateState({
    //                 ingredients: result.data.ingredients,
    //                 directions:  result.data.directions,
    //                 hasData:     true
    //             })
    //         } else {
    //             console.log("Retrieved replacement text data, but unable to parse", result.data)
    //             return Promise.reject(result.body);
    //         }
    //     })
    //     .catch(error => {
    //         console.error("Error in requesting replacements.", error)
    //         return Promise.reject(error.status)
    //     });
}
