import express, {
  Request,
  Response,
  NextFunction,
} from "express";

import cors from "cors";

import mysql, {
  RowDataPacket,
  ResultSetHeader,
} from "mysql2/promise";

import bcrypt from "bcryptjs";
import session from "express-session";
import crypto from "node:crypto";


/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

const app = express();

const PORT = 3001;
const HOST = "127.0.0.1";

const FRONTEND_URL =
  "http://localhost:3000";


/* =========================================================
   CORS
   ========================================================= */

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);


/* =========================================================
   BODY
   ========================================================= */

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);


/* =========================================================
   SESIONES
   ========================================================= */

app.use(
  session({
    name: "wawy.sid",

    secret:
      "chatbot",

    resave: false,

    saveUninitialized: false,

    cookie: {
      httpOnly: true,

      // localhost utiliza HTTP
      secure: false,

      sameSite: "lax",

      // 8 horas
      maxAge:
        8 * 60 * 60 * 1000,
    },
  })
);


/* =========================================================
   EXTENDER LA SESIÓN TYPESCRIPT
   ========================================================= */

declare module "express-session" {
  interface SessionData {
    userId: string;
    email: string;
  }
}


/* =========================================================
   MYSQL
   ========================================================= */

const pool = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "",
  port: 3306,
  database: "chatbot",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/* =========================================================
   INTERFACES
   ========================================================= */

interface UsuarioRow
  extends RowDataPacket {
  User_ID: string;
  email: string;
  contrasena: string;
  activo: number;
}


interface LoginBody {
  email?: string;
  password?: string;
}


interface RegistroBody {
  email?: string;
  password?: string;
}


/* =========================================================
   FUNCIONES AUXILIARES
   ========================================================= */

function normalizarEmail(
  email: string
): string {

  return email
    .trim()
    .toLowerCase();
}


function emailValido(
  email: string
): boolean {

  const regex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return regex.test(email);
}


/* =========================================================
   VERIFICAR CONEXIÓN
   ========================================================= */

app.get(
  "/",
  (
    req: Request,
    res: Response
  ) => {

    return res.json({
      ok: true,
      message:
        "API WAWY funcionando",
    });

  }
);


/* =========================================================
   REGISTRO
   ========================================================= */

app.post(
  "/registrarse",

  async (
    req: Request<
      {},
      {},
      RegistroBody
    >,
    res: Response
  ) => {

    try {

      const email =
        normalizarEmail(
          String(
            req.body.email ?? ""
          )
        );

      const password =
        String(
          req.body.password ?? ""
        );


      /* -------------------------
         Validaciones
         ------------------------- */
      if (!email || !password) {
        return res
          .status(400)
          .json({
            ok: false,
            message:
              "Debe ingresar correo y contraseña",
          });

      }

      if (!emailValido(email)) {
        return res
          .status(400)
          .json({
            ok: false,
            message:
              "Correo electrónico no válido",
          });

      }


      if (password.length < 8) {

        return res
          .status(400)
          .json({
            ok: false,
            message:
              "La contraseña debe contener al menos 8 caracteres",
          });

      }


      /* -------------------------
         Verificar usuario
         ------------------------- */
      const [usuarios] =
        await pool.execute<UsuarioRow[]>(
          `
          SELECT
            User_ID
          FROM usuarios
          WHERE email = ?
          LIMIT 1
          `,
          [email]
        );


      if (usuarios.length > 0) {

        return res
          .status(409)
          .json({
            ok: false,

            message:
              "El correo ya se encuentra registrado",
          });

      }


      /* -------------------------
         Generar ID
         ------------------------- */

      const userId =
        crypto.randomUUID();


      /* -------------------------
         Bcrypt
         ------------------------- */

      const passwordHash =
        await bcrypt.hash(
          password,
          12
        );


      /* -------------------------
         Insertar usuario
         ------------------------- */

      await pool.execute<ResultSetHeader>(
        `
        INSERT INTO usuarios
        (
          email,
          contrasena,
          activo,
          User_ID
        )
        VALUES (?, ?, ?, ?)
        `,
        [
          email,
          passwordHash,
          1,
          userId,
        ]
      );


      return res
        .status(201)
        .json({
          ok: true,

          message:
            "Usuario registrado correctamente",
        });

    }
    catch (error) {

      console.error(
        "Error registrando usuario:",
        error
      );


      return res
        .status(500)
        .json({
          ok: false,

          message:
            "Error interno del servidor",
        });
    }
  }
);

/* =========================================================
   AUTENTICACIÓN
   ========================================================= */
app.post(
  "/autenticacion",
  async (
    req: Request<
      {},
      {},
      LoginBody
    >,
    res: Response
  ) => {

    try {

      const email =
        normalizarEmail(
          String(
            req.body.email ?? ""
          )
        );

      const password =
        String(
          req.body.password ?? ""
        );


      /* -------------------------
         Validación
         ------------------------- */

      if (!email || !password) {

        return res
          .status(400)
          .json({
            ok: false,

            message:
              "Debe ingresar correo y contraseña",
          });

      }


      /* -------------------------
         Buscar usuario
         ------------------------- */

      const [usuarios] =
        await pool.execute<UsuarioRow[]>(
          `
          SELECT
            User_ID,
            email,
            contrasena,
            activo
          FROM usuarios
          WHERE email = ?
          LIMIT 1
          `,
          [email]
        );


      if (usuarios.length === 0) {

        return res
          .status(401)
          .json({
            ok: false,

            message:
              "Correo o contraseña incorrectos",
          });

      }


      const usuario =
        usuarios[0];


      /* -------------------------
         Usuario activo
         ------------------------- */
      if (usuario.activo !== 1) {
        return res
          .status(403)
          .json({
            ok: false,

            message:
              "Usuario desactivado",
          });

      }

      /* -------------------------
         Comprobar bcrypt
         ------------------------- */
      const passwordCorrecto =
        await bcrypt.compare(
          password,
          usuario.contrasena
        );


      if (!passwordCorrecto) {
        return res
          .status(401)
          .json({
            ok: false,

            message:
              "Correo o contraseña incorrectos",
          });

      }


      /* -------------------------
         Regenerar sesión
         ------------------------- */

      req.session.regenerate(
        (error) => {

          if (error) {

            console.error(
              "Error creando sesión:",
              error
            );

            return res
              .status(500)
              .json({
                ok: false,

                message:
                  "Error creando sesión",
              });

          }


          /* -------------------------
             Guardar usuario
             ------------------------- */

          req.session.userId =
            usuario.User_ID;

          req.session.email =
            usuario.email;


          req.session.save(
            (saveError) => {

              if (saveError) {

                console.error(
                  "Error guardando sesión:",
                  saveError
                );

                return res
                  .status(500)
                  .json({
                    ok: false,

                    message:
                      "Error guardando sesión",
                  });

              }


              /* -------------------------
                 Login correcto
                 ------------------------- */

              return res
                .status(200)
                .json({
                  ok: true,

                  message:
                    "Autenticación correcta",

                  user: {
                    id:
                      usuario.User_ID,

                    email:
                      usuario.email,
                  },
                });

            }
          );

        }
      );

    }
    catch (error) {

      console.error(
        "Error autenticando usuario:",
        error
      );
      return res
        .status(500)
        .json({
          ok: false,
          message:
            "Error interno del servidor",
        });

    }

  }
);


/* =========================================================
   CONSULTAR SESIÓN
   ========================================================= */

app.get(
  "/sesion",

  (
    req: Request,
    res: Response
  ) => {

    if (!req.session.userId) {

      return res.json({
        authenticated: false,
      });

    }


    return res.json({
      authenticated: true,

      user: {
        id:
          req.session.userId,

        email:
          req.session.email,
      },
    });

  }
);


/* =========================================================
   MIDDLEWARE PARA RUTAS PROTEGIDAS
   ========================================================= */

function requiereAutenticacion(
  req: Request,
  res: Response,
  next: NextFunction
) {

  if (!req.session.userId) {

    return res
      .status(401)
      .json({
        ok: false,

        message:
          "Usuario no autenticado",
      });

  }


  next();
}


/* =========================================================
   EJEMPLO RUTA PROTEGIDA
   ========================================================= */

app.get(
  "/perfil",

  requiereAutenticacion,

  (
    req: Request,
    res: Response
  ) => {

    return res.json({
      ok: true,

      user: {
        id:
          req.session.userId,

        email:
          req.session.email,
      },
    });

  }
);


/* =========================================================
   CERRAR SESIÓN
   ========================================================= */

app.post(
  "/logout",

  (
    req: Request,
    res: Response
  ) => {

    req.session.destroy(
      (error) => {

        if (error) {

          console.error(
            "Error cerrando sesión:",
            error
          );

          return res
            .status(500)
            .json({
              ok: false,

              message:
                "No fue posible cerrar la sesión",
            });

        }


        res.clearCookie(
          "wawy.sid"
        );


        return res.json({
          ok: true,

          message:
            "Sesión cerrada correctamente",
        });

      }
    );

  }
);

/****Crear password */

interface CrearPasswordBody {
  email?: string;
  password?: string;
}

app.post(
  "/crear-password",
  async (
    req: Request<{}, {}, CrearPasswordBody>,
    res: Response
  ) => {
    try {

      const email = String(
        req.body.email ?? ""
      )
        .trim()
        .toLowerCase();

      const password = String(
        req.body.password ?? ""
      );

      if (!email || !password) {
        return res.status(400).json({
          ok: false,
          message:
            "Debe ingresar correo y contraseña",
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          ok: false,
          message:
            "La contraseña debe contener al menos 8 caracteres",
        });
      }

      const [usuarios] =
        await pool.execute<UsuarioRow[]>(
          `
          SELECT
            User_ID,
            email
          FROM usuarios
          WHERE email = ?
          LIMIT 1
          `,
          [email]
        );

      if (usuarios.length === 0) {
        return res.status(404).json({
          ok: false,
          message:
            "El usuario no existe",
        });
      }

      const passwordHash =
        await bcrypt.hash(
          password,
          12
        );

      await pool.execute(
        `
        UPDATE usuarios
        SET contrasena = ?
        WHERE email = ?
        `,
        [
          passwordHash,
          email
        ]
      );

      return res.status(200).json({
        ok: true,
        message:
          "Contraseña creada correctamente",
      });

    } catch (error) {

      console.error(
        "Error creando contraseña:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "Error interno del servidor",
      });
    }
  }
);


/* =========================================================
   Chat rasa
   ========================================================= */
interface ChatBody {
  message?: string;
}

interface RasaButton {
  title: string;
  payload: string;
}

interface RasaMessage {
  recipient_id?: string;
  text?: string;
  image?: string;
  buttons?: RasaButton[];
  attachment?: unknown;
  custom?: unknown;
}

app.post(
  "/chat",
  requiereAutenticacion,
  async (
    req: Request<{}, {}, ChatBody>,
    res: Response
  ) => {
    try {
      const message = String(
        req.body.message ?? ""
      ).trim();

      if (!message) {
        return res.status(400).json({
          ok: false,
          message: "Debe ingresar un mensaje",
        });
      }

      const userId =
        req.session.userId;

      if (!userId) {
        return res.status(401).json({
          ok: false,
          message: "Usuario no autenticado",
        });
      }

      const rasaResponse =
        await fetch(
          "http://127.0.0.1:5005/webhooks/rest/webhook",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              sender: userId,
              message: message,
            }),
          }
        );

      if (!rasaResponse.ok) {
        console.error(
          "Rasa respondió:",
          rasaResponse.status
        );

        return res.status(502).json({
          ok: false,
          message:
            "No fue posible comunicarse con WAWY",
        });
      }

      const messages =
        (await rasaResponse.json()) as RasaMessage[];

      return res.status(200).json({
        ok: true,
        messages,
      });

    } catch (error) {
      console.error(
        "Error comunicándose con Rasa:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "Error interno del servidor",
      });
    }
  }
);


/* =========================================================
   404
   ========================================================= */

app.use(
  (
    req: Request,
    res: Response
  ) => {

    return res
      .status(404)
      .json({
        ok: false,

        message:
          "Ruta no encontrada",
      });

  }
);


app.use(
  (
    req: Request,
    res: Response
  ) => {
    return res
      .status(404)
      .json({
        ok: false,
        message: "Ruta no encontrada",
      });
  }
);

/* =========================================================
   INICIAR SERVIDOR
   ========================================================= */

async function iniciarServidor() {

  try {

    const connection =
      await pool.getConnection();


    console.log(
      "Conexión MySQL establecida"
    );


    connection.release();


    app.listen(
      PORT,
      HOST,
      () => {

        console.log(
          `Servidor WAWY ejecutándose en http://localhost:${PORT}`
        );

      }
    );

  }
  catch (error) {

    console.error(
      "Error conectando con MySQL:",
      error
    );

    process.exit(1);

  }

}




void iniciarServidor();