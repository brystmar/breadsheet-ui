// User-facing recipe URLs (see "URLs" in the Second Rise spec):
//   defaults use a pure slug:          /recipes/country-sourdough
//   personal recipes add a suffix:     /recipes/country-sourdough-k7qx2m
// The API only ever sees internal ids, slugs, or suffixes; it builds each recipe's `path` itself.

const SUFFIX_PATTERN = /-([a-z0-9]{6})$/


// The public suffix at the end of a recipe path segment, or null when it can't have one
export function suffixFromRecipePath(recipePath = "") {
    const match = SUFFIX_PATTERN.exec(recipePath)
    return match ? match[1] : null
}
