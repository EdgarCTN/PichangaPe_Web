import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Bienvenida from "./pages/Bienvenida";
import { Reservaciones } from "./pages/Reservaciones";
import MisCanchas from "./pages/MisCanchas";
import DetalleReserva from "./pages/DetalleReserva";
import VerificarComprobante from "./pages/VerificarComprobante";
import RegistrarCancha from "./pages/RegistrarCancha";
import Registro from "./pages/Registro";
import BotonModoOscuro from "./componentes/BotonModoOscuro";

const App: React.FC = () => (
  <div>
    <header style={{ position: "absolute", top: 10, right: 10 }}>
      <BotonModoOscuro />
    </header>

    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/bienvenida" element={<Bienvenida />} />
      <Route path="/reservaciones/:idCancha" element={<Reservaciones />} />
      <Route path="/detalle-reserva/:idReserva" element={<DetalleReserva />} />
      <Route path="/miscanchas" element={<MisCanchas />} />
      <Route path="/registro" element={<Registro />} />
      <Route
        path="/verificar-comprobante/:idReserva"
        element={<VerificarComprobante />}
      />
      <Route path="/registrar-cancha" element={<RegistrarCancha />} />
    </Routes>
  </div>
);

export default App;
