// Registro.tsx
import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./Login_Registro.css";

const urlRegistro =
  "https://b2497ce8-dcb5-473c-bec0-4eeb60091278-00-n0byecpxlij6.picard.replit.dev/registrar_usuario.php";

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
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

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
      setErrorMessage("Por favor, complete todos los campos.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const celularRegex = /^9\d{8}$/;
    const documentoRegex = /^\d{8,12}$/;
    const textoRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

    if (!emailRegex.test(correo)) {
      setErrorMessage(
        "Ingrese un correo electrónico válido (ej. ejemplo@correo.com)."
      );
      return;
    }

    if (!celularRegex.test(numeroCel)) {
      setErrorMessage(
        "El número de celular debe tener 9 dígitos y comenzar con 9 (ej. 912345678)."
      );
      return;
    }

    if (!documentoRegex.test(documento)) {
      setErrorMessage(
        "El número de documento debe contener entre 8 y 12 dígitos numéricos."
      );
      return;
    }

    if (!textoRegex.test(nombre)) {
      setErrorMessage(
        "El nombre solo debe contener letras (sin números ni símbolos)."
      );
      return;
    }

    if (!textoRegex.test(apellido)) {
      setErrorMessage(
        "El apellido solo debe contener letras (sin números ni símbolos)."
      );
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
          setErrorMessage(data.error);
        } else {
          setSuccessMessage("Usuario registrado con éxito.");
          setTimeout(() => navigate("/"), 2000);
        }
      } catch (jsonError) {
        console.error("Error procesando JSON:", text);
        setErrorMessage("Respuesta inválida del servidor.");
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      setErrorMessage("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Registro de Usuario</h2>
        <form onSubmit={handleSubmit}>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

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
            placeholder="Nombre (solo letras)"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            type="text"
            placeholder="Apellido (solo letras)"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
          />
          <input
            type="tel"
            placeholder="Celular (ej. 912345678)"
            value={numeroCel}
            onChange={(e) => setNumeroCel(e.target.value)}
          />
          <input
            type="email"
            placeholder="Correo (ej. ejemplo@correo.com)"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
          <input
            type="text"
            placeholder="Documento (8-12 dígitos)"
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
