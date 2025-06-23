// Importamos React (necesario para JSX aunque no se use explícitamente)
import React from "react";

// Importamos componentes necesarios para definir rutas con React Router
import { Routes, Route } from "react-router-dom";

// Importamos los componentes de página que representan las diferentes vistas
import Login from "./pages/Login";
import Bienvenida from "./pages/Bienvenida";
import { Reservaciones } from "./pages/Reservaciones";
import MisCanchas from "./pages/MisCanchas";
import DetalleReserva from "./pages/DetalleReserva";
import VerificarComprobante from "./pages/VerificarComprobante";
import RegistrarCancha from "./pages/RegistrarCancha";
import Registro from "./pages/Registro";

// Importamos un componente de UI para alternar el modo oscuro/claro
import BotonModoOscuro from "./componentes/BotonModoOscuro";

// Componente principal de la aplicación
const App: React.FC = () => (
  <div>
    {/* Encabezado fijo que muestra el botón para alternar entre modo claro y oscuro */}
    <header style={{ position: "absolute", top: 10, right: 10 }}>
      <BotonModoOscuro />
    </header>

    {/* Definimos las rutas de la aplicación */}
    <Routes>
      {/* Ruta raíz que carga la página de Login */}
      <Route path="/" element={<Login />} />

      {/* Página que aparece después del login con datos del usuario */}
      <Route path="/bienvenida" element={<Bienvenida />} />

      {/* Muestra las reservaciones de una cancha específica (se pasa idCancha por URL) */}
      <Route path="/reservaciones/:idCancha" element={<Reservaciones />} />

      {/* Muestra los detalles de una reserva específica */}
      <Route path="/detalle-reserva/:idReserva" element={<DetalleReserva />} />

      {/* Página donde el dueño visualiza, edita o elimina sus canchas */}
      <Route path="/miscanchas" element={<MisCanchas />} />

      {/* Página de registro de nuevos usuarios */}
      <Route path="/registro" element={<Registro />} />

      {/* Verificación de comprobante de pago para una reserva específica */}
      <Route
        path="/verificar-comprobante/:idReserva"
        element={<VerificarComprobante />}
      />

      {/* Página para que el dueño registre una nueva cancha */}
      <Route path="/registrar-cancha" element={<RegistrarCancha />} />
    </Routes>
  </div>
);

// Exportamos el componente principal para usarlo en `main.tsx`
export default App;
