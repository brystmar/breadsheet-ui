import React from "react"
import { useNavigate } from "react-router"
import useFeatureLevel from "../hooks/useFeatureLevel"
import { DEFAULT_LEVEL, FEATURE_LEVELS } from "../helpers/feature_levels"


// Footer control for previewing unreleased milestones, e.g. "Features: M1 · M2"
export default function FooterFeatureLevel() {
    const { level, setLevel } = useFeatureLevel()
    const navigate = useNavigate()

    // Going back to the default level returns to the homepage, since the current page may not exist there
    function handleSelect(option) {
        if (option === level) return
        setLevel(option)
        if (option === DEFAULT_LEVEL) navigate("/")
    }

    return (
        <div className="footer-feature-level" role="group" aria-label="Feature level">
            <span className="footer-feature-level-label">Features:</span>

            {FEATURE_LEVELS.map((option) => (
                <button key={option}
                        type="button"
                        className={`footer-feature-level-option${option === level ? " selected" : ""}`}
                        aria-pressed={option === level}
                        onClick={() => handleSelect(option)}>
                    {option.toUpperCase()}
                </button>
            ))}
        </div>
    )
}
