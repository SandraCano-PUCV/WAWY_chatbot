import React, { Component } from "react";
import {
  Container,
  Nav,
  Navbar,
} from "react-bootstrap";

import { NavLink } from "react-router-dom";

import "./Navbar.css";

export default class NavBar extends Component {
  render() {
    return (
      <Navbar
        bg="dark"
        variant="dark"
        expand="lg"
        className="navbar-color"
      >
        <Container>

          <Navbar.Brand
            as={NavLink}
            to="/"
          >
            WAWY
          </Navbar.Brand>

          <Navbar.Toggle
            aria-controls="navbar-wawy"
          />

          <Navbar.Collapse
            id="navbar-wawy"
          >
            <Nav className="me-auto">

              <Nav.Link
                as={NavLink}
                to="/login"
              >
                Chat
              </Nav.Link>

            </Nav>
          </Navbar.Collapse>

        </Container>
      </Navbar>
    );
  }
}