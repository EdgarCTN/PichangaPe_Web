// Login.tsx
// Importaciones necesarias desde React y React Router
import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

// Importación de estilos CSS compartidos para login y registro
import "./Login_Registro.css";

// Ruta base del backend configurada externamente
import { BASE_URL } from "../config";

// URL del endpoint que maneja el inicio de sesión en el servidor
const url = BASE_URL + "CLogin.php";

// Constante que define la longitud máxima permitida para usuario y contraseña
const MAX_LENGTH = 30;

// Componente funcional Login
const Login: React.FC = () => {
  // Estados del formulario de inicio de sesión
  const [username, setUsername] = useState<string>(""); // Campo de usuario
  const [password, setPassword] = useState<string>(""); // Campo de contraseña
  const [errorMessage, setErrorMessage] = useState<string>(""); // Mensaje de error a mostrar
  const [loading, setLoading] = useState<boolean>(false); // Estado de carga

  const navigate = useNavigate(); // Hook para cambiar de ruta

  // Función que se ejecuta al enviar el formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // Previene recarga de página
    setErrorMessage(""); // Limpia mensajes de error anteriores

    // Validaciones de campos vacíos
    if (!username.trim() && !password.trim()) {
      return setErrorMessage("Ingrese su usuario y contraseña.");
    }
    if (!username.trim()) {
      return setErrorMessage("Ingrese su usuario.");
    }
    if (!password.trim()) {
      return setErrorMessage("Ingrese su contraseña.");
    }

    // Validación de longitud máxima
    if (username.length > MAX_LENGTH || password.length > MAX_LENGTH) {
      return setErrorMessage(
        `El usuario y la contraseña no deben exceder ${MAX_LENGTH} caracteres.`
      );
    }

    // Inicia la petición al backend
    setLoading(true); // Habilita el estado de carga
    try {
      const response = await fetch(url, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ usuario: username, password: password }), // Se envían los datos del formulario
      });

      const text = await response.text(); // Se recibe la respuesta como texto

      try {
        const data = JSON.parse(text); // Intenta convertir el texto a JSON

        if (data.error) {
          // Si el servidor envía un error (ej. "contraseña incorrecta")
          setErrorMessage(data.error);
        } else if (data.rol === "dueño") {
          // Si el usuario es un dueño válido, redirigir a la página de bienvenida
          navigate("/Bienvenida", {
            state: {
              id_cliente: data.id_cliente,
              nombre: data.nombre,
              apellido: data.apellido,
            },
          });
        } else {
          // Si se conectó pero no tiene el rol correcto
          setErrorMessage("Acceso denegado. No eres dueño.");
        }
      } catch (jsonError) {
        // Si ocurre un error al convertir la respuesta a JSON
        console.error("Error procesando JSON:", jsonError, text);
        setErrorMessage("Error del servidor. Respuesta inválida.");
      }
    } catch (err) {
      // Error de red o conexión
      console.error(err);
      setErrorMessage("Error de conexión con el servidor.");
    } finally {
      // Finaliza la carga
      setLoading(false);
    }
  };

  // Navega a la página de registro
  const irARegistro = () => {
    navigate("/registro");
  };

  // Renderizado del componente
  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          {/* Si hay mensaje de error, mostrarlo en la parte superior */}
          {errorMessage && <div className="error-message">{errorMessage}</div>}

          {/* Campo de entrada para el nombre de usuario */}
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          {/* Campo de entrada para la contraseña */}
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Botones del formulario: Entrar y Registrarse */}
          <div className="button-group">
            {/* Botón para enviar el formulario */}
            <button type="submit" disabled={loading}>
              {loading ? "Verificando..." : "Entrar"}
            </button>

            {/* Botón secundario para navegar a registro */}
            <button
              type="button"
              onClick={irARegistro}
              className="secondary-btn"
            >
              Registrarse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Exportar componente para usarlo en otras partes de la aplicación
export default Login;
