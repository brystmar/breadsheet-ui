import React from "react"
import { act, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import App from "../../App"
import { FeatureLevelProvider } from "../../hooks/useFeatureLevel"
import { SessionProvider } from "../../hooks/useSession"
import { applyAction, projectBake } from "../../helpers/bake"

const HOUR = 3600
const USER = { id: "u1", username: "Baker_1", created_at: "2026-11-05T00:00:00+00:00" }
const SUFFIX = "b4k3x9"


// A bake that started an hour ago with step 1 checked off, so step 1 is in progress
function runningBake({ checked = true } = {}) {
    const start = Date.now() - HOUR * 1000
    const iso = (ms) => new Date(ms).toISOString()
    const steps = [ [ "Feed the levain", 2 * HOUR, "6-8 hours" ], [ "Autolyse", 1800, null ], [ "Mix", 900, null ], [ "Bake", 0, null ] ]
        .map(([ text, wait, note ], i) => ({
            position: i + 1, text, note, wait_chosen: wait, wait_min: wait, wait_max: wait, skipped: false, skipped_at: null,
            completed_at: i === 0 && checked ? iso(start) : null, scheduled_at: null, hands_on: { seconds: null }
        }))
    return projectBake({
        id: "bake-1", suffix: SUFFIX, path: `/bakes/${SUFFIX}`, name: "Country Loaf", recipe_id: "r1",
        recipe_path: "/recipes/country-loaf", recipe_deleted: false, anchor_type: "start", anchor_time: iso(start),
        time_zone: "America/Los_Angeles", alert_mode: "simple", status: checked ? "in_progress" : "not_started",
        outcome: null, completed_at: null, steps
    })
}


// A fake backend: `routes` maps "METHOD /path" to [ status, body ], a function of the parsed body,
// or "offline" (fetch rejects). Records every call.
function fakeBackend(routes) {
    const calls = []
    vi.stubGlobal("fetch", vi.fn(async (url, options = {}) => {
        const method = options.method || "GET"
        const path = new URL(url, "http://test").pathname
        const body = options.body ? JSON.parse(options.body) : null
        calls.push({ method, path, body })
        let route = routes[`${method} ${path}`] || [ 200, { recipes: [] } ]
        if (typeof route === "function") route = route(body)
        if (route === "offline") throw new TypeError("Failed to fetch")
        const [ status, json ] = route
        return { status, ok: status >= 200 && status < 300, json: async () => json, headers: { get: () => null } }
    }))
    return calls
}

function routesFor(bake, extra = {}) {
    return {
        "GET /api/v2/session":                  [ 200, { user: USER } ],
        [`GET /api/v2/bakes/by-suffix/${SUFFIX}`]: [ 200, { bake } ],
        [`GET /api/v2/bakes/${bake.id}`]:        [ 200, { bake } ],
        ...extra
    }
}

// Answers a check-off or skip the way the server would
const serverTap = (bake, type, position) => (body) =>
    [ 200, { bake: applyAction(bake, { type, position, at: body.completed_at || body.skipped_at }) } ]

const posts = (calls) => calls.filter(({ method }) => method === "POST")


function renderBake() {
    window.localStorage.setItem("breadsheet.featureLevel", "m2")
    return render(
        <MemoryRouter initialEntries={[ `/bakes/${SUFFIX}` ]}>
            <FeatureLevelProvider>
                <SessionProvider>
                    <App />
                </SessionProvider>
            </FeatureLevelProvider>
        </MemoryRouter>
    )
}


beforeEach(() => {
    window.localStorage.clear()
})

afterEach(() => {
    vi.unstubAllGlobals()
})


describe("the bake view", () => {
    test("shows the step in progress, what's next, and the timeline", async () => {
        fakeBackend(routesFor(runningBake()))
        renderBake()

        expect(await screen.findByText("In progress · step 1 of 4")).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Feed the levain" })).toBeInTheDocument()
        expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50")
        expect(screen.getByText(/1h in · 1h left/)).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Autolyse" })).toBeInTheDocument()
        expect(screen.getByText(/lasts 30m/)).toBeInTheDocument()
        expect(screen.getByLabelText(/^Starts in (00:59|01:00)$/)).toBeInTheDocument()

        const timeline = within(screen.getByRole("list", { name: "Timeline steps" }))
        expect(timeline.getByText("In progress")).toBeInTheDocument()
        expect(timeline.getByText("30m")).toBeInTheDocument()
    })

    test("Done checks off the next step at the tap's time and moves on", async () => {
        const user = userEvent.setup()
        const bake = runningBake()
        const calls = fakeBackend(routesFor(bake, { "POST /api/v2/bakes/bake-1/steps/2/complete": serverTap(bake, "complete", 2) }))
        renderBake()

        const before = Date.now()
        await user.click(await screen.findByRole("button", { name: "Done, start next" }))
        expect(await screen.findByText("In progress · step 2 of 4")).toBeInTheDocument()
        await waitFor(() => expect(posts(calls)).toHaveLength(1))
        expect(Date.parse(posts(calls)[0].body.completed_at)).toBeGreaterThanOrEqual(before)
        expect(screen.queryByText("Saved, will sync")).toBeNull()
    })

    test("offline, a Done tap shows at once, says it will sync, and syncs when back online", async () => {
        const user = userEvent.setup()
        const bake = runningBake()
        let online = false
        const calls = fakeBackend(routesFor(bake, {
            "POST /api/v2/bakes/bake-1/steps/2/complete": (body) => online ? serverTap(bake, "complete", 2)(body) : "offline"
        }))
        renderBake()

        await user.click(await screen.findByRole("button", { name: "Done, start next" }))
        expect(screen.getByText("In progress · step 2 of 4")).toBeInTheDocument()
        expect(await screen.findByText("Saved, will sync")).toBeInTheDocument()
        expect(JSON.parse(window.localStorage.getItem("breadsheet.bakeQueue.bake-1"))).toHaveLength(1)

        online = true
        await act(async () => { window.dispatchEvent(new Event("online")) })
        await waitFor(() => expect(screen.queryByText("Saved, will sync")).toBeNull())
        const taps = posts(calls)
        expect(taps).toHaveLength(2)
        expect(taps[1].body.completed_at).toBe(taps[0].body.completed_at)  // the retry keeps the tap's time
        expect(window.localStorage.getItem("breadsheet.bakeQueue.bake-1")).toBeNull()
    })

    test("Skip this step skips what's next", async () => {
        const user = userEvent.setup()
        const bake = runningBake()
        const calls = fakeBackend(routesFor(bake, { "POST /api/v2/bakes/bake-1/steps/2/skip": serverTap(bake, "skip", 2) }))
        renderBake()

        await user.click(await screen.findByRole("button", { name: "Skip this step" }))
        expect(await screen.findByRole("heading", { name: "Mix" })).toBeInTheDocument()
        await waitFor(() => expect(posts(calls)).toHaveLength(1))
        expect(posts(calls)[0].body.skipped_at).toBeTruthy()
        expect(within(screen.getByRole("list", { name: "Timeline steps" })).getByText("Skipped")).toBeInTheDocument()
    })

    test("the last step left reads Done, finish bake", async () => {
        const bake = runningBake()
        const almost = [ 2, 3 ].reduce((current, position) =>
            applyAction(current, { type: "complete", position, at: new Date().toISOString() }), bake)
        fakeBackend(routesFor(almost))
        renderBake()

        expect(await screen.findByRole("button", { name: "Done, finish bake" })).toBeInTheDocument()
    })

    test("before the first check-off, Start now begins the bake", async () => {
        const user = userEvent.setup()
        const bake = runningBake({ checked: false })
        fakeBackend(routesFor(bake, { "POST /api/v2/bakes/bake-1/steps/1/complete": serverTap(bake, "complete", 1) }))
        renderBake()

        expect(await screen.findByText(/^Not started/)).toBeInTheDocument()
        await user.click(screen.getByRole("button", { name: "Start now" }))
        expect(await screen.findByText("In progress · step 1 of 4")).toBeInTheDocument()
    })

    test("Complete asks first, then finishes the bake", async () => {
        const user = userEvent.setup()
        const bake = runningBake()
        const finished = { ...bake, status: "completed", outcome: "finished", completed_at: new Date().toISOString(),
                           steps: bake.steps.map((step) => ({ ...step, completed_at: step.completed_at || new Date().toISOString() })) }
        const calls = fakeBackend(routesFor(bake, { "POST /api/v2/bakes/bake-1/complete": [ 200, { bake: finished } ] }))
        renderBake()

        await user.click(await screen.findByRole("button", { name: "Complete" }))
        expect(screen.getByText(/The 3 steps you haven't done will be checked off as done now/)).toBeInTheDocument()
        const buttons = within(screen.getByRole("alertdialog")).getAllByRole("button").map((button) => button.textContent)
        expect(buttons).toEqual([ "Keep baking", "Complete bake" ])
        await user.click(screen.getByRole("button", { name: "Complete bake" }))

        expect(await screen.findByRole("heading", { name: "Finished" })).toBeInTheDocument()
        expect(posts(calls)[0].path).toBe("/api/v2/bakes/bake-1/complete")
        expect(screen.queryByRole("button", { name: "Cancel bake" })).toBeNull()
    })

    test("Cancel asks first, and Keep baking backs out", async () => {
        const user = userEvent.setup()
        const bake = runningBake()
        const canceled = { ...bake, status: "completed", outcome: "canceled", completed_at: new Date().toISOString() }
        const calls = fakeBackend(routesFor(bake, { "POST /api/v2/bakes/bake-1/cancel": [ 200, { bake: canceled } ] }))
        renderBake()

        await user.click(await screen.findByRole("button", { name: "Cancel bake" }))
        await user.click(screen.getByRole("button", { name: "Keep baking" }))
        expect(posts(calls)).toHaveLength(0)

        await user.click(screen.getByRole("button", { name: "Cancel bake" }))
        await user.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Cancel bake" }))
        expect(await screen.findByRole("heading", { name: "Canceled" })).toBeInTheDocument()
        expect(within(screen.getByRole("list", { name: "Timeline steps" })).getAllByText("Not done")).toHaveLength(3)
    })

    test("a refused tap says why and shows the server's copy", async () => {
        const user = userEvent.setup()
        const bake = runningBake()
        fakeBackend(routesFor(bake, { "POST /api/v2/bakes/bake-1/steps/2/complete":
            [ 409, { code: "bake_completed", message: "That bake is already over." } ] }))
        renderBake()

        await user.click(await screen.findByRole("button", { name: "Done, start next" }))
        expect(await screen.findByRole("alert")).toHaveTextContent("That bake is already over.")
        expect(await screen.findByText("In progress · step 1 of 4")).toBeInTheDocument()
    })

    test("keeps running from the last copy when breadsheet can't be reached", async () => {
        const bake = runningBake()
        fakeBackend(routesFor(bake))
        const { unmount } = renderBake()
        await screen.findByText("In progress · step 1 of 4")
        unmount()

        fakeBackend(routesFor(bake, { [`GET /api/v2/bakes/by-suffix/${SUFFIX}`]: "offline" }))
        renderBake()
        expect(await screen.findByText(/can't be reached right now/)).toBeInTheDocument()
        expect(screen.getByText("In progress · step 1 of 4")).toBeInTheDocument()
    })

    test("alerts show the bake's mode, with Fancy coming soon, and Export again", async () => {
        const user = userEvent.setup()
        fakeBackend(routesFor(runningBake()))
        renderBake()

        expect(await screen.findByRole("radio", { name: "Simple" })).toBeChecked()
        expect(screen.getByRole("radio", { name: /Fancy/ })).toBeDisabled()
        await user.hover(screen.getByText("Fancy"))
        expect(screen.getByText(/Coming soon!/)).toHaveClass("shown")
        expect(screen.getByRole("button", { name: "Export again (.ics)" })).toBeInTheDocument()
    })
})


describe("Export again", () => {
    test("downloads the schedule and tells the server, for usage metrics", async () => {
        const user = userEvent.setup()
        const downloads = []
        vi.stubGlobal("URL", Object.assign(URL, { createObjectURL: vi.fn((blob) => { downloads.push(blob); return "blob:ics" }),
                                                  revokeObjectURL: vi.fn() }))
        const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {})
        const calls = fakeBackend(routesFor(runningBake(), { "POST /api/v2/events": [ 204, null ] }))
        renderBake()

        await user.click(await screen.findByRole("button", { name: "Export again (.ics)" }))
        expect(downloads).toHaveLength(1)
        await waitFor(() => expect(posts(calls).map(({ path, body }) => [ path, body ]))
            .toEqual([ [ "/api/v2/events", { type: "ics_exported", bake_id: "bake-1" } ] ]))
        click.mockRestore()
    })
})
