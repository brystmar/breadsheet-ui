import React, { useEffect, useState } from "react"
import AdminNav from "./AdminNav"
import PageTitle from "../PageTitle"
import { getMetrics } from "../../data/admin_api"
import "../../styles/admin.sass"


// "weekly_active_bakers" → "Weekly active bakers"; "still_going" → "Still going"
function label(name) {
    const words = name.replace(/_/g, " ")
    return words.charAt(0).toUpperCase() + words.slice(1)
}


function cell(value) {
    if (value === null || value === undefined) return "—"
    if (typeof value === "number") return value.toLocaleString()
    return String(value)
}


// /admin/metrics (breadsheet-ui#66): each metric's question and its numbers, test users left out
export default function AdminMetricsPage() {
    const [ metrics, setMetrics ] = useState(null)
    const [ error, setError ] = useState(null)

    useEffect(() => {
        let current = true
        getMetrics().then((result) => {
            if (!current) return
            if (result.ok) setMetrics(result.data.metrics)
            else setError(result.message)
        })
        return () => { current = false }
    }, [])

    return (
        <section className="admin-page">
            <AdminNav />
            <PageTitle title="Metrics" includeHr={true} />
            <p className="admin-hint">The same numbers as <code>flask --app main metrics</code>. Test users are left out.</p>
            {error && <p className="admin-error" role="alert">{error}</p>}
            {metrics && metrics.map((metric) => {
                // The server lists columns in query order; JSON object keys arrive sorted
                const columns = metric.columns?.length ? metric.columns : metric.rows.length ? Object.keys(metric.rows[0]) : []
                return (
                    <section key={metric.name} className="admin-metric" aria-labelledby={`metric-${metric.name}`}>
                        <h3 id={`metric-${metric.name}`}>{label(metric.name)}</h3>
                        <p className="admin-hint">{metric.question}</p>
                        {metric.rows.length === 0 ? <p className="admin-hint">None yet.</p> :
                            <div className="admin-table-scroll">
                                <table className="admin-table">
                                    <thead>
                                        <tr>{columns.map((column) => <th key={column} scope="col">{label(column)}</th>)}</tr>
                                    </thead>
                                    <tbody>
                                        {metric.rows.map((row, i) =>
                                            <tr key={i}>{columns.map((column) => <td key={column}>{cell(row[column])}</td>)}</tr>)}
                                    </tbody>
                                </table>
                            </div>}
                    </section>
                )
            })}
        </section>
    )
}
