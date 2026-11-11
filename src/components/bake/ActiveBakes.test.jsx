import React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, useLocation } from "react-router"
import App from "../../App"
import { FeatureLevelProvider } from "../../hooks/useFeatureLevel"
import { SessionProvider } from "../../hooks/useSession"
import { applyAction, projectBake } from "../../helpers/bake"

const HOUR = 3600
const USER = { id: "u1", username: "Baker_1", created_at: "2026-11-05T00:00:00+00:00" }


// A bake whose step 1 was checked off `agoHours` ago (or, unchecked, that starts `agoHours` from now)
function makeBake(id, name, { agoHours = 1, checked = true } = {}) {
    const start = Date.now() + (checked ? -agoHours : agoHours) * HOUR * 1000
    const iso = (ms) => new Date(ms).toISOString()
    const steps = [ [ "Feed the levain", 2 * HOUR ], [ "Autolyse", 1800 ], [ "Bake", 0 ] ].map(([ text, wait ], i) => ({
        position: i + 1, text, note: null, wait_chosen: wait, skipped: false, skipped_at: null,
        completed_at: i === 0 && checked ? iso(start) : null, scheduled_at: null, hands_on: { seconds: null }
    }))
    return projectBake({
        id, suffix: `${id}xxxxx`.slice(0, 6), path: `/bakes/${`${id}xxxxx`.slice(0, 6)}`, name, recipe_id: "r1",
        recipe_path: "/recipes/loaf", recipe_deleted: false, anchor_type: "start", anchor_time: iso(start),
        time_zone: "America/Los_Angeles", alert_mode: "simple", status: checked ? "in_progress" : "not_started",
        outcome: null, completed_at: null, steps
    })
}


function fakeBackend(routes) {
    const calls = []
    vi.stubGlobal("fetch", vi.fn(async (url, options = {}) => {
        const method = options.method || "GET"
        const path = new URL(url, "http://test").pathname
        const body = options.body ? JSON.parse(options.body) : null
        calls.push({ method, path, body })
        let route = routes[`${method} ${path}`] || [ 200, { recipes: [] } ]
        if (typeof route === "function") route = route(body)
        const [ status, json ] = route
        return { status, ok: status >= 200 && status < 300, json: async () => json, headers: { get: () => null } }
    }))
    return calls
}

const signedIn = (bakes, extra = {}) => ({
    "GET /api/v2/session": [ 200, { user: USER } ],
    "GET /api/v2/bakes":   [ 200, { bakes } ],
    ...extra
})


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


beforeEach(() => {
    window.localStorage.clear()
})

afterEach(() => {
    vi.unstubAllGlobals()
})


describe("active bakes on the home page", () => {
    test("list above the recipes, each opening its bake", async () => {
        const user = userEvent.setup()
        const running = makeBake("a1", "Country Loaf")
        const later = makeBake("b2", "Shokupan", { checked: false, agoHours: 3 })
        fakeBackend(signedIn([ running, later ], { "GET /api/v2/bakes/by-suffix/a1xxxx": [ 200, { bake: running } ] }))
        renderAt("/")

        const list = await screen.findByRole("region", { name: "Active bakes" })
        const cards = within(list).getAllByRole("link")
        expect(cards).toHaveLength(2)
        expect(cards[0]).toHaveTextContent("Country Loaf")
        expect(cards[0]).toHaveTextContent(/In progress: Feed the levain · 1h left/)
        expect(cards[1]).toHaveTextContent("Not started")
        expect(cards[1]).toHaveTextContent(/Start at \w{3} \d+, \d{4} \d\d:\d\d/)
        expect(screen.queryByText(/the most you can run at once/)).toBeNull()

        await user.click(cards[0])
        expect(screen.getByTestId("path")).toHaveTextContent("/bakes/a1xxxx")
    })

    test("at three bakes, says that's the limit", async () => {
        fakeBackend(signedIn([ makeBake("a1", "One"), makeBake("b2", "Two"), makeBake("c3", "Three") ]))
        renderAt("/")

        expect(await screen.findByText(/That's three bakes, the most you can run at once/)).toBeInTheDocument()
    })

    test("signed out, there's no list and no bar, and no bakes request", async () => {
        const calls = fakeBackend({ "GET /api/v2/session": [ 401, { code: "not_signed_in" } ] })
        renderAt("/")

        await screen.findByRole("heading", { name: "Recipes" })
        await waitFor(() => expect(calls.some(({ path }) => path === "/api/v2/session")).toBe(true))
        expect(calls.some(({ path }) => path === "/api/v2/bakes")).toBe(false)
        expect(screen.queryByRole("region", { name: "Active bakes" })).toBeNull()
        expect(screen.queryByRole("region", { name: "Active bake" })).toBeNull()
    })
})


describe("the active bake bar", () => {
    test("follows the baker around, but not onto the bake view", async () => {
        const user = userEvent.setup()
        const bake = makeBake("a1", "Country Loaf")
        fakeBackend(signedIn([ bake ], { "GET /api/v2/bakes/by-suffix/a1xxxx": [ 200, { bake } ] }))
        renderAt("/convert")

        const bar = await screen.findByRole("region", { name: "Active bake" })
        expect(bar).toHaveTextContent("Baking · Country Loaf")
        expect(bar).toHaveTextContent("Step 1 of 3: Feed the levain")
        expect(bar).toHaveTextContent("1h elapsed · 1h left")
        expect(bar).toHaveTextContent("Next: Autolyse · 30m")
        expect(within(bar).getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50")

        await user.click(within(bar).getByRole("link", { name: /Country Loaf/ }))
        expect(screen.getByTestId("path")).toHaveTextContent("/bakes/a1xxxx")
        expect(await screen.findByText("In progress · step 1 of 3")).toBeInTheDocument()
        expect(screen.queryByRole("region", { name: "Active bake" })).toBeNull()
    })

    test("Done checks off the next step without leaving the page", async () => {
        const user = userEvent.setup()
        const bake = makeBake("a1", "Country Loaf")
        const calls = fakeBackend(signedIn([ bake ], {
            "POST /api/v2/bakes/a1/steps/2/complete": (body) =>
                [ 200, { bake: applyAction(bake, { type: "complete", position: 2, at: body.completed_at }) } ]
        }))
        renderAt("/convert")

        const bar = await screen.findByRole("region", { name: "Active bake" })
        await user.click(within(bar).getByRole("button", { name: "Done With This Step" }))
        expect(bar).toHaveTextContent("Step 2 of 3: Autolyse")
        expect(within(bar).getByRole("button", { name: "Finish Recipe" })).toBeInTheDocument()
        await waitFor(() => expect(calls.filter(({ method }) => method === "POST")).toHaveLength(1))
        expect(screen.getByTestId("path")).toHaveTextContent("/convert")
    })

    test("with several bakes, shows the one that needs you soonest", async () => {
        const soon = makeBake("a1", "Soon Loaf", { agoHours: 1.9 })      // next step due in 6 minutes
        const later = makeBake("b2", "Later Loaf", { agoHours: 0.5 })    // next step due in 90 minutes
        fakeBackend(signedIn([ later, soon ]))
        renderAt("/convert")

        const bar = await screen.findByRole("region", { name: "Active bake" })
        expect(bar).toHaveTextContent("Baking · Soon Loaf")
        expect(within(bar).getByRole("link", { name: "+1 more" })).toHaveAttribute("href", "/")
    })

    test("prefers a bake that's under way over one starting sooner", async () => {
        const underWay = makeBake("a1", "Under Way", { agoHours: 0.1 })            // next step in about 2 hours
        const startingSoon = makeBake("b2", "Starting Soon", { checked: false, agoHours: 0.5 })
        fakeBackend(signedIn([ startingSoon, underWay ]))
        renderAt("/convert")

        expect(await screen.findByRole("region", { name: "Active bake" })).toHaveTextContent("Baking · Under Way")
    })

    test("a bake that hasn't started shows when it starts, with no Done button", async () => {
        fakeBackend(signedIn([ makeBake("a1", "Country Loaf", { checked: false, agoHours: 2 }) ]))
        renderAt("/convert")

        const bar = await screen.findByRole("region", { name: "Active bake" })
        expect(bar).toHaveTextContent(/Start at \w{3} \d\d:\d\d/)
        expect(bar).toHaveTextContent("First up: Feed the levain · 2h")
        expect(within(bar).queryByRole("button")).toBeNull()
    })
})
