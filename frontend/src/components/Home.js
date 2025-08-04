import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPsicologos, getEspecialidades } from '../services/api';
import moment from 'moment-timezone';

const Home = () => {
  const [psicologos, setPsicologos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [psicologosData, especialidadesData] = await Promise.all([
        getPsicologos(),
        getEspecialidades()
      ]);
      
      setPsicologos(psicologosData);
      setEspecialidades(especialidadesData);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const psicologosFiltrados = psicologos.filter(psicologo => {
    const coincideEspecialidad = !filtroEspecialidad || 
      psicologo.especialidades.some(esp => 
        esp.toLowerCase().includes(filtroEspecialidad.toLowerCase())
      );
    
    const coincideBusqueda = !busqueda ||
      psicologo.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      psicologo.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      psicologo.especialidades.some(esp => 
        esp.toLowerCase().includes(busqueda.toLowerCase())
      );

    return coincideEspecialidad && coincideBusqueda;
  });

  const formatearProximaDisponibilidad = (proximaDisponibilidad) => {
    if (!proximaDisponibilidad) return 'Sin disponibilidad próxima';
    
    const fecha = moment(proximaDisponibilidad.fecha);
    const hora = proximaDisponibilidad.hora;
    
    if (fecha.isSame(moment(), 'day')) {
      return `Hoy a las ${hora}`;
    } else if (fecha.isSame(moment().add(1, 'day'), 'day')) {
      return `Mañana a las ${hora}`;
    } else {
      return `${fecha.format('DD/MM')} a las ${hora}`;
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Hero Section */}
      <section className="hero text-center mb-4">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#333' }}>
          Encuentra tu psicólogo ideal
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
          Agenda tu sesión de terapia con profesionales especializados
        </p>
      </section>

      {/* Filtros */}
      <section className="filter-section">
        <div className="filter-header">
          <h2>Buscar psicólogos</h2>
          <span>{psicologosFiltrados.length} profesionales encontrados</span>
        </div>
        
        <div className="filter-controls">
          <div className="form-group" style={{ minWidth: '250px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre o especialidad..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          
          <div className="form-group" style={{ minWidth: '200px' }}>
            <select
              className="form-control form-select"
              value={filtroEspecialidad}
              onChange={(e) => setFiltroEspecialidad(e.target.value)}
            >
              <option value="">Todas las especialidades</option>
              {especialidades.map(esp => (
                <option key={esp.id} value={esp.nombre}>
                  {esp.nombre}
                </option>
              ))}
            </select>
          </div>
          
          {(filtroEspecialidad || busqueda) && (
            <button
              className="btn btn-outline"
              onClick={() => {
                setFiltroEspecialidad('');
                setBusqueda('');
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </section>

      {/* Lista de psicólogos */}
      <section className="psicologos-section">
        {psicologosFiltrados.length === 0 ? (
          <div className="text-center p-4">
            <h3>No se encontraron psicólogos</h3>
            <p>Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="grid grid-3">
            {psicologosFiltrados.map(psicologo => (
              <PsicologoCard
                key={psicologo.id}
                psicologo={psicologo}
                formatearProximaDisponibilidad={formatearProximaDisponibilidad}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const PsicologoCard = ({ psicologo, formatearProximaDisponibilidad }) => {
  return (
    <div className="card">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div 
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}
          >
            {psicologo.nombre.charAt(0)}{psicologo.apellido.charAt(0)}
          </div>
          <div>
            <h3 className="card-title">
              {psicologo.nombre} {psicologo.apellido}
            </h3>
            <div className="card-subtitle">
              ${psicologo.precioBase.toLocaleString()} por sesión
            </div>
          </div>
        </div>
      </div>

      <div className="card-body">
        <div className="especialidades">
          {psicologo.especialidades.slice(0, 3).map((esp, index) => (
            <span key={index} className="especialidad-chip">
              {esp}
            </span>
          ))}
          {psicologo.especialidades.length > 3 && (
            <span className="especialidad-chip">
              +{psicologo.especialidades.length - 3} más
            </span>
          )}
        </div>

        {psicologo.descripcion && (
          <p style={{ 
            marginTop: '1rem', 
            color: '#666', 
            fontSize: '0.9rem',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {psicologo.descripcion}
          </p>
        )}

        <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <small style={{ color: '#666', fontWeight: '500' }}>Próxima disponibilidad:</small>
          <div style={{ fontWeight: '600', color: psicologo.proximaDisponibilidad ? '#28a745' : '#dc3545' }}>
            {formatearProximaDisponibilidad(psicologo.proximaDisponibilidad)}
          </div>
        </div>
      </div>

      <div className="card-footer">
        <Link
          to={`/psicologo/${psicologo.id}/agenda`}
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          Ver agenda
        </Link>
      </div>
    </div>
  );
};

export default Home;
