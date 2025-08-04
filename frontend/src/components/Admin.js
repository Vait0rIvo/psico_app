import React, { useState } from 'react';
import AdminPsicologos from './AdminPsicologos';
import AdminEspecialidades from './AdminEspecialidades';

const Admin = () => {
  const [seccionActiva, setSeccionActiva] = useState('psicologos');

  const secciones = [
    { id: 'psicologos', nombre: 'Psicólogos', icono: '👥' },
    { id: 'especialidades', nombre: 'Especialidades', icono: '🏷️' },
    { id: 'reservas', nombre: 'Reservas', icono: '📅' },
  ];

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'psicologos':
        return <AdminPsicologos />;
      case 'especialidades':
        return <AdminEspecialidades />;
      case 'reservas':
        return <div className="card"><div className="card-body"><h3>Gestión de Reservas</h3><p>Próximamente disponible</p></div></div>;
      default:
        return <AdminPsicologos />;
    }
  };

  return (
    <div className="admin-panel">
      <div className="container">
        {/* Header del admin */}
        <div className="admin-header mb-4">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            Panel de Administración
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            Gestiona psicólogos, especialidades y configuraciones del sistema
          </p>
        </div>

        {/* Navegación de secciones */}
        <div className="admin-nav mb-4">
          <div className="card">
            <div className="card-body">
              <div className="nav-tabs">
                {secciones.map(seccion => (
                  <button
                    key={seccion.id}
                    className={`nav-tab ${seccionActiva === seccion.id ? 'active' : ''}`}
                    onClick={() => setSeccionActiva(seccion.id)}
                  >
                    <span className="nav-tab-icon">{seccion.icono}</span>
                    <span className="nav-tab-text">{seccion.nombre}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contenido de la sección activa */}
        <div className="admin-content">
          {renderSeccion()}
        </div>
      </div>
    </div>
  );
};

export default Admin; 