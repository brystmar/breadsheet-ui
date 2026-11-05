import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router";
import "./normalize.css";
import App from "./App";
import { FeatureLevelProvider } from "./hooks/useFeatureLevel";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Router>
            <FeatureLevelProvider>
                <App />
            </FeatureLevelProvider>
        </Router>
    </React.StrictMode>
)
