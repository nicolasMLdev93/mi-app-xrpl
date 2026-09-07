import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

window.addEventListener("unhandledrejection", (event) => {
  if (
    event.reason?.message?.includes(
      "A listener indicated an asynchronous response",
    )
  ) {
    event.preventDefault();
    console.debug("🔇 Error de extensión suprimido (no afecta a la app)");
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
