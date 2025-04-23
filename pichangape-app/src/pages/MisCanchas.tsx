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
}

const MisCanchas: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id_cliente } = state as LocationState;

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

  // Para forzar fondo rojo o imagen en el body
  useEffect(() => {
    document.body.style.background = ""; // limpia cualquier fondo inline
  }, []);

  const fetchDatos = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://739c9dc3-0789-44cf-b9b3-0a433b602be3-00-g7yu9uuhed8k.worf.replit.dev/CMostrarCancha.php",
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

  return (
    <div className="mis-canchas-page">
      <div className="mis-canchas-container">
        <h2>Mis Canchas Registradas</h2>

        <input
          className="filter-input"
          type="text"
          placeholder="Filtrar por nombre o dirección"
          value={filtro}
          onChange={handleFiltro}
        />

        {loading ? (
          <p className="loading">Cargando canchas...</p>
        ) : lista.length > 0 ? (
          <ul className="canchas-list">
            {lista.map((item) => (
              <li key={item.id_cancha} className="cancha-item">
                <h3>{item.nombre}</h3>
                <p>Dirección: {item.direccion}</p>
                <p>Precio por hora: S/ {item.precio_por_hora}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty">No tienes canchas registradas.</p>
        )}
      </div>
    </div>
  );
};

export default MisCanchas;
