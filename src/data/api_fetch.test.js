import { apiFetch } from "./api_fetch"

describe("apiFetch", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true })))
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    test("includes credentials on a plain GET", async () => {
        await apiFetch("https://api.example.com/api/v1/recipes")

        expect(fetch).toHaveBeenCalledWith(
            "https://api.example.com/api/v1/recipes",
            { credentials: "include" }
        )
    })

    test("keeps the caller's method and body", async () => {
        await apiFetch("https://api.example.com/api/v1/recipe/abc", { method: "PUT", body: "{}" })

        expect(fetch).toHaveBeenCalledWith(
            "https://api.example.com/api/v1/recipe/abc",
            { method: "PUT", body: "{}", credentials: "include" }
        )
    })

    test("can't be switched off by a caller", async () => {
        await apiFetch("https://api.example.com/api/v1/recipes", { credentials: "omit" })

        expect(fetch.mock.calls[0][1].credentials).toBe("include")
    })

    test("returns fetch's response", async () => {
        const response = await apiFetch("https://api.example.com/api/v1/recipes")

        expect(response).toEqual({ ok: true })
    })
})
