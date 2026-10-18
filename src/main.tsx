import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import "./styles/shell.css";
import { keepSavesOnDevice } from "./offline/keepSaves";
import { watchSignIn } from "./offline/signInState";
import { startOfflineSupport } from "./offline/workerUpdates";
import { StudioApp } from "./studio/StudioApp";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <StudioApp />
    </StrictMode>,
  );
  startOfflineSupport();
  watchSignIn();
  keepSavesOnDevice();
}
