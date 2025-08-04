import React, { useState } from 'react';
import moment from 'moment-timezone';
import { crearReserva, getUserTimezone } from '../services/api';

const ReservaModal = ({ slot, onReservaExitosa, onCerrar }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    notas: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timezone] = useState(getUserTimezone());

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.email) {
      setError('Nombre y email son requeridos');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Por favor ingresa un email válido');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const reservaData = {
        psicologoId: slot.psicologo.id,
        fecha: slot.dia,
        hora: slot.hora,
        paciente: {
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          notas: formData.notas
        },
        timezone
      };

      const response = await crearReserva(reservaData);
      onReservaExitosa(response.reserva.id);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fechaFormateada = moment(slot.dia).format('dddd, DD [de] MMMM [de] YYYY');
  const horaUsuario = slot.horaUsuario || slot.hora;

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Confirmar reserva</h2>
          <button className="modal-close" onClick={onCerrar}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Resumen de la cita */}
          <div className="reserva-resumen">
            <div className="card" style={{ backgroundColor: '#f8f9fa', marginBottom: '1.5rem' }}>
              <div className="card-body">
                <h3 style={{ marginBottom: '1rem', color: '#333' }}>Resumen de la cita</h3>
                
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <div>
                    <strong>Psicólogo:</strong> {slot.psicologo.nombre} {slot.psicologo.apellido}
                  </div>
                  
                  <div>
                    <strong>Fecha:</strong> {fechaFormateada}
                  </div>
                  
                  <div>
                    <strong>Hora:</strong> {horaUsuario} ({timezone})
                  </div>
                  
                  <div>
                    <strong>Duración:</strong> {slot.duracion} minutos
                  </div>
                  
                  <div>
                    <strong>Precio:</strong> ${slot.precio.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de datos del paciente */}
          <form onSubmit={handleSubmit}>
            <h3 style={{ marginBottom: '1rem' }}>Datos del paciente</h3>
            
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                Nombre completo *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Tu nombre completo"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-control"
                placeholder="tu@email.com"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className="form-control"
                placeholder="+54 11 1234-5678"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Notas adicionales (opcional)
              </label>
              <textarea
                name="notas"
                value={formData.notas}
                onChange={handleInputChange}
                className="form-control"
                rows="3"
                placeholder="Cualquier información adicional que consideres importante..."
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
                {loading ? (
                  <>
                    <span className="spinner" style={{ 
                      width: '16px', 
                      height: '16px', 
                      marginRight: '0.5rem',
                      borderWidth: '2px'
                    }}></span>
                    Reservando...
                  </>
                ) : (
                  'Confirmar reserva'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReservaModal; 