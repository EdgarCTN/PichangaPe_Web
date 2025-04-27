import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import MisCanchas from "./pages/MisCanchas";
import { Reservaciones } from "./pages/Reservaciones";

const App: React.FC = () => (
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/mis-canchas" element={<MisCanchas />} />
    <Route path="/reservaciones/:idCancha" element={<Reservaciones />} />
  </Routes>
);

export default App;
