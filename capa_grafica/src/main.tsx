import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

const IGNORED_REJECTION_PATTERNS = [
  "A listener indicated an asynchronous response",
  "message channel closed",
  "Extension context invalidated",
  "The message port closed before a response was received",
  "Failed to connect to MetaMask",
  "MetaMask encountered an error",
  "Non-Error promise rejection captured",
  "ResizeObserver loop completed with undelivered notifications",
  "ResizeObserver loop limit exceeded",
  "Cannot read properties of null (reading 'removeChild')",
];

window.addEventListener("unhandledrejection", (event) => {
  const message = event.reason?.message ?? "";
  const isExtensionNoise = IGNORED_REJECTION_PATTERNS.some((pattern) =>
    message.includes(pattern),
  );

  if (isExtensionNoise) {
    event.preventDefault();
    console.debug(
      "🔇 Error de extensión suprimido (no afecta a la app):",
      message,
    );
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
