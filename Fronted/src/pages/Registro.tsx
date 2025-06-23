// Registro.tsx
// Importaciones necesarias desde React y react-router
import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./Login_Registro.css"; // Estilos compartidos entre login y registro
import { BASE_URL } from "../config";

// Definimos la URL del endpoint para registrar usuarios
const urlRegistro = BASE_URL + "registrar_usuario.php";

// Componente funcional de registro
const Registro: React.FC = () => {
  // Estados para los campos del formulario
  const [usuario, setUsuario] = useState(""); // nombre de usuario
  const [password, setPassword] = useState(""); // contraseña
  const [nombre, setNombre] = useState(""); // nombre real
  const [apellido, setApellido] = useState(""); // apellido
  const [numeroCel, setNumeroCel] = useState(""); // celular
  const [correo, setCorreo] = useState(""); // email
  const [documento, setDocumento] = useState(""); // número de documento
  const [tipoDoc, setTipoDoc] = useState("DNI"); // tipo de documento (por defecto: DNI)
  const [fechaNac, setFechaNac] = useState(""); // fecha de nacimiento
  const [rol, setRol] = useState("cliente"); // rol por defecto
  const [loading, setLoading] = useState(false); // estado de carga mientras se registra
  const [errorMessage, setErrorMessage] = useState(""); // mensaje de error para el usuario
  const [successMessage, setSuccessMessage] = useState(""); // mensaje de éxito

  // Hook para redirigir a otras rutas
  const navigate = useNavigate();

  // Maneja el envío del formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // Evita recarga de página
    setErrorMessage(""); // Limpia errores anteriores
    setSuccessMessage(""); // Limpia éxito anterior

    // Validación de campos vacíos
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

    // Validación de edad basada en fecha de nacimiento
    const hoy = new Date();
    const fechaNacimiento = new Date(fechaNac);
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();
    const dia = hoy.getDate() - fechaNacimiento.getDate();
    if (mes < 0 || (mes === 0 && dia < 0)) {
      edad--; // Corrige si aún no cumplió años este año
    }

    // Restricciones de edad
    if (edad < 18) {
      setErrorMessage("Debes tener al menos 18 años para registrarte.");
      return;
    }
    if (edad > 100) {
      setErrorMessage("La edad máxima permitida es de 100 años.");
      return;
    }

    // Expresiones regulares para validaciones específicas
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const celularRegex = /^9\d{8}$/; // Comienza con 9 y tiene 9 dígitos
    const documentoRegex = /^\d{8,12}$/; // Solo números de 8 a 12 dígitos
    const textoRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/u; // Solo letras (acentos y ñ incluidos)

    // Validación de correo
    if (!emailRegex.test(correo)) {
      setErrorMessage(
        "Ingrese un correo electrónico válido (ej. ejemplo@correo.com)."
      );
      return;
    }

    // Validación de número de celular
    if (!celularRegex.test(numeroCel)) {
      setErrorMessage(
        "El número de celular debe tener 9 dígitos y comenzar con 9 (ej. 912345678)."
      );
      return;
    }

    // Validación del número de documento
    if (!documentoRegex.test(documento)) {
      setErrorMessage(
        "El número de documento debe contener entre 8 y 12 dígitos numéricos."
      );
      return;
    }

    // Validación del nombre
    if (!textoRegex.test(nombre)) {
      setErrorMessage(
        "El nombre solo debe contener letras (sin números ni símbolos)."
      );
      return;
    }

    // Validación del apellido
    if (!textoRegex.test(apellido)) {
      setErrorMessage(
        "El apellido solo debe contener letras (sin números ni símbolos)."
      );
      return;
    }

    // Si todas las validaciones pasan, comienza registro
    setLoading(true); // Desactiva el botón para evitar múltiples envíos
    try {
      // Envío de datos al backend
      const response = await fetch(urlRegistro, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
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
        const data = JSON.parse(text); // Intenta interpretar la respuesta
        if (data.error) {
          setErrorMessage(data.error); // Error retornado por el backend
        } else {
          setSuccessMessage("Usuario registrado con éxito.");
          // Redirigir al login después de 2 segundos
          setTimeout(() => navigate("/"), 2000);
        }
      } catch (jsonError) {
        console.error("Error procesando JSON:", jsonError, text);
        setErrorMessage("Respuesta inválida del servidor.");
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      setErrorMessage("Error de conexión con el servidor.");
    } finally {
      setLoading(false); // Permite volver a hacer clic en el botón
    }
  };

  // -------------------- RENDERIZADO DEL FORMULARIO --------------------

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Registro de Usuario</h2>
        <form onSubmit={handleSubmit}>
          {/* Muestra mensaje de error si existe */}
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          {/* Muestra mensaje de éxito si existe */}
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

          {/* Campos del formulario */}
          <label htmlFor="usuario">Usuario</label>
          <input
            id="usuario"
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />

          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            type="text"
            placeholder="Nombre (solo letras)"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <label htmlFor="apellido">Apellido</label>
          <input
            id="apellido"
            type="text"
            placeholder="Apellido (solo letras)"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
          />

          <label htmlFor="numeroCel">Celular</label>
          <input
            id="numeroCel"
            type="tel"
            placeholder="Celular (ej. 912345678)"
            value={numeroCel}
            onChange={(e) => setNumeroCel(e.target.value)}
          />

          <label htmlFor="correo">Correo electrónico</label>
          <input
            id="correo"
            type="email"
            placeholder="Correo (ej. ejemplo@correo.com)"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />

          <label htmlFor="documento">Documento</label>
          <input
            id="documento"
            type="text"
            placeholder="Documento (8-12 dígitos)"
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
          />

          <label htmlFor="tipoDoc">Tipo de documento</label>
          <select
            id="tipoDoc"
            value={tipoDoc}
            onChange={(e) => setTipoDoc(e.target.value)}
          >
            <option value="DNI">DNI</option>
            <option value="Carnet de extranjería">Carnet de extranjería</option>
            <option value="Pasaporte">Pasaporte</option>
          </select>

          <label htmlFor="fechaNac">Fecha de nacimiento</label>
          <input
            id="fechaNac"
            type="date"
            value={fechaNac}
            onChange={(e) => setFechaNac(e.target.value)}
          />

          <label htmlFor="rol">Rol</label>
          <select id="rol" value={rol} onChange={(e) => setRol(e.target.value)}>
            <option value="cliente">Cliente</option>
            <option value="dueño">Dueño</option>
            <option value="admin">Admin</option>
          </select>

          {/* Botón de envío del formulario */}
          <button type="submit" disabled={loading}>
            {loading ? "Registrando..." : "Crear cuenta"}
          </button>

          {/* Botón para regresar al login */}
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

// Exportamos el componente para usarlo en rutas
export default Registro;
