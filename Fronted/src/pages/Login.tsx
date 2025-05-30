// Login.tsx
import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./Login_Registro.css";

const url =
  "https://b2497ce8-dcb5-473c-bec0-4eeb60091278-00-n0byecpxlij6.picard.replit.dev/CLogin.php";

const MAX_LENGTH = 30;

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(""); // Limpiar mensaje anterior

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

    // Validación de longitud
    if (username.length > MAX_LENGTH || password.length > MAX_LENGTH) {
      return setErrorMessage(
        `El usuario y la contraseña no deben exceder ${MAX_LENGTH} caracteres.`
      );
    }

    setLoading(true);
    try {
      const response = await fetch(url, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ usuario: username, password: password }),
      });

      const text = await response.text();

      try {
        const data = JSON.parse(text);

        if (data.error) {
          setErrorMessage(data.error); // Error como: contraseña incorrecta
        } else if (data.rol === "dueño") {
          navigate("/Bienvenida", {
            state: {
              id_cliente: data.id_cliente,
              nombre: data.nombre,
              apellido: data.apellido,
            },
          });
        } else {
          setErrorMessage("Acceso denegado. No eres dueño.");
        }
      } catch (jsonError) {
        console.error("Error procesando JSON:", text);
        setErrorMessage("Error del servidor. Respuesta inválida.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const irARegistro = () => {
    navigate("/registro");
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="button-group">
            <button type="submit" disabled={loading}>
              {loading ? "Verificando..." : "Entrar"}
            </button>
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

export default Login;
