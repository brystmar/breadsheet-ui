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

    static defaultProps = {
        nextStepNumber: 1
    };

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
            stepNumber: 1,
            text: "",
            then_waitHH: 0,
            then_waitMM: 0,
            note: "",
            when: "",
            visible: false
        })
    }

    handleSubmit(event) {
        console.log("New step submitted:", this.state);

        // Don't refresh the page
        event.preventDefault();

        // Send this new step to the parent so it can POST to the backend
        let stateCopy = this.state;
        delete stateCopy.visible;

        this.props.render(stateCopy);
    }

    render() {
        return (
            <div className="add-step-parent">
                <div className="add-step-icon">
                    <img alt="Add recipe"
                         src="https://breadsheet-public.s3-us-west-2.amazonaws.com/button_plus.png"
                         className="add-step-toggle-button"
                         onClick={this.handleFormToggle}/>

                    <label className="add-step-toggle-label" onClick={this.handleFormToggle}>
                        Add Step
                    </label>
                </div>

                <form className="add-step-form"
                      hidden={this.state.visible}
                      onSubmit={this.handleSubmit}>
                    <label className="add-step-form-label">
                        Number
                    </label>
                    <input className="add-step-form-number"
                           type="number"
                           name="stepNumber"
                           placeholder="Step #"
                           value={this.state.stepNumber}
                           onChange={this.handleChange}
                           required={true}
                    />

                    <br/>

                    <label className="add-step-form-label">
                        Text
                    </label>
                    <input className="add-step-form-textbox"
                           type="text"
                           name="text"
                           placeholder="Text"
                           value={this.state.text}
                           onChange={this.handleChange}
                           required={true}
                    />

                    <br/>

                    <label className="add-step-form-label">
                        Then Wait...
                    </label>
                    <input className="add-step-form-then_wait-hh"
                           type="number"
                           name="then_waitHH"
                           placeholder="Hrs"
                           value={this.state.then_waitHH}
                           onChange={this.handleChange}
                    />
                    :
                    <input className="add-step-form-then_wait-mm"
                           type="number"
                           name="then_waitMM"
                           placeholder="Min"
                           value={this.state.then_waitMM}
                           onChange={this.handleChange}
                    />

                    <br/>

                    <label className="add-step-form-label">
                        Note
                    </label>
                    <input className="add-step-form-textbox"
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
