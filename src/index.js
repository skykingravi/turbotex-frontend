import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CanvasProvider } from "./hooks/useCanvas";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <CanvasProvider>
            <App />
        </CanvasProvider>
    </React.StrictMode>
);
