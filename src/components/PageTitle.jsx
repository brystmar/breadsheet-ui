import React from "react";
import LoadingIcon from "./LoadingIcon";

export default function PageTitle({ title = "Recipes", includeHr = true }) {
    return (
        <h1 className={includeHr ? "page-title page-title-border" : "page-title"}>
            {title ? title : <LoadingIcon cssClass="loading-icon-title" />}
        </h1>
    )
}
