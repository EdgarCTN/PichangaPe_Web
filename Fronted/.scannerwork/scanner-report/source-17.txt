// MisCanchas.tsx
import React, { useState, useEffect, ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./MisCanchas.css";
import { BASE_URL } from "../config";

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
        BASE_URL + "CMostrarCancha.php",
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
      alert(json.error || "Error al obtener el reporte.");
      return;
    }

    const ganancias = json.ganancias;
    if (!ganancias || ganancias.length === 0) {
      alert("No hay datos de ganancias disponibles.");
      return;
    }

    const total = ganancias.reduce(
      (acc: number, cancha: Ganancia) => acc + parseFloat(cancha.total),
      0
    );

    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text("Reporte de Ganancias", 14, 20);

    // Total general
    doc.setFontSize(12);
    doc.text(`Total General: S/ ${total.toFixed(2)}`, 14, 28);

    // Verificar si todas las canchas tienen 0.00
    const todasCanchasSinGanancia = ganancias.every(
      (c: Ganancia) => parseFloat(c.total) === 0
    );


    if (todasCanchasSinGanancia) {
      doc.setFontSize(12);
      doc.setTextColor(150);
      doc.text("⚠️ Todas las canchas tienen 0 ganancias registradas.", 14, 38);
      doc.save("ReporteGanancias.pdf");
      return;
    }

    // Obtener cancha más rentable
    const canchaMasRentable = ganancias.reduce(
      (prev: Ganancia, curr: Ganancia) =>
        parseFloat(curr.total) > parseFloat(prev.total) ? curr : prev,
      ganancias[0]
    );

    // Tabla
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

    const finalY = (doc as any).lastAutoTable?.finalY || 35;

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
  } catch (err) {
    console.error(err);
    alert("Error al generar el reporte.");
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

<button onClick={handleReporteGanancias} className="btn-reporte">
  Reporte de Ganancias
</button>




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
