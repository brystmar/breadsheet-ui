import React from 'react';

class ConvertText extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            inputIngredients: "",
            inputDirections: "",
            outputIngredients: "",
            outputDirections: ""
        }
    }

    render() {
        return (
            <div className="text-conversion-container">
                
            </div>
        )
    }
}

export default ConvertText;
