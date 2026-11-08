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
    { id: "s1", position: 1, text: "Feed the levain", note: "6-8 hours", then_wait: 7 * HOUR, wait_min: 6 * HOUR, wait_max: 8 * HOUR },
    { id: "s2", position: 2, text: "Proof", note: null, then_wait: 11 * HOUR, wait_min: 12 * HOUR, wait_max: 14 * HOUR },
    { id: "s3", position: 3, text: "Bake", note: null, then_wait: 1800, wait_min: 1800, wait_max: 1800 }
]

const RECIPE = {
    name: "Country Loaf", author: null, source: null, url: null, difficulty: "Advanced", detail_level: "simple",
    is_draft: false, category: "bread", prerequisite_ids: [], length_seconds: 0, steps: STEPS
}
const MINE = { ...RECIPE, id: "r-mine", slug: "country-loaf", path: "/recipes/country-loaf-k7qx2m", is_mine: true }
const DEFAULT = { ...RECIPE, id: "r-default", slug: "country-loaf", path: "/recipes/country-loaf", is_mine: false }
const NOT_FOUND = [ 404, { code: "not_found", message: "That recipe doesn't exist." } ]


// A fake backend: routes by method and path, records every call with its parsed body
function fakeBackend(routes) {
    const calls = []
    vi.stubGlobal("fetch", vi.fn(async (url, options = {}) => {
        const method = options.method || "GET"
        const path = new URL(url, "http://test").pathname
        calls.push({ method, path, body: options.body ? JSON.parse(options.body) : null })
        const [ status, body ] = routes[`${method} ${path}`] || [ 200, { recipes: [] } ]
        return { status, ok: status >= 200 && status < 300, json: async () => body, headers: { get: () => null } }
    }))
    return calls
}


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


// Routes for a signed-in owner viewing their own recipe
function ownerRoutes(extra = {}) {
    return {
        "GET /api/v2/session":                       [ 200, { user: USER } ],
        "GET /api/v2/recipes/by-slug/country-loaf-k7qx2m": NOT_FOUND,
        "GET /api/v2/recipes/by-suffix/k7qx2m":      [ 200, { recipe: MINE } ],
        "PUT /api/v2/recipes/r-mine":                [ 200, { recipe: { ...MINE, detail_level: "detailed" } } ],
        ...extra
    }
}

const puts = (calls) => calls.filter(({ method }) => method === "PUT")


beforeEach(() => {
    window.localStorage.clear()
})

afterEach(() => {
    vi.unstubAllGlobals()
})


describe("the plan view on your own recipe", () => {
    test("shows each wait as hh:mm, with its range", async () => {
        fakeBackend(ownerRoutes())
        renderAt("/recipes/country-loaf-k7qx2m")

        expect(await screen.findByLabelText("step 1 Then Wait")).toHaveValue("07:00")
        expect(screen.getByLabelText("step 1 shortest wait")).toHaveValue("06:00")
        expect(screen.getByLabelText("step 1 longest wait")).toHaveValue("08:00")
        expect(screen.getByText("Changes save to your copy of this recipe.")).toBeInTheDocument()
    })

    test("marks a Then Wait outside its range with a tooltip, and no other message", async () => {
        fakeBackend(ownerRoutes())
        renderAt("/recipes/country-loaf-k7qx2m")

        const proof = await screen.findByLabelText("step 2 Then Wait, outside range")
        expect(proof.closest(".hhmm-wrap")).toHaveClass("out")
        expect(screen.getByRole("tooltip", { hidden: true })).toHaveTextContent("Outside range")
        expect(screen.queryByText(/expected time range/)).toBeNull()
    })

    test("tidies typed minutes and saves the whole recipe", async () => {
        const user = userEvent.setup()
        const calls = fakeBackend(ownerRoutes())
        renderAt("/recipes/country-loaf-k7qx2m")

        const feed = await screen.findByLabelText("step 1 Then Wait")
        await user.clear(feed)
        await user.type(feed, "01:68")
        await user.tab()
        expect(feed).toHaveValue("02:08")

        await waitFor(() => expect(puts(calls)).toHaveLength(1))
        const body = puts(calls)[0].body
        expect(body.steps.map((step) => step.then_wait)).toEqual([ 2 * HOUR + 8 * 60, 11 * HOUR, 1800 ])
        expect(body.detail_level).toBe("simple")  // only a range change makes it Detailed
        expect(body.name).toBe("Country Loaf")
    })

    test("arrow keys change a wait by a minute, and quick changes save once", async () => {
        const user = userEvent.setup()
        const calls = fakeBackend(ownerRoutes())
        renderAt("/recipes/country-loaf-k7qx2m")

        const bake = await screen.findByLabelText("step 3 Then Wait")
        await user.click(bake)
        await user.keyboard("{ArrowUp}{ArrowUp}{ArrowUp}{ArrowDown}")
        expect(bake).toHaveValue("00:32")

        await waitFor(() => expect(puts(calls)).toHaveLength(1))
        expect(puts(calls)[0].body.steps[2].then_wait).toBe(32 * 60)
    })

    test("the stepper buttons change a wait by a minute", async () => {
        const user = userEvent.setup()
        fakeBackend(ownerRoutes())
        renderAt("/recipes/country-loaf-k7qx2m")

        await user.click(await screen.findByRole("button", { name: "Add a minute to step 3 Then Wait" }))
        // 00:31 is outside the step's 00:30 range, so the label says so
        expect(screen.getByLabelText("step 3 Then Wait, outside range")).toHaveValue("00:31")
        await user.click(screen.getByRole("button", { name: "Take a minute off step 3 Then Wait" }))
        await user.click(screen.getByRole("button", { name: "Take a minute off step 3 Then Wait" }))
        expect(screen.getByLabelText("step 3 Then Wait, outside range")).toHaveValue("00:29")
    })

    test("changing a range makes the recipe Detailed", async () => {
        const user = userEvent.setup()
        const calls = fakeBackend(ownerRoutes())
        renderAt("/recipes/country-loaf-k7qx2m")

        const longest = await screen.findByLabelText("step 3 longest wait")
        await user.clear(longest)
        await user.type(longest, "45")
        await user.tab()

        await waitFor(() => expect(puts(calls)).toHaveLength(1))
        expect(puts(calls)[0].body.detail_level).toBe("detailed")
        expect(puts(calls)[0].body.steps[2]).toMatchObject({ wait_min: 1800, wait_max: 45 * 60 })
    })

    test("a minimum longer than the maximum is flagged and not saved until fixed", async () => {
        const user = userEvent.setup()
        const calls = fakeBackend(ownerRoutes())
        renderAt("/recipes/country-loaf-k7qx2m")

        const shortest = await screen.findByLabelText("step 1 shortest wait")
        await user.clear(shortest)
        await user.type(shortest, "09:00")
        await user.tab()
        expect(screen.getByText("Min is longer than max")).toBeInTheDocument()
        await new Promise((resolve) => setTimeout(resolve, 600))
        expect(puts(calls)).toHaveLength(0)

        await user.clear(shortest)
        await user.type(shortest, "05:00")
        await user.tab()
        await waitFor(() => expect(puts(calls)).toHaveLength(1))
    })

    test("an unreadable entry goes back to the last value", async () => {
        const user = userEvent.setup()
        const calls = fakeBackend(ownerRoutes())
        renderAt("/recipes/country-loaf-k7qx2m")

        const feed = await screen.findByLabelText("step 1 Then Wait")
        await user.clear(feed)
        await user.type(feed, "soon")
        await user.tab()
        expect(feed).toHaveValue("07:00")
        await new Promise((resolve) => setTimeout(resolve, 600))
        expect(puts(calls)).toHaveLength(0)
    })

    test("a failed save keeps the change and offers to try again", async () => {
        const user = userEvent.setup()
        const calls = fakeBackend(ownerRoutes({ "PUT /api/v2/recipes/r-mine": [ 503, { code: "service_unavailable" } ] }))
        renderAt("/recipes/country-loaf-k7qx2m")

        const bake = await screen.findByLabelText("step 3 Then Wait")
        await user.click(bake)
        await user.keyboard("{ArrowUp}")
        expect(await screen.findByRole("alert")).toHaveTextContent("didn't save")
        expect(bake).toHaveValue("00:31")

        await user.click(screen.getByRole("button", { name: "try again" }))
        await waitFor(() => expect(puts(calls)).toHaveLength(2))
        expect(puts(calls)[1].body.steps[2].then_wait).toBe(31 * 60)
    })
})


describe("the plan view on someone else's recipe", () => {
    const routes = {
        "GET /api/v2/session":                    [ 200, { user: USER } ],
        "GET /api/v2/recipes/by-slug/country-loaf": [ 200, { recipe: DEFAULT } ],
        "POST /api/v2/recipes/r-default/copy":    [ 201, { recipe: MINE } ],
        "GET /api/v2/recipes/by-slug/country-loaf-k7qx2m": NOT_FOUND,
        "GET /api/v2/recipes/by-suffix/k7qx2m":   [ 200, { recipe: MINE } ]
    }

    test("grays out every wait and never saves", async () => {
        const calls = fakeBackend(routes)
        renderAt("/recipes/country-loaf")

        expect(await screen.findByLabelText("step 1 Then Wait")).toBeDisabled()
        expect(screen.getByLabelText("step 1 shortest wait")).toBeDisabled()
        expect(screen.getByRole("button", { name: "Add a minute to step 1 Then Wait" })).toBeDisabled()
        expect(screen.queryByText("Changes save to your copy of this recipe.")).toBeNull()
        expect(puts(calls)).toHaveLength(0)
    })

    test("Make it mine copies the recipe and opens the copy", async () => {
        const user = userEvent.setup()
        const calls = fakeBackend(routes)
        renderAt("/recipes/country-loaf")

        await user.click(await screen.findByRole("button", { name: "Make it mine" }))
        await waitFor(() => expect(screen.getByTestId("path")).toHaveTextContent("/recipes/country-loaf-k7qx2m"))
        expect(calls.some(({ method, path }) => method === "POST" && path === "/api/v2/recipes/r-default/copy")).toBe(true)
        expect(await screen.findByLabelText("step 1 Then Wait")).toBeEnabled()
    })

    test("signed out, it points to Register and Sign in instead", async () => {
        fakeBackend({ ...routes, "GET /api/v2/session": [ 401, { code: "not_signed_in" } ] })
        renderAt("/recipes/country-loaf")

        expect(await screen.findByRole("link", { name: "register" })).toHaveAttribute("href", "/register")
        expect(screen.getByRole("link", { name: "sign in" })).toHaveAttribute("href", "/signin")
        expect(screen.queryByRole("button", { name: "Make it mine" })).toBeNull()
    })
})


describe("Start at / Finish at", () => {
    test("toggling keeps the schedule and swaps which end is in the box", async () => {
        const user = userEvent.setup()
        fakeBackend(ownerRoutes())
        renderAt("/recipes/country-loaf-k7qx2m")

        const toggle = await screen.findByRole("button", { name: "Start at:" })
        const startText = document.querySelector(".plan-anchor-input").value
        const finishText = document.querySelector(".plan-other-time").textContent
        expect(screen.getByText("Finish at:")).toBeInTheDocument()

        await user.click(toggle)
        expect(screen.getByRole("button", { name: "Finish at:" })).toBeInTheDocument()
        expect(document.querySelector(".plan-anchor-input").value).toBe(finishText)
        expect(document.querySelector(".plan-other-time").textContent).toBe(startText)
    })
})
