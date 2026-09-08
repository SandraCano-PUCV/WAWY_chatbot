import React, {
  Component,
  FormEvent,
} from "react";
import config from "../../config/config";
import "./Login.css";


interface LoginState {
  email: string;
  password: string;
  mensaje: string;
  cargando: boolean;
}

export default class Login extends Component<
  {},
  LoginState
> {
  state: LoginState = {
    email: "",
    password: "",
    mensaje: "",
    cargando: false,
  };

  handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    this.setState({
      cargando: true,
      mensaje: "",
    });

    try {
      const response = await fetch(
        "http://localhost:3001/autenticacion",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            email: this.state.email,
            password: this.state.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        this.setState({
          mensaje:
            data.message ??
            "Correo o contraseña incorrectos",
          cargando: false,
        });

        return;
      }

      window.location.href = "/chat";
    } catch (error) {
      console.error(error);
      this.setState({
        mensaje:
          "No fue posible conectar con el servidor",
        cargando: false,
      });
    }
  };

  render() {
    return (
      <div className="login-page">

        <div className="login-card">

          <h2 className="login-title">
            WAWY
          </h2>

          <p className="login-subtitle">
            Inicia sesión para continuar
          </p>

          <form onSubmit={this.handleSubmit}>

            <div className="login-form-group">
              <label htmlFor="email">
                Correo electrónico
              </label>

              <input
                id="email"
                type="email"
                placeholder="correo@ejemplo.cl"
                value={this.state.email}
                onChange={(event) =>
                  this.setState({
                    email:
                      event.target.value,
                  })
                }
                required
              />
            </div>

            <div className="login-form-group">
              <label htmlFor="password">
                Contraseña
              </label>

              <input
                id="password"
                type="password"
                placeholder="Ingrese su contraseña"
                value={this.state.password}
                onChange={(event) =>
                  this.setState({
                    password:
                      event.target.value,
                  })
                }
                required
              />
            </div>

            {this.state.mensaje && (
              <div className="login-message">
                {this.state.mensaje}
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={
                this.state.cargando
              }
            >
              {this.state.cargando
                ? "Ingresando..."
                : "Iniciar sesión"}
            </button>

          </form>

          <div className="login-footer">
            ¿No tienes una cuenta?{" "}
            <a href="/registro">
              Registrarse
            </a>
          </div>

        </div>

      </div>
    );
  }
}