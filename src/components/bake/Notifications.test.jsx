import React from "react"
import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import App from "../../App"
import { FeatureLevelProvider } from "../../hooks/useFeatureLevel"
import { SessionProvider } from "../../hooks/useSession"
import { projectBake } from "../../helpers/bake"
import { dueStep } from "../../hooks/useStepNotifications"

const HOUR = 3600
const USER = { id: "u1", username: "Baker_1", created_at: "2026-11-05T00:00:00+00:00" }
const SUFFIX = "b4k3x9"


// Step 1 checked off `minutesAgo` minutes ago with a `waitMinutes` wait, so step 2 is due when that runs out
function makeBake({ minutesAgo = 60, waitMinutes = 61 } = {}) {
    const start = Date.now() - minutesAgo * 60000
    const iso = (ms) => new Date(ms).toISOString()
    const steps = [ [ "Feed the levain", waitMinutes * 60 ], [ "Autolyse", 1800 ], [ "Bake", 0 ] ].map(([ text, wait ], i) => ({
        position: i + 1, text, note: null, wait_chosen: wait, skipped: false, skipped_at: null,
        completed_at: i === 0 ? iso(start) : null, scheduled_at: null, hands_on: { seconds: null }
    }))
    return projectBake({
        id: "bake-1", suffix: SUFFIX, path: `/bakes/${SUFFIX}`, name: "Country Loaf", recipe_id: "r1",
        recipe_path: "/recipes/country-loaf", recipe_deleted: false, anchor_type: "start", anchor_time: iso(start),
        time_zone: "America/Los_Angeles", alert_mode: "simple", status: "in_progress", outcome: null, steps
    })
}


// A stand-in for the browser's Notification API
function fakeNotifications(permission = "default", answer = "granted") {
    const shown = []
    class FakeNotification {
        static permission = permission
        static requestPermission = vi.fn(async () => {
            FakeNotification.permission = answer
            return answer
        })
        constructor(title, options) {
            shown.push({ title, ...options })
        }
        close() {}
    }
    vi.stubGlobal("Notification", FakeNotification)
    return shown
}

function fakeBackend(bake) {
    vi.stubGlobal("fetch", vi.fn(async (url) => {
        const path = new URL(url, "http://test").pathname
        const [ status, json ] = path === "/api/v2/session" ? [ 200, { user: USER } ] :
            path === `/api/v2/bakes/by-suffix/${SUFFIX}` || path === "/api/v2/bakes/bake-1" ? [ 200, { bake } ] :
                [ 200, { bakes: [], recipes: [] } ]
        return { status, ok: true, json: async () => json, headers: { get: () => null } }
    }))
}

function renderBake() {
    window.localStorage.setItem("breadsheet.featureLevel", "m2")
    return render(
        <MemoryRouter initialEntries={[ `/bakes/${SUFFIX}` ]}>
            <FeatureLevelProvider>
                <SessionProvider>
                    <App />
                </SessionProvider>
            </FeatureLevelProvider>
        </MemoryRouter>
    )
}

beforeEach(() => {
    window.localStorage.clear()
})

afterEach(() => {
    vi.unstubAllGlobals()
})


describe("which step to notify about", () => {
    test("the next step, once it's due", () => {
        expect(dueStep(makeBake({ minutesAgo: 60, waitMinutes: 61 }), Date.now())).toBeNull()       // due in a minute
        expect(dueStep(makeBake({ minutesAgo: 60, waitMinutes: 59 }), Date.now()).text).toBe("Autolyse")
    })

    test("not a step that's long overdue, or a finished bake", () => {
        expect(dueStep(makeBake({ minutesAgo: 60, waitMinutes: 45 }), Date.now())).toBeNull()      // 15 minutes late
        expect(dueStep({ ...makeBake({ waitMinutes: 59 }), status: "completed" }, Date.now())).toBeNull()
    })
})


describe("in-tab notifications", () => {
    test("Notify me asks the browser, then notifies when a step is due, once", async () => {
        const user = userEvent.setup()
        const shown = fakeNotifications("default", "granted")
        fakeBackend(makeBake({ minutesAgo: 60, waitMinutes: 59 }))
        renderBake()

        await user.click(await screen.findByRole("button", { name: "Notify me in this tab" }))
        expect(window.Notification.requestPermission).toHaveBeenCalledTimes(1)
        expect(await screen.findByText(/This tab will notify you when each step is due/)).toBeInTheDocument()
        await waitFor(() => expect(shown).toHaveLength(1))
        expect(shown[0]).toMatchObject({ title: "Time for: Autolyse", body: "Country Loaf · step 2 of 3 · then wait 30m",
                                         tag: `breadsheet-${SUFFIX}` })

        // Checking again (a tab coming back into view) doesn't repeat it
        await act(async () => { document.dispatchEvent(new Event("visibilitychange")) })
        expect(shown).toHaveLength(1)
    })

    test("the server's copy of a time doesn't count as a new one", () => {
        const bake = makeBake({ minutesAgo: 60, waitMinutes: 59 })
        fakeNotifications("granted")
        const local = dueStep(bake, Date.now())
        window.localStorage.setItem("breadsheet.notified", JSON.stringify([ `${SUFFIX}-2-${Math.round(Date.parse(local.scheduled_at) / 60000)}` ]))
        // The same moment, as the server writes it
        const server = { ...bake, steps: bake.steps.map((step) => step.position === 2 ?
            { ...step, scheduled_at: step.scheduled_at.replace(/\.(\d{3})Z$/, ".$1000+00:00") } : step) }
        expect(server.steps[1].scheduled_at).toMatch(/\+00:00$/)
        expect(dueStep(server, Date.now())).toBeNull()
    })

    test("with permission already granted, they're on, and Turn off stops them", async () => {
        const user = userEvent.setup()
        const shown = fakeNotifications("granted")
        fakeBackend(makeBake({ minutesAgo: 60, waitMinutes: 61 }))
        renderBake()

        await user.click(await screen.findByRole("button", { name: "Turn off" }))
        expect(screen.getByRole("button", { name: "Notify me in this tab" })).toBeInTheDocument()
        expect(window.localStorage.getItem("breadsheet.notifications")).toBe("off")
        expect(shown).toHaveLength(0)
    })

    test("blocked in the browser, it says so", async () => {
        fakeNotifications("denied")
        fakeBackend(makeBake())
        renderBake()

        expect(await screen.findByText(/Notifications are blocked for breadsheet/)).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Notify me in this tab" })).toBeNull()
    })

    test("without notification support, there's no switch", async () => {
        fakeBackend(makeBake())
        vi.stubGlobal("Notification", undefined)
        delete window.Notification
        renderBake()

        await screen.findByText("In progress · step 1 of 3")
        expect(screen.queryByRole("button", { name: "Notify me in this tab" })).toBeNull()
    })
})
