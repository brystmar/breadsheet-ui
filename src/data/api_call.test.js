import { apiCall } from "./api_call"


function stubFetch() {
    const fetch = vi.fn(async () => ({ status: 204, ok: true, headers: { get: () => null } }))
    vi.stubGlobal("fetch", fetch)
    return fetch
}

afterEach(() => {
    vi.unstubAllGlobals()
})


describe("apiCall", () => {
    test("state-changing requests always send JSON's content type, which the API requires", async () => {
        const fetch = stubFetch()
        await apiCall("/api/v2/recipes/r1", { method: "DELETE" })
        await apiCall("/api/v2/recipes/r1/publish", { method: "delete" })
        for (const [ , options ] of fetch.mock.calls) expect(options.headers).toEqual({ "Content-Type": "application/json" })
    })

    test("keeps headers a caller set, and leaves reads alone", async () => {
        const fetch = stubFetch()
        await apiCall("/api/v2/bakes", { method: "POST", headers: { "content-type": "application/json", "Idempotency-Key": "k1" } })
        await apiCall("/api/v2/recipes")
        expect(fetch.mock.calls[0][1].headers).toEqual({ "content-type": "application/json", "Idempotency-Key": "k1" })
        expect(fetch.mock.calls[1][1].headers).toBeUndefined()
    })

    test("passes the API's field errors through", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => ({
            status: 400, ok: false, headers: { get: () => null },
            json: async () => ({ code: "recipe_invalid", message: "Check the recipe", fields: { name: "Give the recipe a name." } })
        })))
        const result = await apiCall("/api/v2/recipes", { method: "POST", body: "{}" })
        expect(result).toMatchObject({ ok: false, status: 400, code: "recipe_invalid", fields: { name: "Give the recipe a name." } })
    })
})
