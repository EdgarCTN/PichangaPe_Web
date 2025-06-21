import React, { useState, useEffect, ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Bienvenida_MisCanchas.css";
import { BASE_URL } from "../config";

interface Cancha {
  id_cancha: string;
  nombre: string;
  direccion: string;
  precio_por_hora: string;
  estado: string;
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
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [tipoMensaje, setTipoMensaje] = useState<"éxito" | "error" | null>(
    null
  );
  const [idPendienteEliminar, setIdPendienteEliminar] = useState<string | null>(
    null
  );

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

  const mostrarMensaje = (texto: string, tipo: "éxito" | "error") => {
    setMensaje(texto);
    setTipoMensaje(tipo);
    setTimeout(() => {
      setMensaje(null);
      setTipoMensaje(null);
    }, 4000);
  };

  const fetchDatos = async () => {
    setLoading(true);
    try {
      const res = await fetch(BASE_URL + "CMostrarCancha.php", {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ id_dueno: id_cliente }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        mostrarMensaje(json.error ?? `Error servidor: ${res.status}`, "error");
        return;
      }
      setLista(json.canchas ?? []);
      setListaFull(json.canchas ?? []);
    } catch (err) {
      console.error(err);
      mostrarMensaje("Error al cargar canchas. Revisa la consola.", "error");
    } finally {
      setLoading(false);
    }
  };

  const confirmarEliminacion = (id_cancha: string) => {
    setIdPendienteEliminar(id_cancha);
  };

  const cancelarEliminacion = () => {
    setIdPendienteEliminar(null);
  };

  const eliminarCanchaConfirmada = async () => {
    if (!idPendienteEliminar) return;
    try {
      const res = await fetch(BASE_URL + "eliminar_cancha.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_cancha: idPendienteEliminar }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        mostrarMensaje(json.error ?? "Error al eliminar la cancha.", "error");
      } else {
        mostrarMensaje(json.mensaje, "éxito");
        setLista((prev) =>
          prev.filter((c) => c.id_cancha !== idPendienteEliminar)
        );
        setListaFull((prev) =>
          prev.filter((c) => c.id_cancha !== idPendienteEliminar)
        );
      }
    } catch (err) {
      console.error(err);
      mostrarMensaje("Error al intentar eliminar la cancha.", "error");
    } finally {
      setIdPendienteEliminar(null);
    }
  };

  const cambiarEstadoCancha = async (
    id_cancha: string,
    nuevoEstado: string
  ) => {
    try {
      const res = await fetch(BASE_URL + "cambiar_estado_cancha.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_cancha, estado: nuevoEstado }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        mostrarMensaje(json.error ?? "Error al cambiar el estado.", "error");
        return;
      }

      setLista((prev) =>
        prev.map((c) =>
          c.id_cancha === id_cancha ? { ...c, estado: nuevoEstado } : c
        )
      );
      setListaFull((prev) =>
        prev.map((c) =>
          c.id_cancha === id_cancha ? { ...c, estado: nuevoEstado } : c
        )
      );

      mostrarMensaje("Estado actualizado correctamente.", "éxito");
    } catch (err) {
      console.error(err);
      mostrarMensaje("Error al actualizar estado de la cancha.", "error");
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

  interface Ganancia {
    nombre: string;
    total: string;
  }

  const handleReporteGanancias = async () => {
    try {
      const res = await fetch(BASE_URL + "CReporteGanancias.php", {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ id_dueno: id_cliente }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        mostrarMensaje(json.error ?? "Error al obtener el reporte.", "error");
        return;
      }

      const ganancias = json.ganancias;
      if (!ganancias || ganancias.length === 0) {
        mostrarMensaje("No hay datos de ganancias disponibles.", "error");
        return;
      }

      const total = ganancias.reduce(
        (acc: number, cancha: Ganancia) => acc + parseFloat(cancha.total),
        0
      );

      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Reporte de Ganancias", 14, 20);
      doc.setFontSize(12);
      doc.text(`Total General: S/ ${total.toFixed(2)}`, 14, 28);

      const todasCanchasSinGanancia = ganancias.every(
        (c: Ganancia) => parseFloat(c.total) === 0
      );

      if (todasCanchasSinGanancia) {
        doc.setFontSize(12);
        doc.setTextColor(150);
        doc.text(
          "⚠️ Todas las canchas tienen 0 ganancias registradas.",
          14,
          38
        );
        doc.save("ReporteGanancias.pdf");
        return;
      }

      const canchaMasRentable = ganancias.reduce(
        (prev: Ganancia, curr: Ganancia) =>
          parseFloat(curr.total) > parseFloat(prev.total) ? curr : prev,
        ganancias[0]
      );

      const tableColumn = ["Cancha", "Ganancia (S/)"];
      const tableRows = ganancias.map((cancha: Ganancia) => [
        cancha.nombre,
        parseFloat(cancha.total).toFixed(2),
      ]);

      autoTable(doc, {
        startY: 35,
        head: [tableColumn],
        body: tableRows,
        styles: { fontSize: 11 },
        headStyles: { fillColor: [22, 160, 133] },
        didParseCell: (data) => {
          if (
            data.row.index !== undefined &&
            ganancias[data.row.index].nombre === canchaMasRentable.nombre
          ) {
            data.cell.styles.fillColor = [22, 160, 133];
          }
        },
      });

      const finalY = (doc as any).lastAutoTable?.finalY ?? 35;

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(
        `⭐ Cancha más rentable: ${canchaMasRentable.nombre} (S/ ${parseFloat(
          canchaMasRentable.total
        ).toFixed(2)})`,
        14,
        finalY + 10
      );

      doc.save("ReporteGanancias.pdf");
      mostrarMensaje("Reporte generado correctamente.", "éxito");
    } catch (err) {
      console.error(err);
      mostrarMensaje("Error al generar el reporte.", "error");
    }
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
        {mensaje && <div className={`mensaje ${tipoMensaje}`}>{mensaje}</div>}
        {idPendienteEliminar && (
          <div className="modal-overlay">
            <div className="modal-content">
              <p>
                ¿Estás seguro de eliminar esta cancha? Esta acción no se puede
                deshacer.
              </p>
              <div className="confirmacion-botones">
                <button className="btn-cancelar" onClick={cancelarEliminacion}>
                  Cancelar
                </button>
                <button
                  className="btn-confirmar"
                  onClick={eliminarCanchaConfirmada}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
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

          <button onClick={handleReporteGanancias} className="btn-reporte">
            Reporte de Ganancias
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
        ...
        {!loading && lista.length > 0 && (
          <ul className="canchas-list">
            {lista.map((item) => (
              <li key={item.id_cancha} className="cancha-card">
                <button
                  type="button"
                  className="cancha-info"
                  onClick={() => handleSeleccionCancha(item)}
                >
                  <h3>{item.nombre}</h3>
                  <p>Dirección: {item.direccion}</p>
                  <p>Precio por hora: S/ {item.precio_por_hora}</p>
                  <p>
                    Estado actual: <strong>{item.estado}</strong>
                  </p>
                </button>

                <div className="cambiar-estado">
                  <label htmlFor={`estado-${item.id_cancha}`}>
                    Cambiar estado:
                  </label>
                  <select
                    id={`estado-${item.id_cancha}`}
                    value={item.estado}
                    onChange={(e) =>
                      cambiarEstadoCancha(item.id_cancha, e.target.value)
                    }
                  >
                    <option value="activa">Activa</option>
                    <option value="inactiva">Inactiva</option>
                    <option value="mantenimiento">Mantenimiento</option>
                  </select>
                  <button
                    className="btn-eliminar"
                    onClick={() => confirmarEliminacion(item.id_cancha)}
                  >
                    Eliminar cancha
                  </button>
                </div>
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
