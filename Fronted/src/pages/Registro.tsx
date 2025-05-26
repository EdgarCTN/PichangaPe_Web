// Registro.tsx
import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./Login_Registro.css";

const urlRegistro =
  "https://a806fc95-3459-494b-9464-9e1e5b9cb5c1-00-23sfxp7uc6gjx.riker.replit.dev/registrar_usuario.php";

const Registro: React.FC = () => {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [numeroCel, setNumeroCel] = useState("");
  const [correo, setCorreo] = useState("");
  const [documento, setDocumento] = useState("");
  const [tipoDoc, setTipoDoc] = useState("DNI");
  const [fechaNac, setFechaNac] = useState("");
  const [rol, setRol] = useState("cliente");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (
      !usuario ||
      !password ||
      !nombre ||
      !apellido ||
      !numeroCel ||
      !correo ||
      !documento ||
      !tipoDoc ||
      !fechaNac
    ) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(urlRegistro, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          usuario,
          password,
          nombre,
          apellido,
          numeroCel,
          correo,
          documento,
          tipoDoc,
          fechaNac,
          rol,
        }),
      });

      const text = await response.text();

      try {
        const data = JSON.parse(text);
        if (data.error) {
          alert(data.error);
        } else {
          alert("Usuario registrado con éxito.");
          navigate("/"); // Redirige al login
        }
      } catch (jsonError) {
        console.error("Error procesando JSON:", text);
        alert("Respuesta inválida del servidor.");
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      alert("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Registro de Usuario</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            type="text"
            placeholder="Apellido"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
          />
          <input
            type="tel"
            placeholder="Celular"
            value={numeroCel}
            onChange={(e) => setNumeroCel(e.target.value)}
          />
          <input
            type="email"
            placeholder="Correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
          <input
            type="text"
            placeholder="Documento"
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
          />
          <select value={tipoDoc} onChange={(e) => setTipoDoc(e.target.value)}>
            <option value="DNI">DNI</option>
            <option value="Carnet de extranjería">Carnet de extranjería</option>
            <option value="Pasaporte">Pasaporte</option>
          </select>
          <input
            type="date"
            value={fechaNac}
            onChange={(e) => setFechaNac(e.target.value)}
          />
          <select value={rol} onChange={(e) => setRol(e.target.value)}>
            <option value="cliente">Cliente</option>
            <option value="dueño">Dueño</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" disabled={loading}>
            {loading ? "Registrando..." : "Crear cuenta"}
          </button>

          <div className="button-group">
            <button
              type="button"
              className="secondary-btn"
              onClick={() => navigate("/")}
            >
              Volver al Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registro;
