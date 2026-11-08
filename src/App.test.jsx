import React from "react";
import { render, act } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router";
import App from "./App";
import { FeatureLevelProvider } from "./hooks/useFeatureLevel";
import { SessionProvider } from "./hooks/useSession";

test("renders without crashing", () => {
    render(
        <MemoryRouter>
            <FeatureLevelProvider>
                <SessionProvider>
                    <App />
                </SessionProvider>
            </FeatureLevelProvider>
        </MemoryRouter>
    );
});


// GoatCounter route tracking
describe("GoatCounter route tracking", () => {
    let navigate

    // Exposes the router's navigate function to the test
    function CaptureNavigate() {
        navigate = useNavigate()
        return null
    }

    // Renders the app at `/` without calling the real backend
    function renderApp() {
        render(
            <MemoryRouter initialEntries={[ "/" ]}>
                <FeatureLevelProvider>
                    <SessionProvider>
                        <App />
                    </SessionProvider>
                </FeatureLevelProvider>
                <CaptureNavigate />
            </MemoryRouter>
        )
    }

    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn(async () => ({ json: async () => ({ data: [] }) })))
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    test("counts route changes but not the initial load", () => {
        const count = vi.fn()
        vi.stubGlobal("goatcounter", { count })
        renderApp()

        expect(count).not.toHaveBeenCalled()

        act(() => navigate("/convert?from=test"))
        expect(count).toHaveBeenCalledTimes(1)
        expect(count).toHaveBeenCalledWith({ path: "/convert?from=test" })
    })

    test("does nothing when the script is blocked or not loaded", () => {
        renderApp()

        expect(() => act(() => navigate("/convert"))).not.toThrow()
    })
})


// breadsheet-ui#45: v1 recipe writes are off, so nothing offers to change a recipe
// M1's recipe list and page (v1), now that M2 is the default
describe("no recipe edit controls", () => {
    const RECIPE = {
        id: "r1", name: "Country Sourdough", difficulty: "Intermediate", solve_for_start: true,
        length: 1800, start_time: 0, date_added: 0,
        steps: [ { step_id: "s1", number: 1, text: "Mix", then_wait: 1800, note: null } ]
    }

    function renderAt(path) {
        window.localStorage.setItem("breadsheet.featureLevel", "m1")
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

    let fetchMock

    beforeEach(() => {
        fetchMock = vi.fn(async (url) => ({
            ok: true,
            json: async () => ({ data: url.endsWith("/recipes") ? [ RECIPE ] : RECIPE })
        }))
        vi.stubGlobal("fetch", fetchMock)
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        window.localStorage.clear()
    })

    test("the recipe list has no add or delete buttons", async () => {
        const { findByText, queryByRole } = renderAt("/")
        await findByText("Country Sourdough")

        expect(queryByRole("button", { name: /add/i })).toBeNull()
        expect(queryByRole("button", { name: /delete/i })).toBeNull()
    })

    test("the recipe page has no Save button and never writes", async () => {
        const { findAllByText, queryByRole } = renderAt("/r1")
        await findAllByText("Mix")

        expect(queryByRole("button", { name: /save/i })).toBeNull()
        const methods = fetchMock.mock.calls.map(([ , options ]) => options?.method ?? "GET")
        expect(methods.every((method) => method === "GET")).toBe(true)
    })
})
