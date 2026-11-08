import React, { useEffect, useMemo, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router"
import PageTitle from "../PageTitle"
import EditStepRow from "./EditStepRow"
import useActiveBakes from "../../hooks/useActiveBakes"
import { createRecipe, deleteRecipe, listPrepRecipes, publishRecipe, unpublishRecipe, updateRecipe } from "../../data/recipes_api"
import { blankStep, DIFFICULTIES, formBody, formProblems, recipeForm } from "../../helpers/recipe_form"
import "../../styles/plan-view.sass"
import "../../styles/recipe-edit.sass"


// A new recipe starts as one blank step
const NEW_RECIPE = { name: "", category: "bread", detail_level: "simple", difficulty: "Beginner", is_draft: true, steps: [] }

function initialForm(recipe) {
    const form = recipeForm(recipe || NEW_RECIPE)
    return recipe ? form : { ...form, steps: [ blankStep() ] }
}


// The recipe editor (M2, breadsheet-ui#31), for the owner of a personal recipe, or a new one when `recipe`
// is null. Everything saves together; a failed save keeps the changes in the form and says so. New recipes
// and drafts can be saved as a draft (incomplete is fine) or saved to go live.
export default function RecipeEditPage({ recipe = null }) {
    const isNew = recipe === null
    const navigate = useNavigate()
    const location = useLocation()
    const { bakes } = useActiveBakes()

    const [ saved, setSaved ] = useState(recipe)
    const [ form, setForm ] = useState(() => initialForm(recipe))
    const [ baseline, setBaseline ] = useState(() => JSON.stringify(formBody(initialForm(recipe), recipe?.is_draft ?? true)))
    const [ errors, setErrors ] = useState({})
    const [ message, setMessage ] = useState(null)
    const [ status, setStatus ] = useState(location.state?.saved ? "saved" : "idle")
    const [ prepRecipes, setPrepRecipes ] = useState([])
    const [ confirmDelete, setConfirmDelete ] = useState(false)
    const [ publishing, setPublishing ] = useState(false)
    const [ publishMessage, setPublishMessage ] = useState(null)

    const isDraft = saved ? saved.is_draft : true
    const recipeId = saved?.id ?? null
    const body = formBody(form, isDraft)
    const dirty = JSON.stringify(body) !== baseline
    const detailed = form.detailLevel === "detailed"
    const bakesFromIt = bakes.filter((bake) => recipeId && bake.recipe_id === recipeId).length

    // The prep recipes this one can list as prerequisites
    useEffect(() => {
        let current = true
        listPrepRecipes().then((result) => {
            if (current && result.ok) setPrepRecipes((result.data?.recipes ?? []).filter((prep) => prep.id !== recipeId))
        })
        return () => { current = false }
    }, [ recipeId ])

    // Closing the tab with unsaved changes asks first
    useEffect(() => {
        if (!dirty) return
        const warn = (event) => { event.preventDefault() }
        window.addEventListener("beforeunload", warn)
        return () => window.removeEventListener("beforeunload", warn)
    }, [ dirty ])

    function change(update) {
        setForm((current) => ({ ...current, ...update }))
        if (status === "saved") setStatus("idle")
    }

    function changeStep(index, update) {
        change({ steps: form.steps.map((step, i) => i === index ? { ...step, ...update } : step) })
    }

    function moveStep(index, by) {
        const steps = [ ...form.steps ]
        const [ moved ] = steps.splice(index, 1)
        steps.splice(index + by, 0, moved)
        change({ steps })
        setErrors({})  // field errors are keyed by position
    }

    function removeStep(index) {
        change({ steps: form.steps.filter((_, i) => i !== index) })
        setErrors({})
    }

    function togglePrerequisite(id) {
        const chosen = form.prerequisites.includes(id)
        change({ prerequisites: chosen ? form.prerequisites.filter((x) => x !== id) : [ ...form.prerequisites, id ] })
    }

    // Saves the form: as a draft (`asDraft`, incomplete is fine), or live
    async function save(asDraft) {
        const problems = formProblems(form, { draft: asDraft })
        if (Object.keys(problems).length) {
            setErrors(problems)
            setMessage("Check the highlighted fields, then save again.")
            return
        }

        setStatus("saving")
        setMessage(null)
        const request = formBody(form, asDraft)
        const result = isNew ? await createRecipe(request) : await updateRecipe(recipeId, request)
        if (!result.ok) {
            setStatus("idle")
            setErrors(result.fields || {})
            setMessage(`Your changes didn't save, and they're still here. ${result.message}`)
            return
        }

        const updated = result.data.recipe
        const fresh = recipeForm(updated)
        setSaved(updated)
        setForm(fresh)
        setBaseline(JSON.stringify(formBody(fresh, updated.is_draft)))
        setErrors({})
        setStatus("saved")
        // A new recipe, or a rename, moves to the recipe's own URL
        if (isNew || updated.path !== recipe.path) navigate(`${updated.path}/edit`, { replace: true, state: { saved: true } })
    }

    function handleSubmit(event) {
        event.preventDefault()
        save(false)
    }

    // Publishing shares the recipe as saved, so it waits until changes are saved
    async function togglePublished() {
        setPublishing(true)
        setPublishMessage(null)
        const publish = !saved.published_at
        const result = publish ? await publishRecipe(recipeId) : await unpublishRecipe(recipeId)
        setPublishing(false)
        if (result.ok) {
            // Publishing answers with the recipe; unpublishing answers 204 with no body
            setSaved(publish ? result.data.recipe : { ...saved, published_at: null })
            return
        }
        if (result.fields) setErrors(result.fields)
        setPublishMessage(publish ? `This recipe can't be published yet. ${result.message}` : result.message)
    }

    async function remove() {
        const result = await deleteRecipe(recipeId)
        if (result.ok) {
            setBaseline(JSON.stringify(body))  // nothing left to lose
            navigate("/", { replace: true })
        } else {
            setConfirmDelete(false)
            setMessage(result.message)
        }
    }

    const fieldError = (field) => errors[field]
    const prepChoices = useMemo(() => {
        // Keep any chosen prerequisite listed even if the list hasn't loaded
        const known = new Set(prepRecipes.map((prep) => prep.id))
        const missing = (saved?.prerequisites || []).filter((prep) => !known.has(prep.id))
        return [ ...prepRecipes, ...missing ]
    }, [ prepRecipes, saved?.prerequisites ])

    return (
        <form className="recipe-edit" onSubmit={handleSubmit} noValidate>
            <p className="edit-back">
                {isNew ? <Link to="/">← Recipes</Link> : <Link to={saved.path}>← Back to the plan</Link>}
            </p>
            <PageTitle title={isNew ? "New recipe" : "Edit recipe"} includeHr={true} />
            {isDraft &&
                <p className="edit-draft">
                    {isNew ? "Save as a draft to finish it later; only you can see drafts, and they can't be baked." :
                        "Draft: only you can see it, and it can't be baked yet. Save takes it live."}
                </p>}

            <section className="edit-card" aria-labelledby="edit-details">
                <h3 id="edit-details">Details</h3>
                <div className="edit-grid">
                    <span className="edit-field edit-wide">
                        <label className="edit-label" htmlFor="edit-name">Name</label>
                        <input id="edit-name" className={fieldError("name") ? "edit-input invalid" : "edit-input"} type="text"
                               value={form.name} aria-invalid={Boolean(fieldError("name"))}
                               onChange={(event) => change({ name: event.target.value })} />
                        {fieldError("name") && <span className="edit-field-error">{fieldError("name")}</span>}
                    </span>
                    <span className="edit-field">
                        <label className="edit-label" htmlFor="edit-author">Author <span className="edit-optional">(optional)</span></label>
                        <input id="edit-author" className="edit-input" type="text" value={form.author}
                               onChange={(event) => change({ author: event.target.value })} />
                    </span>
                    <span className="edit-field">
                        <label className="edit-label" htmlFor="edit-source">Source <span className="edit-optional">(optional)</span></label>
                        <input id="edit-source" className="edit-input" type="text" value={form.source}
                               onChange={(event) => change({ source: event.target.value })} />
                    </span>
                    <span className="edit-field">
                        <label className="edit-label" htmlFor="edit-url">Link <span className="edit-optional">(optional)</span></label>
                        <input id="edit-url" className={fieldError("url") ? "edit-input invalid" : "edit-input"} type="url"
                               value={form.url} placeholder="https://" aria-invalid={Boolean(fieldError("url"))}
                               onChange={(event) => change({ url: event.target.value })} />
                        {fieldError("url") && <span className="edit-field-error">{fieldError("url")}</span>}
                    </span>
                    <span className="edit-field">
                        <label className="edit-label" htmlFor="edit-difficulty">Difficulty</label>
                        <select id="edit-difficulty" className="edit-input" value={form.difficulty}
                                onChange={(event) => change({ difficulty: event.target.value })}>
                            {DIFFICULTIES.map((difficulty) => <option key={difficulty}>{difficulty}</option>)}
                        </select>
                    </span>
                </div>
            </section>

            <section className="edit-card" aria-labelledby="edit-category">
                <h3 id="edit-category">Category</h3>
                <div className="edit-choice" role="radiogroup" aria-labelledby="edit-category">
                    <label><input type="radio" name="category" value="bread" checked={form.category === "bread"}
                                  onChange={() => change({ category: "bread" })} /> Bread</label>
                    <label><input type="radio" name="category" value="prep" checked={form.category === "prep"}
                                  onChange={() => change({ category: "prep" })} /> Prep</label>
                </div>
                <p className="edit-hint">
                    {form.category === "prep" ?
                        "Prep recipes get you ready for another bake, like reviving a starter. They can't have prerequisites of their own." :
                        "Something you bake. It can list prep recipes to do first."}
                </p>

                {form.category === "bread" &&
                    <fieldset className="edit-prereqs">
                        <legend>Before you start <span className="edit-optional">(any one of these)</span></legend>
                        {prepChoices.length === 0 ?
                            <p className="edit-hint">No prep recipes to choose from yet.</p> :
                            prepChoices.map((prep) =>
                                <label key={prep.id}>
                                    <input type="checkbox" checked={form.prerequisites.includes(prep.id)}
                                           onChange={() => togglePrerequisite(prep.id)} />
                                    {prep.name}
                                </label>)}
                        {fieldError("prerequisites") && <span className="edit-field-error">{fieldError("prerequisites")}</span>}
                    </fieldset>}
            </section>

            <section className="edit-card" aria-labelledby="edit-steps">
                <div className="edit-steps-head">
                    <h3 id="edit-steps">Steps</h3>
                    <div className="edit-level" role="group" aria-label="Detail level">
                        <button type="button" aria-pressed={!detailed} onClick={() => change({ detailLevel: "simple" })}>Simple</button>
                        <button type="button" aria-pressed={detailed} onClick={() => change({ detailLevel: "detailed" })}>Detailed</button>
                    </div>
                </div>
                <p className="edit-hint">
                    {detailed ? "Each step's wait range, hands-on time, and whether you need to be home." :
                        "One Then Wait per step. Detailed adds ranges and hands-on time; switching back keeps them."}
                </p>

                <ol className="edit-steps">
                    {form.steps.map((step, index) =>
                        <EditStepRow key={step.key} step={step} index={index} count={form.steps.length}
                                     detailed={detailed} errors={errors}
                                     onChange={(update) => changeStep(index, update)}
                                     onMove={(by) => moveStep(index, by)}
                                     onRemove={() => removeStep(index)} />)}
                </ol>
                <button type="button" className="btn btn-default edit-add-step"
                        onClick={() => change({ steps: [ ...form.steps, blankStep() ] })}>Add a step</button>
                {fieldError("steps") && <span className="edit-field-error">{fieldError("steps")}</span>}
            </section>

            {!isNew &&
                <section className="edit-card edit-community" aria-labelledby="edit-community">
                    <h3 id="edit-community">Community</h3>
                    {saved.published_at ?
                        <p className="edit-hint">
                            Published to the community library. Anyone can find it and make it theirs, and your edits show
                            there right away. Unpublishing doesn't affect copies people already made.
                        </p> :
                        <p className="edit-hint">
                            {isDraft ? "Drafts can't be published. Save it to take it live first." :
                                "Share it in the community library, where anyone can find it and make it theirs."}
                        </p>}
                    <div className="edit-actions">
                        <button type="button" className="btn btn-default"
                                disabled={publishing || dirty || (isDraft && !saved.published_at)}
                                onClick={togglePublished}>
                            {saved.published_at ? "Unpublish" : "Publish to community"}
                        </button>
                        {dirty && <span className="edit-hint">Save your changes first.</span>}
                    </div>
                    {publishMessage && <p className="edit-message" role="alert">{publishMessage}</p>}
                </section>}

            {message && <p className="edit-message" role="alert">{message}</p>}

            <div className="edit-actions">
                <button type="submit" className="btn btn-primary edit-save"
                        disabled={status === "saving" || (!dirty && !(isDraft && !isNew))}>
                    {status === "saving" ? "Saving…" : "Save"}
                </button>
                {isDraft &&
                    <button type="button" className="btn btn-default" disabled={status === "saving" || !dirty}
                            onClick={() => save(true)}>Save as draft</button>}
                <span className="edit-status" role="status">
                    {status === "saved" && !dirty ? "Saved." : dirty ? "Unsaved changes" : ""}
                </span>
                {!isNew && !confirmDelete &&
                    <button type="button" className="btn edit-delete" onClick={() => setConfirmDelete(true)}>Delete recipe</button>}
            </div>

            {confirmDelete &&
                <div className="edit-card edit-confirm" role="alertdialog" aria-labelledby="confirm-delete">
                    <p id="confirm-delete">
                        Delete this recipe? This can't be undone. Copies people made from it keep working.
                        {bakesFromIt > 0 && ` Your ${bakesFromIt === 1 ? "bake" : `${bakesFromIt} bakes`} from it will keep running.`}
                    </p>
                    <div className="edit-actions">
                        <button type="button" className="btn btn-default" onClick={() => setConfirmDelete(false)}>Keep it</button>
                        <button type="button" className="btn edit-delete" onClick={remove}>Delete recipe</button>
                    </div>
                </div>}
        </form>
    )
}
