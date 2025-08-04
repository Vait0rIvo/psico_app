const express = require('express');
const moment = require('moment-timezone');
const db = require('../models/Database');

const router = express.Router();

// POST /api/reservas - Crear una nueva reserva
router.post('/', (req, res) => {
  try {
    const { psicologoId, fecha, hora, paciente, timezone } = req.body;

    // Validaciones
    if (!psicologoId || !fecha || !hora || !paciente) {
      return res.status(400).json({ 
        error: 'Faltan datos requeridos: psicologoId, fecha, hora, paciente' 
      });
    }

    if (!paciente.nombre || !paciente.email) {
      return res.status(400).json({ 
        error: 'Datos del paciente incompletos: nombre y email son requeridos' 
      });
    }

    // Verificar que el psicólogo existe
    const psicologo = db.findById('psicologos', psicologoId);
    if (!psicologo) {
      return res.status(404).json({ error: 'Psicólogo no encontrado' });
    }

    // Verificar disponibilidad
    const reservas = db.findAll('reservas');
    const estaReservado = reservas.some(reserva => 
      reserva.psicologoId === psicologoId &&
      reserva.fecha === fecha &&
      reserva.hora === hora &&
      reserva.estado !== 'cancelada'
    );

    if (estaReservado) {
      return res.status(409).json({ error: 'El horario ya está reservado' });
    }

    // Verificar que el psicólogo tiene disponibilidad para ese día/hora
    const fechaMoment = moment(fecha);
    const diaSemana = fechaMoment.format('dddd').toLowerCase();
    const horarios = db.findByQuery('horarios', { psicologoId });
    
    const horarioValido = horarios.find(horario => 
      horario.diaSemana === diaSemana &&
      horario.slots.some(slot => slot.hora === hora)
    );

    if (!horarioValido) {
      return res.status(400).json({ error: 'El psicólogo no tiene disponibilidad en ese horario' });
    }

    // Verificar que la fecha/hora es futura
    const fechaHora = moment.tz(
      `${fecha} ${hora}`,
      'YYYY-MM-DD HH:mm',
      horarioValido.timezone || 'America/Argentina/Buenos_Aires'
    );

    if (fechaHora.isBefore(moment())) {
      return res.status(400).json({ error: 'No se puede reservar en el pasado' });
    }

    // Crear la reserva
    const reserva = {
      psicologoId,
      fecha,
      hora,
      paciente,
      timezone: timezone || 'America/Argentina/Buenos_Aires',
      estado: 'confirmada',
      fechaReserva: new Date().toISOString(),
      precio: horarioValido.slots.find(s => s.hora === hora)?.precio || psicologo.precioBase
    };

    const nuevaReserva = db.create('reservas', reserva);

    // Preparar respuesta con información completa
    const fechaHoraUsuario = fechaHora.clone().tz(timezone || 'America/Argentina/Buenos_Aires');
    
    res.status(201).json({
      reserva: nuevaReserva,
      confirmacion: {
        mensaje: '¡Tu sesión quedó agendada!',
        psicologo: `${psicologo.nombre} ${psicologo.apellido}`,
        fecha: fechaMoment.format('DD/MM/YYYY'),
        hora: fechaHoraUsuario.format('HH:mm'),
        timezone: timezone || 'America/Argentina/Buenos_Aires',
        fechaCompleta: fechaHoraUsuario.format('dddd, DD [de] MMMM [de] YYYY [a las] HH:mm')
      }
    });

  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/reservas/:id - Obtener una reserva específica
router.get('/:id', (req, res) => {
  try {
    const reserva = db.findById('reservas', req.params.id);
    
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    // Obtener información del psicólogo
    const psicologo = db.findById('psicologos', reserva.psicologoId);
    
    res.json({
      ...reserva,
      psicologo: psicologo ? {
        nombre: psicologo.nombre,
        apellido: psicologo.apellido,
        foto: psicologo.foto,
        especialidades: psicologo.especialidades
      } : null
    });

  } catch (error) {
    console.error('Error al obtener reserva:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/reservas - Obtener reservas (con filtros opcionales)
router.get('/', (req, res) => {
  try {
    const { psicologoId, email, estado, fecha } = req.query;
    let reservas = db.findAll('reservas');

    // Aplicar filtros
    if (psicologoId) {
      reservas = reservas.filter(r => r.psicologoId === psicologoId);
    }

    if (email) {
      reservas = reservas.filter(r => r.paciente.email === email);
    }

    if (estado) {
      reservas = reservas.filter(r => r.estado === estado);
    }

    if (fecha) {
      reservas = reservas.filter(r => r.fecha === fecha);
    }

    // Agregar información del psicólogo a cada reserva
    reservas = reservas.map(reserva => {
      const psicologo = db.findById('psicologos', reserva.psicologoId);
      return {
        ...reserva,
        psicologo: psicologo ? {
          nombre: psicologo.nombre,
          apellido: psicologo.apellido,
          foto: psicologo.foto
        } : null
      };
    });

    // Ordenar por fecha y hora (más recientes primero)
    reservas.sort((a, b) => {
      const fechaA = moment(`${a.fecha} ${a.hora}`);
      const fechaB = moment(`${b.fecha} ${b.hora}`);
      return fechaB.diff(fechaA);
    });

    res.json(reservas);

  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/reservas/:id/cancelar - Cancelar una reserva
router.put('/:id/cancelar', (req, res) => {
  try {
    const reserva = db.findById('reservas', req.params.id);
    
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    if (reserva.estado === 'cancelada') {
      return res.status(400).json({ error: 'La reserva ya está cancelada' });
    }

    // Verificar que la cancelación se hace con suficiente antelación (ej: 24 horas)
    const fechaHora = moment(`${reserva.fecha} ${reserva.hora}`);
    const horasAnticipacion = fechaHora.diff(moment(), 'hours');

    if (horasAnticipacion < 24) {
      return res.status(400).json({ 
        error: 'No se puede cancelar con menos de 24 horas de anticipación' 
      });
    }

    // Actualizar estado
    const reservaActualizada = db.update('reservas', req.params.id, {
      estado: 'cancelada',
      fechaCancelacion: new Date().toISOString(),
      motivoCancelacion: req.body.motivo || 'Cancelada por el paciente'
    });

    res.json({
      reserva: reservaActualizada,
      mensaje: 'Reserva cancelada exitosamente'
    });

  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router; 