import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // Update the path to the correct location of index.css
import App from "./App.tsx"; // Update the path to the correct location of App.tsx

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
