import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import { BrowserRouter } from "react-router-dom";

import NavBar from "./Layouts/NavBar";
import AppContent from "./Layouts/AppContent/AppContent";

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <AppContent />
    </BrowserRouter>
  );
}

export default App;