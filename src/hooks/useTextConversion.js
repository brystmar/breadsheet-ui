import {useReducer} from "react";

function useTextConversion(endpoint) {
    let [state, dispatch] = useReducer((state, action) => {
        switch (action.type) {
            case 'GET_TEXT_LIST': {
                return 0
            }

            case 'UPDATE_TEXT_LIST_ITEM': {
                return 0
            }

            default: {
                return 0
            }
        }
    }, {
        ingredients: [],
        directions: [],
        hasData: false
    })

    return [state, dispatch]
}

export default useTextConversion;
