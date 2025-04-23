import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import MisCanchas from "./pages/MisCanchas";

const App: React.FC = () => (
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/mis-canchas" element={<MisCanchas />} />
  </Routes>
);

export default App;
