import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Componentes
import Home from './components/Home';
import PsicologoAgenda from './components/PsicologoAgenda';
import Admin from './components/Admin';
import Header from './components/Header';
import ConfirmacionReserva from './components/ConfirmacionReserva';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/psicologo/:id/agenda" element={<PsicologoAgenda />} />
            <Route path="/confirmacion/:reservaId" element={<ConfirmacionReserva />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 