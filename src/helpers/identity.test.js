import { describeWait, keyFromHash, keyLinkUrl, usernameProblem } from "./identity"


describe("usernameProblem", () => {
    test.each([ "abc", "Thomas_B", "bread-head", "9lives", "a".repeat(30), "  padded  " ])("%s is fine", (name) => {
        expect(usernameProblem(name)).toBeNull()
    })

    test.each([ "ab", "a".repeat(31), "_abc", "-abc", "has space", "émile", "dot.name", "" ])("%s is rejected", (name) => {
        expect(usernameProblem(name)).toMatch(/letters, numbers/)
    })
})


describe("key links", () => {
    test("the key goes in the fragment, never the path", () => {
        expect(keyLinkUrl("abc_DEF-123", "https://www.breadsheet.com")).toBe("https://www.breadsheet.com/k#abc_DEF-123")
    })

    test("reads the key back from the fragment", () => {
        expect(keyFromHash("#abc_DEF-123")).toBe("abc_DEF-123")
        expect(keyFromHash("#%20abc%20")).toBe("abc")
        expect(keyFromHash("")).toBeNull()
        expect(keyFromHash("#")).toBeNull()
        expect(keyFromHash(undefined)).toBeNull()
    })
})


describe("describeWait", () => {
    test("rounds up to minutes", () => {
        expect(describeWait(806)).toBe("about 14 minutes")
        expect(describeWait(30)).toBe("about a minute")
        expect(describeWait(null)).toBe("a little while")
    })
})
