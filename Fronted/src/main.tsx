// Importa React, necesario para trabajar con JSX
import React from "react";

// Importa ReactDOM para renderizar la app dentro del DOM del navegador
import ReactDOM from "react-dom/client";

// Importa BrowserRouter para habilitar navegación con rutas (SPA)
import { BrowserRouter } from "react-router-dom";

// Importa el contexto personalizado para modo oscuro
import { ProveedorModoOscuro } from "./contexto/ModoOscuroContexto";

// Importa el componente principal que contiene todas las rutas y páginas
import App from "./App";

// Importa los estilos CSS globales de la aplicación
import "./index.css";

// Renderiza la aplicación dentro del elemento HTML con id="root"
// `createRoot` es la forma moderna (React 18+) de inicializar la app
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* BrowserRouter permite usar rutas declarativas (URL amigables) */}
    <BrowserRouter>
      {/* ProveedorModoOscuro hace que el estado del modo oscuro esté disponible en toda la app */}
      <ProveedorModoOscuro>
        {/* Componente principal que contiene todas las rutas y lógica */}
        <App />
      </ProveedorModoOscuro>
    </BrowserRouter>
  </React.StrictMode>
);
