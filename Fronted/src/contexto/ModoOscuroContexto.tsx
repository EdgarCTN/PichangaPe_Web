import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";

interface ModoOscuroContextoProps {
  modoOscuro: boolean;
  alternarModoOscuro: () => void;
}

const ModoOscuroContexto = createContext<ModoOscuroContextoProps | null>(null);

interface ProveedorModoOscuroProps {
  children: ReactNode;
}

export const ProveedorModoOscuro: React.FC<ProveedorModoOscuroProps> = ({
  children,
}) => {
  const [modoOscuro, setModoOscuro] = useState<boolean>(() => {
    try {
      const guardado = localStorage.getItem("modoOscuro");
      return guardado ? JSON.parse(guardado) : false;
    } catch {
      return false;
    }
  });

  const alternarModoOscuro = () => {
    setModoOscuro((anterior) => {
      const nuevoEstado = !anterior;
      try {
        localStorage.setItem("modoOscuro", JSON.stringify(nuevoEstado));
      } catch {}
      return nuevoEstado;
    });
  };

  useEffect(() => {
    document.body.classList.toggle("oscuro", modoOscuro);
  }, [modoOscuro]);

  const contextoValue = useMemo(
    () => ({ modoOscuro, alternarModoOscuro }),
    [modoOscuro]
  );

  return (
    <ModoOscuroContexto.Provider value={contextoValue}>
      {children}
    </ModoOscuroContexto.Provider>
  );
};

// ✅ Nombre correcto como custom hook: useModoOscuro
export const useModoOscuro = (): ModoOscuroContextoProps => {
  const contexto = useContext(ModoOscuroContexto);
  if (contexto === null) {
    throw new Error(
      "useModoOscuro debe usarse dentro de un ProveedorModoOscuro"
    );
  }
  return contexto;
};
