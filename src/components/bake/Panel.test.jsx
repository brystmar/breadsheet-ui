import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import App from "../../App"
import { FeatureLevelProvider } from "../../hooks/useFeatureLevel"
import { SessionProvider } from "../../hooks/useSession"
import { projectBake } from "../../helpers/bake"
import { setPanelToken } from "../../data/panel_token"

const HOUR = 3600
const TOKEN = "panel-token-123"


function bake(id = "bake-1", name = "Country Loaf") {
    const start = Date.now() - HOUR * 1000
    const iso = (ms) => new Date(ms).toISOString()
    const steps = [ [ "Feed the levain", 2 * HOUR ], [ "Mix", 900 ], [ "Bake", 0 ] ].map(([ text, wait ], i) => ({
        position: i + 1, text, note: null, wait_chosen: wait, wait_min: wait, wait_max: wait, skipped: false,
        skipped_at: null, completed_at: i === 0 ? iso(start) : null, scheduled_at: null, hands_on: { seconds: null }
    }))
    return projectBake({
        id, suffix: `s-${id}`, path: `/bakes/s-${id}`, name, recipe_id: "r1", recipe_path: "/recipes/country-loaf",
        recipe_deleted: false, anchor_type: "start", anchor_time: iso(start), time_zone: "America/Los_Angeles",
        alert_mode: "fancy", status: "in_progress", outcome: null, completed_at: null, steps
    })
}


// A fake backend that records each call's method, path, and Authorization header
function fakeBackend(routes) {
    const calls = []
    vi.stubGlobal("fetch", vi.fn(async (url, options = {}) => {
        const method = options.method || "GET"
        const path = new URL(url, "http://test").pathname
        calls.push({ method, path, authorization: options.headers?.Authorization ?? null, credentials: options.credentials })
        const [ status, json ] = routes[`${method} ${path}`] || [ 401, { code: "not_signed_in", message: "Sign in." } ]
        return { status, ok: status >= 200 && status < 300, json: async () => json, headers: { get: () => null } }
    }))
    return calls
}


// Opens the page the way Home Assistant does: the token in the fragment
function openPanel(path, token = TOKEN) {
    window.history.replaceState(null, "", token ? `${path}#t=${token}` : path)
    return render(
        <MemoryRouter initialEntries={[ path ]}>
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
    setPanelToken(null)
})

afterEach(() => {
    vi.unstubAllGlobals()
})


describe("Home Assistant's panel", () => {
    test("shows one bake with the panel token, and takes the token out of the address", async () => {
        const calls = fakeBackend({ "GET /api/v2/bakes/bake-1": [ 200, { bake: bake() } ] })
        openPanel("/panel/bake-1")

        expect(await screen.findByRole("heading", { name: "Country Loaf" })).toBeInTheDocument()
        const bakeCall = calls.find(({ path }) => path === "/api/v2/bakes/bake-1")
        expect(bakeCall.authorization).toBe(`Bearer ${TOKEN}`)
        expect(window.location.hash).toBe("")
        expect(window.location.pathname).toBe("/panel/bake-1")
        // Just the bake: no site header, no links that need breadsheet's own sign-in
        expect(screen.queryByRole("link", { name: "Sign in" })).not.toBeInTheDocument()
        expect(screen.queryByRole("link", { name: "View recipe" })).not.toBeInTheDocument()
        expect(screen.getByRole("link", { name: "← Active bakes" })).toHaveAttribute("href", "/panel")
    })

    test("taps go to breadsheet with the panel token", async () => {
        const user = userEvent.setup()
        const done = bake()
        const calls = fakeBackend({
            "GET /api/v2/bakes/bake-1":                  [ 200, { bake: done } ],
            "POST /api/v2/bakes/bake-1/steps/2/complete": [ 200, { bake: done } ]
        })
        openPanel("/panel/bake-1")
        await user.click(await screen.findByRole("button", { name: /^Done/ }))
        await waitFor(() => expect(calls.some(({ method }) => method === "POST")).toBe(true))
        expect(calls.find(({ method }) => method === "POST").authorization).toBe(`Bearer ${TOKEN}`)
    })

    test("with one active bake, it opens directly", async () => {
        fakeBackend({ "GET /api/v2/bakes": [ 200, { bakes: [ bake() ] } ] })
        openPanel("/panel")
        expect(await screen.findByRole("heading", { name: "Country Loaf" })).toBeInTheDocument()
    })

    test("with several, it lists them", async () => {
        fakeBackend({ "GET /api/v2/bakes": [ 200, { bakes: [ bake(), bake("bake-2", "Pizza Dough") ] } ] })
        openPanel("/panel")
        expect(await screen.findByRole("link", { name: "Pizza Dough" })).toHaveAttribute("href", "/panel/bake-2")
        expect(screen.getByRole("link", { name: "Country Loaf" })).toHaveAttribute("href", "/panel/bake-1")
    })

    test("with none, it says so", async () => {
        fakeBackend({ "GET /api/v2/bakes": [ 200, { bakes: [] } ] })
        openPanel("/panel")
        expect(await screen.findByRole("heading", { name: "No bakes going" })).toBeInTheDocument()
    })

    test("without a token, it asks to open it from Home Assistant", async () => {
        const calls = fakeBackend({})
        openPanel("/panel/bake-1", null)
        expect(await screen.findByText(/Open Breadsheet again from Home Assistant's sidebar/)).toBeInTheDocument()
        expect(calls.some(({ path }) => path.startsWith("/api/v2/bakes"))).toBe(false)
    })

    test("an expired token asks to reopen it", async () => {
        fakeBackend({ "GET /api/v2/bakes/bake-1": [ 401, { code: "token_invalid", message: "Pair again." } ] })
        openPanel("/panel/bake-1")
        expect(await screen.findByRole("heading", { name: "This view has expired" })).toBeInTheDocument()
    })

    test("during an outage, the last copy keeps running", async () => {
        fakeBackend({ "GET /api/v2/bakes/bake-1": [ 200, { bake: bake() } ] })
        const { unmount } = openPanel("/panel/bake-1")
        await screen.findByRole("heading", { name: "Country Loaf" })
        unmount()

        fakeBackend({ "GET /api/v2/bakes/bake-1": [ 503, { code: "service_unavailable", message: "Down." } ] })
        openPanel("/panel/bake-1")
        expect(await screen.findByRole("heading", { name: "Country Loaf" })).toBeInTheDocument()
        expect(screen.getByText(/last schedule fetched/)).toBeInTheDocument()
    })
})
