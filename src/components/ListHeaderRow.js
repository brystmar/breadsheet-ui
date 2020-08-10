import React from 'react';
import BtnEdit from './buttons/BtnEdit';

function ListHeaderRow(props) {
    const columns = props.colTitles.map(title =>
        <span className={props.for + "-list-cell"}>{title}</span>)

    return (
        <div className={props.for + "-list-row list-header"}>
            {columns}
            <span className="recipe-list-cell icon-cell">
                <BtnEdit onClickFn={props.onClickFn}
                         onClickParam={props.onClickParam}/>
            </span>
        </div>
    )
}

ListHeaderRow.defaultProps = {
    for: "recipe",
    colTitles: [""],
    onClickParam: true
}

export default ListHeaderRow;
