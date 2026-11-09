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
        await userEvent.click(await screen.findByRole("link", { name: "Admin" }))
        expect(await screen.findByRole("heading", { name: "Default recipes" })).toBeInTheDocument()
        expect(within(screen.getByRole("navigation", { name: "Admin" })).getAllByRole("link").map((a) => a.textContent))
            .toEqual([ "Recipes", "Users", "Metrics" ])
        unmount()

        fakeBackend({ "GET /api/v2/session": [ 200, { user: BAKER } ] })
        renderAt("/profile")
        await screen.findByRole("heading", { name: "Profile" })
        expect(screen.queryByRole("heading", { name: "Admin" })).not.toBeInTheDocument()
        expect(screen.queryByRole("link", { name: "Admin" })).not.toBeInTheDocument()
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


// breadsheet-ui#66: users and metrics
const USERS = [
    { id: "u-baker", username: "baker", created_at: "2026-11-08T00:00:00+00:00", is_admin: false,
      last_seen_at: "2026-11-09T00:00:00+00:00", is_active: true, is_test: false, recipe_count: 3, published_count: 1,
      bake_count: 2, active_bake_count: 1 },
    { ...ADMIN, last_seen_at: "2026-11-09T00:00:00+00:00", is_active: true, is_test: false, recipe_count: 0,
      published_count: 0, bake_count: 0, active_bake_count: 0 }
]
const NEW_KEY = "NeWkEyNeWkEyNeWkEy0123"

// The user's row in the admin list (the header also shows the signed-in username)
function rowNow(username) {
    return screen.queryAllByText(username).map((el) => el.closest("li.admin-row")).find(Boolean) ?? null
}

async function rowFor(username) {
    let row = null
    await waitFor(() => { row = rowNow(username); expect(row).not.toBeNull() })
    return row
}

describe("users", () => {
    function usersRoutes(extra = {}) {
        return adminRoutes({
            "GET /api/v2/admin/users": [ 200, { users: USERS } ],
            "GET /api/v2/admin/users?tests=0": [ 200, { users: USERS } ],
            ...extra
        })
    }

    test("lists users with their activity, hiding test users by default; filters ask the server", async () => {
        const calls = fakeBackend(usersRoutes({ "GET /api/v2/admin/users?active=1&tests=0": [ 200, { users: [ USERS[0] ] } ] }))
        renderAt("/admin/users")
        const row = await rowFor("baker")
        expect(row).toHaveTextContent("3 recipes (1 published)")
        expect(row).toHaveTextContent("2 bakes (1 active)")
        expect(await rowFor("chief")).toHaveTextContent("Admin")

        await userEvent.click(screen.getByRole("checkbox", { name: "Active only" }))
        await waitFor(() => expect(rowNow("chief")).toBeNull())
        const lists = calls.filter(({ path }) => path === "/api/v2/admin/users").length
        expect(lists).toBeGreaterThanOrEqual(2)
    })

    test("you can't reset your own key", async () => {
        fakeBackend(usersRoutes())
        renderAt("/admin/users")
        const mine = await rowFor("chief")
        expect(within(mine).queryByRole("button", { name: "Reset key" })).not.toBeInTheDocument()
        expect(within(mine).getByRole("button", { name: "Rename" })).toBeInTheDocument()
    })

    test("reset key confirms, then hands over the new key once", async () => {
        const calls = fakeBackend(usersRoutes({
            "POST /api/v2/admin/users/u-baker/key": [ 200, { user: USERS[0], key: NEW_KEY } ]
        }))
        renderAt("/admin/users")
        const row = await rowFor("baker")
        await userEvent.click(within(row).getByRole("button", { name: "Reset key" }))
        expect(screen.getByRole("alertdialog")).toHaveTextContent("Only do this for someone you can verify.")
        expect(calls.some(({ method }) => method === "POST")).toBe(false)

        await userEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Reset key" }))
        expect(await screen.findByRole("heading", { name: "New key for baker" })).toBeInTheDocument()
        expect(screen.getByLabelText("baker's key")).toHaveTextContent(NEW_KEY)
        await userEvent.click(screen.getByRole("checkbox", { name: "I've passed this key on" }))
        await userEvent.click(screen.getByRole("button", { name: "Done" }))
        expect(await screen.findByRole("heading", { name: "Users" })).toBeInTheDocument()
        expect(screen.queryByText(NEW_KEY)).not.toBeInTheDocument()
    })

    test("rename checks availability, blocks taken names, and saves", async () => {
        const calls = fakeBackend(usersRoutes({
            "GET /api/v2/usernames/chief2": [ 200, { username: "chief2", available: false, code: "username_taken",
                                                     message: "That username is taken. Please pick another." } ],
            "GET /api/v2/usernames/support": [ 200, { username: "support", available: false, code: "username_invalid",
                                                      message: "That username is reserved. Please pick another." } ],
            "PATCH /api/v2/admin/users/u-baker": (body) => [ 200, { user: { ...USERS[0], username: body.username } } ]
        }))
        renderAt("/admin/users")
        const row = await rowFor("baker")
        await userEvent.click(within(row).getByRole("button", { name: "Rename" }))
        const input = screen.getByLabelText("New username for baker")

        await userEvent.clear(input)
        await userEvent.type(input, "chief2")
        expect(await screen.findByText(/That username is taken/)).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Save" })).toBeDisabled()

        await userEvent.clear(input)
        await userEvent.type(input, "support")
        expect(await screen.findByText(/reserved.*Admins can still try it/)).toBeInTheDocument()
        await userEvent.click(screen.getByRole("button", { name: "Save" }))
        expect(await rowFor("support")).toHaveTextContent("3 recipes")
        const patch = calls.find(({ method }) => method === "PATCH")
        expect(patch.body).toEqual({ username: "support" })
    })
})


test("metrics show each question with its numbers", async () => {
    fakeBackend(adminRoutes({
        "GET /api/v2/admin/metrics": [ 200, { metrics: [
            { name: "bakes_started_vs_finished", question: "Do people finish what they start?",
              columns: [ "started", "finished", "canceled", "expired", "still_going" ],
              rows: [ { canceled: 2, expired: 1, finished: 9, started: 12, still_going: 0 } ] },
            { name: "agents", question: "Are people letting their assistant do the planning?", columns: [], rows: [] }
        ] } ]
    }))
    renderAt("/admin/metrics")
    const section = (await screen.findByRole("heading", { name: "Bakes started vs finished" })).closest("section")
    expect(section).toHaveTextContent("Do people finish what they start?")
    expect(within(section).getAllByRole("columnheader").map((th) => th.textContent))
        .toEqual([ "Started", "Finished", "Canceled", "Expired", "Still going" ])
    expect(within(section).getAllByRole("cell").map((td) => td.textContent)).toEqual([ "12", "9", "2", "1", "0" ])
    expect(screen.getByRole("heading", { name: "Agents" }).closest("section")).toHaveTextContent("None yet.")
})
