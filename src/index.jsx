import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router";
import "./normalize.css";
import App from "./App";
import { FeatureLevelProvider } from "./hooks/useFeatureLevel";
import { SessionProvider } from "./hooks/useSession";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Router>
            <FeatureLevelProvider>
                <SessionProvider>
                    <App />
                </SessionProvider>
            </FeatureLevelProvider>
        </Router>
    </React.StrictMode>
)
