import React from 'react';
import BtnEdit from './buttons/BtnEdit';

function ListHeaderRow(props) {
    const columns = props.colTitles.map((title, index) => {
        // For each column, apply a unique class name based on the column's title
        // Truncate any spaces or punctuation in the title to simplify the classes
        const classString = props.for + "-list-cell col-" + title.toLowerCase()
            .split(" ")[0]
            .split(".")[0]

        if (index === props.colTitles.length - 1) {
            return <span key={index} className={classString}>
                <h2 title={title}>{title}</h2>
                <BtnEdit onClickFn={props.onClickFn}
                         onClickParam={props.onClickParam}/>
            </span>
        } else {
            return <h2 key={index} className={classString} title={title}>{title}</h2>
        }
    })

    console.log(props.colTitles.length);

    return (
        <div className={props.for + "-list-row list-header"}>
            {columns}
        </div>
    )
}

ListHeaderRow.defaultProps = {
    for: "recipe",
    colTitles: [""],
    onClickParam: true
}

export default ListHeaderRow;
