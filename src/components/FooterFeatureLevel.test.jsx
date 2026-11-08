import React from "react"
import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router"
import FooterFeatureLevel from "./FooterFeatureLevel"
import useFeatureLevel, { AtFeatureLevel, FeatureLevelProvider } from "../hooks/useFeatureLevel"

const STORAGE_KEY = "breadsheet.featureLevel"


// The toggle plus something gated at M2, as the app will use them, starting at `path`
function renderToggle(path = "/") {
    return render(
        <MemoryRouter initialEntries={[ path ]}>
            <FeatureLevelProvider>
                <FooterFeatureLevel />
                <AtFeatureLevel min="m2" fallback={<p>Classic app</p>}>
                    <p>Second Rise preview</p>
                </AtFeatureLevel>
                <Routes>
                    <Route path="/" element={<p>Homepage</p>} />
                    <Route path="/register" element={<p>Register page</p>} />
                </Routes>
            </FeatureLevelProvider>
        </MemoryRouter>
    )
}


describe("FooterFeatureLevel", () => {
    afterEach(() => window.localStorage.clear())

    test("starts at M2, the default, with M2 features shown", () => {
        renderToggle()

        expect(screen.getByRole("button", { name: "M2" })).toHaveAttribute("aria-pressed", "true")
        expect(screen.getByRole("button", { name: "M1" })).toHaveAttribute("aria-pressed", "false")
        expect(screen.getByText("Second Rise preview")).toBeInTheDocument()
        expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()  // nothing saved until someone picks
    })

    test("switching to M1 hides M2 features and remembers the choice", async () => {
        renderToggle()
        await userEvent.click(screen.getByRole("button", { name: "M1" }))

        expect(screen.getByRole("button", { name: "M1" })).toHaveAttribute("aria-pressed", "true")
        expect(screen.getByText("Classic app")).toBeInTheDocument()
        expect(window.localStorage.getItem(STORAGE_KEY)).toBe("m1")
    })

    test("switching to M2 shows M2 features and remembers the choice", async () => {
        window.localStorage.setItem(STORAGE_KEY, "m1")
        renderToggle()
        await userEvent.click(screen.getByRole("button", { name: "M2" }))

        expect(screen.getByRole("button", { name: "M2" })).toHaveAttribute("aria-pressed", "true")
        expect(screen.getByText("Second Rise preview")).toBeInTheDocument()
        expect(window.localStorage.getItem(STORAGE_KEY)).toBe("m2")
    })

    test("switching back to M1 hides them again", async () => {
        window.localStorage.setItem(STORAGE_KEY, "m2")
        renderToggle()
        expect(screen.getByText("Second Rise preview")).toBeInTheDocument()

        await userEvent.click(screen.getByRole("button", { name: "M1" }))
        expect(screen.getByText("Classic app")).toBeInTheDocument()
    })

    test("switching back to M1 returns to the homepage", async () => {
        window.localStorage.setItem(STORAGE_KEY, "m2")
        renderToggle("/register")
        expect(screen.getByText("Register page")).toBeInTheDocument()

        await userEvent.click(screen.getByRole("button", { name: "M1" }))
        expect(screen.getByText("Homepage")).toBeInTheDocument()
    })

    test("switching to M2 stays on the current page", async () => {
        window.localStorage.setItem(STORAGE_KEY, "m1")
        renderToggle("/register")
        await userEvent.click(screen.getByRole("button", { name: "M2" }))
        expect(screen.getByText("Register page")).toBeInTheDocument()
    })

    test("follows a change made in another tab", () => {
        renderToggle()

        act(() => {
            window.localStorage.setItem(STORAGE_KEY, "m1")
            window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY, newValue: "m1" }))
        })
        expect(screen.getByText("Classic app")).toBeInTheDocument()
    })

    test("is a labeled group for screen readers", () => {
        renderToggle()
        expect(screen.getByRole("group", { name: "Feature level" })).toBeInTheDocument()
    })
})


describe("useFeatureLevel", () => {
    test("needs the provider", () => {
        function Orphan() {
            useFeatureLevel()
            return null
        }
        vi.spyOn(console, "error").mockImplementation(() => {})  // React logs the thrown error
        expect(() => render(<Orphan />)).toThrow("FeatureLevelProvider")
        vi.restoreAllMocks()
    })
})
