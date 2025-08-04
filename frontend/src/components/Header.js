import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          🧠 PsicoAgenda
        </Link>
        <nav className="nav-links">
          <Link to="/">Inicio</Link>
          <Link to="/admin">Admin</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header; 