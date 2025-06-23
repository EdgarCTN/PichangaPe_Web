// Bienvenida.tsx
// Importaciones de React y herramientas de enrutamiento
import React, { useState, useEffect, ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Importación de estilos compartidos con MisCanchas
import "./Bienvenida_MisCanchas.css";

// URL base para peticiones al backend
import { BASE_URL } from "../config";

// Definición del tipo de datos que representa las estadísticas de una cancha
interface CanchaEstadistica {
  id_cancha: string;
  nombre: string;
  ganancias: string;
  total_reservas: number;
  total_reservas_pagadas: number;
}

// Estado que se recibe desde la navegación (cliente autenticado)
interface LocationState {
  id_cliente: string;
  nombre: string;
  apellido: string;
}

// Componente principal: Bienvenida
const Bienvenida: React.FC = () => {
  // Hook para obtener la información pasada por navegación (location.state)
  const location = useLocation();
  // Hook para redirigir a otras rutas
  const navigate = useNavigate();
  // Extracción del estado de navegación (datos del cliente)
  const state = location.state as LocationState | undefined;
  const id_cliente = state?.id_cliente;
  const nombre = state?.nombre;
  const apellido = state?.apellido;

  // Estados del componente
  const [lista, setLista] = useState<CanchaEstadistica[]>([]); // Lista filtrada
  const [listaFull, setListaFull] = useState<CanchaEstadistica[]>([]); // Lista completa
  const [filtro, setFiltro] = useState<string>(""); // Valor del input de filtro
  const [loading, setLoading] = useState<boolean>(true); // Indicador de carga

  // Al cargar el componente, verificar si hay ID de cliente y obtener datos
  useEffect(() => {
    if (!id_cliente) {
      // Si no hay ID, redirige a la pantalla de inicio
      navigate("/", { replace: true });
      return;
    }
    // Llama a la función para obtener estadísticas
    fetchEstadisticas();
  }, [id_cliente, navigate]);

  // Limpia el fondo al montar el componente (puede usarse para temas personalizados)
  useEffect(() => {
    document.body.style.background = "";
  }, []);

  // Función asincrónica para obtener estadísticas de canchas desde el backend
  const fetchEstadisticas = async () => {
    setLoading(true); // Mostrar mensaje de carga
    try {
      // Petición POST a backend con el id del cliente
      const res = await fetch(BASE_URL + "estadisticas_Canchas.php", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ id_cliente: id_cliente! }),
      });

      const json = await res.json(); // Convierte la respuesta a JSON

      // Si hubo error, mostrar alerta
      if (!res.ok || json?.error) {
        alert(json.error ?? `Error servidor: ${res.status}`);
        return;
      }

      // Guardar estadísticas en los estados de lista y lista completa
      setLista(json);
      setListaFull(json);
    } catch (err) {
      console.error(err);
      alert("Error al cargar estadísticas. Revisa la consola.");
    } finally {
      setLoading(false); // Ocultar mensaje de carga
    }
  };

  // Manejar cambio en el input de filtro
  const handleFiltro = (e: ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.toLowerCase();
    setFiltro(valor);
    // Filtrar la lista completa en base al nombre de la cancha
    setLista(
      valor
        ? listaFull.filter((c) => c.nombre.toLowerCase().includes(valor))
        : listaFull
    );
  };

  // Manejar clic sobre una cancha, redirige a la vista de reservaciones
  const handleSeleccionCancha = (cancha: CanchaEstadistica) => {
    navigate(`/reservaciones/${cancha.id_cancha}`);
  };

  // Navegar a la vista de "Mis Canchas"
  const irVentanaBienvenida = () => {
    navigate("/miscanchas", {
      state: { id_cliente: id_cliente!, nombre: nombre!, apellido: apellido! },
    });
  };

  // Cerrar sesión, redirige a inicio
  const handleLogout = () => {
    navigate("/", { replace: true });
  };

  // Renderizado del componente
  return (
    <div className="mis-canchas-page">
      <div className="mis-canchas-container">
        {/* Mensaje de bienvenida con nombre y apellido */}
        <h2>
          ¡Te damos la bienvenida, {nombre} {apellido}!
        </h2>

        {/* Botones de navegación */}
        <div className="botonera">
          <button onClick={irVentanaBienvenida} className="btn-mis-canchas">
            Ir a Mis Canchas
          </button>
          <button onClick={handleLogout} className="btn-logout">
            Cerrar sesión
          </button>
        </div>

        {/* Input para filtrar canchas por nombre */}
        <input
          className="filter-input"
          type="text"
          placeholder="Filtrar por nombre de cancha"
          value={filtro}
          onChange={handleFiltro}
        />

        {/* Mensaje de carga mientras se obtienen las estadísticas */}
        {loading && <p className="loading">Cargando estadísticas...</p>}

        {/* Lista de canchas cuando ya se cargó y hay resultados */}
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

        {/* Mensaje cuando no hay canchas disponibles */}
        {!loading && lista.length === 0 && (
          <p className="empty">No tienes estadísticas registradas.</p>
        )}
      </div>
    </div>
  );
};

// Exporta el componente para usarlo en otras partes de la app
export default Bienvenida;
