import { atLeast, DEFAULT_LEVEL, FEATURE_LEVELS, isFeatureLevel, readStoredLevel, storeLevel } from "./feature_levels"

const STORAGE_KEY = "breadsheet.featureLevel"


describe("feature levels", () => {
    afterEach(() => {
        window.localStorage.clear()
        vi.restoreAllMocks()
    })

    test("today's app is the default level", () => {
        expect(DEFAULT_LEVEL).toBe("m1")
        expect(FEATURE_LEVELS[0]).toBe("m1")
    })

    test("atLeast compares by milestone order", () => {
        expect(atLeast("m2", "m1")).toBe(true)
        expect(atLeast("m2", "m2")).toBe(true)
        expect(atLeast("m1", "m2")).toBe(false)
    })

    test("only known levels are valid", () => {
        expect(isFeatureLevel("m2")).toBe(true)
        expect(isFeatureLevel("m9")).toBe(false)
        expect(isFeatureLevel(null)).toBe(false)
    })

    test("a stored level survives a reload", () => {
        expect(storeLevel("m2")).toBe(true)
        expect(window.localStorage.getItem(STORAGE_KEY)).toBe("m2")
        expect(readStoredLevel()).toBe("m2")
    })

    test("nothing stored means the default", () => {
        expect(readStoredLevel()).toBe(DEFAULT_LEVEL)
    })

    test("an unknown stored value means the default", () => {
        window.localStorage.setItem(STORAGE_KEY, "m9")
        expect(readStoredLevel()).toBe(DEFAULT_LEVEL)
    })

    test("blocked storage falls back quietly", () => {
        vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("SecurityError") })
        vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("SecurityError") })

        expect(readStoredLevel()).toBe(DEFAULT_LEVEL)
        expect(storeLevel("m2")).toBe(false)
    })
})
