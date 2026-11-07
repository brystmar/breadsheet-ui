import React from "react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, useLocation } from "react-router"
import App from "../App"
import { FeatureLevelProvider } from "../hooks/useFeatureLevel"
import { SessionProvider } from "../hooks/useSession"
import { suffixFromRecipePath } from "../helpers/recipe_paths"

const LEVEL_KEY = "breadsheet.featureLevel"

const STEPS = [
    { id: "s1", position: 1, text: "Mix the dough", then_wait: 1800, note: "Use warm water", wait_min: 0, wait_max: 0 },
    { id: "s2", position: 2, text: "Shape", then_wait: 600, note: null, wait_min: 0, wait_max: 0 }
]

const DEFAULT_RECIPE = {
    id: "r-default", slug: "country-sourdough", path: "/recipes/country-sourdough", scope: "default",
    name: "Country Sourdough", author: "Ken Forkish", source: null, url: null, difficulty: "Advanced",
    length_seconds: 2400, steps: STEPS
}

const PERSONAL_RECIPE = {
    id: "r-personal", slug: "my-rye", path: "/recipes/my-rye-k7qx2m", scope: "personal",
    name: "My Rye", author: null, source: null, url: null, difficulty: "Beginner",
    length_seconds: 2400, steps: STEPS
}

const NOT_FOUND = [ 404, { code: "not_found", message: "That recipe doesn't exist." } ]


// A fake backend: routes by method and path, records every call
function fakeBackend(routes) {
    const calls = []
    vi.stubGlobal("fetch", vi.fn(async (url, options = {}) => {
        const method = options.method || "GET"
        const path = new URL(url, "http://test").pathname
        calls.push({ method, path })
        const [ status, body ] = routes[`${method} ${path}`] ||
            (path === "/api/v2/session" ? [ 401, { code: "not_signed_in" } ] : [ 200, { data: [], recipes: [] } ])
        return {
            status,
            ok:      status >= 200 && status < 300,
            json:    async () => body,
            headers: { get: () => null }
        }
    }))
    return calls
}


// Shows the router's current path, so tests can check redirects
function CurrentPath() {
    return <output data-testid="path">{useLocation().pathname}</output>
}


function renderApp(path, level = "m2") {
    window.localStorage.setItem(LEVEL_KEY, level)
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


describe("suffixFromRecipePath", () => {
    test("finds a 6-character suffix after the last hyphen", () => {
        expect(suffixFromRecipePath("country-sourdough-k7qx2m")).toBe("k7qx2m")
    })

    test("returns null when the last part isn't 6 lowercase letters or digits", () => {
        expect(suffixFromRecipePath("country-sourdough")).toBeNull()
        expect(suffixFromRecipePath("shokupan")).toBeNull()
        expect(suffixFromRecipePath("bread-k7qx2")).toBeNull()
        expect(suffixFromRecipePath("bread-K7QX2M")).toBeNull()
    })
})


describe("public recipe URLs at M2", () => {
    test("the recipe list links to each recipe's public path", async () => {
        fakeBackend({ "GET /api/v2/recipes": [ 200, { recipes: [ DEFAULT_RECIPE, PERSONAL_RECIPE ] } ] })
        renderApp("/")

        expect(await screen.findByRole("link", { name: "Country Sourdough" }))
            .toHaveAttribute("href", "/recipes/country-sourdough")
        expect(screen.getByRole("link", { name: "My Rye" })).toHaveAttribute("href", "/recipes/my-rye-k7qx2m")
    })

    test("a default recipe opens by its slug, with one lookup", async () => {
        const calls = fakeBackend({ "GET /api/v2/recipes/by-slug/country-sourdough": [ 200, { recipe: DEFAULT_RECIPE } ] })
        renderApp("/recipes/country-sourdough")

        expect(await screen.findByRole("heading", { name: "Country Sourdough" })).toBeInTheDocument()
        expect(screen.getByText("Mix the dough")).toBeInTheDocument()
        // Images are root-relative, or they'd break under /recipes/
        for (const image of document.querySelectorAll("img")) expect(image.getAttribute("src")).toMatch(/^\//)
        expect(calls.some(({ path }) => path.startsWith("/api/v2/recipes/by-suffix"))).toBe(false)
        expect(calls.some(({ path }) => path.startsWith("/api/v1"))).toBe(false)
    })

    test("a personal recipe opens by its suffix after the slug lookup misses", async () => {
        const calls = fakeBackend({
            "GET /api/v2/recipes/by-slug/my-rye-k7qx2m": NOT_FOUND,
            "GET /api/v2/recipes/by-suffix/k7qx2m":      [ 200, { recipe: PERSONAL_RECIPE } ]
        })
        renderApp("/recipes/my-rye-k7qx2m")

        expect(await screen.findByRole("heading", { name: "My Rye" })).toBeInTheDocument()
        const lookups = calls.map(({ path }) => path).filter((path) => path.includes("/by-"))
        expect(lookups).toEqual([ "/api/v2/recipes/by-slug/my-rye-k7qx2m", "/api/v2/recipes/by-suffix/k7qx2m" ])
    })

    test("a renamed personal recipe redirects to its current path", async () => {
        fakeBackend({
            "GET /api/v2/recipes/by-slug/old-name-k7qx2m": NOT_FOUND,
            "GET /api/v2/recipes/by-suffix/k7qx2m":        [ 200, { recipe: PERSONAL_RECIPE } ],
            "GET /api/v2/recipes/by-slug/my-rye-k7qx2m":   NOT_FOUND
        })
        renderApp("/recipes/old-name-k7qx2m")

        expect(await screen.findByRole("heading", { name: "My Rye" })).toBeInTheDocument()
        expect(screen.getByTestId("path")).toHaveTextContent("/recipes/my-rye-k7qx2m")
    })

    test("a differently-cased URL redirects to the lowercase path", async () => {
        fakeBackend({ "GET /api/v2/recipes/by-slug/country-sourdough": [ 200, { recipe: DEFAULT_RECIPE } ] })
        renderApp("/recipes/Country-Sourdough")

        expect(await screen.findByRole("heading", { name: "Country Sourdough" })).toBeInTheDocument()
        expect(screen.getByTestId("path")).toHaveTextContent("/recipes/country-sourdough")
    })

    test("an unknown slug without a suffix shows not found, with one lookup", async () => {
        const calls = fakeBackend({ "GET /api/v2/recipes/by-slug/no-such-bread": NOT_FOUND })
        renderApp("/recipes/no-such-bread")

        expect(await screen.findByRole("heading", { name: "Recipe not found" })).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "See all recipes" })).toHaveAttribute("href", "/")
        expect(calls.filter(({ path }) => path.includes("/by-"))).toHaveLength(1)
    })

    test("an unknown suffix shows not found", async () => {
        fakeBackend({
            "GET /api/v2/recipes/by-slug/gone-zzzzzz": NOT_FOUND,
            "GET /api/v2/recipes/by-suffix/zzzzzz":    NOT_FOUND
        })
        renderApp("/recipes/gone-zzzzzz")

        expect(await screen.findByRole("heading", { name: "Recipe not found" })).toBeInTheDocument()
    })

    test("an API failure says so instead of not found", async () => {
        fakeBackend({ "GET /api/v2/recipes/by-slug/shokupan": [ 500, { code: "server_error", message: "Oops." } ] })
        renderApp("/recipes/shokupan")

        expect(await screen.findByRole("heading", { name: "Something went wrong" })).toBeInTheDocument()
        expect(screen.getByText("Oops.")).toBeInTheDocument()
    })

    test("an old id URL redirects to the homepage", async () => {
        fakeBackend({ "GET /api/v2/recipes": [ 200, { recipes: [ DEFAULT_RECIPE ] } ] })
        renderApp("/0168f588-a680-79c7-9d08-7442421059ee")

        expect(await screen.findByRole("link", { name: "Country Sourdough" })).toBeInTheDocument()
        expect(screen.getByTestId("path")).toHaveTextContent(/^\/$/)
    })
})


describe("recipe URLs at M1 (today's app)", () => {
    const V1_RECIPE = {
        id: "r1", name: "Country Sourdough", difficulty: "Intermediate", solve_for_start: true,
        length: 1800, start_time: 0, date_added: 0,
        steps: [ { step_id: "s1", number: 1, text: "Mix", then_wait: 1800, note: null } ]
    }

    test("the list still uses v1 and links by id", async () => {
        const calls = fakeBackend({ "GET /api/v1/recipes": [ 200, { data: [ V1_RECIPE ] } ] })
        renderApp("/", "m1")

        expect(await screen.findByRole("link", { name: "Country Sourdough" })).toHaveAttribute("href", "/r1")
        expect(calls.some(({ path }) => path.startsWith("/api/v2/recipes"))).toBe(false)
    })

    test("an id URL still opens the recipe", async () => {
        fakeBackend({
            "GET /api/v1/recipes":    [ 200, { data: [ V1_RECIPE ] } ],
            "GET /api/v1/recipe/r1":  [ 200, { data: V1_RECIPE } ]
        })
        renderApp("/r1", "m1")

        expect(await screen.findAllByText("Mix")).not.toHaveLength(0)
        expect(screen.getByTestId("path")).toHaveTextContent("/r1")
    })
})
