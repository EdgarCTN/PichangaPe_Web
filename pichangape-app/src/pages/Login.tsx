import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const url =
  "https://739c9dc3-0789-44cf-b9b3-0a433b602be3-00-g7yu9uuhed8k.worf.replit.dev/CLogin.php";

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
      const data = await response.json();

      if (data.error) {
        alert(data.error);
      } else if (data.rol === "dueño") {
        navigate("/mis-canchas", {
          state: {
            id_cliente: data.id_cliente,
            nombre: data.nombre,
            apellido: data.apellido,
          },
        });
      } else {
        alert("Acceso denegado. No eres dueño.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
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
      </div>
    </div>
  );
};

export default Login;
