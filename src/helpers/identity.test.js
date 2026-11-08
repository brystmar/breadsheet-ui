import { describeWait, keyFromHash, keyLinkUrl, usernameChecks, usernameHasTestPrefix, usernameIsValid } from "./identity"


describe("username rules", () => {
    const met = (name) => usernameChecks(name).map((check) => check.met)

    test("the three rules, in order", () => {
        expect(usernameChecks("").map((check) => check.label)).toEqual([
            "3 to 30 characters long",
            "Only letters, numbers, underscores, and hyphens",
            "Starts with a letter"
        ])
    })

    test("nothing is met for an empty name", () => {
        expect(met("")).toEqual([ false, false, false ])
    })

    test("each rule is checked on its own", () => {
        expect(met("ab")).toEqual([ false, true, true ])
        expect(met("9lives")).toEqual([ true, true, false ])
        expect(met("has space")).toEqual([ true, false, true ])
        expect(met("a".repeat(31))).toEqual([ false, true, true ])
    })

    test.each([ "abc", "Thomas_B", "bread-head", "baker9", "a".repeat(30), "  padded  " ])("%s is valid", (name) => {
        expect(usernameIsValid(name)).toBe(true)
    })

    test.each([ "ab", "a".repeat(31), "_abc", "-abc", "9lives", "42", "has space", "émile", "dot.name", "" ])(
        "%s is not", (name) => {
            expect(usernameIsValid(name)).toBe(false)
        })
})


describe("the test- prefix", () => {
    test.each([ "test-", "test-dev-01", "Test-Prod-01", "  TEST-me" ])("%s is reserved", (name) => {
        expect(usernameHasTestPrefix(name)).toBe(true)
        expect(usernameIsValid(name)).toBe(false)
    })

    test.each([ "test", "tester", "testy-baker", "my-test-loaf" ])("%s is fine", (name) => {
        expect(usernameHasTestPrefix(name)).toBe(false)
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
