import React from 'react';
import Button from 'react-bootstrap/Button';
import Accordion from 'react-bootstrap/Accordion';
import {MDBDataTable} from 'mdbreact';
import Card from "react-bootstrap/Card";

class ConversionListContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchString: "",
            scope: "ingredients",
            hidden: true
        }

        this.reset = this.reset.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.toggleScope = this.toggleScope.bind(this);
        this.onRowHover = this.onRowHover.bind(this);
        this.reformatSpaces = this.reformatSpaces.bind(this);
        this.newbieHacks = this.newbieHacks.bind(this);
    }

    componentDidMount() {
        this.newbieHacks()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.newbieHacks()
    }

    newbieHacks() {
        // Two minor hacks to remove items I can't customize from a package
        // Remove the `Entries per page` selector
        document.getElementsByClassName("dataTables_length bs-select")[0].innerHTML = "";

        // TODO: Remove the text label above the search box
        // let searchLabel = document.getElementsByClassName("dataTables_filter")[0];
        // searchLabel = searchLabel.getElementsByTagName("label")[0];
        // console.log(searchLabel)
    }

    reset() {
        this.setState({
            searchString: "",
            scope: "ingredients"
        })
    }

    handleChange(event) {
        const {name, value} = event.target;

        this.setState({
            [name]: value
        });
    }

    onRowHover(event) {
        console.log(JSON.stringify(event));
    }

    toggleScope() {
        if (this.state.scope === "ingredients") {
            this.setState({
                scope: "directions"
            })
        } else {
            this.setState({
                scope: "ingredients"
            })
        }
    }

    reformatSpaces(array) {
        // For visibility, replace all spaces with · and newlines with ¶
        let output = [];
        let updated_old = "";
        let updated_new = "";

        // For each item in the array...
        for (let i = 0; i < array.length; i++) {
            updated_old = "";
            updated_new = "";

            // Replace these characters in the 'find' column
            for (let j = 0; j < array[i]['old'].length; j++) {
                if (array[i]['old'][j] === " ") {
                    updated_old += String.fromCharCode(183);
                } else if (array[i]['old'][j] === "\n") {
                    updated_old += String.fromCharCode(182);
                } else {
                    updated_old += array[i]['old'][j];
                }
            }

            // Ditto for the 'replace' column
            for (let k = 0; k < array[i]['new'].length; k++) {
                if (array[i]['new'][k] === " ") {
                    updated_new += String.fromCharCode(183);
                } else if (array[i]['new'][k] === "\n") {
                    updated_new += String.fromCharCode(182);
                } else {
                    updated_new += array[i]['new'][k];
                }
            }

            // Append to the array
            output.push({old: updated_old, new: updated_new});
        }
        return output;
    }

    render() {
        let dtData = {
            columns: [
                {
                    label: "Find",
                    field: "old",
                    sort: "asc",
                    width: 150
                },
                {
                    label: "Replace",
                    field: "new",
                    sort: "asc",
                    width: 150
                }
            ],
            rows: this.state.scope === "ingredients" && this.props.ingredientsList.length > 0 ?
                this.reformatSpaces(this.props.ingredientsList) :
                this.reformatSpaces(this.props.directionsList)
        };

        let toggleLabel = this.state.scope === "ingredients" ? "Ingredients" : "Directions";

        return (
            <div className="text-conversion-list-container">
                <Accordion>
                    <Card>
                        <Accordion.Toggle as={Card.Header}
                                          className="text-conversion-accordion"
                                          eventKey="0">
                            What's being replaced?
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="0">
                            <Card.Body>
                                <h4 className="toggle-replacements">
                                    Replacements for &nbsp;
                                    <Button variant="secondary" name="scopeChange"
                                            onClick={this.toggleScope}>
                                        {toggleLabel} <i className="fas fa-retweet"/>
                                    </Button>
                                </h4>
                                <MDBDataTable scrollY
                                              striped
                                              small
                                              responsiveSm
                                              hover
                                              bordered
                                              maxHeight="600px"
                                              className="text-conversion-list-item"
                                              data={dtData}
                                              entries={12}/>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                </Accordion>
            </div>
        )
    }
}

ConversionListContainer.defaultProps = {
    ingredientsList: [],
    directionsList: []
}

export default ConversionListContainer;
