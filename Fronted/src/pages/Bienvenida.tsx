// Bienvenida.tsx
import React, { useState, useEffect, ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Bienvenida.css";

interface CanchaEstadistica {
  id_cancha: string;
  nombre: string;
  ganancias: string;
  total_reservas: number;
  total_reservas_pagadas: number;
}

interface LocationState {
  id_cliente: string;
  nombre: string;
  apellido: string;
}

const Bienvenida: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | undefined;
  const id_cliente = state?.id_cliente;
  const nombre = state?.nombre;
  const apellido = state?.apellido;

  const [lista, setLista] = useState<CanchaEstadistica[]>([]);
  const [listaFull, setListaFull] = useState<CanchaEstadistica[]>([]);
  const [filtro, setFiltro] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id_cliente) {
      navigate("/", { replace: true });
      return;
    }
    fetchEstadisticas();
  }, [id_cliente, navigate]);

  useEffect(() => {
    document.body.style.background = "";
  }, []);

  const fetchEstadisticas = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://b2497ce8-dcb5-473c-bec0-4eeb60091278-00-n0byecpxlij6.picard.replit.dev/estadisticas_Canchas.php",
        {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ id_cliente: id_cliente! }),
        }
      );
      const json = await res.json();

      if (!res.ok || json?.error) {
        alert(json.error || `Error servidor: ${res.status}`);
        return;
      }

      setLista(json);
      setListaFull(json);
    } catch (err) {
      console.error(err);
      alert("Error al cargar estadísticas. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  const handleFiltro = (e: ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.toLowerCase();
    setFiltro(valor);
    setLista(
      valor
        ? listaFull.filter((c) => c.nombre.toLowerCase().includes(valor))
        : listaFull
    );
  };

  const handleSeleccionCancha = (cancha: CanchaEstadistica) => {
    navigate(`/reservaciones/${cancha.id_cancha}`);
  };

  const irVentanaBienvenida = () => {
    navigate("/miscanchas", {
      state: { id_cliente: id_cliente!, nombre: nombre!, apellido: apellido! },
    });
  };

  const handleLogout = () => {
    navigate("/", { replace: true });
  };

  return (
    <div className="mis-canchas-page">
      <div className="mis-canchas-container">
        <h2>
          ¡Te damos la bienvenida, {nombre} {apellido}!
        </h2>

        <div className="botonera">
          <button onClick={irVentanaBienvenida} className="btn-mis-canchas">
            Ir a Mis Canchas
          </button>
          <button onClick={handleLogout} className="btn-logout">
            Cerrar sesión
          </button>
        </div>

        <input
          className="filter-input"
          type="text"
          placeholder="Filtrar por nombre de cancha"
          value={filtro}
          onChange={handleFiltro}
        />

        {loading && <p className="loading">Cargando estadísticas...</p>}

        {!loading && lista.length > 0 && (
          <ul className="canchas-list">
            {lista.map((item) => (
              <li key={item.id_cancha}>
                <button
                  className="cancha-item"
                  onClick={() => handleSeleccionCancha(item)}
                >
                  <h3>{item.nombre}</h3>
                  <p>Ganancias: S/ {parseFloat(item.ganancias).toFixed(2)}</p>
                  <p>Total Reservas: {item.total_reservas}</p>
                  <p>Reservas Pagadas: {item.total_reservas_pagadas}</p>
                </button>
              </li>
            ))}
          </ul>
        )}

        {!loading && lista.length === 0 && (
          <p className="empty">No tienes estadísticas registradas.</p>
        )}
      </div>
    </div>
  );
};

export default Bienvenida;
