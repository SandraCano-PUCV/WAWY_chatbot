"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const promise_1 = __importDefault(require("mysql2/promise"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_session_1 = __importDefault(require("express-session"));
const node_crypto_1 = __importDefault(require("node:crypto"));
/* =========================================================
   CONFIGURACIÓN
   ========================================================= */
const app = (0, express_1.default)();
const PORT = 3001;
const HOST = "127.0.0.1";
const FRONTEND_URL = "http://localhost:3000";
/* =========================================================
   CORS
   ========================================================= */
app.use((0, cors_1.default)({
    origin: FRONTEND_URL,
    credentials: true,
}));
/* =========================================================
   BODY
   ========================================================= */
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({
    extended: true,
}));
/* =========================================================
   SESIONES
   ========================================================= */
app.use((0, express_session_1.default)({
    name: "wawy.sid",
    secret: "chatbot",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        // localhost utiliza HTTP
        secure: false,
        sameSite: "lax",
        // 8 horas
        maxAge: 8 * 60 * 60 * 1000,
    },
}));
/* =========================================================
   MYSQL
   ========================================================= */
const pool = promise_1.default.createPool({
    host: "localhost",
    user: "root",
    password: "",
    port: 25060,
    database: "chatbot",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
/* =========================================================
   FUNCIONES AUXILIARES
   ========================================================= */
function normalizarEmail(email) {
    return email
        .trim()
        .toLowerCase();
}
function emailValido(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
/* =========================================================
   VERIFICAR CONEXIÓN
   ========================================================= */
app.get("/", (req, res) => {
    return res.json({
        ok: true,
        message: "API WAWY funcionando",
    });
});
/* =========================================================
   REGISTRO
   ========================================================= */
app.post("/registrarse", async (req, res) => {
    try {
        const email = normalizarEmail(String(req.body.email ?? ""));
        const password = String(req.body.password ?? "");
        /* -------------------------
           Validaciones
           ------------------------- */
        if (!email || !password) {
            return res
                .status(400)
                .json({
                ok: false,
                message: "Debe ingresar correo y contraseña",
            });
        }
        if (!emailValido(email)) {
            return res
                .status(400)
                .json({
                ok: false,
                message: "Correo electrónico no válido",
            });
        }
        if (password.length < 8) {
            return res
                .status(400)
                .json({
                ok: false,
                message: "La contraseña debe contener al menos 8 caracteres",
            });
        }
        /* -------------------------
           Verificar usuario
           ------------------------- */
        const [usuarios] = await pool.execute(`
          SELECT
            User_ID
          FROM usuarios
          WHERE email = ?
          LIMIT 1
          `, [email]);
        if (usuarios.length > 0) {
            return res
                .status(409)
                .json({
                ok: false,
                message: "El correo ya se encuentra registrado",
            });
        }
        /* -------------------------
           Generar ID
           ------------------------- */
        const userId = node_crypto_1.default.randomUUID();
        /* -------------------------
           Bcrypt
           ------------------------- */
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        /* -------------------------
           Insertar usuario
           ------------------------- */
        await pool.execute(`
        INSERT INTO usuarios
        (
          email,
          contrasena,
          activo,
          User_ID
        )
        VALUES (?, ?, ?, ?)
        `, [
            email,
            passwordHash,
            1,
            userId,
        ]);
        return res
            .status(201)
            .json({
            ok: true,
            message: "Usuario registrado correctamente",
        });
    }
    catch (error) {
        console.error("Error registrando usuario:", error);
        return res
            .status(500)
            .json({
            ok: false,
            message: "Error interno del servidor",
        });
    }
});
/* =========================================================
   AUTENTICACIÓN
   ========================================================= */
app.post("/autenticacion", async (req, res) => {
    try {
        const email = normalizarEmail(String(req.body.email ?? ""));
        const password = String(req.body.password ?? "");
        /* -------------------------
           Validación
           ------------------------- */
        if (!email || !password) {
            return res
                .status(400)
                .json({
                ok: false,
                message: "Debe ingresar correo y contraseña",
            });
        }
        /* -------------------------
           Buscar usuario
           ------------------------- */
        const [usuarios] = await pool.execute(`
          SELECT
            User_ID,
            email,
            contrasena,
            activo
          FROM usuarios
          WHERE email = ?
          LIMIT 1
          `, [email]);
        if (usuarios.length === 0) {
            return res
                .status(401)
                .json({
                ok: false,
                message: "Correo o contraseña incorrectos",
            });
        }
        const usuario = usuarios[0];
        /* -------------------------
           Usuario activo
           ------------------------- */
        if (usuario.activo !== 1) {
            return res
                .status(403)
                .json({
                ok: false,
                message: "Usuario desactivado",
            });
        }
        /* -------------------------
           Comprobar bcrypt
           ------------------------- */
        const passwordCorrecto = await bcryptjs_1.default.compare(password, usuario.contrasena);
        if (!passwordCorrecto) {
            return res
                .status(401)
                .json({
                ok: false,
                message: "Correo o contraseña incorrectos",
            });
        }
        /* -------------------------
           Regenerar sesión
           ------------------------- */
        req.session.regenerate((error) => {
            if (error) {
                console.error("Error creando sesión:", error);
                return res
                    .status(500)
                    .json({
                    ok: false,
                    message: "Error creando sesión",
                });
            }
            /* -------------------------
               Guardar usuario
               ------------------------- */
            req.session.userId =
                usuario.User_ID;
            req.session.email =
                usuario.email;
            req.session.save((saveError) => {
                if (saveError) {
                    console.error("Error guardando sesión:", saveError);
                    return res
                        .status(500)
                        .json({
                        ok: false,
                        message: "Error guardando sesión",
                    });
                }
                /* -------------------------
                   Login correcto
                   ------------------------- */
                return res
                    .status(200)
                    .json({
                    ok: true,
                    message: "Autenticación correcta",
                    user: {
                        id: usuario.User_ID,
                        email: usuario.email,
                    },
                });
            });
        });
    }
    catch (error) {
        console.error("Error autenticando usuario:", error);
        return res
            .status(500)
            .json({
            ok: false,
            message: "Error interno del servidor",
        });
    }
});
/* =========================================================
   CONSULTAR SESIÓN
   ========================================================= */
app.get("/sesion", (req, res) => {
    if (!req.session.userId) {
        return res.json({
            authenticated: false,
        });
    }
    return res.json({
        authenticated: true,
        user: {
            id: req.session.userId,
            email: req.session.email,
        },
    });
});
/* =========================================================
   MIDDLEWARE PARA RUTAS PROTEGIDAS
   ========================================================= */
function requiereAutenticacion(req, res, next) {
    if (!req.session.userId) {
        return res
            .status(401)
            .json({
            ok: false,
            message: "Usuario no autenticado",
        });
    }
    next();
}
/* =========================================================
   EJEMPLO RUTA PROTEGIDA
   ========================================================= */
app.get("/perfil", requiereAutenticacion, (req, res) => {
    return res.json({
        ok: true,
        user: {
            id: req.session.userId,
            email: req.session.email,
        },
    });
});
/* =========================================================
   CERRAR SESIÓN
   ========================================================= */
app.post("/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error("Error cerrando sesión:", error);
            return res
                .status(500)
                .json({
                ok: false,
                message: "No fue posible cerrar la sesión",
            });
        }
        res.clearCookie("wawy.sid");
        return res.json({
            ok: true,
            message: "Sesión cerrada correctamente",
        });
    });
});
/* =========================================================
   404
   ========================================================= */
app.use((req, res) => {
    return res
        .status(404)
        .json({
        ok: false,
        message: "Ruta no encontrada",
    });
});
/* =========================================================
   INICIAR SERVIDOR
   ========================================================= */
async function iniciarServidor() {
    try {
        const connection = await pool.getConnection();
        console.log("Conexión MySQL establecida");
        connection.release();
        app.listen(PORT, HOST, () => {
            console.log(`Servidor WAWY ejecutándose en http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("Error conectando con MySQL:", error);
        process.exit(1);
    }
}
void iniciarServidor();
//# sourceMappingURL=server.js.map