export function getTextConversionData(updateState) {
    // Retrieves the full list of replacements for both ingredients and directions
    console.log("Calling endpoint: /api/v1/replacements/all");

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
                    directions:  result.data.directions,
                    hasData:     true
                })
            } else {
                console.log("Retrieved replacement text data, but unable to parse", result.data)
                return Promise.reject(result.body);
            }
        })
        .catch(rejection => {
            console.log("Caught error querying for replacements:", rejection)
            return Promise.reject(rejection.status)
        });
}
