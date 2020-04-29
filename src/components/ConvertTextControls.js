import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
// import FormLabel from 'react-bootstrap/FormLabel';
// import FormControl from 'react-bootstrap/FormText';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {CSSTransition} from 'react-transition-group';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import convert_text_using_provided_list from '../scripts/convert_text_functions';

class ConvertTextControls extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            inputIngredients: "",
            inputDirections: "",
            outputIngredients: "",
            outputDirections: "",
            transition: false,
            textboxRows: 8,
            textboxCols: 10
        }

        this.handleChange = this.handleChange.bind(this);
        this.clipboardConfirmation = this.clipboardConfirmation.bind(this);
        this.resetForm = this.resetForm.bind(this);
    }

    handleChange(event) {
        const {name, value} = event.target;

        if (this.props.ingredientsList === [] || this.state.directionsList === []) {
            // Don't run functions until we have replacement data
            this.setState({
                [name]: value
            });
        } else {
            // Convert the relevant text
            if (name === "inputIngredients") {
                this.setState({
                    [name]: value,
                    outputIngredients: convert_text_using_provided_list(value, this.props.ingredientsList)
                });
            } else if (name === "inputDirections") {
                this.setState({
                    [name]: value,
                    outputDirections: convert_text_using_provided_list(value, this.props.directionsList)
                })
            }
        }
    }

    clipboardConfirmation() {
        // Briefly display a confirmation that text was copied to the clipboard
        //   Epic CSS animations, anyone? https://daneden.github.io/animate.css/
        this.setState({
            transition: !this.state.transition
        })
    }

    resetForm() {
        this.setState({
            inputIngredients: "",
            inputDirections: "",
            outputIngredients: "",
            outputDirections: "",
            textboxRows: 8,
            textboxCols: 20
        })
    }

    render() {
        return (
            <Form className="text-conversion-table">
                <Row className="text-conversion-table-bs-row">
                    <Col>
                        {/*<Form.Label*/}
                        {/*    className="text-conversion-table-bs-label">Ingredients</Form.Label>*/}
                        <Form.Control as="textarea"
                                      name="inputIngredients"
                                      value={this.state.inputIngredients}
                                      placeholder="Ingredients Input"
                                      onChange={this.handleChange}
                                      autoFocus={true}
                                      tabIndex={1}
                                      rows={this.state.textboxRows}
                                      cols={this.state.textboxCols}/>
                    </Col>
                    {/*<Col className="text-conversion-arrow">*/}
                    {/*    -->*/}
                    {/*</Col>*/}
                    <Col>
                        {/*<Form.Label*/}
                        {/*    className="text-conversion-table-bs-label"> &nbsp; </Form.Label>*/}
                        <Form.Control as="textarea"
                                      name="outputIngredients"
                                      value={this.state.outputIngredients}
                                      placeholder="Ingredients Output"
                                      disabled={true}
                                      rows={this.state.textboxRows}
                                      cols={this.state.textboxCols}/>
                    </Col>
                </Row>
                <Row className="text-conversion-table-bs-row">
                    <Col>
                        {/*<Form.Label*/}
                        {/*    className="text-conversion-table-bs-label">Directions</Form.Label>*/}
                        <Form.Control as="textarea"
                                      name="inputDirections"
                                      value={this.state.inputDirections}
                                      placeholder="Directions Input"
                                      onChange={this.handleChange}
                                      tabIndex={2}
                                      rows={this.state.textboxRows}
                                      cols={this.state.textboxCols}/>
                    </Col>
                    {/*<Col className="text-conversion-arrow">*/}
                    {/*    -->*/}
                    {/*</Col>*/}
                    <Col>
                        {/*<Form.Label*/}
                        {/*    className="text-conversion-table-bs-label"> &nbsp; </Form.Label>*/}
                        <Form.Control as="textarea"
                                      name="outputDirections"
                                      value={this.state.outputDirections}
                                      placeholder="Directions Output"
                                      disabled={true}
                                      rows={this.state.textboxRows}
                                      cols={this.state.textboxCols}/>
                    </Col>
                </Row>
                <Row className="text-conversion-table-bs-row">
                    <Col className="button-clipboard-row">
                        <CopyToClipboard
                            text={(this.state.outputIngredients + "\n\n" + this.state.outputDirections).trim()}
                            onCopy={this.clipboardConfirmation}>
                            <Button variant="success"
                                    size="sm"
                                    name="copyToClipboard"
                                    className="button-clipboard-row"
                                    tabIndex={3}>
                                <i className="far fa-copy"/> Copy to Clipboard
                            </Button>
                        </CopyToClipboard>

                        <CSSTransition in={this.state.transition}
                                       timeout={1000}
                                       classNames="clipboard-confirmation"
                                       onEntered={this.clipboardConfirmation}>
                            <span className="clipboard-confirmation">
                                Copied!
                            </span>
                        </CSSTransition>
                    </Col>
                    <Col className="button-reset-column">
                        <Button variant="danger"
                                size="sm"
                                name="resetForm"
                                className="button-reset"
                                onClick={this.resetForm}
                                tabIndex={4}>
                            Reset
                        </Button>
                    </Col>
                </Row>
            </Form>
        )
    }
}

ConvertTextControls.defaultProps = {
    ingredientsList: [],
    directionsList: []
}

export default ConvertTextControls;
