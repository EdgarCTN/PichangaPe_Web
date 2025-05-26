import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const url =
  "https://a806fc95-3459-494b-9464-9e1e5b9cb5c1-00-23sfxp7uc6gjx.riker.replit.dev/CLogin.php";

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return alert("Ingrese su usuario");
    if (!password.trim()) return alert("Ingrese su contraseña");

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
          alert(data.error);
        } else if (data.rol === "dueño") {
          navigate("/Bienvenida", {
            state: {
              id_cliente: data.id_cliente,
              nombre: data.nombre,
              apellido: data.apellido,
            },
          });
        } else {
          alert("Acceso denegado. No eres dueño.");
        }
      } catch (jsonError) {
        console.error("Error procesando JSON:", text);
        alert("Error del servidor. Respuesta inválida.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const irARegistro = () => {
    navigate("/registro"); // Asegúrate de tener esta ruta definida en React Router
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
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
          <button type="submit" disabled={loading}>
            {loading ? "Verificando..." : "Entrar"}
          </button>
        </form>
        <button onClick={irARegistro} className="registro-btn">
          Registrarse
        </button>
      </div>
    </div>
  );
};

export default Login;
