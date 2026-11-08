import { useEffect, useState } from "react"


// The current time (epoch ms), updated every `intervalMs` for countdowns and progress bars
export default function useNow(intervalMs = 10 * 1000) {
    const [ now, setNow ] = useState(() => Date.now())
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), intervalMs)
        return () => clearInterval(id)
    }, [ intervalMs ])
    return now
}
