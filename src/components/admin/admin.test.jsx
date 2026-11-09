import React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, useLocation } from "react-router"
import App from "../../App"
import { FeatureLevelProvider } from "../../hooks/useFeatureLevel"
import { SessionProvider } from "../../hooks/useSession"

// breadsheet-ui#65: admins curate default recipes with the recipe editor

const ADMIN = { id: "u-admin", username: "chief", created_at: "2026-11-05T00:00:00+00:00", is_admin: true }
const BAKER = { ...ADMIN, id: "u-baker", username: "baker", is_admin: false }
const STEPS = [
    { id: "s1", position: 1, text: "Mix", note: null, then_wait: 3600, wait_min: 3600, wait_max: 3600,
      active_seconds: null, needs_presence: null, warnings: [] },
    { id: "s2", position: 2, text: "Bake", note: null, then_wait: 0, wait_min: 0, wait_max: 0,
      active_seconds: null, needs_presence: null, warnings: [] }
]
const SOURDOUGH = {
    id: "r-sour", slug: "country-sourdough", path: "/recipes/country-sourdough", scope: "default", owner: null,
    is_mine: false, is_draft: false, published_at: null, archived_at: null, name: "Country Sourdough", author: null,
    source: null, url: null, difficulty: "Intermediate", detail_level: "simple", category: "bread",
    prerequisite_ids: [], prerequisites: [], length_seconds: 3600, step_count: 2, steps: STEPS
}
const BAGELS = { ...SOURDOUGH, id: "r-bagels", slug: "bagels", path: "/recipes/bagels", name: "Old Bagels",
                 archived_at: "2026-11-01T00:00:00+00:00" }
const PREP_DEFAULT = { ...SOURDOUGH, id: "p-default", name: "Revive a Starter", category: "prep" }
const PREP_MINE = { ...PREP_DEFAULT, id: "p-mine", name: "My Poolish", scope: "personal", is_mine: true }


function fakeBackend(routes) {
    const calls = []
    vi.stubGlobal("fetch", vi.fn(async (url, options = {}) => {
        const method = options.method || "GET"
        const parsed = new URL(url, "http://test")
        const body = options.body ? JSON.parse(options.body) : null
        calls.push({ method, path: parsed.pathname, body })
        let route = routes[`${method} ${parsed.pathname}${parsed.search}`] || routes[`${method} ${parsed.pathname}`] || [ 200, { recipes: [] } ]
        if (typeof route === "function") route = route(body)
        const [ status, json ] = route
        return { status, ok: status >= 200 && status < 300, json: async () => json, headers: { get: () => null } }
    }))
    return calls
}

function adminRoutes(extra = {}) {
    return {
        "GET /api/v2/session":                [ 200, { user: ADMIN } ],
        "GET /api/v2/connections":            [ 200, { connections: [] } ],
        "GET /api/v2/admin/recipes":          [ 200, { recipes: [ SOURDOUGH, BAGELS ] } ],
        "GET /api/v2/recipes/r-sour":         [ 200, { recipe: SOURDOUGH } ],
        "GET /api/v2/recipes/r-bagels":       [ 200, { recipe: BAGELS } ],
        "GET /api/v2/recipes?category=prep":  [ 200, { recipes: [ PREP_DEFAULT, PREP_MINE ] } ],
        "PUT /api/v2/admin/recipes/r-sour":   (body) => [ 200, { recipe: { ...SOURDOUGH, ...body,
                                                  steps: body.steps.map((s, i) => ({ ...s, id: s.id || `n${i}`, position: i + 1, warnings: [] })) } } ],
        "POST /api/v2/admin/recipes":         (body) => [ 201, { recipe: { ...SOURDOUGH, ...body, id: "r-new", path: "/recipes/rye",
                                                  steps: body.steps.map((s, i) => ({ ...s, id: `n${i}`, position: i + 1, warnings: [] })) } } ],
        "DELETE /api/v2/admin/recipes/r-sour": [ 204, null ],
        "GET /api/v2/recipes/r-new":          [ 200, { recipe: { ...SOURDOUGH, id: "r-new", name: "Rye", path: "/recipes/rye" } } ],
        ...extra
    }
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

const writes = (calls) => calls.filter(({ method }) => method !== "GET")

beforeEach(() => window.localStorage.clear())
afterEach(() => vi.unstubAllGlobals())


describe("who sees admin", () => {
    test.each([
        [ "a signed-in non-admin", { "GET /api/v2/session": [ 200, { user: BAKER } ] } ],
        [ "someone signed out", { "GET /api/v2/session": [ 401, { code: "not_signed_in", message: "Sign in." } ] } ]
    ])("%s is sent home from /admin", async (_, routes) => {
        const calls = fakeBackend(routes)
        renderAt("/admin/recipes/r-sour")
        await waitFor(() => expect(screen.getByTestId("path")).toHaveTextContent(/^\/$/))
        expect(screen.queryByRole("heading", { name: /default recipe/i })).not.toBeInTheDocument()
        expect(calls.some(({ path }) => path.startsWith("/api/v2/admin"))).toBe(false)
    })

    test("only admins get the Admin link on the profile", async () => {
        fakeBackend(adminRoutes())
        const { unmount } = renderAt("/profile")
        await userEvent.click(await screen.findByRole("link", { name: "Default recipes" }))
        expect(await screen.findByRole("heading", { name: "Default recipes" })).toBeInTheDocument()
        unmount()

        fakeBackend({ "GET /api/v2/session": [ 200, { user: BAKER } ] })
        renderAt("/profile")
        await screen.findByRole("heading", { name: "Profile" })
        expect(screen.queryByRole("heading", { name: "Admin" })).not.toBeInTheDocument()
        expect(screen.queryByRole("link", { name: "Default recipes" })).not.toBeInTheDocument()
    })

    test("admins get Edit default on a default's plan view; others don't", async () => {
        const plan = { "GET /api/v2/recipes/by-slug/country-sourdough": [ 200, { recipe: SOURDOUGH } ] }
        fakeBackend(adminRoutes(plan))
        const { unmount } = renderAt("/recipes/country-sourdough")
        expect(await screen.findByRole("link", { name: "Edit default" })).toHaveAttribute("href", "/admin/recipes/r-sour")
        unmount()

        fakeBackend({ "GET /api/v2/session": [ 200, { user: BAKER } ], ...plan })
        renderAt("/recipes/country-sourdough")
        await screen.findByRole("heading", { name: "Country Sourdough" })
        expect(screen.queryByRole("link", { name: "Edit default" })).not.toBeInTheDocument()
    })
})


describe("the default recipes list", () => {
    test("lists every default, archived ones marked, with New default", async () => {
        fakeBackend(adminRoutes())
        renderAt("/admin/recipes")
        await screen.findByRole("link", { name: "Country Sourdough" })
        const rows = screen.getAllByRole("listitem").filter((li) => li.classList.contains("admin-row"))
        expect(rows.map((li) => within(li).getByRole("link").textContent)).toEqual([ "Country Sourdough", "Old Bagels" ])
        expect(rows[1]).toHaveTextContent("Archived")
        expect(rows[0]).toHaveTextContent("Bread · Simple · 2 steps")
        expect(screen.getByRole("link", { name: "New default recipe" })).toHaveAttribute("href", "/admin/recipes/new")
    })
})


describe("editing a default", () => {
    test("saves through the admin endpoint, never as a draft, with no Community section", async () => {
        const calls = fakeBackend(adminRoutes())
        renderAt("/admin/recipes/r-sour")
        const name = await screen.findByLabelText("Name")
        expect(screen.getByRole("heading", { name: "Edit default recipe" })).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Save as draft" })).not.toBeInTheDocument()
        expect(screen.queryByRole("heading", { name: "Community" })).not.toBeInTheDocument()

        await userEvent.clear(name)
        await userEvent.type(name, "Country Sourdough II")
        await userEvent.click(screen.getByRole("button", { name: "Save" }))
        expect(await screen.findByText("Saved.")).toBeInTheDocument()

        const [ put ] = writes(calls)
        expect(put.method).toBe("PUT")
        expect(put.path).toBe("/api/v2/admin/recipes/r-sour")
        expect(put.body).toMatchObject({ name: "Country Sourdough II", is_draft: false })
        expect(screen.getByTestId("path")).toHaveTextContent("/admin/recipes/r-sour")
    })

    test("offers only default prep recipes as prerequisites", async () => {
        fakeBackend(adminRoutes())
        renderAt("/admin/recipes/r-sour")
        expect(await screen.findByRole("checkbox", { name: "Revive a Starter" })).toBeInTheDocument()
        expect(screen.queryByRole("checkbox", { name: "My Poolish" })).not.toBeInTheDocument()
    })

    test("archiving confirms first, then returns to the list", async () => {
        const calls = fakeBackend(adminRoutes())
        renderAt("/admin/recipes/r-sour")
        await userEvent.click(await screen.findByRole("button", { name: "Archive recipe" }))
        expect(screen.getByRole("alertdialog")).toHaveTextContent("There's no unarchive here.")
        await userEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Archive recipe" }))
        expect(await screen.findByRole("heading", { name: "Default recipes" })).toBeInTheDocument()
        expect(writes(calls).map(({ method, path }) => `${method} ${path}`)).toEqual([ "DELETE /api/v2/admin/recipes/r-sour" ])
    })

    test("an archived default says so and can't be archived again", async () => {
        fakeBackend(adminRoutes())
        renderAt("/admin/recipes/r-bagels")
        expect(await screen.findByText(/^Archived: hidden from every list/)).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Archive recipe" })).not.toBeInTheDocument()
    })

    test("a personal recipe's id isn't editable here", async () => {
        fakeBackend(adminRoutes({ "GET /api/v2/recipes/p-mine": [ 200, { recipe: PREP_MINE } ] }))
        renderAt("/admin/recipes/p-mine")
        expect(await screen.findByText("That isn't a default recipe.")).toBeInTheDocument()
        expect(screen.queryByLabelText("Name")).not.toBeInTheDocument()
    })
})


test("a new default is created through the admin endpoint, then opens for editing", async () => {
    const calls = fakeBackend(adminRoutes())
    renderAt("/admin/recipes/new")
    expect(await screen.findByRole("heading", { name: "New default recipe" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Save as draft" })).not.toBeInTheDocument()
    await userEvent.type(screen.getByLabelText("Name"), "Rye")
    await userEvent.type(screen.getByLabelText("Directions"), "Mix the rye")
    await userEvent.click(screen.getByRole("button", { name: "Save" }))

    expect(await screen.findByText("Saved.")).toBeInTheDocument()
    const [ post ] = writes(calls)
    expect(`${post.method} ${post.path}`).toBe("POST /api/v2/admin/recipes")
    expect(post.body).toMatchObject({ name: "Rye", is_draft: false })
    expect(screen.getByTestId("path")).toHaveTextContent("/admin/recipes/r-new")
})
