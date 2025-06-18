// VerificarComprobante.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./VerificarComprobante.css";
import { BASE_URL } from "../config";

const API_FETCH_VOUCHER = BASE_URL + "obtener_voucher.php";
const API_UPDATE_STATE = BASE_URL + "actualizar_estado_reserva.php";

const VerificarComprobante: React.FC = () => {
  const { idReserva } = useParams<{ idReserva: string }>();
  const navigate = useNavigate();

  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [buttonsDisabled, setButtonsDisabled] = useState<boolean>(false);
  const [estadoReserva, setEstadoReserva] = useState<string>("pendiente");
  const [mensajeResultado, setMensajeResultado] = useState<string>("");

  const fetchVoucher = useCallback(async () => {
    if (!idReserva) {
      setError("No se recibió el ID de reserva.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setMensajeResultado("");

    try {
      const response = await fetch(API_FETCH_VOUCHER, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({ id_reserva: idReserva }).toString(),
      });

      const text = await response.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        console.error("Respuesta no JSON:", text);
        throw new Error("Error en la respuesta del servidor.");
      }

      if (json.error) {
        throw new Error(json.error);
      }

      setImageUrl(json.image_url);

      if (json.estado) {
        setEstadoReserva(json.estado);

        if (json.estado === "pagado") {
          setMensajeResultado("✅ Comprobante aprobado previamente.");
          setButtonsDisabled(true);
        } else if (json.estado === "cancelado") {
          setMensajeResultado("❌ Comprobante rechazado previamente.");
          setButtonsDisabled(true);
        } else if (json.estado === "pendiente") {
          setMensajeResultado("");
          setButtonsDisabled(false);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [idReserva]);

  const actualizarEstado = async (nuevoEstado: "pagado" | "cancelado") => {
    if (!idReserva) return;

    setLoading(true);
    setError("");
    setMensajeResultado("");

    try {
      const response = await fetch(API_UPDATE_STATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({
          id_reserva: idReserva,
          estado: nuevoEstado,
        }).toString(),
      });

      const text = await response.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        console.error("Respuesta no JSON:", text);
        throw new Error("Error en la respuesta del servidor.");
      }

      if (json.error) {
        setError(json.error);
      } else if (json.success) {
        setMensajeResultado(
          nuevoEstado === "pagado"
            ? "✅ Comprobante aprobado correctamente."
            : "❌ Comprobante rechazado correctamente."
        );
        setButtonsDisabled(true);
        setEstadoReserva(nuevoEstado);

        const idCliente = json.id_cliente;
        const nombre = json.nombre ?? "";
        const apellido = json.apellido ?? "";

        if (!idCliente) {
          setError("No se obtuvo id_cliente");
          return;
        }

        // Navegar luego de un breve delay para que el usuario vea el mensaje
        setTimeout(() => {
          navigate("/bienvenida", {
            state: {
              id_cliente: idCliente,
              nombre,
              apellido,
            },
          });
        }, 2000);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError("Error al actualizar estado: " + message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen((prev) => !prev);
  };

  useEffect(() => {
    fetchVoucher();
  }, [fetchVoucher]);

  if (loading) {
    return (
      <div className="verificar-container">
        <div className="verificar-card">
          <p className="verificar-loading">Cargando comprobante...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="verificar-container">
        <div className="verificar-card">
          <p className="verificar-error">Error: {error}</p>
          <button className="verificar-retry-button" onClick={fetchVoucher}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="verificar-container">
      <div className="verificar-card">
        {/* Botón Volver a Detalle */}
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Volver a Detalle
        </button>

        <h2 className="verificar-title">Comprobante de Reserva #{idReserva}</h2>

        <button
          type="button"
          className={`verificar-image-container ${
            isFullScreen ? "fullscreen" : ""
          }`}
          onClick={toggleFullScreen}
        >
          <img src={imageUrl} alt="Comprobante" className="verificar-image" />
        </button>

        {/* Mensaje resultado aprobación/rechazo */}
        {mensajeResultado && (
          <p
            style={{
              marginTop: "20px",
              fontWeight: "bold",
              color: estadoReserva === "pagado" ? "green" : "red",
            }}
          >
            {mensajeResultado}
          </p>
        )}

        {/* Mostrar botones solo si está pendiente y no están deshabilitados */}
        {!isFullScreen && !buttonsDisabled && estadoReserva === "pendiente" && (
          <div className="verificar-buttons">
            <button
              className="verificar-button cancelar"
              onClick={() => actualizarEstado("cancelado")}
              disabled={buttonsDisabled}
            >
              Rechazar
            </button>

            <button
              className="verificar-button aprobar"
              onClick={() => actualizarEstado("pagado")}
              disabled={buttonsDisabled}
            >
              Aprobar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificarComprobante;
