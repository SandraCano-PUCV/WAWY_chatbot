import logging
import os
from datetime import datetime
from typing import Any, Optional, Union

import mysql.connector
from mysql.connector import Error


logger = logging.getLogger(__name__)


# =========================================================
# CONFIGURACIÓN DE BASE DE DATOS
# =========================================================
#
# Las credenciales de base de datos son información privada y
# conviene mantenerlas fuera del repositorio.
#
# Valores por defecto pensados únicamente para desarrollo local.
#
DB_CONFIG = {
    "host": os.getenv("WAWY_DB_HOST", "127.0.0.1"),
    "port": int(os.getenv("WAWY_DB_PORT", "3306")),
    "user": os.getenv("WAWY_DB_USER", "root"),
    "password": os.getenv("WAWY_DB_PASSWORD", ""),
    "database": os.getenv("WAWY_DB_NAME", "chatbot"),
    "connection_timeout": 5,
    "charset": "utf8mb4",
    "use_unicode": True,
}


def _get_connection():
    """Crea una conexión MySQL."""
    return mysql.connector.connect(**DB_CONFIG)


# =========================================================
# USUARIOS
# =========================================================

def BuscarUsuario(user_id: str) -> Optional[int]:
    """
    Convierte el User_ID público de WAWY en el idusuarios interno
    utilizado como FK por la tabla respuestas.

    El valor user_id corresponde a tracker.sender_id, que llega
    desde Express como sender en el webhook REST de Rasa.
    """

    connection = None
    cursor = None

    try:
        connection = _get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT idusuarios
            FROM usuarios
            WHERE User_ID = %s
            LIMIT 1
            """,
            (user_id,),
        )

        row = cursor.fetchone()

        if row is None:
            return None

        return int(row[0])

    except Error:
        logger.exception(
            "Error consultando el usuario en MySQL."
        )
        raise

    finally:
        if cursor is not None:
            cursor.close()

        if connection is not None and connection.is_connected():
            connection.close()


def Autenticacion(email: str) -> Optional[str]:
    """
    Se conserva por compatibilidad con código antiguo.

    La autenticación de WAWY debe realizarla Express, no Rasa.
    Esta función únicamente busca el User_ID asociado a un correo.
    """

    connection = None
    cursor = None

    try:
        connection = _get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT User_ID
            FROM usuarios
            WHERE email = ?
            LIMIT 1
            """.replace("?", "%s"),
            (email.strip().lower(),),
        )

        row = cursor.fetchone()

        if row is None:
            return None

        return str(row[0])

    except Error:
        logger.exception(
            "Error consultando el usuario por correo."
        )
        raise

    finally:
        if cursor is not None:
            cursor.close()

        if connection is not None and connection.is_connected():
            connection.close()


# =========================================================
# RESPUESTAS
# =========================================================

def Respuestas(
    idusuario: Union[str, int],
    pregunta: str,
    respuesta: Any,
) -> bool:
    """
    Guarda una respuesta capturada por WAWY.

    idusuario puede ser:
      - el User_ID público enviado por Express a Rasa, o
      - el idusuarios interno de MySQL.

    Retorna True si el registro fue almacenado.
    """

    if idusuario is None:
        raise ValueError(
            "No se recibió un identificador de usuario."
        )

    public_or_internal_id = str(idusuario).strip()

    if not public_or_internal_id:
        raise ValueError(
            "El identificador de usuario está vacío."
        )

    # Si recibimos un id numérico puro lo tratamos como idusuarios.
    # En el flujo React -> Express -> Rasa normalmente recibiremos
    # el User_ID público y será necesario resolverlo primero.
    if public_or_internal_id.isdigit():
        usuario_db_id = int(public_or_internal_id)
    else:
        usuario_db_id = BuscarUsuario(
            public_or_internal_id
        )

    if usuario_db_id is None:
        raise ValueError(
            "No existe un usuario asociado al User_ID recibido."
        )

    connection = None
    cursor = None

    try:
        connection = _get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO respuestas
                (idUsuario, pregunta, respuesta, fecha)
            VALUES
                (%s, %s, %s, %s)
            """,
            (
                usuario_db_id,
                str(pregunta),
                str(respuesta),
                datetime.now(),
            ),
        )

        connection.commit()

        return True

    except Error:
        if (
            connection is not None
            and connection.is_connected()
        ):
            connection.rollback()

        logger.exception(
            "Error guardando una respuesta en MySQL."
        )

        raise

    finally:
        if cursor is not None:
            cursor.close()

        if connection is not None and connection.is_connected():
            connection.close()
