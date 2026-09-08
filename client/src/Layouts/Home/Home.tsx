import React from "react";
import { Component } from "react";

export default class Home extends Component {
  render() {
    return (
      <>
        <div className="ntdl-container">
          <h2>Acerca de nosotros</h2>
          <p>
            Este es un proyecto de investigación de la Pontificia Universidad
            Católica de Valparaíso (Chile), Universidad San Buenaventura de Cali
            (Colombia) y la Universidad de Valparaíso (Chile).
          </p>
          <p>
            Se tiene la participación de estudiantes y profesores en la Escuela
            de Ingeniería Informática (PUCV), Psicología (USBCali), Ingeniería
            Multimedia (USBCali)
            </p><p>
                <strong>WAWY</strong>(We Are With You)
            , es un avatar diseñado
            para apoyar el estrés académico. Por lo que, el proyecto se centra
            en diseñar e implementar un diálogo conversacional apoyado por la
            Terapia Congnitivo-Conductual. Además de considerar otros
            instrumentos que se pueden embeber a través del dialogo para
            reconocer el estrés en estudiantes. 
            </p><p>
            <strong>WAWY</strong>  Es implementando usando el
            framework opensource RASA, para construir dialogos conversacionales,
            el cual es basado en el lenguaje de programación Python.
          </p>
        </div>
      </>
    );
  }
}
