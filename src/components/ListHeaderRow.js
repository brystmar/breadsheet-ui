import React from "react";

export default function ListHeaderRow(props) {
    const columns = props.colTitles.map((title, index) => {
        // For each column, apply a unique class name based on the column's title
        // Truncate any spaces or punctuation in the title to simplify the classes
        const classString = props.for + "-list-cell col-" + title.toLowerCase()
            .split(" ")[0]
            .split(".")[0]

        return <h2 key={index} className={classString} title={title}>{title}</h2>
    })

    return (
        <div className={props.for + "-list-row list-header"}>
            {columns}
        </div>
    )
}

ListHeaderRow.defaultProps = {
    for:          "recipe",
    colTitles:    [ "" ],
    onClickParam: true
}
