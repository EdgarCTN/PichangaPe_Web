import React, { createContext, useContext, useState, useEffect } from "react";

interface ModoOscuroContextoProps {
  modoOscuro: boolean;
  alternarModoOscuro: () => void;
}

const ModoOscuroContexto = createContext<ModoOscuroContextoProps | undefined>(
  undefined
);

export const ProveedorModoOscuro: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [modoOscuro, setModoOscuro] = useState<boolean>(() => {
    const guardado = localStorage.getItem("modoOscuro");
    return guardado ? JSON.parse(guardado) : false;
  });

  const alternarModoOscuro = () => {
    setModoOscuro((anterior) => {
      localStorage.setItem("modoOscuro", JSON.stringify(!anterior));
      return !anterior;
    });
  };

  useEffect(() => {
    document.body.className = modoOscuro ? "oscuro" : "";
  }, [modoOscuro]);

  return (
    <ModoOscuroContexto.Provider value={{ modoOscuro, alternarModoOscuro }}>
      {children}
    </ModoOscuroContexto.Provider>
  );
};

export const usarModoOscuro = () => {
  const contexto = useContext(ModoOscuroContexto);
  if (!contexto)
    throw new Error(
      "usarModoOscuro debe usarse dentro de un ProveedorModoOscuro"
    );
  return contexto;
};
