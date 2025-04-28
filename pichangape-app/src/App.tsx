import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Bienvenida from "./pages/Bienvenida";
import { Reservaciones } from "./pages/Reservaciones";
import MisCanchas from "./pages/MisCanchas";
import DetalleReserva from "./pages/DetalleReserva";
import VerificarComprobante from "./pages/VerificarComprobante"; // <-- agregamos esta línea

const App: React.FC = () => (
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/bienvenida" element={<Bienvenida />} />
    <Route path="/reservaciones/:idCancha" element={<Reservaciones />} />
    <Route path="/detalle-reserva/:idReserva" element={<DetalleReserva />} />
    <Route path="/miscanchas" element={<MisCanchas />} />
    <Route
      path="/verificar-comprobante/:idReserva"
      element={<VerificarComprobante />}
    />{" "}
    {/* <-- nueva ruta */}
  </Routes>
);

export default App;
