import React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, useLocation } from "react-router"
import App from "../../App"
import { FeatureLevelProvider } from "../../hooks/useFeatureLevel"
import { SessionProvider } from "../../hooks/useSession"

const USER = { id: "u1", username: "Baker_1", created_at: "2026-11-05T00:00:00+00:00" }

const summary = (overrides) => ({
    author: null, source: null, url: null, difficulty: "Intermediate", detail_level: "simple", category: "bread",
    is_draft: false, published_at: null, owner: null, is_mine: false, length_seconds: 6 * 3600, ...overrides
})
const SOURDOUGH = summary({ id: "d1", name: "Country Sourdough", path: "/recipes/country-sourdough", scope: "default" })
const STARTER = summary({ id: "d2", name: "Revive a Starter", path: "/recipes/revive-a-starter", scope: "default", category: "prep" })
const MY_RYE = summary({ id: "m1", name: "My Rye", path: "/recipes/my-rye-k7qx2m", scope: "personal", is_mine: true,
                         owner: "Baker_1", published_at: "2026-11-07T00:00:00+00:00" })
const MY_DRAFT = summary({ id: "m2", name: "", path: "/recipes/recipe-d4r4ft", scope: "personal", is_mine: true, is_draft: true })
const SHARED = summary({ id: "c1", name: "Shokupan", path: "/recipes/shokupan-x1y2z3", scope: "personal", owner: "milkbread",
                         detail_level: "detailed", published_at: "2026-11-06T00:00:00+00:00" })


function fakeBackend(routes) {
    const calls = []
    vi.stubGlobal("fetch", vi.fn(async (url, options = {}) => {
        const method = options.method || "GET"
        const parsed = new URL(url, "http://test")
        calls.push({ method, path: parsed.pathname, params: Object.fromEntries(parsed.searchParams) })
        let route = routes[`${method} ${parsed.pathname}`] || [ 200, { recipes: [] } ]
        if (typeof route === "function") route = route(Object.fromEntries(parsed.searchParams))
        const [ status, json ] = route
        return { status, ok: status >= 200 && status < 300, json: async () => json, headers: { get: () => null } }
    }))
    return calls
}

const signedIn = (extra = {}) => ({ "GET /api/v2/session": [ 200, { user: USER } ], ...extra })
const signedOut = (extra = {}) => ({ "GET /api/v2/session": [ 401, { code: "not_signed_in" } ], ...extra })
const listCalls = (calls, path) => calls.filter((call) => call.method === "GET" && call.path === path)


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


describe("my recipes", () => {
    test("lists your recipes, then the defaults to browse and copy", async () => {
        fakeBackend(signedIn({ "GET /api/v2/recipes": [ 200, { recipes: [ SOURDOUGH, STARTER, MY_RYE, MY_DRAFT ] } ] }))
        renderAt("/")

        const mine = await screen.findByRole("list", { name: "Your recipes" })
        await within(mine).findByRole("link", { name: "My Rye" })
        expect(within(mine).getByRole("link", { name: "Untitled draft" })).toHaveAttribute("href", "/recipes/recipe-d4r4ft")
        expect(within(mine).getByText("Draft")).toBeInTheDocument()
        expect(within(mine).getByText("Published")).toBeInTheDocument()
        expect(within(mine).queryByRole("button", { name: /Make/ })).toBeNull()

        const defaults = screen.getByRole("list", { name: "Breadsheet recipes" })
        expect(within(defaults).getAllByRole("listitem")).toHaveLength(2)
        expect(within(defaults).getByText(/Prep · 6 hours · Intermediate/)).toBeInTheDocument()
        expect(within(defaults).getByRole("button", { name: "Make Country Sourdough mine" })).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "+ New recipe" })).toHaveAttribute("href", "/recipes/new")
    })

    test("with none of your own yet, says how to get some", async () => {
        fakeBackend(signedIn({ "GET /api/v2/recipes": [ 200, { recipes: [ SOURDOUGH ] } ] }))
        renderAt("/")

        expect(await screen.findByText(/None yet\. Make one of these recipes yours/)).toBeInTheDocument()
    })

    test("Make it mine copies a default and opens the copy", async () => {
        const user = userEvent.setup()
        const copy = { ...SOURDOUGH, id: "m3", path: "/recipes/country-sourdough-c0pyc0", is_mine: true }
        fakeBackend(signedIn({
            "GET /api/v2/recipes": [ 200, { recipes: [ SOURDOUGH ] } ],
            "POST /api/v2/recipes/d1/copy": [ 201, { recipe: copy } ],
            "GET /api/v2/recipes/by-slug/country-sourdough-c0pyc0": [ 404, { code: "not_found", message: "Nope" } ],
            "GET /api/v2/recipes/by-suffix/c0pyc0": [ 200, { recipe: { ...copy, steps: [] } } ]
        }))
        renderAt("/")

        await user.click(await screen.findByRole("button", { name: "Make Country Sourdough mine" }))
        await waitFor(() => expect(screen.getByTestId("path")).toHaveTextContent("/recipes/country-sourdough-c0pyc0"))
    })

    test("searches by name and filters by category", async () => {
        const user = userEvent.setup()
        const calls = fakeBackend(signedIn({ "GET /api/v2/recipes": (params) =>
            [ 200, { recipes: [ SOURDOUGH, STARTER, MY_RYE ].filter((recipe) =>
                (!params.category || recipe.category === params.category) &&
                (!params.q || recipe.name.toLowerCase().includes(params.q))) } ] }))
        renderAt("/")

        await screen.findByRole("link", { name: "My Rye" })
        await user.click(screen.getByRole("button", { name: "Prep" }))
        await waitFor(() => expect(screen.queryByRole("link", { name: "My Rye" })).toBeNull())
        expect(screen.getByText("None of your recipes match.")).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Revive a Starter" })).toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: "All" }))
        await user.type(screen.getByRole("searchbox", { name: "Search recipes" }), "rye")
        await waitFor(() => expect(listCalls(calls, "/api/v2/recipes").at(-1).params).toEqual({ q: "rye" }))
        expect(await screen.findByRole("link", { name: "My Rye" })).toBeInTheDocument()
        await waitFor(() => expect(screen.queryByRole("link", { name: "Country Sourdough" })).toBeNull())
    })

    test("signed out, just the defaults, with no copy buttons", async () => {
        fakeBackend(signedOut({ "GET /api/v2/recipes": [ 200, { recipes: [ SOURDOUGH ] } ] }))
        renderAt("/")

        expect(await screen.findByRole("link", { name: "Country Sourdough" })).toBeInTheDocument()
        expect(screen.queryByRole("heading", { name: "Your recipes" })).toBeNull()
        expect(screen.queryByRole("button", { name: /mine/ })).toBeNull()
        expect(screen.queryByRole("link", { name: "+ New recipe" })).toBeNull()
    })
})


describe("the community library", () => {
    test("is linked from the home page, not the header", async () => {
        const user = userEvent.setup()
        fakeBackend(signedOut())
        renderAt("/")

        expect(within(screen.getByRole("navigation")).queryByRole("link", { name: "Community" })).toBeNull()
        await user.click(await screen.findByRole("link", { name: "Community library" }))
        expect(await screen.findByRole("heading", { name: "Community library" })).toBeInTheDocument()
        expect(screen.getByTestId("path")).toHaveTextContent("/community")
    })

    test("shows each recipe's publisher, category, and detail level, with Make it mine", async () => {
        fakeBackend(signedIn({ "GET /api/v2/community/recipes": [ 200, { recipes: [ SHARED, MY_RYE ] } ] }))
        renderAt("/community")

        const list = await screen.findByRole("list", { name: "Community recipes" })
        await within(list).findByRole("link", { name: "Shokupan" })
        expect(within(list).getByText(/by milkbread · Bread · Detailed · 6 hours/)).toBeInTheDocument()
        expect(within(list).getByRole("button", { name: "Make Shokupan mine" })).toBeInTheDocument()
        // Your own published recipe is marked, not copyable
        const mine = within(list).getByRole("link", { name: "My Rye" }).closest("li")
        expect(within(mine).getByText("Yours")).toBeInTheDocument()
        expect(within(mine).queryByRole("button")).toBeNull()
    })

    test("signed out, it's visible, and Make it mine asks you to sign in first", async () => {
        const user = userEvent.setup()
        fakeBackend(signedOut({ "GET /api/v2/community/recipes": [ 200, { recipes: [ SHARED ] } ] }))
        renderAt("/community")

        await user.click(await screen.findByRole("link", { name: "Sign in to make it yours" }))
        expect(screen.getByTestId("path")).toHaveTextContent("/signin")
    })

    test("filters by category, and says when nothing matches", async () => {
        const user = userEvent.setup()
        const calls = fakeBackend(signedOut({ "GET /api/v2/community/recipes": (params) =>
            [ 200, { recipes: params.category === "prep" ? [] : [ SHARED ] } ] }))
        renderAt("/community")

        await screen.findByRole("link", { name: "Shokupan" })
        await user.click(screen.getByRole("button", { name: "Prep" }))
        expect(await screen.findByText("No community recipes match.")).toBeInTheDocument()
        expect(listCalls(calls, "/api/v2/community/recipes").at(-1).params).toEqual({ category: "prep" })
    })

    test("before anyone has shared, says how to", async () => {
        fakeBackend(signedOut())
        renderAt("/community")

        expect(await screen.findByText(/Nobody has shared a recipe yet/)).toBeInTheDocument()
    })
})
