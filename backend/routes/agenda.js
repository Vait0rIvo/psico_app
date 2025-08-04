const express = require('express');
const moment = require('moment-timezone');
const db = require('../models/Database');

const router = express.Router();

// GET /api/agenda/:psicologoId - Obtener agenda semanal de un psicólogo
router.get('/:psicologoId', (req, res) => {
  try {
    const { psicologoId } = req.params;
    const { fecha, timezone } = req.query;
    
    // Usar la fecha proporcionada o la fecha actual
    const fechaBase = fecha ? moment(fecha) : moment();
    const userTimezone = timezone || 'America/Argentina/Buenos_Aires';

    // Obtener psicólogo
    const psicologo = db.findById('psicologos', psicologoId);
    if (!psicologo) {
      return res.status(404).json({ error: 'Psicólogo no encontrado' });
    }

    // Obtener horarios del psicólogo
    const horarios = db.findByQuery('horarios', { psicologoId });
    
    // Obtener reservas existentes
    const reservas = db.findAll('reservas');

    // Generar agenda para 7 días
    const agenda = [];
    for (let i = 0; i < 7; i++) {
      const fecha = moment(fechaBase).add(i, 'days');
      const diaSemana = fecha.format('dddd').toLowerCase();
      
      // Buscar horarios para este día
      const horariosDelDia = horarios.filter(h => h.diaSemana === diaSemana);
      
      const slotsDelDia = [];
      
      horariosDelDia.forEach(horario => {
        horario.slots.forEach(slot => {
          // Crear momento en timezone del psicólogo
          const fechaHoraPsicologo = moment.tz(
            `${fecha.format('YYYY-MM-DD')} ${slot.hora}`,
            'YYYY-MM-DD HH:mm',
            horario.timezone || 'America/Argentina/Buenos_Aires'
          );

          // Convertir a timezone del usuario
          const fechaHoraUsuario = fechaHoraPsicologo.clone().tz(userTimezone);

          // Verificar si está reservado
          const estaReservado = reservas.some(reserva => 
            reserva.psicologoId === psicologoId &&
            reserva.fecha === fecha.format('YYYY-MM-DD') &&
            reserva.hora === slot.hora &&
            reserva.estado !== 'cancelada'
          );

          // Solo mostrar slots futuros
          if (fechaHoraPsicologo.isAfter(moment())) {
            slotsDelDia.push({
              id: `${fecha.format('YYYY-MM-DD')}-${slot.hora}`,
              fecha: fecha.format('YYYY-MM-DD'),
              hora: slot.hora,
              horaUsuario: fechaHoraUsuario.format('HH:mm'),
              fechaHoraUsuario: fechaHoraUsuario.toISOString(),
              disponible: !estaReservado,
              duracion: slot.duracion || 50,
              precio: slot.precio || psicologo.precioBase
            });
          }
        });
      });

      agenda.push({
        fecha: fecha.format('YYYY-MM-DD'),
        diaSemana: fecha.format('dddd'),
        slots: slotsDelDia.sort((a, b) => a.hora.localeCompare(b.hora))
      });
    }

    res.json({
      psicologoId,
      psicologo: {
        nombre: psicologo.nombre,
        apellido: psicologo.apellido,
        foto: psicologo.foto
      },
      timezone: userTimezone,
      agenda
    });

  } catch (error) {
    console.error('Error al obtener agenda:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/agenda/:psicologoId/disponibilidad - Verificar disponibilidad específica
router.get('/:psicologoId/disponibilidad', (req, res) => {
  try {
    const { psicologoId } = req.params;
    const { fecha, hora } = req.query;

    if (!fecha || !hora) {
      return res.status(400).json({ error: 'Fecha y hora son requeridas' });
    }

    // Verificar si existe reserva
    const reservas = db.findAll('reservas');
    const estaReservado = reservas.some(reserva => 
      reserva.psicologoId === psicologoId &&
      reserva.fecha === fecha &&
      reserva.hora === hora &&
      reserva.estado !== 'cancelada'
    );

    // Verificar si el psicólogo tiene horario para ese día/hora
    const fechaMoment = moment(fecha);
    const diaSemana = fechaMoment.format('dddd').toLowerCase();
    const horarios = db.findByQuery('horarios', { psicologoId });
    
    const tieneHorario = horarios.some(horario => 
      horario.diaSemana === diaSemana &&
      horario.slots.some(slot => slot.hora === hora)
    );

    res.json({
      disponible: !estaReservado && tieneHorario,
      estaReservado,
      tieneHorario
    });

  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router; 