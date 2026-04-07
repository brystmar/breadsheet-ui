import React from "react";

export default function ListHeaderRow({ for: forProp = "recipe", colTitles = [""], onClickParam = true, onClickFn }) {
    const columns = colTitles.map((title, index) => {
        // For each column, apply a unique class name based on the column's title
        // Truncate any spaces or punctuation in the title to simplify the classes
        const classString = forProp + "-list-cell col-" + title.toLowerCase()
            .split(" ")[0]
            .split(".")[0]

        return <h2 key={index} className={classString} title={title}>{title}</h2>
    })

    return (
        <div className={forProp + "-list-row list-header"}>
            {columns}
        </div>
    )
}
