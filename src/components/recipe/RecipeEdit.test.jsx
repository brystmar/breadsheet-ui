import React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, useLocation } from "react-router"
import App from "../../App"
import { FeatureLevelProvider } from "../../hooks/useFeatureLevel"
import { SessionProvider } from "../../hooks/useSession"

const HOUR = 3600
const USER = { id: "u1", username: "Baker_1", created_at: "2026-11-05T00:00:00+00:00" }
const STARTER = { id: "p1", name: "Revive a Starter", path: "/recipes/revive-a-starter", category: "prep" }

const STEPS = [
    { id: "s1", position: 1, text: "Feed the levain", note: "6-8 hours", then_wait: 7 * HOUR, wait_min: 6 * HOUR, wait_max: 8 * HOUR,
      active_seconds: null, needs_presence: null, warnings: [] },
    { id: "s2", position: 2, text: "Mix", note: null, then_wait: 1800, wait_min: 1800, wait_max: 1800,
      active_seconds: 900, needs_presence: true, warnings: [] },
    { id: "s3", position: 3, text: "Bake", note: null, then_wait: 0, wait_min: 0, wait_max: 0,
      active_seconds: null, needs_presence: null, warnings: [] }
]
const MINE = {
    id: "r-mine", slug: "country-loaf", path: "/recipes/country-loaf-k7qx2m", is_mine: true, is_draft: false,
    name: "Country Loaf", author: "Ken", source: null, url: null, difficulty: "Advanced", detail_level: "simple",
    category: "bread", prerequisite_ids: [ "p1" ], prerequisites: [ STARTER ], length_seconds: 0, steps: STEPS
}
const DEFAULT = { ...MINE, id: "r-default", path: "/recipes/country-loaf", is_mine: false, prerequisite_ids: [], prerequisites: [] }
const NOT_FOUND = [ 404, { code: "not_found", message: "That recipe doesn't exist." } ]


function fakeBackend(routes) {
    const calls = []
    vi.stubGlobal("fetch", vi.fn(async (url, options = {}) => {
        const method = options.method || "GET"
        const parsed = new URL(url, "http://test")
        const body = options.body ? JSON.parse(options.body) : null
        calls.push({ method, path: parsed.pathname, query: parsed.search, body })
        let route = routes[`${method} ${parsed.pathname}${parsed.search}`] || routes[`${method} ${parsed.pathname}`] || [ 200, { recipes: [] } ]
        if (typeof route === "function") route = route(body)
        const [ status, json ] = route
        return { status, ok: status >= 200 && status < 300, json: async () => json, headers: { get: () => null } }
    }))
    return calls
}

function ownerRoutes(extra = {}) {
    return {
        "GET /api/v2/session":                              [ 200, { user: USER } ],
        "GET /api/v2/recipes/by-slug/country-loaf-k7qx2m":  NOT_FOUND,
        "GET /api/v2/recipes/by-suffix/k7qx2m":             [ 200, { recipe: MINE } ],
        "GET /api/v2/recipes?category=prep":                [ 200, { recipes: [ STARTER, { ...STARTER, id: "p2", name: "Make a Poolish" } ] } ],
        "PUT /api/v2/recipes/r-mine":                       (body) => [ 200, { recipe: { ...MINE, ...body, prerequisite_ids: body.prerequisites,
                                                                steps: body.steps.map((step, i) => ({ ...step, id: step.id || `new${i}`, position: i + 1, warnings: [] })) } } ],
        ...extra
    }
}

const puts = (calls) => calls.filter(({ method }) => method === "PUT")


function CurrentPath() {
    return <output data-testid="path">{useLocation().pathname}</output>
}

function renderAt(path) {
    window.localStorage.setItem("breadsheet.featureLevel", "m2")
    return render(
        <MemoryRouter initialEntries={[ path ]}>
            <FeatureLevelProvider>
                <SessionProvider>
                    <App />
                    <CurrentPath />
                </SessionProvider>
            </FeatureLevelProvider>
        </MemoryRouter>
    )
}

const EDIT = "/recipes/country-loaf-k7qx2m/edit"

beforeEach(() => {
    window.localStorage.clear()
})

afterEach(() => {
    vi.unstubAllGlobals()
})


describe("the plan view links to the editor", () => {
    test("owners get Edit recipe, and prerequisites show as Before you start", async () => {
        const user = userEvent.setup()
        fakeBackend(ownerRoutes())
        renderAt("/recipes/country-loaf-k7qx2m")

        expect(await screen.findByText("Before you start:")).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Revive a Starter" })).toHaveAttribute("href", "/recipes/revive-a-starter")
        await user.click(screen.getByRole("link", { name: "Edit recipe" }))
        expect(await screen.findByRole("heading", { name: "Edit recipe" })).toBeInTheDocument()
    })

    test("someone else's recipe has no Edit link, and its /edit goes to the plan", async () => {
        fakeBackend({ "GET /api/v2/session": [ 200, { user: USER } ], "GET /api/v2/recipes/by-slug/country-loaf": [ 200, { recipe: DEFAULT } ] })
        renderAt("/recipes/country-loaf/edit")

        await waitFor(() => expect(screen.getByTestId("path")).toHaveTextContent(/^\/recipes\/country-loaf$/))
        expect(await screen.findByRole("button", { name: "Make it mine" })).toBeInTheDocument()
        expect(screen.queryByRole("link", { name: "Edit recipe" })).toBeNull()
    })
})


describe("the recipe editor", () => {
    test("saves details with Save, and only when something changed", async () => {
        const user = userEvent.setup()
        const calls = fakeBackend(ownerRoutes())
        renderAt(EDIT)

        const save = await screen.findByRole("button", { name: "Save" })
        expect(save).toBeDisabled()
        await user.type(screen.getByLabelText(/^Source/), "Flour Water Salt Yeast")
        await user.selectOptions(screen.getByLabelText("Difficulty"), "Expert")
        expect(screen.getByText("Unsaved changes")).toBeInTheDocument()
        await user.click(save)

        await waitFor(() => expect(puts(calls)).toHaveLength(1))
        expect(puts(calls)[0].body).toMatchObject({ name: "Country Loaf", author: "Ken", source: "Flour Water Salt Yeast",
                                                     difficulty: "Expert", is_draft: false, prerequisites: [ "p1" ] })
        expect(await screen.findByText("Saved.")).toBeInTheDocument()
    })

    test("a rename moves to the new URL", async () => {
        const user = userEvent.setup()
        fakeBackend(ownerRoutes({
            "PUT /api/v2/recipes/r-mine": (body) => [ 200, { recipe: { ...MINE, ...body, path: "/recipes/rye-loaf-k7qx2m" } } ],
            "GET /api/v2/recipes/by-slug/rye-loaf-k7qx2m": NOT_FOUND
        }))
        renderAt(EDIT)

        const name = await screen.findByLabelText("Name")
        await user.clear(name)
        await user.type(name, "Rye Loaf")
        await user.click(screen.getByRole("button", { name: "Save" }))
        await waitFor(() => expect(screen.getByTestId("path")).toHaveTextContent("/recipes/rye-loaf-k7qx2m/edit"))
    })

    test("Simple shows one Then Wait; on a step without a range, the range follows it", async () => {
        const user = userEvent.setup()
        const calls = fakeBackend(ownerRoutes())
        renderAt(EDIT)

        expect(await screen.findByLabelText("step 2 Then Wait")).toHaveValue("00:30")
        expect(screen.queryByLabelText("step 2 shortest wait")).toBeNull()
        const mix = screen.getByLabelText("step 2 Then Wait")
        await user.clear(mix)
        await user.type(mix, "45")
        await user.tab()
        await user.click(screen.getByRole("button", { name: "Save" }))

        await waitFor(() => expect(puts(calls)).toHaveLength(1))
        expect(puts(calls)[0].body.steps[1]).toMatchObject({ then_wait: 2700, wait_min: 2700, wait_max: 2700 })
        // A step with a range keeps it
        expect(puts(calls)[0].body.steps[0]).toMatchObject({ then_wait: 7 * HOUR, wait_min: 6 * HOUR, wait_max: 8 * HOUR })
    })

    test("Detailed adds the range, hands-on minutes, and needs you home; Simple hides them without erasing", async () => {
        const user = userEvent.setup()
        const calls = fakeBackend(ownerRoutes())
        renderAt(EDIT)

        await user.click(await screen.findByRole("button", { name: "Detailed" }))
        expect(screen.getByLabelText("step 1 shortest wait")).toHaveValue("06:00")
        const handsOn = screen.getAllByLabelText("Hands-on (min)")
        expect(handsOn[0]).toHaveValue("")
        expect(handsOn[0]).toHaveAttribute("placeholder", "Unknown")
        expect(handsOn[1]).toHaveValue("15")
        await user.type(handsOn[0], "10")
        await user.selectOptions(screen.getAllByLabelText("Needs you home")[0], "Yes")

        await user.click(screen.getByRole("button", { name: "Simple" }))
        expect(screen.queryByLabelText("step 1 shortest wait")).toBeNull()
        await user.click(screen.getByRole("button", { name: "Save" }))

        await waitFor(() => expect(puts(calls)).toHaveLength(1))
        const body = puts(calls)[0].body
        expect(body.detail_level).toBe("simple")
        expect(body.steps[0]).toMatchObject({ active_seconds: 600, needs_presence: true })
        expect(body.steps[2]).toMatchObject({ active_seconds: null, needs_presence: null })  // unknown stays unknown
    })

    test("adds, moves, and removes steps", async () => {
        const user = userEvent.setup()
        const calls = fakeBackend(ownerRoutes())
        renderAt(EDIT)

        await user.click(await screen.findByRole("button", { name: "Add a step" }))
        const directions = screen.getAllByLabelText("Directions")
        await user.type(directions[3], "Cool")
        await user.click(screen.getByRole("button", { name: "Move step 4 up" }))
        await user.click(screen.getByRole("button", { name: "Remove step 1" }))
        await user.click(screen.getByRole("button", { name: "Save" }))

        await waitFor(() => expect(puts(calls)).toHaveLength(1))
        expect(puts(calls)[0].body.steps.map((step) => [ step.id, step.text ])).toEqual([ [ "s2", "Mix" ], [ null, "Cool" ], [ "s3", "Bake" ] ])
    })

    test("catches a missing name or step text before saving", async () => {
        const user = userEvent.setup()
        const calls = fakeBackend(ownerRoutes())
        renderAt(EDIT)

        await user.clear(await screen.findByLabelText("Name"))
        await user.click(screen.getByRole("button", { name: "Add a step" }))
        await user.click(screen.getByRole("button", { name: "Save" }))

        expect(screen.getByRole("alert")).toHaveTextContent("Check the highlighted fields")
        expect(screen.getByText("Give the recipe a name.")).toBeInTheDocument()
        expect(screen.getByText("Describe the step.")).toBeInTheDocument()
        expect(screen.getByLabelText("Name")).toHaveAttribute("aria-invalid", "true")
        expect(puts(calls)).toHaveLength(0)
    })

    test("a refused save shows the server's messages by field and keeps the changes", async () => {
        const user = userEvent.setup()
        fakeBackend(ownerRoutes({ "PUT /api/v2/recipes/r-mine": [ 400, { code: "recipe_invalid",
            message: "Check the recipe: Must be a web address starting with http:// or https://.",
            fields: { url: "Must be a web address starting with http:// or https://." } } ] }))
        renderAt(EDIT)

        await user.type(await screen.findByLabelText(/^Link/), "ftp://example.com")
        await user.click(screen.getByRole("button", { name: "Save" }))

        expect(await screen.findByRole("alert")).toHaveTextContent("Your changes didn't save, and they're still here.")
        expect(screen.getAllByText(/Must be a web address/).length).toBeGreaterThan(0)
        expect(screen.getByLabelText(/^Link/)).toHaveValue("ftp://example.com")
        expect(screen.getByText("Unsaved changes")).toBeInTheDocument()
    })

    test("picks prerequisites for bread; prep recipes have none", async () => {
        const user = userEvent.setup()
        const calls = fakeBackend(ownerRoutes())
        renderAt(EDIT)

        const poolish = await screen.findByRole("checkbox", { name: "Make a Poolish" })
        expect(screen.getByRole("checkbox", { name: "Revive a Starter" })).toBeChecked()
        await user.click(poolish)
        await user.click(screen.getByRole("button", { name: "Save" }))
        await waitFor(() => expect(puts(calls)).toHaveLength(1))
        expect(puts(calls)[0].body.prerequisites).toEqual([ "p1", "p2" ])

        await user.click(screen.getByRole("radio", { name: "Prep" }))
        expect(screen.queryByRole("checkbox", { name: "Make a Poolish" })).toBeNull()
        await user.click(screen.getByRole("button", { name: "Save" }))
        await waitFor(() => expect(puts(calls)).toHaveLength(2))
        expect(puts(calls)[1].body).toMatchObject({ category: "prep", prerequisites: [] })
    })

    test("delete asks first, mentions bakes that keep running, then goes home", async () => {
        const user = userEvent.setup()
        const calls = fakeBackend(ownerRoutes({
            "GET /api/v2/bakes":            [ 200, { bakes: [ { id: "b1", suffix: "b1xxxx", path: "/bakes/b1xxxx", name: "Country Loaf", recipe_id: "r-mine",
                                                       status: "not_started", time_zone: "UTC", anchor_type: "start",
                                                       anchor_time: "2026-11-14T18:00:00+00:00", projected_end: "2026-11-14T19:00:00+00:00",
                                                       steps: [ { position: 1, text: "Mix", wait_chosen: 3600, skipped: false,
                                                                  completed_at: null, scheduled_at: "2026-11-14T18:00:00+00:00" } ] } ] } ],
            "DELETE /api/v2/recipes/r-mine": [ 204, null ]
        }))
        renderAt(EDIT)

        await user.click(await screen.findByRole("button", { name: "Delete recipe" }))
        const dialog = screen.getByRole("alertdialog")
        expect(dialog).toHaveTextContent("This can't be undone.")
        await waitFor(() => expect(dialog).toHaveTextContent("Your bake from it will keep running."))
        await user.click(within(dialog).getByRole("button", { name: "Keep it" }))
        expect(calls.some(({ method }) => method === "DELETE")).toBe(false)

        await user.click(screen.getByRole("button", { name: "Delete recipe" }))
        await user.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Delete recipe" }))
        await waitFor(() => expect(screen.getByTestId("path")).toHaveTextContent(/^\/$/))
        expect(calls.some(({ method, path }) => method === "DELETE" && path === "/api/v2/recipes/r-mine")).toBe(true)
    })
})
