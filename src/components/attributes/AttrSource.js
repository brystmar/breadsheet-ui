import React from 'react';

function AttrSource(props) {
    let classes = props.extraClassString, sourceWithLink = props.name;

    // Apply the link and adjust the class
    if (props.url && props.name) {
        classes += " text-with-ext-link-icon"
        sourceWithLink =
            <a href={props.url}
               target="_blank"
               rel="noopener noreferrer">
                {props.name}
                <img src="./icons/external-link-alt-solid.svg"
                     alt="Link opens in a separate tab"
                     className="icon icon-ext-link"/>
            </a>
    }

    return (
        <span className={classes}>
            {sourceWithLink}
        </span>
    )
}

AttrSource.defaultProps = {
    name: "Abraham Lincoln",
    url: "https://en.wikipedia.org/wiki/Abraham_Lincoln_vs._Zombies",
    extraClassString: ""
}

export default AttrSource;
