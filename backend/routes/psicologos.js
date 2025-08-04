const express = require('express');
const moment = require('moment-timezone');
const db = require('../models/Database');

const router = express.Router();

// GET /api/psicologos - Obtener todos los psicólogos con filtros opcionales
router.get('/', (req, res) => {
  try {
    let psicologos = db.findAll('psicologos');
    const { especialidad, disponible } = req.query;

    // Filtrar por especialidad
    if (especialidad) {
      psicologos = psicologos.filter(psicologo => 
        psicologo.especialidades.some(esp => 
          esp.toLowerCase().includes(especialidad.toLowerCase())
        )
      );
    }

    // Agregar próxima disponibilidad para cada psicólogo
    psicologos = psicologos.map(psicologo => {
      const proximaDisponibilidad = obtenerProximaDisponibilidad(psicologo.id);
      return {
        ...psicologo,
        proximaDisponibilidad
      };
    });

    // Filtrar por disponibilidad si se solicita
    if (disponible === 'true') {
      psicologos = psicologos.filter(psicologo => psicologo.proximaDisponibilidad);
    }

    res.json(psicologos);
  } catch (error) {
    console.error('Error al obtener psicólogos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/psicologos/:id - Obtener un psicólogo específico
router.get('/:id', (req, res) => {
  try {
    const psicologo = db.findById('psicologos', req.params.id);
    
    if (!psicologo) {
      return res.status(404).json({ error: 'Psicólogo no encontrado' });
    }

    // Agregar próxima disponibilidad
    const proximaDisponibilidad = obtenerProximaDisponibilidad(psicologo.id);
    
    res.json({
      ...psicologo,
      proximaDisponibilidad
    });
  } catch (error) {
    console.error('Error al obtener psicólogo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/psicologos/especialidades - Obtener todas las especialidades
router.get('/especialidades/list', (req, res) => {
  try {
    const especialidades = db.findAll('especialidades');
    res.json(especialidades);
  } catch (error) {
    console.error('Error al obtener especialidades:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Función auxiliar para obtener la próxima disponibilidad
function obtenerProximaDisponibilidad(psicologoId) {
  const horarios = db.findByQuery('horarios', { psicologoId });
  const reservas = db.findAll('reservas');
  const ahora = moment();

  for (let i = 0; i < 30; i++) { // Buscar en los próximos 30 días
    const fecha = moment().add(i, 'days');
    const diaSemana = fecha.format('dddd').toLowerCase();
    
    // Buscar horarios para este día de la semana
    const horariosDelDia = horarios.filter(h => h.diaSemana === diaSemana);
    
    for (const horario of horariosDelDia) {
      for (const slot of horario.slots) {
        const fechaHora = moment.tz(
          `${fecha.format('YYYY-MM-DD')} ${slot.hora}`,
          'YYYY-MM-DD HH:mm',
          horario.timezone || 'America/Argentina/Buenos_Aires'
        );

        // Verificar si el slot está en el futuro y no está reservado
        if (fechaHora.isAfter(ahora)) {
          const estaReservado = reservas.some(reserva => 
            reserva.psicologoId === psicologoId &&
            reserva.fecha === fecha.format('YYYY-MM-DD') &&
            reserva.hora === slot.hora &&
            reserva.estado !== 'cancelada'
          );

          if (!estaReservado) {
            return {
              fecha: fecha.format('YYYY-MM-DD'),
              hora: slot.hora,
              fechaHora: fechaHora.toISOString()
            };
          }
        }
      }
    }
  }

  return null; // No hay disponibilidad en los próximos 30 días
}

module.exports = router; 