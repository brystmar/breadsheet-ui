import React, { useRef, useState } from "react"
import { Link, useNavigate } from "react-router"
import PageTitle from "../PageTitle"
import RecipePageAttributes from "../RecipePageAttributes"
import PlanStartFinish from "./PlanStartFinish"
import PlanStepRow from "./PlanStepRow"
import useRecipeSaver from "../../hooks/useRecipeSaver"
import useSession from "../../hooks/useSession"
import { copyRecipe } from "../../data/recipes_api"
import { nextQuarterHour, planStep, recipeBody, stepTimes } from "../../helpers/plan"
import "../../styles/plan-view.sass"


// The plan view for a v2 recipe (M2, breadsheet-ui#32). Owners change Then Waits and ranges here, and
// each change saves to the recipe. Anyone else sees the waits grayed out, with "Make it mine" to copy it.
export default function PlanPage({ recipe }) {
    const navigate = useNavigate()
    const { status: sessionStatus } = useSession()
    const editable = recipe.is_mine === true

    const [ steps, setSteps ] = useState(() => (recipe.steps || []).map(planStep))
    const [ solveForStart, setSolveForStart ] = useState(true)
    const [ anchor, setAnchor ] = useState(() => nextQuarterHour())
    const [ copyError, setCopyError ] = useState(null)
    const [ copying, setCopying ] = useState(false)

    // The recipe as last saved, for building the next full save
    const saved = useRef(recipe)
    const detailed = useRef(recipe.detail_level === "detailed")
    const saver = useRecipeSaver(recipe.id, (updated) => { saved.current = updated })

    const { times, start, finish, total } = stepTimes(steps, anchor, solveForStart)

    // A change to one step's waits; owners' changes save to the recipe
    function changeStep(index, change) {
        const next = steps.map((step, i) => i === index ? { ...step, ...change } : step)
        setSteps(next)
        if (!editable) return

        // Setting a range on a Simple recipe makes it Detailed, so the recipe view shows the range
        if ("min" in change || "max" in change) detailed.current = true
        // The API refuses a range whose minimum is longer than its maximum; save once it's fixed
        if (next.some((step) => step.min > step.max)) return
        saver.save(recipeBody(saved.current, next, detailed.current))
    }

    // Switching between Start at and Finish at keeps the schedule where it is
    function toggleAnchor() {
        setAnchor(solveForStart ? finish : start)
        setSolveForStart(!solveForStart)
    }

    // Copies the recipe into the user's own collection and opens the copy
    async function makeItMine() {
        setCopying(true)
        setCopyError(null)
        const result = await copyRecipe(recipe.id)
        setCopying(false)
        if (result.ok) {
            navigate(result.data.recipe.path)
        } else {
            setCopyError(result.message)
        }
    }

    return (
        <div className="recipe-detail-summary plan-view">
            <PageTitle title={recipe.name} includeHr={true} />

            <RecipePageAttributes difficulty={recipe.difficulty}
                                  source={recipe.source || ""}
                                  author={recipe.author || ""}
                                  url={recipe.url || ""}
                                  length={total} />

            <PlanStartFinish solveForStart={solveForStart}
                             start={start}
                             finish={finish}
                             onToggle={toggleAnchor}
                             onAnchorChange={setAnchor} />

            {/* Waits change only on the user's own recipes */}
            {!editable &&
                <div className="plan-copy-note">
                    {sessionStatus === "signedIn" ?
                        <>
                            <p>This recipe isn't yours. To change its waits or ranges, save a copy to your recipes first.</p>
                            <button type="button" className="btn btn-primary" onClick={makeItMine} disabled={copying}>
                                Make it mine
                            </button>
                        </> :
                        <p>
                            To change this recipe's waits or ranges, <Link to="/register">register</Link> or <Link to="/signin">sign in</Link>,
                            then make it yours.
                        </p>}
                    {copyError && <p className="plan-error" role="alert">{copyError}</p>}
                </div>}

            <div role="table" aria-label="Schedule" className="plan-steps">
                <div role="row" className="plan-step-row plan-step-header">
                    <span role="columnheader" className="plan-col-step"><span className="sr-only">Step</span></span>
                    <span role="columnheader" className="plan-col-when">When</span>
                    <span role="columnheader" className="plan-col-action">Action</span>
                    <span role="columnheader" className="plan-col-wait">Then Wait</span>
                    <span role="columnheader" className="plan-col-range">Range</span>
                    <span role="columnheader" className="plan-col-note">Note</span>
                </div>
                {steps.map((step, index) =>
                    <PlanStepRow key={step.id ?? index}
                                 step={step}
                                 number={index + 1}
                                 when={times[index]}
                                 editable={editable}
                                 highlight={index % 2 === 0}
                                 onChange={(change) => changeStep(index, change)} />
                )}
            </div>

            {editable && <p className="plan-footnote">Changes save to your copy of this recipe.</p>}
            {saver.status === "error" &&
                <p className="plan-error" role="alert">
                    Your last change didn't save. It's still here; <button type="button" className="btn-link" onClick={saver.retry}>try again</button>.
                </p>}
        </div>
    )
}
