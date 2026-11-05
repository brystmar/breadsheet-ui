import React from "react"
import useFeatureLevel from "../hooks/useFeatureLevel"
import { FEATURE_LEVELS } from "../helpers/feature_levels"


// Footer control for previewing unreleased milestones, e.g. "Features: M1 · M2"
export default function FooterFeatureLevel() {
    const { level, setLevel } = useFeatureLevel()

    return (
        <div className="footer-feature-level" role="group" aria-label="Feature level">
            <span className="footer-feature-level-label">Features:</span>

            {FEATURE_LEVELS.map((option) => (
                <button key={option}
                        type="button"
                        className={`footer-feature-level-option${option === level ? " selected" : ""}`}
                        aria-pressed={option === level}
                        onClick={() => setLevel(option)}>
                    {option.toUpperCase()}
                </button>
            ))}
        </div>
    )
}
