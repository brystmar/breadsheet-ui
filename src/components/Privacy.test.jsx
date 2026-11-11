import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import App from "../App"
import { FeatureLevelProvider } from "../hooks/useFeatureLevel"
import { SessionProvider } from "../hooks/useSession"


function renderAt(path, level) {
    window.localStorage.clear()
    if (level) window.localStorage.setItem("breadsheet.featureLevel", level)
    vi.stubGlobal("fetch", vi.fn(async () => ({ status: 401, ok: false, json: async () => ({ data: [], recipes: [] }), headers: { get: () => null } })))
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

afterEach(() => {
    vi.unstubAllGlobals()
})


describe("the privacy page", () => {
    test.each([ [ "m1" ], [ "m2" ] ])("is linked from the footer at %s", async (level) => {
        const user = userEvent.setup()
        renderAt("/convert", level)

        await user.click(screen.getByRole("link", { name: "Privacy" }))
        expect(await screen.findByRole("heading", { name: "Privacy" })).toBeInTheDocument()
    })

    test("says what's collected and what isn't", () => {
        renderAt("/privacy", "m2")

        expect(screen.getByRole("heading", { name: "What Breadsheet Collects" })).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "What Breadsheet Doesn't Collect" })).toBeInTheDocument()
        expect(screen.getByText(/never stores your key itself/)).toBeInTheDocument()
        expect(screen.getByText(/your id is removed from every event/)).toBeInTheDocument()
    })
})
