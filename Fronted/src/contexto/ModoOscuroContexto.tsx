// Importamos funciones y tipos esenciales desde React
import React, {
  createContext, // Para crear el contexto global
  useContext, // Para consumir el contexto desde un componente
  useState, // Para manejar el estado del modo oscuro
  useEffect, // Para aplicar efectos secundarios (como modificar el <body>)
  useMemo, // Para memorizar valores derivados del estado (optimización)
  ReactNode, // Tipo para los hijos del proveedor
} from "react";

// Interfaz que define la estructura del contexto: un booleano y una función para alternar
interface ModoOscuroContextoProps {
  modoOscuro: boolean; // true = modo oscuro activado
  alternarModoOscuro: () => void; // función para cambiar entre claro/oscuro
}

// Se crea el contexto con un valor inicial `null`, indicando que aún no se ha provisto
const ModoOscuroContexto = createContext<ModoOscuroContextoProps | null>(null);

// Interfaz que define las props del proveedor de contexto
interface ProveedorModoOscuroProps {
  children: ReactNode; // Los componentes hijos que estarán envueltos por el proveedor
}

// Componente proveedor que administra el estado global del modo oscuro
export const ProveedorModoOscuro: React.FC<ProveedorModoOscuroProps> = ({
  children,
}) => {
  // Estado inicial del modo oscuro, cargado desde `localStorage` si existe
  const [modoOscuro, setModoOscuro] = useState<boolean>(() => {
    try {
      const guardado = localStorage.getItem("modoOscuro");
      return guardado ? JSON.parse(guardado) : false;
    } catch {
      return false; // Si ocurre error al acceder a localStorage, usar modo claro
    }
  });

  // Función que invierte el valor actual de `modoOscuro` y lo guarda en localStorage
  const alternarModoOscuro = () => {
    setModoOscuro((anterior) => {
      const nuevoEstado = !anterior; // Alternar valor
      try {
        localStorage.setItem("modoOscuro", JSON.stringify(nuevoEstado)); // Guardar
      } catch {}
      return nuevoEstado;
    });
  };

  // Efecto que se ejecuta cada vez que `modoOscuro` cambia
  useEffect(() => {
    // Añade o remueve la clase CSS "oscuro" al <body> según el estado actual
    document.body.classList.toggle("oscuro", modoOscuro);
  }, [modoOscuro]);

  // Memoriza el valor del contexto para evitar renderizados innecesarios
  const contextoValue = useMemo(
    () => ({ modoOscuro, alternarModoOscuro }), // El valor que será accesible globalmente
    [modoOscuro] // Solo se actualiza si cambia `modoOscuro`
  );

  // Devuelve el proveedor con los hijos envueltos en el contexto
  return (
    <ModoOscuroContexto.Provider value={contextoValue}>
      {children}
    </ModoOscuroContexto.Provider>
  );
};

// Custom hook para consumir el contexto fácilmente en cualquier componente
export const useModoOscuro = (): ModoOscuroContextoProps => {
  const contexto = useContext(ModoOscuroContexto);

  // Si el contexto es null, significa que no está dentro de un proveedor y lanzamos error
  if (contexto === null) {
    throw new Error(
      "useModoOscuro debe usarse dentro de un ProveedorModoOscuro"
    );
  }

  // Retornamos el valor del contexto: modo actual y función de alternancia
  return contexto;
};
