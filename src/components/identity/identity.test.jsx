import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import App from "../../App"
import { FeatureLevelProvider } from "../../hooks/useFeatureLevel"
import { SessionProvider } from "../../hooks/useSession"

const LEVEL_KEY = "breadsheet.featureLevel"
const KEY = "AbCdEfGhIjKlMnOpQrStUv"
const USER = { id: "01a1-user", username: "Baker_1", created_at: "2026-11-05T00:00:00+00:00" }


// A fake backend: routes by method and path, records every call
function fakeBackend(routes) {
    const calls = []
    const fetchMock = vi.fn(async (url, options = {}) => {
        const method = options.method || "GET"
        const path = new URL(url, "http://test").pathname
        calls.push({ method, path, body: options.body, href: window.location.href })
        const [ status, body, headers = {} ] = routes[`${method} ${path}`] || [ 200, { data: [] } ]
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
        renderApp("/", null)

        await waitFor(() => expect(calls.some((c) => c.path === "/api/v1/recipes")).toBe(true))
        expect(calls.some((c) => c.path.startsWith("/api/v2/"))).toBe(false)
        expect(screen.queryByRole("link", { name: "Register" })).not.toBeInTheDocument()
    })

    test("/register isn't an identity screen", () => {
        fakeBackend({})
        renderApp("/register", null)
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

        expect(await screen.findByRole("alert")).toHaveTextContent("That username is taken")
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
