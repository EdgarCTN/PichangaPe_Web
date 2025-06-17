import React from "react";
import { usarModoOscuro } from "../contexto/ModoOscuroContexto";
import "./BotonModoOscuro.css";

const BotonModoOscuro: React.FC = () => {
  const { modoOscuro, alternarModoOscuro } = usarModoOscuro();

  return (
    <button
      onClick={alternarModoOscuro}
      className={`boton-tema ${modoOscuro ? "activo" : ""}`}
    >
      <span className="icono">{modoOscuro ? "☀" : "🌙"}</span>
      <span className="texto">{modoOscuro ? "Modo Claro" : "Modo Oscuro"}</span>
    </button>
  );
};

export default BotonModoOscuro;
