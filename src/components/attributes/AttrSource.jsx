import React from "react";

export default function AttrSource({ name = "Abraham Lincoln", url = "https://en.wikipedia.org/wiki/Abraham_Lincoln_vs._Zombies", extraClassString = "" }) {
    let classes = extraClassString, sourceWithLink = name;

    // Apply the link and adjust the class
    if (url && name) {
        classes += " text-with-ext-link-icon"
        sourceWithLink =
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
            >
                {name}
                <img
                    src="./icons/external-link-alt-solid.svg"
                    alt="Link opens in a separate tab"
                    className="icon icon-ext-link"
                />
            </a>
    }

    return (
        <span className={classes}>
            {sourceWithLink}
        </span>
    )
}
