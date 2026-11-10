import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./estilos.css";
import { Landing } from "./Landing.jsx";
import "./landing.css";

createRoot(document.getElementById("raiz")).render(<StrictMode>{window.location.pathname === "/" ? <Landing /> : <App />}</StrictMode>);
