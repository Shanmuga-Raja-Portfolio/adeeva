import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import "./styles/shell.css";
import { StudioApp } from "./studio/StudioApp";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <StudioApp />
    </StrictMode>,
  );
}
