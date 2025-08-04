import React, { useState, useEffect } from 'react';
import { getAdminEspecialidades, crearEspecialidad } from '../services/api';

const AdminEspecialidades = () => {
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    cargarEspecialidades();
  }, []);

  const cargarEspecialidades = async () => {
    try {
      setLoading(true);
      const data = await getAdminEspecialidades();
      setEspecialidades(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNuevaEspecialidad = () => {
    setMostrarModal(true);
  };

  const handleGuardarEspecialidad = async (datos) => {
    try {
      await crearEspecialidad(datos);
      setSuccess('Especialidad creada exitosamente');
      setMostrarModal(false);
      cargarEspecialidades();
    } catch (err) {
      setError(err.message);
    }
  };

  const cerrarAlertas = () => {
    setError(null);
    setSuccess(null);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-especialidades">
      {/* Alertas */}
      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={cerrarAlertas} style={{ float: 'right' }}>×</button>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          {success}
          <button onClick={cerrarAlertas} style={{ float: 'right' }}>×</button>
        </div>
      )}

      {/* Header de sección */}
      <div className="card mb-4">
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2>Gestión de Especialidades</h2>
              <p style={{ color: '#666', margin: 0 }}>
                {especialidades.length} especialidades disponibles
              </p>
            </div>
            <button 
              onClick={handleNuevaEspecialidad}
              className="btn btn-primary"
            >
              + Agregar Especialidad
            </button>
          </div>
        </div>
      </div>

      {/* Lista de especialidades */}
      <div className="card">
        <div className="card-body">
          {especialidades.length === 0 ? (
            <div className="text-center p-4">
              <h3>No hay especialidades registradas</h3>
              <p>Comienza agregando la primera especialidad</p>
              <button 
                onClick={handleNuevaEspecialidad}
                className="btn btn-primary"
              >
                Agregar Especialidad
              </button>
            </div>
          ) : (
            <div className="grid grid-3">
              {especialidades.map(especialidad => (
                <div key={especialidad.id} className="card">
                  <div className="card-body">
                    <h3 className="card-title">{especialidad.nombre}</h3>
                    {especialidad.descripcion && (
                      <p style={{ color: '#666', fontSize: '0.9rem' }}>
                        {especialidad.descripcion}
                      </p>
                    )}
                    <div style={{ 
                      marginTop: '1rem', 
                      padding: '0.5rem', 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      color: '#666'
                    }}>
                      ID: {especialidad.id}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de crear especialidad */}
      {mostrarModal && (
        <EspecialidadModal
          onGuardar={handleGuardarEspecialidad}
          onCerrar={() => setMostrarModal(false)}
        />
      )}
    </div>
  );
};

const EspecialidadModal = ({ onGuardar, onCerrar }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onGuardar(formData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Nueva Especialidad</h2>
          <button className="modal-close" onClick={onCerrar}>×</button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Ej: Ansiedad, Depresión, etc."
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                className="form-control"
                rows="3"
                placeholder="Descripción de la especialidad..."
                disabled={loading}
              />
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={onCerrar}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminEspecialidades; 