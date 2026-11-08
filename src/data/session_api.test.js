import { getSession, signIn, signOut, signUp } from "./session_api"


// A fetch Response stand-in
function response(status, body, headers = {}) {
    return {
        status,
        ok:      status >= 200 && status < 300,
        json:    async () => {
            if (body === undefined) throw new SyntaxError("no body")
            return body
        },
        headers: { get: (name) => headers[name] ?? null }
    }
}


describe("session_api", () => {
    afterEach(() => vi.unstubAllGlobals())

    test("signUp posts JSON with credentials and returns the user and key", async () => {
        const fetchMock = vi.fn(async () => response(201, { user: { username: "baker" }, key: "k".repeat(22) }))
        vi.stubGlobal("fetch", fetchMock)

        const result = await signUp("baker")

        expect(result).toEqual({ ok: true, status: 201, data: { user: { username: "baker" }, key: "k".repeat(22) } })
        const [ url, options ] = fetchMock.mock.calls[0]
        expect(url).toMatch(/\/api\/v2\/users$/)
        expect(options.method).toBe("POST")
        expect(options.credentials).toBe("include")
        expect(options.headers["Content-Type"]).toBe("application/json")
        expect(JSON.parse(options.body)).toEqual({ username: "baker" })
    })

    test("errors carry the API's code, message, and Retry-After", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => response(429,
            { code: "rate_limited", message: "Too many" }, { "Retry-After": "806" })))

        expect(await signIn("x".repeat(22))).toEqual(
            { ok: false, status: 429, code: "rate_limited", message: "Too many", retryAfter: 806, fields: null })
    })

    test("a failure without a JSON body still has a message", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => response(502, undefined)))
        const result = await getSession()
        expect(result.code).toBe("http_error")
        expect(result.message).toBeTruthy()
    })

    test("network failures become network_error", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("Failed to fetch") }))
        expect((await getSession()).code).toBe("network_error")
    })

    test("signOut sends JSON (the API requires it) and handles 204", async () => {
        const fetchMock = vi.fn(async () => response(204))
        vi.stubGlobal("fetch", fetchMock)

        expect(await signOut()).toEqual({ ok: true, status: 204, data: null })
        expect(fetchMock.mock.calls[0][1].method).toBe("DELETE")
        expect(fetchMock.mock.calls[0][1].headers["Content-Type"]).toBe("application/json")
    })
})
