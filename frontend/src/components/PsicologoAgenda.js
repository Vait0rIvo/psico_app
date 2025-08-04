import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment-timezone';
import { getAgenda, getPsicologo, getUserTimezone } from '../services/api';
import ReservaModal from './ReservaModal';

const PsicologoAgenda = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [psicologo, setPsicologo] = useState(null);
  const [agenda, setAgenda] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fechaActual, setFechaActual] = useState(moment());
  const [slotSeleccionado, setSlotSeleccionado] = useState(null);
  const [mostrarModalReserva, setMostrarModalReserva] = useState(false);
  const [timezone] = useState(getUserTimezone());

  useEffect(() => {
    cargarDatos();
  }, [id, fechaActual]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [psicologoData, agendaData] = await Promise.all([
        getPsicologo(id),
        getAgenda(id, { 
          fecha: fechaActual.format('YYYY-MM-DD'), 
          timezone 
        })
      ]);
      
      setPsicologo(psicologoData);
      setAgenda(agendaData.agenda || []);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const avanzarSemana = () => {
    setFechaActual(prev => moment(prev).add(7, 'days'));
  };

  const retrocederSemana = () => {
    const nuevaFecha = moment(fechaActual).subtract(7, 'days');
    if (nuevaFecha.isSameOrAfter(moment(), 'day')) {
      setFechaActual(nuevaFecha);
    }
  };

  const volverASemanaActual = () => {
    setFechaActual(moment());
  };

  const handleSlotClick = (dia, slot) => {
    if (!slot.disponible) return;
    
    setSlotSeleccionado({
      ...slot,
      dia: dia.fecha,
      diaNombre: dia.diaSemana,
      psicologo
    });
    setMostrarModalReserva(true);
  };

  const handleReservaExitosa = (reservaId) => {
    setMostrarModalReserva(false);
    setSlotSeleccionado(null);
    navigate(`/confirmacion/${reservaId}`);
  };

  const handleCerrarModal = () => {
    setMostrarModalReserva(false);
    setSlotSeleccionado(null);
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
          <button 
            onClick={() => navigate('/')}
            className="btn btn-outline mt-2"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (!psicologo) {
    return (
      <div className="container">
        <div className="alert alert-error">
          Psicólogo no encontrado
        </div>
      </div>
    );
  }

  const semanaInicio = moment(fechaActual).startOf('week');
  const esSemanaPasada = semanaInicio.isBefore(moment().startOf('week'));
  const esSemanaActual = semanaInicio.isSame(moment().startOf('week'));

  return (
    <div className="container">
      {/* Header del psicólogo */}
      <div className="psicologo-header">
        <button 
          onClick={() => navigate('/')}
          className="btn btn-outline mb-3"
        >
          ← Volver al inicio
        </button>
        
        <div className="card mb-4">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <div 
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}
              >
                {psicologo.nombre.charAt(0)}{psicologo.apellido.charAt(0)}
              </div>
              
              <div>
                <h1 className="card-title" style={{ fontSize: '2rem' }}>
                  {psicologo.nombre} {psicologo.apellido}
                </h1>
                
                <div className="especialidades mb-2">
                  {psicologo.especialidades.map((esp, index) => (
                    <span key={index} className="especialidad-chip">
                      {esp}
                    </span>
                  ))}
                </div>
                
                <div style={{ color: '#666', fontSize: '1.1rem' }}>
                  ${psicologo.precioBase.toLocaleString()} por sesión
                </div>
                
                {psicologo.descripcion && (
                  <p style={{ marginTop: '1rem', color: '#666' }}>
                    {psicologo.descripcion}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de navegación de semana */}
      <div className="agenda-controls">
        <div className="card mb-4">
          <div className="card-body">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <h2>Agenda disponible</h2>
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button
                  onClick={retrocederSemana}
                  disabled={esSemanaPasada}
                  className="btn btn-outline"
                >
                  ← Semana anterior
                </button>
                
                {!esSemanaActual && (
                  <button
                    onClick={volverASemanaActual}
                    className="btn btn-secondary"
                  >
                    Esta semana
                  </button>
                )}
                
                <span style={{ fontWeight: '500', color: '#666' }}>
                  {semanaInicio.format('DD MMM')} - {semanaInicio.clone().add(6, 'days').format('DD MMM YYYY')}
                </span>
                
                <button
                  onClick={avanzarSemana}
                  className="btn btn-outline"
                >
                  Semana siguiente →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vista de calendario semanal */}
      <div className="agenda-calendar">
        <div className="card">
          <div className="card-body">
            {agenda.length === 0 ? (
              <div className="text-center p-4">
                <h3>No hay horarios disponibles esta semana</h3>
                <p>Intenta con otra semana o contacta directamente al psicólogo</p>
              </div>
            ) : (
              <div className="calendar-grid">
                {agenda.map((dia, index) => (
                  <DiaColumn
                    key={index}
                    dia={dia}
                    onSlotClick={handleSlotClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="info-section mt-4">
        <div className="grid grid-2">
          <div className="card">
            <div className="card-header">
              <h3>Información de la sesión</h3>
            </div>
            <div className="card-body">
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong>Duración:</strong> 50 minutos
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong>Modalidad:</strong> Virtual / Presencial
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong>Precio:</strong> ${psicologo.precioBase.toLocaleString()}
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong>Timezone:</strong> {timezone}
                </li>
              </ul>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h3>Política de cancelación</h3>
            </div>
            <div className="card-body">
              <p>
                Las sesiones pueden cancelarse hasta 24 horas antes del horario agendado.
                Cancelaciones con menos tiempo pueden estar sujetas a cargo.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de reserva */}
      {mostrarModalReserva && slotSeleccionado && (
        <ReservaModal
          slot={slotSeleccionado}
          onReservaExitosa={handleReservaExitosa}
          onCerrar={handleCerrarModal}
        />
      )}
    </div>
  );
};

const DiaColumn = ({ dia, onSlotClick }) => {
  const fecha = moment(dia.fecha);
  const esHoy = fecha.isSame(moment(), 'day');
  const esPasado = fecha.isBefore(moment(), 'day');

  return (
    <div className="dia-column">
      <div className={`dia-header ${esHoy ? 'dia-hoy' : ''} ${esPasado ? 'dia-pasado' : ''}`}>
        <h4>{fecha.format('dddd')}</h4>
        <span>{fecha.format('DD/MM')}</span>
      </div>
      
      <div className="slots-container">
        {dia.slots.length === 0 ? (
          <div className="no-slots">
            Sin horarios
          </div>
        ) : (
          dia.slots.map((slot, index) => (
            <SlotButton
              key={index}
              slot={slot}
              onClick={() => onSlotClick(dia, slot)}
              disabled={esPasado}
            />
          ))
        )}
      </div>
    </div>
  );
};

const SlotButton = ({ slot, onClick, disabled }) => {
  const clases = [
    'slot-button',
    slot.disponible ? 'slot-disponible' : 'slot-ocupado',
    disabled ? 'slot-disabled' : ''
  ].filter(Boolean).join(' ');

  return (
    <button
      className={clases}
      onClick={onClick}
      disabled={disabled || !slot.disponible}
      title={slot.disponible ? `Disponible - $${slot.precio}` : 'No disponible'}
    >
      <span className="slot-hora">{slot.horaUsuario || slot.hora}</span>
      <span className="slot-precio">${slot.precio}</span>
    </button>
  );
};

export default PsicologoAgenda; 