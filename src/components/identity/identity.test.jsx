import React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import App from "../../App"
import { FeatureLevelProvider } from "../../hooks/useFeatureLevel"
import { SessionProvider } from "../../hooks/useSession"

const LEVEL_KEY = "breadsheet.featureLevel"
const KEY = "AbCdEfGhIjKlMnOpQrStUv"
const USER = { id: "01a1-user", username: "Baker_1", created_at: "2026-11-05T00:00:00+00:00" }


// Unlisted routes: username checks answer "available" and connections are empty, in the real shapes;
// anything else gets an empty list. A route may be a function, for answers that change between calls.
function defaultRoute(method, path) {
    const checked = path.match(/^\/api\/v2\/usernames\/(.+)$/)
    if (method === "GET" && checked) return [ 200, { username: decodeURIComponent(checked[1]), available: true } ]
    if (method === "GET" && path === "/api/v2/connections") return [ 200, { connections: [] } ]
    return [ 200, { data: [] } ]
}


// A fake backend: routes by method and path, records every call
function fakeBackend(routes) {
    const calls = []
    const fetchMock = vi.fn(async (url, options = {}) => {
        const method = options.method || "GET"
        const path = new URL(url, "http://test").pathname
        calls.push({ method, path, body: options.body, href: window.location.href })
        const route = routes[`${method} ${path}`]
        const [ status, body, headers = {} ] = (typeof route === "function" ? route() : route) || defaultRoute(method, path)
        return {
            status,
            ok:      status >= 200 && status < 300,
            json:    async () => body,
            headers: { get: (name) => headers[name] ?? null }
        }
    })
    vi.stubGlobal("fetch", fetchMock)
    return calls
}


function renderApp(path = "/", level = "m2") {
    if (level) window.localStorage.setItem(LEVEL_KEY, level)
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
    window.history.replaceState(null, "", "/")
})

afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
})


describe("at M1 (today's app)", () => {
    test("never asks the API about sessions and shows no account links", async () => {
        const calls = fakeBackend({})
        renderApp("/", "m1")

        await waitFor(() => expect(calls.some((c) => c.path === "/api/v1/recipes")).toBe(true))
        expect(calls.some((c) => c.path.startsWith("/api/v2/"))).toBe(false)
        expect(screen.queryByRole("link", { name: "Register" })).not.toBeInTheDocument()
    })

    test("/register isn't an identity screen", () => {
        fakeBackend({})
        renderApp("/register", "m1")
        expect(screen.queryByRole("heading", { name: "Register" })).not.toBeInTheDocument()
    })
})


describe("registration", () => {
    test("pick a username, then the key is shown once and must be saved before continuing", async () => {
        const calls = fakeBackend({
            "GET /api/v2/session": [ 401, { code: "not_signed_in", message: "Not signed in" } ],
            "POST /api/v2/users":  [ 201, { user: USER, key: KEY } ]
        })
        renderApp("/register")

        await userEvent.type(await screen.findByLabelText("Username"), "Baker_1")
        await userEvent.click(screen.getByRole("button", { name: "Register" }))

        // The save-your-key screen
        expect(await screen.findByRole("heading", { name: "Save your key, Baker_1" })).toBeInTheDocument()
        expect(screen.getByLabelText("Your key")).toHaveTextContent(KEY)
        expect(screen.getByText(`${window.location.origin}/k#${KEY}`)).toBeInTheDocument()
        expect(screen.getByTitle("QR code for your sign-in link")).toBeInTheDocument()
        expect(JSON.parse(calls.find((c) => c.path === "/api/v2/users").body)).toEqual({ username: "Baker_1" })

        // Continue unlocks only once the key is saved
        const continueButton = screen.getByRole("button", { name: "Continue" })
        expect(continueButton).toBeDisabled()
        await userEvent.click(screen.getByLabelText("I've saved my key somewhere safe"))
        expect(continueButton).toBeEnabled()

        // Back to the recipes, signed in
        await userEvent.click(continueButton)
        expect(await screen.findByText("Baker_1")).toBeInTheDocument()
        expect(screen.queryByLabelText("Your key")).not.toBeInTheDocument()
    })

    test("copying the key also unlocks Continue", async () => {
        fakeBackend({
            "GET /api/v2/session": [ 401, { code: "not_signed_in" } ],
            "POST /api/v2/users":  [ 201, { user: USER, key: KEY } ]
        })
        const user = userEvent.setup()
        const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue()
        renderApp("/register")

        await user.type(await screen.findByLabelText("Username"), "Baker_1")
        await user.click(screen.getByRole("button", { name: "Register" }))
        await user.click(await screen.findByRole("button", { name: "Copy" }))

        expect(writeText).toHaveBeenCalledWith(KEY)
        expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled()
    })

    test("the rules start red and turn green as they're met", async () => {
        fakeBackend({ "GET /api/v2/session": [ 401, { code: "not_signed_in" } ] })
        renderApp("/register")

        const rule = (label) => screen.getByText(label).closest("li")
        await screen.findByLabelText("Username")
        for (const label of [ "3 to 30 characters long", "Only letters, numbers, underscores, and hyphens",
                              "Starts with a letter" ]) {
            expect(rule(label)).not.toHaveClass("met")
        }
        expect(screen.getByRole("button", { name: "Register" })).toBeDisabled()

        await userEvent.type(screen.getByLabelText("Username"), "9a")
        expect(rule("Only letters, numbers, underscores, and hyphens")).toHaveClass("met")
        expect(rule("3 to 30 characters long")).not.toHaveClass("met")
        expect(rule("Starts with a letter")).not.toHaveClass("met")

        await userEvent.clear(screen.getByLabelText("Username"))
        await userEvent.type(screen.getByLabelText("Username"), "Baker_1")
        expect(screen.getAllByRole("listitem").filter((li) => li.classList.contains("met"))).toHaveLength(3)
        expect(screen.getByRole("button", { name: "Register" })).toBeEnabled()
    })

    test("the test- prefix is reserved", async () => {
        const calls = fakeBackend({ "GET /api/v2/session": [ 401, { code: "not_signed_in" } ] })
        renderApp("/register")

        const input = await screen.findByLabelText("Username")
        const reserved = () => screen.queryByText((_, el) => el?.tagName === "P"
            && el.textContent === "The test- prefix is reserved")

        await userEvent.type(input, "test")
        expect(reserved()).not.toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Register" })).toBeEnabled()

        await userEvent.type(input, "-baker")
        expect(reserved()).toBeInTheDocument()
        expect(reserved()).toHaveClass("identity-error")
        expect(input).toHaveAttribute("aria-invalid", "true")
        expect(screen.getByRole("button", { name: "Register" })).toBeDisabled()
        await userEvent.type(input, "{Enter}")
        expect(calls.filter((call) => call.method === "POST")).toEqual([])

        // Any case counts, as on the server
        await userEvent.clear(input)
        await userEvent.type(input, "TEST-Prod-01")
        expect(reserved()).toBeInTheDocument()

        // Changing the prefix clears it
        await userEvent.clear(input)
        await userEvent.type(input, "tester-01")
        expect(reserved()).not.toBeInTheDocument()
        expect(input).not.toHaveAttribute("aria-invalid")
        expect(screen.getByRole("button", { name: "Register" })).toBeEnabled()
    })

    test("an invalid username is never sent", async () => {
        const calls = fakeBackend({ "GET /api/v2/session": [ 401, { code: "not_signed_in" } ] })
        renderApp("/register")

        await userEvent.type(await screen.findByLabelText("Username"), "9lives")
        await userEvent.click(screen.getByRole("button", { name: "Register" }))

        expect(calls.some((c) => c.path === "/api/v2/users")).toBe(false)
    })

    test("the server's message is shown when a name is taken", async () => {
        fakeBackend({
            "GET /api/v2/session": [ 401, { code: "not_signed_in" } ],
            "POST /api/v2/users":  [ 409, { code: "username_taken", message: "That username is taken. Please pick another." } ]
        })
        renderApp("/register")

        await userEvent.type(await screen.findByLabelText("Username"), "Baker_1")
        await userEvent.click(screen.getByRole("button", { name: "Register" }))

        // Taken between the check and the click: the answer moves to the availability line
        expect(await screen.findByText("That username is taken. Please pick another.")).toHaveClass("identity-error")
        expect(screen.getByRole("button", { name: "Register" })).toBeDisabled()
    })
})


// breadsheet-ui#62: the server says whether a name is available before Register
describe("username availability", () => {
    const TAKEN = { username: "BreadHead", available: false, code: "username_taken",
                    message: "That username is taken. Please pick another." }

    async function setUp(routes = {}) {
        const calls = fakeBackend({ "GET /api/v2/session": [ 401, { code: "not_signed_in" } ], ...routes })
        renderApp("/register")
        const input = await screen.findByLabelText("Username")
        const checks = () => calls.filter((call) => call.path.startsWith("/api/v2/usernames/")).map((call) => call.path)
        return { input, checks }
    }

    test("a pause in typing checks the name once, and shows it's available", async () => {
        const { input, checks } = await setUp()
        await userEvent.type(input, "Baker_1")
        expect(await screen.findByText("✓ Available")).toBeInTheDocument()
        expect(checks()).toEqual([ "/api/v2/usernames/Baker_1" ])
        expect(screen.getByRole("button", { name: "Register" })).toBeEnabled()
    })

    test("a taken name shows the server's message and disables Register", async () => {
        const { input } = await setUp({ "GET /api/v2/usernames/BreadHead": [ 200, TAKEN ] })
        await userEvent.type(input, "BreadHead")
        expect(await screen.findByText(TAKEN.message)).toHaveClass("identity-error")
        expect(input).toHaveAttribute("aria-invalid", "true")
        expect(screen.getByRole("button", { name: "Register" })).toBeDisabled()

        // Changing the name clears it
        await userEvent.type(input, "2")
        expect(screen.queryByText(TAKEN.message)).not.toBeInTheDocument()
        expect(await screen.findByText("✓ Available")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Register" })).toBeEnabled()
    })

    test("leaving the field checks right away", async () => {
        const { input, checks } = await setUp()
        await userEvent.type(input, "Baker_1")
        await userEvent.tab()
        expect(checks()).toEqual([ "/api/v2/usernames/Baker_1" ])  // before the typing pause
        expect(await screen.findByText("✓ Available")).toBeInTheDocument()
    })

    test("names that fail the local rules or use test- are never sent", async () => {
        const { input, checks } = await setUp()
        await userEvent.type(input, "9x")
        await userEvent.tab()
        await userEvent.clear(input)
        await userEvent.type(input, "test-baker")
        await userEvent.tab()
        await new Promise((resolve) => setTimeout(resolve, 700))
        expect(checks()).toEqual([])
    })

    test("a failed check doesn't block Register", async () => {
        const { input } = await setUp({ "GET /api/v2/usernames/Baker_1": [ 429, { code: "rate_limited", message: "Wait." }, { "Retry-After": "30" } ] })
        await userEvent.type(input, "Baker_1")
        await userEvent.tab()
        await waitFor(() => expect(screen.queryByText("Checking…")).not.toBeInTheDocument())
        expect(screen.queryByText("✓ Available")).not.toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Register" })).toBeEnabled()
    })

    test("each name is checked once, even when it comes back", async () => {
        const { input, checks } = await setUp()
        await userEvent.type(input, "Baker_1")
        await screen.findByText("✓ Available")
        await userEvent.type(input, "{Backspace}")
        await screen.findByText("✓ Available")
        await userEvent.type(input, "1")
        expect(screen.getByText("✓ Available")).toBeInTheDocument()
        expect(checks()).toEqual([ "/api/v2/usernames/Baker_1", "/api/v2/usernames/Baker_" ])
    })
})


describe("key links (/k#key)", () => {
    test("removes the key from the address bar before signing in, then turns on M2", async () => {
        window.history.replaceState(null, "", `/k#${KEY}`)
        const calls = fakeBackend({
            "POST /api/v2/session": [ 200, { user: USER } ],
            "GET /api/v2/session":  [ 200, { user: USER } ]
        })
        renderApp("/k", null)  // a new device starts at the default level

        await waitFor(() => expect(window.localStorage.getItem(LEVEL_KEY)).toBe("m2"))
        const signInCall = calls.find((c) => c.method === "POST" && c.path === "/api/v2/session")
        expect(JSON.parse(signInCall.body)).toEqual({ key: KEY })
        expect(signInCall.href).not.toContain(KEY)  // already gone when the request went out
        expect(window.location.href).not.toContain(KEY)
        expect(calls.filter((c) => c.method === "POST")).toHaveLength(1)
    })

    test("a wrong key explains what to do next", async () => {
        window.history.replaceState(null, "", `/k#${KEY}`)
        fakeBackend({ "POST /api/v2/session": [ 401, { code: "key_invalid",
                                                       message: "That key doesn't match any account." } ] })
        renderApp("/k", null)

        expect(await screen.findByRole("alert")).toHaveTextContent("doesn't match any account")
        expect(screen.getByRole("link", { name: "Paste your key instead" })).toBeInTheDocument()
    })

    test("too many attempts says how long to wait", async () => {
        window.history.replaceState(null, "", `/k#${KEY}`)
        fakeBackend({ "POST /api/v2/session": [ 429, { code: "rate_limited", message: "Too many" },
                                                { "Retry-After": "806" } ] })
        renderApp("/k", null)

        expect(await screen.findByRole("alert")).toHaveTextContent("Try again in about 14 minutes")
    })

    test("a link without a key doesn't call the API", async () => {
        const calls = fakeBackend({})
        renderApp("/k", null)

        expect(await screen.findByRole("alert")).toHaveTextContent("doesn't contain a key")
        expect(calls.some((c) => c.method === "POST")).toBe(false)
    })
})


describe("sign in and out", () => {
    test("pasting a key signs in", async () => {
        const calls = fakeBackend({
            "GET /api/v2/session":  [ 401, { code: "not_signed_in" } ],
            "POST /api/v2/session": [ 200, { user: USER } ]
        })
        renderApp("/signin")

        await userEvent.type(await screen.findByLabelText("Your key"), `  ${KEY}  `)
        await userEvent.click(screen.getByRole("button", { name: "Sign in" }))

        expect(await screen.findByText("Baker_1")).toBeInTheDocument()
        expect(JSON.parse(calls.find((c) => c.method === "POST").body)).toEqual({ key: KEY })
    })

    test("the header shows the signed-in user, and Sign out clears it", async () => {
        const calls = fakeBackend({
            "GET /api/v2/session":    [ 200, { user: USER } ],
            "DELETE /api/v2/session": [ 204 ]
        })
        renderApp("/")

        expect(await screen.findByText("Baker_1")).toBeInTheDocument()
        await userEvent.click(screen.getByRole("button", { name: "Sign out" }))

        expect(await screen.findByRole("link", { name: "Sign in" })).toBeInTheDocument()
        expect(calls.some((c) => c.method === "DELETE")).toBe(true)
    })
})


describe("profile (/profile)", () => {
    test("the username in the header opens the profile, with no separate Devices link", async () => {
        fakeBackend({ "GET /api/v2/session": [ 200, { user: USER } ] })
        renderApp("/")

        const profileLink = await screen.findByRole("link", { name: "Baker_1" })
        expect(screen.queryByRole("link", { name: "Devices" })).not.toBeInTheDocument()
        await userEvent.click(profileLink)

        expect(await screen.findByRole("heading", { name: "Profile" })).toBeInTheDocument()
        expect(screen.getByText(/You're signed in here as/)).toHaveTextContent("You're signed in here as Baker_1.")
        expect(screen.getByRole("heading", { name: "Devices" })).toBeInTheDocument()
        expect(screen.getByText(/You can use Breadsheet on a different device/)).toBeInTheDocument()
    })

    test("the old /devices link lands on the profile", async () => {
        fakeBackend({ "GET /api/v2/session": [ 200, { user: USER } ] })
        renderApp("/devices")
        expect(await screen.findByRole("heading", { name: "Profile" })).toBeInTheDocument()
    })

    test("signed out, it goes to Sign in", async () => {
        fakeBackend({ "GET /api/v2/session": [ 401, { code: "not_signed_in" } ] })
        renderApp("/profile")
        expect(await screen.findByLabelText("Your key")).toBeInTheDocument()
        expect(screen.queryByRole("heading", { name: "Profile" })).not.toBeInTheDocument()
    })
})


// breadsheet-ui#29: pairing Home Assistant and its connections, on /profile
describe("Home Assistant on the profile", () => {
    const SIGNED_IN = { "GET /api/v2/session": [ 200, { user: USER } ] }
    const KITCHEN = { id: "0193-kitchen", label: "Kitchen HA", scopes: [ "recipes:read" ],
                      created_at: "2026-11-01T18:00:00+00:00", last_used_at: "2026-11-07T09:00:00+00:00" }
    const CABIN = { id: "0193-cabin", label: "Cabin", scopes: [ "recipes:read" ],
                    created_at: "2026-11-02T18:00:00+00:00", last_used_at: null }
    const inMinutes = (minutes) => new Date(Date.now() + minutes * 60_000).toISOString()

    test("it's marked under construction and has an anchor for pairing links", async () => {
        fakeBackend(SIGNED_IN)
        renderApp("/profile")
        const heading = await screen.findByRole("heading", { name: /Home Assistant/ })
        expect(heading).toHaveTextContent("Under construction")
        expect(heading.closest("section")).toHaveAttribute("id", "home-assistant")
        expect(await screen.findByText("No Home Assistant connected yet.")).toBeInTheDocument()
    })

    test("lists connections with when they were paired and last used", async () => {
        fakeBackend({ ...SIGNED_IN, "GET /api/v2/connections": [ 200, { connections: [ CABIN, KITCHEN ] } ] })
        renderApp("/profile")
        await screen.findByText("Cabin")
        const rows = screen.getAllByRole("listitem").filter((li) => li.classList.contains("connection"))
        expect(rows.map((li) => li.querySelector("strong").textContent)).toEqual([ "Cabin", "Kitchen HA" ])
        expect(rows[0]).toHaveTextContent("Not used yet")
        expect(rows[1]).toHaveTextContent(/Last used Nov \d, 2026/)
    })

    test("gets a code, shows it with a countdown, and copies it", async () => {
        const calls = fakeBackend({ ...SIGNED_IN,
                                    "POST /api/v2/pairing-codes": [ 201, { code: "7KQ2-M9XD", expires_at: inMinutes(10) } ] })
        const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue()
        renderApp("/profile")

        await userEvent.click(await screen.findByRole("button", { name: "Get a pairing code" }))
        expect(await screen.findByText("7KQ2-M9XD")).toHaveClass("pairing-code")
        expect(screen.getByText(/Expires in (10:00|9:5\d)/)).toBeInTheDocument()
        const post = calls.find((call) => call.method === "POST" && call.path === "/api/v2/pairing-codes")
        expect(post).toBeTruthy()

        await userEvent.click(screen.getByRole("button", { name: "Copy" }))
        expect(writeText).toHaveBeenCalledWith("7KQ2-M9XD")
        expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Get a new code" })).toBeInTheDocument()
    })

    test("an expired code says so and offers a new one", async () => {
        fakeBackend({ ...SIGNED_IN,
                      "POST /api/v2/pairing-codes": [ 201, { code: "7KQ2-M9XD", expires_at: new Date(Date.now() + 1200).toISOString() } ] })
        renderApp("/profile")
        await userEvent.click(await screen.findByRole("button", { name: "Get a pairing code" }))
        expect(await screen.findByText("7KQ2-M9XD")).toBeInTheDocument()
        expect(await screen.findByText("This code expired.", {}, { timeout: 3000 })).toBeInTheDocument()
        expect(screen.queryByText("7KQ2-M9XD")).not.toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Get a new code" })).toBeEnabled()
    })

    test("notices when Home Assistant pairs, then stops looking", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true })
        try {
            let paired = false
            const calls = fakeBackend({
                ...SIGNED_IN,
                "GET /api/v2/connections": () => [ 200, { connections: paired ? [ CABIN, KITCHEN ] : [ KITCHEN ] } ],
                "POST /api/v2/pairing-codes": [ 201, { code: "7KQ2-M9XD", expires_at: inMinutes(10) } ]
            })
            const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
            renderApp("/profile")
            await screen.findByText("Kitchen HA")
            await user.click(screen.getByRole("button", { name: "Get a pairing code" }))
            await screen.findByText("7KQ2-M9XD")

            await vi.advanceTimersByTimeAsync(5000)   // no pairing yet: the code stays
            expect(screen.getByText("7KQ2-M9XD")).toBeInTheDocument()

            paired = true
            await vi.advanceTimersByTimeAsync(5000)
            expect(await screen.findByText("✓ Paired with Cabin")).toBeInTheDocument()
            expect(screen.queryByText("7KQ2-M9XD")).not.toBeInTheDocument()
            expect(screen.getByText("Cabin")).toBeInTheDocument()

            const lists = () => calls.filter((call) => call.path === "/api/v2/connections").length
            const before = lists()
            await vi.advanceTimersByTimeAsync(20_000)
            expect(lists()).toBe(before)
        } finally {
            vi.useRealTimers()
        }
    })

    test("revoking asks first, warns about assistants, and removes the row", async () => {
        const calls = fakeBackend({ ...SIGNED_IN,
                                    "GET /api/v2/connections": [ 200, { connections: [ KITCHEN ] } ],
                                    "DELETE /api/v2/connections/0193-kitchen": [ 204, null ] })
        renderApp("/profile")
        await screen.findByText("Kitchen HA")

        await userEvent.click(screen.getByRole("button", { name: "Revoke" }))
        const dialog = screen.getByRole("alertdialog")
        expect(dialog).toHaveTextContent("Revoke Kitchen HA? Home Assistant loses access right away, along with any AI assistants connected through it.")
        await userEvent.click(screen.getByRole("button", { name: "Keep it" }))
        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
        expect(calls.some((call) => call.method === "DELETE")).toBe(false)

        await userEvent.click(screen.getByRole("button", { name: "Revoke" }))
        await userEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Revoke" }))
        expect(await screen.findByText("No Home Assistant connected yet.")).toBeInTheDocument()
        expect(calls.filter((call) => call.method === "DELETE").map((call) => call.path)).toEqual([ "/api/v2/connections/0193-kitchen" ])
    })

    test("a connection already revoked elsewhere just disappears", async () => {
        fakeBackend({ ...SIGNED_IN,
                      "GET /api/v2/connections": [ 200, { connections: [ KITCHEN ] } ],
                      "DELETE /api/v2/connections/0193-kitchen": [ 404, { code: "not_found", message: "Not found." } ] })
        renderApp("/profile")
        await userEvent.click(await screen.findByRole("button", { name: "Revoke" }))
        await userEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Revoke" }))
        expect(await screen.findByText("No Home Assistant connected yet.")).toBeInTheDocument()
        expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    })

    test("failures show the server's message", async () => {
        fakeBackend({ ...SIGNED_IN,
                      "GET /api/v2/connections": [ 503, { code: "service_unavailable", message: "Breadsheet is busy. Try again in a minute." } ],
                      "POST /api/v2/pairing-codes": [ 401, { code: "not_signed_in", message: "Sign in to do that." } ] })
        renderApp("/profile")
        expect(await screen.findByText(/Breadsheet is busy/)).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument()
        await userEvent.click(screen.getByRole("button", { name: "Get a pairing code" }))
        expect(await screen.findByText("Sign in to do that.")).toBeInTheDocument()
    })
})


test("the key never reaches the console or browser storage", async () => {
    const logged = []
    for (const method of [ "log", "debug", "info", "warn", "error" ]) {
        vi.spyOn(console, method).mockImplementation((...args) => logged.push(args.map(String).join(" ")))
    }
    fakeBackend({
        "GET /api/v2/session":  [ 401, { code: "not_signed_in" } ],
        "POST /api/v2/users":   [ 201, { user: USER, key: KEY } ]
    })
    renderApp("/register")

    await userEvent.type(await screen.findByLabelText("Username"), "Baker_1")
    await userEvent.click(screen.getByRole("button", { name: "Register" }))
    await screen.findByLabelText("Your key")

    expect(logged.join("\n")).not.toContain(KEY)
    expect(JSON.stringify({ ...window.localStorage })).not.toContain(KEY)
    expect(JSON.stringify({ ...window.sessionStorage })).not.toContain(KEY)
})
