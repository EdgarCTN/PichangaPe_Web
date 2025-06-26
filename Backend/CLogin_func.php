<?php
function login($conexion, $usuario, $password) {
    $query = "SELECT * FROM clientes
              WHERE usuario='$usuario'
                AND password='$password'
                AND rol='dueño'";

    $resultado = mysqli_query($conexion, $query);
    if ($resultado && $resultado->num_rows > 0) {
        return mysqli_fetch_assoc($resultado);
    } else {
        return ["error" => "Credenciales incorrectas o acceso denegado"];
    }
}
