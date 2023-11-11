import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app";

const rootDiv = document.getElementById("root");
if (!rootDiv) throw new Error("failed to find root div");

const root = createRoot(rootDiv);
root.render(<App />);
