import {useState} from 'react';

function useStep(initialState) {
    const [step, updateStep] = useState(initialState);

    function handleStepChange(event) {
        updateStep({[event.target.name]: event.target.value})
    }

    return [step, updateStep, handleStepChange]
}

export default useStep;
