import React, { useState, useEffect } from 'react';
import { 
  getAdminPsicologos, 
  crearPsicologo, 
  actualizarPsicologo, 
  eliminarPsicologo,
  getAdminEspecialidades 
} from '../services/api';

const AdminPsicologos = () => {
  const [psicologos, setPsicologos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [psicologoEditando, setPsicologoEditando] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [psicologosData, especialidadesData] = await Promise.all([
        getAdminPsicologos(),
        getAdminEspecialidades()
      ]);
      setPsicologos(psicologosData);
      setEspecialidades(especialidadesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNuevoPsicologo = () => {
    setPsicologoEditando(null);
    setMostrarModal(true);
  };

  const handleEditarPsicologo = (psicologo) => {
    setPsicologoEditando(psicologo);
    setMostrarModal(true);
  };

  const handleEliminarPsicologo = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este psicólogo?')) {
      return;
    }

    try {
      await eliminarPsicologo(id);
      setSuccess('Psicólogo eliminado exitosamente');
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGuardarPsicologo = async (datos) => {
    try {
      if (psicologoEditando) {
        await actualizarPsicologo(psicologoEditando.id, datos);
        setSuccess('Psicólogo actualizado exitosamente');
      } else {
        await crearPsicologo(datos);
        setSuccess('Psicólogo creado exitosamente');
      }
      
      setMostrarModal(false);
      setPsicologoEditando(null);
      cargarDatos();
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
    <div className="admin-psicologos">
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
              <h2>Gestión de Psicólogos</h2>
              <p style={{ color: '#666', margin: 0 }}>
                {psicologos.length} psicólogos registrados
              </p>
            </div>
            <button 
              onClick={handleNuevoPsicologo}
              className="btn btn-primary"
            >
              + Agregar Psicólogo
            </button>
          </div>
        </div>
      </div>

      {/* Lista de psicólogos */}
      <div className="card">
        <div className="card-body">
          {psicologos.length === 0 ? (
            <div className="text-center p-4">
              <h3>No hay psicólogos registrados</h3>
              <p>Comienza agregando el primer psicólogo</p>
              <button 
                onClick={handleNuevoPsicologo}
                className="btn btn-primary"
              >
                Agregar Psicólogo
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Psicólogo</th>
                    <th>Email</th>
                    <th>Especialidades</th>
                    <th>Precio Base</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {psicologos.map(psicologo => (
                    <tr key={psicologo.id}>
                      <td>
                        <div>
                          <strong>{psicologo.nombre} {psicologo.apellido}</strong>
                          {psicologo.telefono && (
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>
                              {psicologo.telefono}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>{psicologo.email}</td>
                      <td>
                        <div className="especialidades">
                          {psicologo.especialidades.slice(0, 2).map((esp, index) => (
                            <span key={index} className="especialidad-chip" style={{ margin: '0.1rem' }}>
                              {esp}
                            </span>
                          ))}
                          {psicologo.especialidades.length > 2 && (
                            <span style={{ fontSize: '0.8rem', color: '#666' }}>
                              +{psicologo.especialidades.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>${psicologo.precioBase.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${psicologo.activo ? 'status-active' : 'status-inactive'}`}>
                          {psicologo.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button
                            onClick={() => handleEditarPsicologo(psicologo)}
                            className="btn btn-outline btn-sm"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleEliminarPsicologo(psicologo.id)}
                            className="btn btn-danger btn-sm"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de crear/editar */}
      {mostrarModal && (
        <PsicologoModal
          psicologo={psicologoEditando}
          especialidades={especialidades}
          onGuardar={handleGuardarPsicologo}
          onCerrar={() => {
            setMostrarModal(false);
            setPsicologoEditando(null);
          }}
        />
      )}
    </div>
  );
};

const PsicologoModal = ({ psicologo, especialidades, onGuardar, onCerrar }) => {
  const [formData, setFormData] = useState({
    nombre: psicologo?.nombre || '',
    apellido: psicologo?.apellido || '',
    email: psicologo?.email || '',
    telefono: psicologo?.telefono || '',
    especialidades: psicologo?.especialidades || [],
    descripcion: psicologo?.descripcion || '',
    experiencia: psicologo?.experiencia || '',
    educacion: psicologo?.educacion || '',
    precioBase: psicologo?.precioBase || '',
    activo: psicologo?.activo !== false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEspecialidadToggle = (especialidad) => {
    setFormData(prev => ({
      ...prev,
      especialidades: prev.especialidades.includes(especialidad)
        ? prev.especialidades.filter(e => e !== especialidad)
        : [...prev.especialidades, especialidad]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.precioBase) {
      setError('Faltan campos requeridos');
      return;
    }

    if (formData.especialidades.length === 0) {
      setError('Debe seleccionar al menos una especialidad');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const datos = {
        ...formData,
        precioBase: parseFloat(formData.precioBase)
      };
      
      await onGuardar(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {psicologo ? 'Editar Psicólogo' : 'Nuevo Psicólogo'}
          </h2>
          <button className="modal-close" onClick={onCerrar}>×</button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Apellido *</label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-control"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className="form-control"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Precio Base ($) *</label>
              <input
                type="number"
                name="precioBase"
                value={formData.precioBase}
                onChange={handleInputChange}
                className="form-control"
                min="0"
                step="100"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Especialidades *</label>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '0.5rem',
                marginTop: '0.5rem'
              }}>
                {especialidades.map(esp => (
                  <label key={esp.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.especialidades.includes(esp.nombre)}
                      onChange={() => handleEspecialidadToggle(esp.nombre)}
                      disabled={loading}
                    />
                    <span>{esp.nombre}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                className="form-control"
                rows="3"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Experiencia</label>
              <textarea
                name="experiencia"
                value={formData.experiencia}
                onChange={handleInputChange}
                className="form-control"
                rows="2"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Educación</label>
              <textarea
                name="educacion"
                value={formData.educacion}
                onChange={handleInputChange}
                className="form-control"
                rows="2"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <span>Activo</span>
              </label>
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

export default AdminPsicologos; 