import {useState} from 'react';


export default function useRecipe(initialState) {
    const [recipe, updateRecipe] = useState(initialState);

    function handleChange(event) {
        updateRecipe({[event.target.name]: event.target.value})
    }

    return [recipe, updateRecipe, handleChange]
}
