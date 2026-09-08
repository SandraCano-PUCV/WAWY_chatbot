from typing import Any, Dict, List, Text
import logging

from rasa_sdk import Action, FormValidationAction, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.types import DomainDict

from actions.conection import Respuestas


logger = logging.getLogger(__name__)


# =========================================================
# HELPERS
# =========================================================

def get_user_id(tracker: Tracker) -> str:
    """
    El identificador del usuario llega desde Express en el campo
    'sender' del webhook REST de Rasa.
    """
    return tracker.sender_id


def guardar_respuesta(
    tracker: Tracker,
    pregunta: str,
    respuesta: Any,
) -> None:
    """
    Guarda una respuesta en la BD sin detener el diálogo si ocurre
    un error de persistencia.
    """
    try:
        Respuestas(
            get_user_id(tracker),
            pregunta,
            str(respuesta),
        )
    except Exception:
        logger.exception(
            "No fue posible guardar la respuesta del usuario %s",
            get_user_id(tracker),
        )


def normalizar_texto(valor: Any) -> str:
    return str(valor).strip()


# =========================================================
# ACCIÓN DE INICIO
# =========================================================

class ActionSaludo(Action):

    def name(self) -> Text:
        return "action_saludo"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        logger.info(
            "Inicio de conversación WAWY. sender_id=%s",
            get_user_id(tracker),
        )

        return []


# =========================================================
# VALIDADORES DE PERFIL
# =========================================================

class ValidateNombreForm(FormValidationAction):

    def name(self) -> Text:
        return "validate_nombre_form"

    def validate_nombre(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:

        nombre = normalizar_texto(slot_value)

        if len(nombre) <= 2:
            dispatcher.utter_message(
                text="El nombre ingresado es demasiado corto."
            )
            return {"nombre": None}

        guardar_respuesta(
            tracker,
            "¿Cuál es tu nombre?",
            nombre,
        )

        return {"nombre": nombre}


class ValidateEdadForm(FormValidationAction):

    def name(self) -> Text:
        return "validate_edad_form"

    def validate_edad(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:

        edad = normalizar_texto(slot_value)

        if not edad.isdigit():
            dispatcher.utter_message(
                text="Por favor ingresa una edad válida utilizando números."
            )
            return {"edad": None}

        edad_num = int(edad)

        if edad_num <= 0 or edad_num > 120:
            dispatcher.utter_message(
                text="Por favor ingresa una edad válida."
            )
            return {"edad": None}

        guardar_respuesta(
            tracker,
            "¿Cuál es tu edad?",
            edad,
        )

        return {"edad": edad}


class ValidateGeneroForm(FormValidationAction):

    def name(self) -> Text:
        return "validate_genero_form"

    def validate_genero(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:

        genero = normalizar_texto(slot_value)

        if not genero:
            dispatcher.utter_message(
                text="Por favor selecciona o ingresa una opción."
            )
            return {"genero": None}

        guardar_respuesta(
            tracker,
            "¿Con qué género te identificas?",
            genero,
        )

        return {"genero": genero}


class ValidateVivirForm(FormValidationAction):

    def name(self) -> Text:
        return "validate_vivir_form"

    def validate_vivir(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:

        vivir = normalizar_texto(slot_value).lower()

        if vivir == "sí":
            vivir = "si"

        if vivir != "si":
            dispatcher.utter_message(
                text="Por favor selecciona una de las opciones disponibles."
            )
            return {"vivir": None}

        guardar_respuesta(
            tracker,
            "¿Te gustaría contarme con quién vives?",
            vivir,
        )

        return {"vivir": vivir}


class ValidateConquienForm(FormValidationAction):

    def name(self) -> Text:
        return "validate_conquien_form"

    def validate_conquien(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:

        conquien = normalizar_texto(slot_value)

        if not conquien:
            return {"conquien": None}

        if conquien.lower() == "solo":
            dispatcher.utter_message(
                text=(
                    "Gracias por responder. Recuerda que la compañía "
                    "más importante en la vida también puede ser la propia."
                )
            )
        else:
            dispatcher.utter_message(
                text="Gracias por contármelo."
            )

        guardar_respuesta(
            tracker,
            "¿Con quién vives?",
            conquien,
        )

        return {"conquien": conquien}


class ValidateProfesionForm(FormValidationAction):

    def name(self) -> Text:
        return "validate_profesion_form"

    def validate_profesion(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:

        profesion = normalizar_texto(slot_value).lower()

        if profesion not in {"ambos", "estudio", "trabajo"}:
            dispatcher.utter_message(
                text="Por favor selecciona una de las opciones disponibles."
            )
            return {"profesion": None}

        guardar_respuesta(
            tracker,
            "¿Estudias o trabajas?",
            profesion,
        )

        # Se conserva el comportamiento del flujo original.
        # Si se elige estudio/ambos se muestra la pregunta de universidad.
        # Si se elige trabajo, el stories.yml debe tener una rama específica
        # para no activar universidad_form posteriormente.
        if profesion in {"ambos", "estudio"}:
            dispatcher.utter_message(
                response="utter_ask_7"
            )
        else:
            dispatcher.utter_message(
                response="utter_ask_10"
            )

        return {"profesion": profesion}


class ValidateUniversidadForm(FormValidationAction):

    def name(self) -> Text:
        return "validate_universidad_form"

    def validate_universidad(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:

        universidad = normalizar_texto(slot_value)

        if not universidad:
            return {"universidad": None}

        guardar_respuesta(
            tracker,
            "¿En qué universidad estás?",
            universidad,
        )

        return {"universidad": universidad}


class ValidateEscuelaForm(FormValidationAction):

    def name(self) -> Text:
        return "validate_escuela_form"

    def validate_escuela(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:

        escuela = normalizar_texto(slot_value)

        if not escuela:
            return {"escuela": None}

        guardar_respuesta(
            tracker,
            "¿En qué escuela, facultad o carrera estás?",
            escuela,
        )

        return {"escuela": escuela}


class ValidateSemestreForm(FormValidationAction):

    def name(self) -> Text:
        return "validate_semestre_form"

    def validate_semestre(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:

        semestre = normalizar_texto(slot_value)

        if not semestre:
            return {"semestre": None}

        guardar_respuesta(
            tracker,
            "¿En qué semestre estás?",
            semestre,
        )

        return {"semestre": semestre}


# =========================================================
# VALIDADORES DEL DIÁLOGO
# =========================================================

class ValidateResponse11Form(FormValidationAction):

    def name(self) -> Text:
        return "validate_response_11_form"

    def validate_response_11(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:

        respuesta = normalizar_texto(slot_value)

        guardar_respuesta(
            tracker,
            "¿Quieres compartirme lo que has sentido últimamente?",
            respuesta,
        )

        return {"response_11": respuesta}


class ValidateResponse12Form(FormValidationAction):

    def name(self) -> Text:
        return "validate_response_12_form"

    def validate_response_12(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:

        respuesta = normalizar_texto(slot_value)

        guardar_respuesta(
            tracker,
            "¿Quieres compartirme algo más?",
            respuesta,
        )

        return {"response_12": respuesta}


class ValidateResponse121Form(FormValidationAction):

    def name(self) -> Text:
        return "validate_response_121_form"

    def validate_response_121(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:

        respuesta = normalizar_texto(slot_value)

        guardar_respuesta(
            tracker,
            "¿Quieres compartirme algo más?",
            respuesta,
        )

        return {"response_121": respuesta}


class ValidateResponse13Form(FormValidationAction):

    def name(self) -> Text:
        return "validate_response_13_form"

    def validate_response_13(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:

        respuesta = normalizar_texto(slot_value)

        guardar_respuesta(
            tracker,
            "¿Te gustaría que profundicemos en ello?",
            respuesta,
        )

        return {"response_13": respuesta}


class ValidateResponse14Form(FormValidationAction):

    def name(self) -> Text:
        return "validate_response_14_form"

    def validate_response_14(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:

        respuesta = normalizar_texto(slot_value)

        guardar_respuesta(
            tracker,
            "Lo que estás sintiendo",
            respuesta,
        )

        return {"response_14": respuesta}


class ValidateResponse15Form(FormValidationAction):

    def name(self) -> Text:
        return "validate_response_15_form"

    def validate_response_15(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:

        respuesta = normalizar_texto(slot_value)

        guardar_respuesta(
            tracker,
            "Imágenes que representan cómo te has sentido últimamente",
            respuesta,
        )

        return {"response_15": respuesta}


class ValidateResponse16Form(FormValidationAction):

    def name(self) -> Text:
        return "validate_response_16_form"

    def validate_response_16(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:

        respuesta = normalizar_texto(slot_value)

        guardar_respuesta(
            tracker,
            "¿Qué situaciones generan aquello que indicaste?",
            respuesta,
        )

        return {"response_16": respuesta}


class ValidateResponse17Form(FormValidationAction):

    def name(self) -> Text:
        return "validate_response_17_form"

    def validate_response_17(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:

        respuesta = normalizar_texto(slot_value)

        guardar_respuesta(
            tracker,
            "Forma de asumir situaciones difíciles",
            respuesta,
        )

        return {"response_17": respuesta}


class ValidateResponse18Form(FormValidationAction):

    def name(self) -> Text:
        return "validate_response_18_form"

    def validate_response_18(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:

        respuesta = normalizar_texto(slot_value)

        guardar_respuesta(
            tracker,
            "¿Te identificas con Juan?",
            respuesta,
        )

        return {"response_18": respuesta}


class ValidateResponse20Form(FormValidationAction):

    def name(self) -> Text:
        return "validate_response_20_form"

    def validate_response_20(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:

        respuesta = normalizar_texto(slot_value)

        guardar_respuesta(
            tracker,
            "Referente al video, ¿has vivenciado alguna de estas situaciones?",
            respuesta,
        )

        return {"response_20": respuesta}


class ValidateResponse21Form(FormValidationAction):

    def name(self) -> Text:
        return "validate_response_21_form"

    def validate_response_21(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:

        respuesta = normalizar_texto(slot_value)

        guardar_respuesta(
            tracker,
            "¿Con qué frecuencia sientes lo indicado anteriormente?",
            respuesta,
        )

        return {"response_21": respuesta}


class ValidateResponse22Form(FormValidationAction):

    def name(self) -> Text:
        return "validate_response_22_form"

    def validate_response_22(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:

        respuesta = normalizar_texto(slot_value)

        guardar_respuesta(
            tracker,
            (
                "¿Has notado que la forma como pensamos frente a las "
                "situaciones cambia nuestra forma de sentirnos?"
            ),
            respuesta,
        )

        return {"response_22": respuesta}


class ValidateResponse23Form(FormValidationAction):

    def name(self) -> Text:
        return "validate_response_23_form"

    def validate_response_23(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:

        respuesta = normalizar_texto(slot_value)

        if (
            respuesta.lower()
            == "es entendible, pero me podrias explicar un poco más".lower()
        ):
            nombre = tracker.get_slot("nombre") or ""

            dispatcher.utter_message(
                text=(
                    f"Claro, {nombre}. En el siguiente video hay una "
                    "representación de cómo pueden verse los pensamientos "
                    "intrusivos, simbolizados a través de una mosca que se "
                    "multiplica cada vez que se intenta eliminar, hasta "
                    "dejarnos cansados."
                ),
                json_message={
                    "type": "video",
                    "payload": {
                        "title": "Pensamientos intrusivos",
                        "src": "https://www.youtube.com/embed/OHzGHOO2Xz4",
                    },
                },
            )

        guardar_respuesta(
            tracker,
            "Pensamientos intrusivos negativos y positivos",
            respuesta,
        )

        return {"response_23": respuesta}


class ValidateResponse24Form(FormValidationAction):

    def name(self) -> Text:
        return "validate_response_24_form"

    def validate_response_24(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:

        respuesta = normalizar_texto(slot_value)

        guardar_respuesta(
            tracker,
            "¿En algún momento te han llegado pensamientos de este tipo?",
            respuesta,
        )

        return {"response_24": respuesta}


class ValidateResponse29Form(FormValidationAction):

    def name(self) -> Text:
        return "validate_response_29_form"

    def validate_response_29(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:

        respuesta = normalizar_texto(slot_value)

        guardar_respuesta(
            tracker,
            "¿Cómo te hicieron sentir los ejemplos?",
            respuesta,
        )

        return {"response_29": respuesta}


class ValidateResponse30Form(FormValidationAction):

    def name(self) -> Text:
        return "validate_response_30_form"

    def validate_response_30(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:

        respuesta = normalizar_texto(slot_value)

        guardar_respuesta(
            tracker,
            "¿Por qué escogiste ese emoji?",
            respuesta,
        )

        return {"response_30": respuesta}


class ValidateResponse31Form(FormValidationAction):

    def name(self) -> Text:
        return "validate_response_31_form"

    def validate_response_31(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:

        respuesta = normalizar_texto(slot_value)

        guardar_respuesta(
            tracker,
            (
                "¿Has pensado alguna vez en algo como los ejemplos "
                "anteriores? ¿Cómo te hizo sentir?"
            ),
            respuesta,
        )

        return {"response_31": respuesta}


class ValidateResponse33Form(FormValidationAction):

    def name(self) -> Text:
        return "validate_response_33_form"

    def validate_response_33(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:

        respuesta = normalizar_texto(slot_value)

        guardar_respuesta(
            tracker,
            (
                "¿Has vivido alguna vez estos pensamientos de "
                "minimización de las cosas positivas?"
            ),
            respuesta,
        )

        return {"response_33": respuesta}


class ValidateResponse34Form(FormValidationAction):

    def name(self) -> Text:
        return "validate_response_34_form"

    def validate_response_34(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:

        respuesta = normalizar_texto(slot_value)

        guardar_respuesta(
            tracker,
            "¿Sueles concentrarte en tus puntos débiles olvidando los fuertes?",
            respuesta,
        )

        return {"response_34": respuesta}


class ValidateResponse36Form(FormValidationAction):

    def name(self) -> Text:
        return "validate_response_36_form"

    def validate_response_36(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:

        respuesta = normalizar_texto(slot_value)

        guardar_respuesta(
            tracker,
            (
                "¿Estás utilizando un criterio distinto para ti que "
                "para los demás cuando existe un logro o reconocimiento?"
            ),
            respuesta,
        )

        return {"response_36": respuesta}


# =========================================================
# ACCIONES PERSONALIZADAS DEL DIÁLOGO
# =========================================================

class ActionAsk15(Action):

    def name(self) -> Text:
        return "action_ask_15"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        data = {
            "payload": "ButtonsCarusel",
            "data": [
                {
                    "title": "Sensación de ahogo",
                    "payload": "ahogo",
                    "imagen": "assets/iconos/ahogo.png",
                },
                {
                    "title": "Decaimiento",
                    "payload": "decaimiento",
                    "imagen": "assets/iconos/decaimiento.png",
                },
                {
                    "title": "Pérdida de apetito",
                    "payload": "perdida de apetito",
                    "imagen": "assets/iconos/falta_apetito.png",
                },
                {
                    "title": "Aumento de apetito",
                    "payload": "aumento de apetito",
                    "imagen": "assets/iconos/aumento_apetito.png",
                },
                {
                    "title": "Insomnio",
                    "payload": "insomnio",
                    "imagen": "assets/iconos/Insomnio.png",
                },
            ],
        }

        dispatcher.utter_message(
            text=(
                "Te voy a mostrar algunas imágenes. Selecciona las que "
                "representen algo que hayas sentido últimamente."
            )
        )

        dispatcher.utter_message(
            json_message=data
        )

        return []


class ActionAsk19(Action):

    def name(self) -> Text:
        return "action_ask_19"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        dispatcher.utter_message(
            text=(
                "Durante este semestre, ¿has sentido presión en el pecho "
                "o sensación de ahogo durante periodos de mucha carga "
                "estudiantil, problemas familiares o sociales? No "
                "necesariamente se presentan todas estas situaciones a "
                "la vez. En el siguiente video se ejemplifica para una "
                "mejor comprensión."
            ),
            json_message={
                "type": "video",
                "payload": {
                    "title": "Ejemplo",
                    "src": "https://www.youtube.com/embed/f1xjue-NjzI",
                },
            },
        )

        dispatcher.utter_message(
            text=" ",
            buttons=[
                {
                    "title": "Entiendo",
                    "payload": "/afirmativo",
                }
            ],
        )

        return []


class ActionAsk21(Action):

    def name(self) -> Text:
        return "action_ask_21"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        opcion = tracker.get_slot("response_20") or "eso"

        dispatcher.utter_message(
            text=f"¿Con qué frecuencia sientes {opcion}?",
            buttons=[
                {
                    "title": "Muy frecuentemente",
                    "payload": "Muy frecuentemente",
                },
                {
                    "title": "Frecuentemente",
                    "payload": "frecuentemente",
                },
                {
                    "title": "Pocas veces",
                    "payload": "Pocas veces",
                },
                {
                    "title": "Casi nunca",
                    "payload": "Casi nunca",
                },
            ],
        )

        return []


class ActionAsk23(Action):

    def name(self) -> Text:
        return "action_ask_23"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        nombre = tracker.get_slot("nombre") or ""

        texto = (
            f"Entonces {nombre}, quería explicarte que los pensamientos "
            "influyen en lo que sentimos. Con las siguientes preguntas y "
            "ejemplos quiero conocerte un poco más. El objetivo es "
            "identificar pensamientos intrusivos negativos y positivos, "
            "como muestra la imagen."
        )

        dispatcher.utter_message(
            text=texto,
            image="assets/img/pensamientos.png",
        )

        dispatcher.utter_message(
            text=" ",
            buttons=[
                {
                    "title": "Está bien WAWY",
                    "payload": "esta bien",
                },
                {
                    "title": "Es entendible, pero me podrías explicar un poco más",
                    "payload": "Es entendible, pero me podrias explicar un poco más",
                },
            ],
        )

        return []


class ActionAsk24(Action):

    def name(self) -> Text:
        return "action_ask_24"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        texto = (
            "Existen pensamientos intrusivos cuando pensamos en las cosas "
            "que deberían o tendrían que pasar. Por ejemplo:\n\n"
            "- Debería trabajar en algo relacionado con mi carrera.\n"
            "- Tendría que haber terminado mi proyecto de título (tesis) "
            "hace rato.\n"
            "- Debería graduarme con mis compañeros de inicio de carrera.\n"
            "- Debería entender los temas como los demás.\n\n"
            "¿En algún momento te han llegado pensamientos de este tipo? "
            "¿Qué te hicieron sentir?"
        )

        dispatcher.utter_message(
            text=texto
        )

        return []


class ActionAsk26(Action):

    def name(self) -> Text:
        return "action_ask_26"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        nombre = tracker.get_slot("nombre") or ""

        texto = (
            f"Mira, {nombre}. En ocasiones las personas se encasillan o "
            "se etiquetan a sí mismas. Esto puede verse cuando aparecen "
            "pensamientos como:\n\n"
            "- Soy un(a) tont@ por haberme equivocado en el parcial.\n"
            "- Soy un perdedor por no tener las mejores calificaciones.\n"
            "- Ellos son mejores que yo porque no sé exponer."
        )

        dispatcher.utter_message(
            text=texto,
            buttons=[
                {
                    "title": "Entiendo WAWY",
                    "payload": "/afirmativo",
                }
            ],
        )

        return []


class ActionAsk28(Action):

    def name(self) -> Text:
        return "action_ask_28"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        nombre = tracker.get_slot("nombre") or ""

        texto = (
            f"Claro, {nombre}. En ocasiones podemos distorsionar nuestra "
            "realidad mediante nuestros pensamientos, porque podemos tomar "
            "en cuenta solo nuestros deseos y nuestra perspectiva sin "
            "considerar otros factores del entorno. Por ejemplo:\n\n"
            "- No es justo que me haya esforzado tanto para este parcial "
            "y haber obtenido esta nota.\n"
            "- Es injusto que no me hayan dado la calificación que me "
            "merecía.\n"
            "- Es injusto que a esa persona le den ese reconocimiento y "
            "no a mí."
        )

        dispatcher.utter_message(
            text=texto,
            buttons=[
                {
                    "title": "Está bien WAWY",
                    "payload": "/afirmativo",
                }
            ],
        )

        return []


class ActionAsk29(Action):

    def name(self) -> Text:
        return "action_ask_29"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        data = {
            "payload": "ButtonsCarusel",
            "data": [
                {
                    "title": "Triste",
                    "payload": "triste",
                    "imagen": "assets/iconos/decaimiento.png",
                },
                {
                    "title": "Frustrado",
                    "payload": "frustrado",
                    "imagen": "assets/iconos/frustrado.png",
                },
                {
                    "title": "Rabia",
                    "payload": "rabia",
                    "imagen": "assets/iconos/rabia.png",
                },
                {
                    "title": "Impotencia",
                    "payload": "impotencia",
                    "imagen": "assets/iconos/impotencia.png",
                },
            ],
        }

        dispatcher.utter_message(
            text="¿Cómo te hicieron sentir los ejemplos?"
        )

        dispatcher.utter_message(
            json_message=data
        )

        return []


class ActionAsk31(Action):

    def name(self) -> Text:
        return "action_ask_31"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        nombre = tracker.get_slot("nombre") or ""

        texto = (
            "Entiendo, muchas gracias por compartirlo conmigo. "
            f"{nombre}, algunos pensamientos intrusivos pueden "
            "engrandecerse por lo frecuentes que se vuelven en nuestra "
            "cotidianidad. Por ejemplo:\n\n"
            "- Si paso al frente, me voy a desmayar y voy a hacer el "
            "ridículo frente a todos.\n"
            "- Perder esta materia es lo peor que me podría pasar en la "
            "vida.\n"
            "- Si no termino mi carrera universitaria, no seré nadie en "
            "la vida.\n"
            "- Si no saco buenas calificaciones, seré la decepción de mi "
            "familia.\n\n"
            "¿Has pensado alguna vez en algo como los ejemplos anteriores? "
            "¿Cómo te hizo sentir?"
        )

        dispatcher.utter_message(
            text=texto
        )

        return []


class ActionAsk32(Action):

    def name(self) -> Text:
        return "action_ask_32"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        texto = (
            "Los pensamientos intrusivos también pueden presentarse como "
            "minimización de las cosas positivas que nos ocurren. Por "
            "ejemplo:\n\n"
            "- ¿Por qué habría que celebrar pasar esta materia que tanto "
            "me costó? Era mi obligación.\n"
            "- Quedar en primer lugar no significa nada.\n"
            "- Ganar una prueba no es nada."
        )

        dispatcher.utter_message(
            text=texto
        )

        return []