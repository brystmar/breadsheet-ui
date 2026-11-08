import React from "react"
import PageTitle from "./PageTitle"
import "../styles/privacy.sass"


// /privacy (breadsheet#34; spec: Usage metrics): exactly what breadsheet collects, and what it doesn't
export default function PrivacyPage() {
    return (
        <article className="privacy-page">
            <PageTitle title="Privacy" includeHr={true} />
            <p className="privacy-lead">
                Breadsheet collects as little as it can to run the site and learn whether it's useful. It has no ads,
                sells nothing, and shares nothing.
            </p>

            <h2>What breadsheet collects</h2>
            <h3>Visits</h3>
            <p>
                Page views are counted with <a href="https://www.goatcounter.com" target="_blank" rel="noopener noreferrer">GoatCounter</a>:
                the page, the site that linked to it, your country, and your browser, operating system, and screen
                size. GoatCounter doesn't use cookies or store IP addresses. Sign-in links aren't counted.
            </p>

            <h3>Your account</h3>
            <p>
                Your username, a fingerprint (hash) of your key, when you signed up, and the last day you used
                breadsheet. Breadsheet never stores your key itself, so it can't show it to you again or to anyone
                else. A single cookie keeps you signed in; there are no other cookies.
            </p>

            <h3>Your recipes and bakes</h3>
            <p>
                What you save: your recipes and their steps, and your bakes with their times and check-offs.
                Personal recipes are visible to anyone you share the link with. Published recipes are visible to
                everyone, with your username.
            </p>

            <h3>What you do in breadsheet</h3>
            <p>To see which features are used, breadsheet records events like these, each with the time it happened:</p>
            <ul>
                <li>Signing up or signing in</li>
                <li>Creating, copying, publishing, unpublishing, or deleting a recipe</li>
                <li>Starting, completing, or canceling a bake, and checking off or skipping a step</li>
                <li>Downloading a bake's calendar events</li>
            </ul>
            <p>
                Each event records your account's id, which recipe or bake it was about, and whether it came from
                the website, Home Assistant, or an assistant (with the assistant's name, if it gives one). A
                check-off also records how many seconds early or late it was.
            </p>

            <h2>What breadsheet doesn't collect</h2>
            <ul>
                <li>Your IP address or browser details in its own records</li>
                <li>Anything you type into events: they hold ids, times, and numbers only</li>
                <li>Tracking cookies, advertising ids, or data from other sites</li>
            </ul>
            <p>
                The services that host breadsheet (Cloudflare and Google Cloud) see standard request details, like
                IP addresses, to deliver the site, and keep their own logs for a limited time. Breadsheet doesn't
                copy them into its records.
            </p>

            <h2>When you delete things</h2>
            <p>
                Deleting a recipe removes it, but its events keep the deleted recipe's id, so counts like "most
                copied" stay accurate. Bakes keep their own copy of a recipe's steps. If your account is deleted,
                your id is removed from every event.
            </p>

            <h2>Questions</h2>
            <p>
                Ask on <a href="https://github.com/brystmar/breadsheet/issues" target="_blank" rel="noopener noreferrer">GitHub</a>.
            </p>
        </article>
    )
}
