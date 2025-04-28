import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./VerificarComprobante.css";

const API_FETCH_VOUCHER =
  "https://739c9dc3-0789-44cf-b9b3-0a433b602be3-00-g7yu9uuhed8k.worf.replit.dev/obtener_voucher.php";
const API_UPDATE_STATE =
  "https://739c9dc3-0789-44cf-b9b3-0a433b602be3-00-g7yu9uuhed8k.worf.replit.dev/actualizar_estado_reserva.php";

const VerificarComprobante: React.FC = () => {
  const { idReserva } = useParams<{ idReserva: string }>();
  const navigate = useNavigate();

  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [buttonsDisabled, setButtonsDisabled] = useState<boolean>(false);

  const fetchVoucher = useCallback(async () => {
    if (!idReserva) {
      setError("No se recibió el ID de reserva.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

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
      } catch (err) {
        console.error("Respuesta no JSON:", text);
        throw new Error("Error en la respuesta del servidor.");
      }

      if (json.error) {
        throw new Error(json.error);
      }

      setImageUrl(json.image_url);
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
      } catch (err) {
        console.error("Respuesta no JSON:", text);
        throw new Error("Error en la respuesta del servidor.");
      }

      if (json.error) {
        alert(json.error);
      } else if (json.success) {
        alert(json.success);
        setButtonsDisabled(true);

        const idCliente = json.id_cliente;
        const nombre = json.nombre || "";
        const apellido = json.apellido || "";

        if (!idCliente) {
          alert("No se obtuvo id_cliente");
          return;
        }

        navigate("/bienvenida", {
          state: {
            id_cliente: idCliente,
            nombre,
            apellido,
          },
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      alert("Error al actualizar estado: " + message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
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
        <h2 className="verificar-title">Comprobante de Reserva #{idReserva}</h2>

        <div
          className={`verificar-image-container ${
            isFullScreen ? "fullscreen" : ""
          }`}
          onClick={toggleFullScreen}
        >
          <img src={imageUrl} alt="Comprobante" className="verificar-image" />
        </div>

        {!isFullScreen && (
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
