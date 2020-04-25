import React, {PureComponent} from 'react';
import {FixedSizeGrid} from 'react-window';

class ConversionListContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            searchString: "",
            scope: "ingredients"
        }
        this.reset = this.reset.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.toggleScope = this.toggleScope.bind(this);
        this.onRowHover = this.onRowHover.bind(this);
        this.filterArray = this.filterArray.bind(this);
        this.objectToArray = this.objectToArray.bind(this);
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

    filterArray(array) {
        let output = [];
        for (let i = 0; i < array.length; i++) {
            if (array[i].toString().includes(this.state.searchString)) {
                output.push(this.objectToArray(array[i]));
            }
        }
        return output;
    }

    objectToArray(something) {
        return [something['old'], something['new']];
    }

    render() {
        return (
            <div className="text-conversion-list-container">
                <input type="text"
                       name="searchString"
                       value={this.state.searchString}
                       placeholder={"Search " + this.state.scope + " list"}
                       maxLength={160}
                       disabled  // TODO: Re-enable once search filtering works
                       onChange={this.handleChange}/>

                <button name="scopeChange"
                        onClick={this.toggleScope}>
                    <i className="fas fa-retweet"/>
                </button>

                <br/>

                <table className="text-conversion-listbox-header-table">
                    <thead>
                    <tr>
                        <th>
                            Find
                        </th>
                        <th>
                            Replace With
                        </th>
                    </tr>
                    </thead>
                </table>
                <FixedSizeGrid className="text-conversion-listbox"
                               columnCount={2}
                               columnWidth={185}
                               columnHeight={30}
                               height={300}
                               width={420}
                               rowHeight={30}
                               rowWidth={80}
                               rowCount={this.state.scope === "ingredients" ?
                                   this.props.ingredientsList.length :
                                   this.props.directionsList.length}
                               itemData={this.state.scope === "ingredients" && this.props.ingredientsList.length > 0 ?
                                   this.filterArray(this.props.ingredientsList) :
                                   this.filterArray(this.props.directionsList)}>
                    {GridItemRenderer}
                </FixedSizeGrid>
                <br/>
            </div>
        )
    }
}


class GridItemRenderer extends PureComponent {
    render() {
        // Access the data source using the `data` prop
        const {data, columnIndex, rowIndex, style} = this.props;

        let datum = data[rowIndex][columnIndex];
        let output = "";

        // Replace spaces with · and newlines with ¶
        for (let i = 0; i < datum.length; i++) {
            if (datum[i] === " ") {
                output += String.fromCharCode(183);
            } else if (datum[i] === "\n") {
                output += String.fromCharCode(182);
            } else {
                output += datum[i];
            }
        }

        return (
            <div style={style}
                 className="text-conversion-list-item">
                {output}
            </div>
        );
    }
}

ConversionListContainer.defaultProps = {
    ingredientsList: [],
    directionsList: []
}

export default ConversionListContainer;
