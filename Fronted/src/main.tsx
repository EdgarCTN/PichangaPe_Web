import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ProveedorModoOscuro } from "./contexto/ModoOscuroContexto";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ProveedorModoOscuro>
        <App />
      </ProveedorModoOscuro>
    </BrowserRouter>
  </React.StrictMode>
);
