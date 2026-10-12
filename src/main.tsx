import React from "react";
import ReactDOM from "react-dom/client";
import Konva from "konva";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./styles/globals.css";
import "./styles/components.css";
import "./styles/mobile.css";
import { MOBILE_QUERY } from "./hooks/useIsMobile";

if (window.matchMedia(MOBILE_QUERY).matches) {
  Konva.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
