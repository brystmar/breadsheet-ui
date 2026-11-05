import React from "react"
import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import FooterFeatureLevel from "./FooterFeatureLevel"
import useFeatureLevel, { AtFeatureLevel, FeatureLevelProvider } from "../hooks/useFeatureLevel"

const STORAGE_KEY = "breadsheet.featureLevel"


// The toggle plus something gated at M2, as the app will use them
function renderToggle() {
    return render(
        <FeatureLevelProvider>
            <FooterFeatureLevel />
            <AtFeatureLevel min="m2" fallback={<p>Classic app</p>}>
                <p>Second Rise preview</p>
            </AtFeatureLevel>
        </FeatureLevelProvider>
    )
}


describe("FooterFeatureLevel", () => {
    afterEach(() => window.localStorage.clear())

    test("starts at M1 with M2 features hidden", () => {
        renderToggle()

        expect(screen.getByRole("button", { name: "M1" })).toHaveAttribute("aria-pressed", "true")
        expect(screen.getByRole("button", { name: "M2" })).toHaveAttribute("aria-pressed", "false")
        expect(screen.getByText("Classic app")).toBeInTheDocument()
        expect(screen.queryByText("Second Rise preview")).not.toBeInTheDocument()
    })

    test("switching to M2 shows M2 features and remembers the choice", async () => {
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

    test("follows a change made in another tab", () => {
        renderToggle()

        act(() => {
            window.localStorage.setItem(STORAGE_KEY, "m2")
            window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY, newValue: "m2" }))
        })
        expect(screen.getByText("Second Rise preview")).toBeInTheDocument()
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
