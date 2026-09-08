import React, { Component } from "react";
import { Container, Row } from "react-bootstrap";
import { Routes, Route } from "react-router-dom";

import Home from "../Home/Home";
import Login from "../Login/Login";
import Chat from "../Chat/Chat";

import "./AppContent.css";

export default class AppContent extends Component {
  render() {
    return (
      <Container fluid="lg">
        <Row>
          <div className="app-container">

            <Routes>

              <Route
                path="/"
                element={<Home />}
              />

              <Route
                path="/login"
                element={<Login />}
              />

              <Route
                path="/chat"
                element={<Chat />}
              />

             

            </Routes>

          </div>
        </Row>
      </Container>
    );
  }
}