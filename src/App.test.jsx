import React from "react";
import { render, act } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router";
import App from "./App";
import { FeatureLevelProvider } from "./hooks/useFeatureLevel";

test("renders without crashing", () => {
    render(
        <MemoryRouter>
            <FeatureLevelProvider>
                <App />
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
                    <App />
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
