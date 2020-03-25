import React from 'react';

class AddStep extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.handleFormToggle = this.handleFormToggle.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.resetDefaults = this.resetDefaults.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.resetDefaults();
    }

    handleFormToggle() {
        console.log("Clicked handleFormToggle. State.visible is now:", !this.state.visible);
        this.setState({
            visible: !this.state.visible
        });
    }

    handleChange(event) {
        const {name, value} = event.target;
        this.setState({
            [name]: value
        })
    }

    resetDefaults() {
        this.setState({
            stepNumber: 0,
            nextStepNumber: 1,
            text: "",
            thenWaitHH: 0,
            thenWaitMM: 0,
            note: "",
            when: "",
            visible: false
        })
    }

    handleSubmit(event) {
        // Don't refresh the page
        event.preventDefault();

        // Create an object that's congruent with the Step data model
        let newStep = {
            number: this.state.stepNumber,
            text: this.state.text,
            then_wait: this.state.thenWaitHH * 3600 + this.state.thenWaitMM * 60,
            note: this.state.note
        };

        // Send this new step to the parent so it can update the backend
        console.log("New step to add:", newStep);
        this.props.addStepToRecipe(newStep);
    }

    render() {
        return (
            <div className="add-step-parent">
                <div className="add-step-icon">
                    <img alt="Add recipe"
                         src="https://breadsheet-public.s3-us-west-2.amazonaws.com/button_plus.png"
                         className="add-recipe-toggle-button"
                         onClick={this.handleFormToggle}/>

                    <label className="add-recipe-toggle-label" onClick={this.handleFormToggle}>
                        Add Step
                    </label>
                </div>

                <form className="add-recipe-form"
                      hidden={this.state.visible}
                      onSubmit={this.handleSubmit}>

                    <label className="add-recipe-form-label">Number</label>
                    <input className="add-recipe-form-number"
                           type="number"
                           name="stepNumber"
                           placeholder="Step #"
                           value={this.state.stepNumber}
                           onChange={this.handleChange}
                           required={true}
                    />

                    <br/>

                    <label className="add-recipe-form-label">Text</label>
                    <input className="add-recipe-form-textbox"
                           type="text"
                           name="text"
                           placeholder="Text"
                           value={this.state.text}
                           onChange={this.handleChange}
                           required={true}
                    />

                    <br/>

                    <label className="add-recipe-form-label">Then Wait...</label>
                    <input className="then-wait-hh-input"
                           type="number"
                           name="thenWaitHH"
                           placeholder="Hrs"
                           value={this.state.thenWaitHH}
                           onChange={this.handleChange}
                    />
                    :
                    <input className="then-wait-mm-input"
                           type="number"
                           name="thenWaitMM"
                           placeholder="Min"
                           value={this.state.thenWaitMM}
                           onChange={this.handleChange}
                    />

                    <br/>

                    <label className="add-recipe-form-label">Note</label>
                    <input className="add-recipe-form-textbox"
                           type="text"
                           name="note"
                           placeholder="Optional"
                           value={this.state.note}
                           onChange={this.handleChange}
                    />

                    <br/>
                    <input type="button"
                           name="cancelNewStep"
                           className="button-cancel"
                           value="Cancel"
                           onClick={this.resetDefaults}/>
                    <input type="submit"
                           name="saveNewStep"
                           className="button-submit"
                           disabled={this.state.visible}
                           value="Submit"/>
                </form>
            </div>
        )
    }
}

export default AddStep;
