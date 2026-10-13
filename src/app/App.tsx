import { GameShell } from "./GameShell";
import { SettingsProvider } from "./SettingsContext";
import { ToastProvider } from "./ToastContext";

export function App() {
  return (
    <SettingsProvider>
      <ToastProvider>
        <GameShell />
      </ToastProvider>
    </SettingsProvider>
  );
}
