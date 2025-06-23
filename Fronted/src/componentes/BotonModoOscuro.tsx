// Importación del núcleo de React
import React from "react";

// Importamos el hook personalizado que permite acceder al contexto del modo oscuro
import { useModoOscuro } from "../contexto/ModoOscuroContexto";

// Importamos los estilos CSS específicos para este botón
import "./BotonModoOscuro.css";

// Definimos un componente funcional llamado `BotonModoOscuro`
const BotonModoOscuro: React.FC = () => {
  // Extraemos del contexto el estado actual `modoOscuro`
  // y la función `alternarModoOscuro` que permite cambiar entre claro/oscuro
  const { modoOscuro, alternarModoOscuro } = useModoOscuro();

  return (
    // Renderizamos un botón que alterna entre modo claro y oscuro al hacer clic
    <button
      onClick={alternarModoOscuro} // Al hacer clic, se ejecuta la función del contexto que cambia el tema
      className={`boton-tema ${modoOscuro ? "activo" : ""}`} // Clase CSS condicional: si `modoOscuro` está activado, se agrega "activo"
    >
      {/* Icono que representa el modo actual: ☀ para claro, 🌙 para oscuro */}
      <span className="icono">{modoOscuro ? "☀" : "🌙"}</span>

      {/* Texto que describe el modo al que se cambiará si se hace clic */}
      <span className="texto">{modoOscuro ? "Modo Claro" : "Modo Oscuro"}</span>
    </button>
  );
};

// Exportamos el componente para que pueda ser usado en otros archivos
export default BotonModoOscuro;
