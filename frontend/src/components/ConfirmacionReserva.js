import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import moment from 'moment-timezone';
import { getReserva } from '../services/api';

const ConfirmacionReserva = () => {
  const { reservaId } = useParams();
  const [reserva, setReserva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarReserva();
  }, [reservaId]);

  const cargarReserva = async () => {
    try {
      setLoading(true);
      const reservaData = await getReserva(reservaId);
      setReserva(reservaData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
          <Link to="/" className="btn btn-outline mt-2">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  if (!reserva) {
    return (
      <div className="container">
        <div className="alert alert-error">
          Reserva no encontrada
        </div>
      </div>
    );
  }

  const fechaReserva = moment(reserva.fecha);
  const fechaFormateada = fechaReserva.format('dddd, DD [de] MMMM [de] YYYY');

  return (
    <div className="container">
      <div className="confirmacion-page">
        {/* Mensaje de éxito */}
        <div className="text-center mb-4">
          <div 
            style={{
              width: '100px',
              height: '100px',
              margin: '0 auto 2rem',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #28a745, #20c997)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem'
            }}
          >
            ✓
          </div>
          
          <h1 style={{ 
            fontSize: '2.5rem', 
            color: '#28a745', 
            marginBottom: '1rem',
            fontWeight: 'bold'
          }}>
            ¡Tu sesión quedó agendada!
          </h1>
          
          <p style={{ fontSize: '1.2rem', color: '#666' }}>
            Hemos confirmado tu cita. Te enviaremos un recordatorio por email.
          </p>
        </div>

        {/* Detalles de la reserva */}
        <div className="reserva-detalles">
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
            <div className="card-header">
              <h2>Detalles de tu cita</h2>
            </div>
            
            <div className="card-body">
              <div className="reserva-info">
                <div className="info-row">
                  <div className="info-label">Psicólogo:</div>
                  <div className="info-value">
                    {reserva.psicologo?.nombre} {reserva.psicologo?.apellido}
                  </div>
                </div>
                
                <div className="info-row">
                  <div className="info-label">Paciente:</div>
                  <div className="info-value">{reserva.paciente.nombre}</div>
                </div>
                
                <div className="info-row">
                  <div className="info-label">Fecha:</div>
                  <div className="info-value">{fechaFormateada}</div>
                </div>
                
                <div className="info-row">
                  <div className="info-label">Hora:</div>
                  <div className="info-value">
                    {reserva.hora} ({reserva.timezone})
                  </div>
                </div>
                
                <div className="info-row">
                  <div className="info-label">Estado:</div>
                  <div className="info-value">
                    <span className="estado-confirmada">Confirmada</span>
                  </div>
                </div>
                
                <div className="info-row">
                  <div className="info-label">Precio:</div>
                  <div className="info-value">
                    ${reserva.precio.toLocaleString()}
                  </div>
                </div>
                
                <div className="info-row">
                  <div className="info-label">Código de reserva:</div>
                  <div className="info-value">
                    <code style={{ 
                      background: '#f8f9fa', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px',
                      fontFamily: 'monospace'
                    }}>
                      {reserva.id}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="info-adicional">
          <div className="grid grid-2" style={{ maxWidth: '800px', margin: '0 auto 2rem' }}>
            <div className="card">
              <div className="card-header">
                <h3>Qué sigue ahora</h3>
              </div>
              <div className="card-body">
                <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                  <li>Recibirás un email de confirmación en {reserva.paciente.email}</li>
                  <li>Te enviaremos un recordatorio 24 horas antes</li>
                  <li>Puedes cancelar hasta 24 horas antes sin cargo</li>
                  <li>Para consultas, contacta directamente al psicólogo</li>
                </ul>
              </div>
            </div>
            
            <div className="card">
              <div className="card-header">
                <h3>Contacto</h3>
              </div>
              <div className="card-body">
                <p><strong>Email:</strong> {reserva.paciente.email}</p>
                {reserva.paciente.telefono && (
                  <p><strong>Teléfono:</strong> {reserva.paciente.telefono}</p>
                )}
                {reserva.paciente.notas && (
                  <div>
                    <strong>Notas:</strong>
                    <p style={{ 
                      marginTop: '0.5rem', 
                      padding: '0.75rem', 
                      background: '#f8f9fa', 
                      borderRadius: '6px',
                      fontStyle: 'italic'
                    }}>
                      {reserva.paciente.notas}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="acciones text-center">
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn-primary">
              Buscar otros psicólogos
            </Link>
            
            <Link 
              to={`/psicologo/${reserva.psicologoId}/agenda`} 
              className="btn btn-outline"
            >
              Ver agenda del psicólogo
            </Link>
            
            <button
              onClick={() => window.print()}
              className="btn btn-secondary"
            >
              Imprimir confirmación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacionReserva; 