// MisCanchas.tsx
import React, { useState, useEffect, ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./MisCanchas.css";

interface Cancha {
  id_cancha: string;
  nombre: string;
  direccion: string;
  precio_por_hora: string;
}

interface LocationState {
  id_cliente: string;
  nombre: string;
  apellido: string;
}

const MisCanchas: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id_cliente, nombre, apellido } = state as LocationState;

  const [lista, setLista] = useState<Cancha[]>([]);
  const [listaFull, setListaFull] = useState<Cancha[]>([]);
  const [filtro, setFiltro] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id_cliente) {
      navigate("/");
      return;
    }
    fetchDatos();
  }, [id_cliente, navigate]);

  useEffect(() => {
    document.body.style.background = "";
  }, []);

  const fetchDatos = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://a806fc95-3459-494b-9464-9e1e5b9cb5c1-00-23sfxp7uc6gjx.riker.replit.dev/CMostrarCancha.php",
        {
          method: "POST",
          mode: "cors",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ id_dueno: id_cliente }),
        }
      );
      const json = await res.json();
      if (!res.ok || json.error) {
        alert(json.error || `Error servidor: ${res.status}`);
        return;
      }
      setLista(json.canchas || []);
      setListaFull(json.canchas || []);
    } catch (err) {
      console.error(err);
      alert("Error al cargar canchas. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  const handleFiltro = (e: ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.toLowerCase();
    setFiltro(valor);
    setLista(
      valor
        ? listaFull.filter(
            (c) =>
              c.nombre.toLowerCase().includes(valor) ||
              c.direccion.toLowerCase().includes(valor)
          )
        : listaFull
    );
  };

  const handleSeleccionCancha = (cancha: Cancha) => {
    navigate(`/reservaciones/${cancha.id_cancha}`);
  };

  const handleAgregarCancha = () => {
    navigate("/registrar-cancha", {
      state: { id_cliente, nombre, apellido },
    });
  };

  return (
    <div className="mis-canchas-page">
      <div className="mis-canchas-container">
        <h2>Mis Canchas Registradas</h2>

        <div className="botones-container">
          <button
            onClick={() =>
              navigate("/bienvenida", {
                state: { id_cliente, nombre, apellido },
              })
            }
            className="btn-volver"
          >
            Volver a Bienvenida
          </button>

          <button onClick={handleAgregarCancha} className="btn-agregar">
            Agregar Cancha
          </button>
        </div>

        <input
          className="filter-input"
          type="text"
          placeholder="Filtrar por nombre o dirección"
          value={filtro}
          onChange={handleFiltro}
        />

        {loading && <p className="loading">Cargando canchas...</p>}

        {!loading && lista.length > 0 && (
          <ul className="canchas-list">
            {lista.map((item) => (
              <li key={item.id_cancha}>
                <button
                  className="cancha-item"
                  onClick={() => handleSeleccionCancha(item)}
                >
                  <h3>{item.nombre}</h3>
                  <p>Dirección: {item.direccion}</p>
                  <p>Precio por hora: S/ {item.precio_por_hora}</p>
                </button>
              </li>
            ))}
          </ul>
        )}

        {!loading && lista.length === 0 && (
          <p className="empty">No tienes canchas registradas.</p>
        )}
      </div>
    </div>
  );
};

export default MisCanchas;
