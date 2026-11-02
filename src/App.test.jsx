import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import App from "./App";

test("renders without crashing", () => {
    render(
        <MemoryRouter>
            <App />
        </MemoryRouter>
    );
});
