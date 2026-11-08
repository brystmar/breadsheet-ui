import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, useLocation } from "react-router"
import App from "../../App"
import { FeatureLevelProvider } from "../../hooks/useFeatureLevel"
import { SessionProvider } from "../../hooks/useSession"

const HOUR = 3600
const USER = { id: "u1", username: "Baker_1", created_at: "2026-11-05T00:00:00+00:00" }

const STEPS = [
    { id: "s1", position: 1, text: "Feed the levain", note: null, then_wait: 7 * HOUR, default_wait: 7 * HOUR,
      wait_min: 6 * HOUR, wait_max: 8 * HOUR },
    { id: "s2", position: 2, text: "Proof", note: null, then_wait: 11 * HOUR, default_wait: 11 * HOUR,
      wait_min: 11 * HOUR, wait_max: 14 * HOUR },
    { id: "s3", position: 3, text: "Bake", note: null, then_wait: 1800, default_wait: 1800,
      wait_min: 1800, wait_max: 1800 }
]
const RECIPE = {
    id: "r-default", slug: "country-loaf", path: "/recipes/country-loaf", is_mine: false,
    name: "Country Loaf", author: null, source: null, url: null, difficulty: "Advanced", detail_level: "simple",
    is_draft: false, category: "bread", prerequisite_ids: [ "p1" ], length_seconds: 0, steps: STEPS,
    prerequisites: [ { id: "p1", name: "Revive a Starter", path: "/recipes/revive-a-starter", category: "prep" } ]
}
const BAKE = {
    id: "b1", suffix: "b4k3x9", path: "/bakes/b4k3x9", name: "Country Loaf", recipe_id: "r-default",
    recipe_path: "/recipes/country-loaf", recipe_deleted: false, anchor_type: "start",
    anchor_time: "2026-11-14T18:00:00+00:00", time_zone: "America/Los_Angeles", alert_mode: "simple",
    status: "not_started", projected_end: "2026-11-15T12:30:00+00:00",
    steps: [
        { position: 1, text: "Feed the levain", skipped: false, scheduled_at: "2026-11-14T18:00:00+00:00", hands_on: { seconds: null } },
        { position: 2, text: "Proof", skipped: false, scheduled_at: "2026-11-15T01:00:00+00:00", hands_on: { seconds: null } },
        { position: 3, text: "Bake", skipped: false, scheduled_at: "2026-11-15T12:00:00+00:00", hands_on: { seconds: null } }
    ]
}


// A fake backend: routes by method and path, records every call with its headers and parsed body
function fakeBackend(routes) {
    const calls = []
    vi.stubGlobal("fetch", vi.fn(async (url, options = {}) => {
        const method = options.method || "GET"
        const path = new URL(url, "http://test").pathname
        calls.push({ method, path, headers: options.headers || {}, body: options.body ? JSON.parse(options.body) : null })
        const [ status, body ] = routes[`${method} ${path}`] || [ 200, { recipes: [] } ]
        return { status, ok: status >= 200 && status < 300, json: async () => body, headers: { get: () => null } }
    }))
    return calls
}

function signedInRoutes(extra = {}) {
    return {
        "GET /api/v2/session":                     [ 200, { user: USER } ],
        "GET /api/v2/recipes/by-slug/country-loaf": [ 200, { recipe: RECIPE } ],
        "POST /api/v2/bakes":                       [ 201, { bake: BAKE } ],
        "GET /api/v2/bakes/by-suffix/b4k3x9":       [ 200, { bake: BAKE } ],
        ...extra
    }
}

const posts = (calls) => calls.filter(({ method, path }) => method === "POST" && path === "/api/v2/bakes")


function CurrentPath() {
    const location = useLocation()
    return <output data-testid="path" data-state={JSON.stringify(location.state)}>{location.pathname}</output>
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


let downloads
beforeEach(() => {
    window.localStorage.clear()
    downloads = []
    vi.stubGlobal("URL", Object.assign(URL, {
        createObjectURL: vi.fn((blob) => { downloads.push(blob); return "blob:ics" }),
        revokeObjectURL: vi.fn()
    }))
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {})
})

afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
})


describe("Start bake", () => {
    test("opens from the plan view with its anchor", async () => {
        const user = userEvent.setup()
        fakeBackend(signedInRoutes())
        renderAt("/recipes/country-loaf")

        await user.click(await screen.findByRole("button", { name: "Start bake" }))
        expect(await screen.findByRole("heading", { name: "Start bake" })).toBeInTheDocument()
        expect(screen.getByTestId("path")).toHaveTextContent("/recipes/country-loaf/start")
        expect(screen.getByRole("button", { name: "Start at" })).toHaveAttribute("aria-pressed", "true")
    })

    test("signed out, Start bake on the plan goes to sign in and back", async () => {
        const user = userEvent.setup()
        fakeBackend({ ...signedInRoutes(), "GET /api/v2/session": [ 401, { code: "not_signed_in" } ] })
        renderAt("/recipes/country-loaf")

        await user.click(await screen.findByRole("button", { name: "Start bake" }))
        expect(screen.getByTestId("path")).toHaveTextContent("/signin")
        expect(JSON.parse(screen.getByTestId("path").dataset.state)).toEqual({ from: "/recipes/country-loaf/start" })
    })

    test("reminds you of prerequisites, with links", async () => {
        fakeBackend(signedInRoutes())
        renderAt("/recipes/country-loaf/start")

        expect(await screen.findByText("You'll need this ready when the bake starts:")).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Revive a Starter" })).toHaveAttribute("href", "/recipes/revive-a-starter")
    })

    test("starts a Simple bake with an idempotency key, downloads the ICS, and opens the bake", async () => {
        const user = userEvent.setup()
        const calls = fakeBackend(signedInRoutes())
        renderAt("/recipes/country-loaf/start")

        await user.click(await screen.findByRole("button", { name: "Start bake" }))
        await waitFor(() => expect(screen.getByTestId("path")).toHaveTextContent("/bakes/b4k3x9"))

        const [ post ] = posts(calls)
        expect(post.headers["Idempotency-Key"]).toMatch(/.{8,}/)
        expect(post.body).toMatchObject({ recipe_id: "r-default", anchor_type: "start", alert_mode: "simple", start_at_step: 1 })
        expect(post.body.time_zone).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone)
        expect(post.body.anchor_time).toMatch(/Z$/)
        expect(post.body.waits).toBeUndefined()  // the recipe's own waits

        expect(downloads).toHaveLength(1)
        expect(await downloads[0].text()).toContain("UID:b4k3x9-1@breadsheet.com")
        expect(await screen.findByRole("heading", { name: "Country Loaf" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Export again (.ics)" })).toBeInTheDocument()
    })

    test("can skip the ICS download", async () => {
        const user = userEvent.setup()
        fakeBackend(signedInRoutes())
        renderAt("/recipes/country-loaf/start")

        await user.click(await screen.findByRole("checkbox", { name: "Export calendar events as ICS" }))
        expect(screen.queryByText(/Downloads the schedule/)).toBeNull()
        await user.click(screen.getByRole("button", { name: "Start bake" }))
        await waitFor(() => expect(screen.getByTestId("path")).toHaveTextContent("/bakes/b4k3x9"))
        expect(downloads).toHaveLength(0)
    })

    test("can begin partway through", async () => {
        const user = userEvent.setup()
        const calls = fakeBackend(signedInRoutes())
        renderAt("/recipes/country-loaf/start")

        await user.selectOptions(await screen.findByLabelText("Begin at step"), "3. Bake")
        expect(screen.getByText("Steps 1–2 will be marked skipped, and the bake begins at step 3.")).toBeInTheDocument()
        await user.click(screen.getByRole("button", { name: "Start bake" }))
        await waitFor(() => expect(posts(calls)).toHaveLength(1))
        expect(posts(calls)[0].body.start_at_step).toBe(3)
    })

    test("sends the zone you pick, reading the time in that zone", async () => {
        const user = userEvent.setup()
        const calls = fakeBackend(signedInRoutes())
        renderAt("/recipes/country-loaf/start")

        await user.selectOptions(await screen.findByLabelText("Time zone"), "Asia/Tokyo")
        await user.click(screen.getByRole("button", { name: "Start bake" }))
        await waitFor(() => expect(posts(calls)).toHaveLength(1))
        expect(posts(calls)[0].body.time_zone).toBe("Asia/Tokyo")
        // A quarter-hour wall time in Tokyo (UTC+9, no DST) is a quarter-hour instant
        expect(new Date(posts(calls)[0].body.anchor_time).getUTCMinutes() % 15).toBe(0)
    })

    test("Fancy is shown but can't be picked", async () => {
        const user = userEvent.setup()
        fakeBackend(signedInRoutes())
        renderAt("/recipes/country-loaf/start")

        expect(await screen.findByRole("radio", { name: "Simple" })).toBeChecked()
        expect(screen.getByRole("radio", { name: /Fancy/ })).toBeDisabled()
        await user.click(screen.getByText("Phone alerts through Home Assistant"))
        expect(screen.getByRole("tooltip")).toHaveTextContent("Coming soon!")
    })

    test("a refused start says why and stays put", async () => {
        const user = userEvent.setup()
        fakeBackend(signedInRoutes({ "POST /api/v2/bakes": [ 409, { code: "bake_limit_reached",
            message: "You can have up to 3 bakes going at once. Finish or cancel one first." } ] }))
        renderAt("/recipes/country-loaf/start")

        await user.click(await screen.findByRole("button", { name: "Start bake" }))
        expect(await screen.findByRole("alert")).toHaveTextContent("up to 3 bakes")
        expect(screen.getByTestId("path")).toHaveTextContent("/recipes/country-loaf/start")
        expect(downloads).toHaveLength(0)
    })

    test("a retry of the same choices reuses the idempotency key", async () => {
        const user = userEvent.setup()
        const calls = fakeBackend(signedInRoutes({ "POST /api/v2/bakes": [ 503, { code: "service_unavailable" } ] }))
        renderAt("/recipes/country-loaf/start")

        const start = await screen.findByRole("button", { name: "Start bake" })
        await user.click(start)
        await screen.findByRole("alert")
        await user.click(start)
        await waitFor(() => expect(posts(calls)).toHaveLength(2))
        expect(posts(calls)[1].headers["Idempotency-Key"]).toBe(posts(calls)[0].headers["Idempotency-Key"])
    })

    test("signed out, the Start bake screen points to sign in", async () => {
        fakeBackend({ ...signedInRoutes(), "GET /api/v2/session": [ 401, { code: "not_signed_in" } ] })
        renderAt("/recipes/country-loaf/start")

        expect(await screen.findByRole("link", { name: "sign in" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Start bake" })).toBeDisabled()
    })
})
