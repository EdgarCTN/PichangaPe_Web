// DetalleReserva.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./DetalleReserva.css";

// Interfaz para los detalles de la reserva
interface DetalleReservaProps {
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  nombre_reservador: string;
  apellido_reservador: string;
  celular: string;
  estado_reserva: string;
}

// URL base para la API
const API_URL =
  "https://739c9dc3-0789-44cf-b9b3-0a433b602be3-00-g7yu9uuhed8k.worf.replit.dev/reservaciones_clientes.php";

const DetalleReserva: React.FC = () => {
  const { idReserva } = useParams<{ idReserva: string }>();
  const navigate = useNavigate();

  const [detalle, setDetalle] = useState<DetalleReservaProps | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Extraemos la función fetch a un useCallback para evitar recreación en cada render
  const fetchDetalleReserva = useCallback(async () => {
    if (!idReserva) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Agregamos timestamp para evitar caché
      const timestamp = new Date().getTime();
      const url = `${API_URL}?_=${timestamp}`;

      const res = await fetch(url, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({
          id_reserva: idReserva,
        }).toString(),
      });

      // Primero verificamos el status HTTP
      if (!res.ok) {
        throw new Error(`Error del servidor (${res.status})`);
      }

      const text = await res.text();

      // Si la respuesta está vacía
      if (!text.trim()) {
        throw new Error("El servidor devolvió una respuesta vacía");
      }

      // Intentamos parsear JSON
      let json;
      try {
        json = JSON.parse(text);
      } catch (parseErr) {
        console.error("Respuesta no JSON:", text);
        throw new Error(
          "El servidor devolvió una respuesta inesperada. Detalles en consola."
        );
      }

      // Verificamos si hay error en la respuesta JSON
      if (json.error) {
        throw new Error(json.error);
      }

      // Asignamos el detalle
      setDetalle({
        fecha: json.fecha || "",
        hora_inicio: json.hora_inicio || "",
        hora_fin: json.hora_fin || "",
        nombre_reservador: json.nombre_reservador || "",
        apellido_reservador: json.apellido_reservador || "",
        celular: json.celular || "",
        estado_reserva: json.estado_reserva || "",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      console.error("Error al obtener detalle:", err);
    } finally {
      setLoading(false);
    }
  }, [idReserva]);

  useEffect(() => {
    if (!idReserva) {
      navigate("/"); // sin id volvemos al listado
      return;
    }

    fetchDetalleReserva();
  }, [idReserva, navigate, fetchDetalleReserva]);

  // Componentes para diferentes estados
  const LoadingComponent = () => (
    <div className="loading-container">
      <p>Cargando detalles de la reserva...</p>
    </div>
  );

  const ErrorComponent = () => (
    <div
      className="error-container"
      style={{ color: "red", padding: "20px", textAlign: "center" }}
    >
      <p>Error: {error}</p>
      <button
        onClick={fetchDetalleReserva}
        style={{
          padding: "8px 16px",
          backgroundColor: "#e74c3c",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          marginTop: 10,
        }}
      >
        Reintentar
      </button>
    </div>
  );

  const DetalleComponent = () => {
    if (!detalle) return <p>No se encontraron datos para la reserva.</p>;

    return (
      <div
        className="detalle-container"
        style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}
      >
        <h2>Detalle de Reserva #{idReserva}</h2>

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

        <button onClick={() => navigate(`/verificar-comprobante/${idReserva}`)}>
          Verificar Comprobante
        </button>
      </div>
    );
  };

  // Renderizado condicional basado en el estado
  if (loading) return <LoadingComponent />;
  if (error) return <ErrorComponent />;
  return <DetalleComponent />;
};

export default DetalleReserva;
