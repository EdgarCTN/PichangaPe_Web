// DetalleReserva.tsx
// Importaciones necesarias desde React y librerías
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Para obtener parámetros de la URL y navegación
import "./DetalleReserva.css"; // Estilos del componente
import { BASE_URL } from "../config"; // Ruta base para API

// Interface que describe la estructura esperada de los datos de una reserva
interface DetalleData {
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  nombre_reservador: string;
  apellido_reservador: string;
  celular: string;
  estado_reserva: string;
}

// Props para componente de error (mensaje + botón de reintento)
interface ErrorProps {
  error: string;
  onRetry: () => void;
}

// Props que recibe el componente visual principal (datos de reserva y eventos)
interface DetalleViewProps {
  detalle: DetalleData;
  idReserva: string;
  onVerify: () => void; // Acción que verifica el comprobante
}

// Ruta final para la API que obtiene el detalle de la reserva
const API_URL = BASE_URL + "reservaciones_clientes.php";

// ---------------- COMPONENTES AUXILIARES -----------------

// Muestra un mensaje de carga mientras se esperan los datos
const LoadingComponent: React.FC = () => (
  <div className="loading-container">
    <p>Cargando detalles de la reserva...</p>
  </div>
);

// Componente reutilizable para mostrar errores con opción de volver a intentar
const ErrorComponent: React.FC<ErrorProps> = ({ error, onRetry }) => (
  <div className="error-container" style={{ textAlign: "center" }}>
    <p style={{ color: "red" }}>Error: {error}</p>
    <button className="btn-retry" onClick={onRetry}>
      Reintentar
    </button>
  </div>
);

// Vista principal que muestra todos los datos detallados de la reserva
const DetalleView: React.FC<DetalleViewProps> = ({
  detalle,
  idReserva,
  onVerify,
}) => {
  const navigate = useNavigate(); // Hook para navegar entre rutas

  return (
    <div className="detalle-container">
      {/* Botón para regresar a la lista anterior */}
      <button className="btn-back" onClick={() => navigate(-1)}>
        ← Volver a Reservaciones
      </button>

      {/* Encabezado con número de reserva */}
      <h2>Detalle de Reserva #{idReserva}</h2>

      {/* Información completa de la reserva */}
      <div className="detalle-info">
        <p>
          <strong>Fecha:</strong> {detalle.fecha}
        </p>
        <p>
          <strong>Inicio:</strong> {detalle.hora_inicio}
        </p>
        <p>
          <strong>Fin:</strong> {detalle.hora_fin}
        </p>
        <p>
          <strong>Nombre:</strong> {detalle.nombre_reservador}{" "}
          {detalle.apellido_reservador}
        </p>
        <p>
          <strong>Celular:</strong> {detalle.celular}
        </p>
        <p>
          <strong>Estado:</strong> {detalle.estado_reserva}
        </p>
      </div>

      {/* Botón que lleva a la verificación del comprobante */}
      <button className="btn-verify" onClick={onVerify}>
        Verificar Comprobante
      </button>
    </div>
  );
};

// ---------------- COMPONENTE PRINCIPAL -----------------

const DetalleReserva: React.FC = () => {
  // Obtiene el parámetro `idReserva` desde la URL
  const { idReserva } = useParams<{ idReserva: string }>();
  const navigate = useNavigate();

  // Estado que almacena la data de la reserva (si existe)
  const [detalle, setDetalle] = useState<DetalleData | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Controla la animación de carga
  const [error, setError] = useState<string>(""); // Almacena posibles errores

  // Función para cargar los datos de la reserva desde la API
  const fetchDetalleReserva = useCallback(async () => {
    if (!idReserva) return;

    setLoading(true); // Mostrar pantalla de carga
    setError(""); // Limpiar errores previos

    try {
      // Se agrega timestamp para evitar caché del navegador
      const timestamp = new Date().getTime();
      const url = `${API_URL}?_=${timestamp}`;

      const res = await fetch(url, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({ id_reserva: idReserva }).toString(),
      });

      // Si la respuesta del servidor no es OK, se lanza error
      if (!res.ok) {
        throw new Error(`Error del servidor (${res.status})`);
      }

      const text = await res.text(); // Se recibe como texto para controlar el parseo

      // Si el servidor devuelve una cadena vacía, se lanza error
      if (!text.trim()) {
        throw new Error("El servidor devolvió una respuesta vacía");
      }

      let json;
      try {
        json = JSON.parse(text); // Intento de convertir el texto a JSON
      } catch (parseErr) {
        // Error detallado si el JSON está mal formado
        console.error(
          "Error al parsear JSON:",
          parseErr,
          "\nRespuesta del servidor:",
          text
        );
        throw new Error(
          "El servidor devolvió una respuesta inesperada. Detalles en consola."
        );
      }

      // Si la respuesta incluye un error, se lanza
      if (json.error) {
        throw new Error(json.error);
      }

      // Se actualiza el estado con los datos recibidos
      setDetalle({
        fecha: json.fecha ?? "",
        hora_inicio: json.hora_inicio ?? "",
        hora_fin: json.hora_fin ?? "",
        nombre_reservador: json.nombre_reservador ?? "",
        apellido_reservador: json.apellido_reservador ?? "",
        celular: json.celular ?? "",
        estado_reserva: json.estado_reserva ?? "",
      });
    } catch (err) {
      // Captura del error en cualquier etapa de la solicitud
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      console.error("Error al obtener detalle:", err);
    } finally {
      setLoading(false); // Ocultar pantalla de carga
    }
  }, [idReserva]);

  // Hook que se ejecuta al montar el componente
  useEffect(() => {
    if (!idReserva) {
      // Si no hay ID, redirige a la página principal
      navigate("/");
      return;
    }

    // Cargar detalles de reserva
    fetchDetalleReserva();
  }, [idReserva, navigate, fetchDetalleReserva]);

  // Renderizado según el estado actual
  if (loading) return <LoadingComponent />; // Mientras carga, mostrar spinner
  if (error)
    return <ErrorComponent error={error} onRetry={fetchDetalleReserva} />; // Si hay error, mostrar mensaje
  if (detalle)
    return (
      <DetalleView
        detalle={detalle}
        idReserva={idReserva!}
        onVerify={() => navigate(`/verificar-comprobante/${idReserva}`)} // Navega a verificación
      />
    );

  // Si no hay datos ni error ni carga, mensaje neutro
  return <p>No se encontraron datos para la reserva.</p>;
};

// Exportar el componente principal
export default DetalleReserva;
