// DetalleReserva.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./DetalleReserva.css";

// Datos de la reserva
interface DetalleData {
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  nombre_reservador: string;
  apellido_reservador: string;
  celular: string;
  estado_reserva: string;
}

// Props para ErrorComponent
interface ErrorProps {
  error: string;
  onRetry: () => void;
}

// Props para DetalleView
interface DetalleViewProps {
  detalle: DetalleData;
  idReserva: string;
  onVerify: () => void;
}

const API_URL =
  "https://a806fc95-3459-494b-9464-9e1e5b9cb5c1-00-23sfxp7uc6gjx.riker.replit.dev/reservaciones_clientes.php";

// Componente para estado de carga
const LoadingComponent: React.FC = () => (
  <div className="loading-container">
    <p>Cargando detalles de la reserva...</p>
  </div>
);

// Componente para mostrar errores y permitir reintento
const ErrorComponent: React.FC<ErrorProps> = ({ error, onRetry }) => (
  <div className="error-container" style={{ textAlign: "center" }}>
    <p style={{ color: "red" }}>Error: {error}</p>
    <button className="btn-retry" onClick={onRetry}>
      Reintentar
    </button>
  </div>
);

// Componente para mostrar los detalles de la reserva
const DetalleView: React.FC<DetalleViewProps> = ({
  detalle,
  idReserva,
  onVerify,
}) => {
  const navigate = useNavigate();

  return (
    <div className="detalle-container">
      <button className="btn-back" onClick={() => navigate(-1)}>
        ← Volver a Reservaciones
      </button>

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
      <button className="btn-verify" onClick={onVerify}>
        Verificar Comprobante
      </button>
    </div>
  );
};

const DetalleReserva: React.FC = () => {
  const { idReserva } = useParams<{ idReserva: string }>();
  const navigate = useNavigate();

  const [detalle, setDetalle] = useState<DetalleData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchDetalleReserva = useCallback(async () => {
    if (!idReserva) return;

    setLoading(true);
    setError("");

    try {
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

      if (!res.ok) {
        throw new Error(`Error del servidor (${res.status})`);
      }

      const text = await res.text();
      if (!text.trim()) {
        throw new Error("El servidor devolvió una respuesta vacía");
      }

      let json;
      try {
        json = JSON.parse(text);
      } catch (parseErr) {
        console.error("Respuesta no JSON:", text);
        throw new Error(
          "El servidor devolvió una respuesta inesperada. Detalles en consola."
        );
      }

      if (json.error) {
        throw new Error(json.error);
      }

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
      navigate("/");
      return;
    }
    fetchDetalleReserva();
  }, [idReserva, navigate, fetchDetalleReserva]);

  if (loading) return <LoadingComponent />;
  if (error)
    return <ErrorComponent error={error} onRetry={fetchDetalleReserva} />;
  if (detalle)
    return (
      <DetalleView
        detalle={detalle}
        idReserva={idReserva!}
        onVerify={() => navigate(`/verificar-comprobante/${idReserva}`)}
      />
    );

  return <p>No se encontraron datos para la reserva.</p>;
};

export default DetalleReserva;
