const express = require('express');
const db = require('../models/Database');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// ============= PSICÓLOGOS =============

// GET /api/admin/psicologos - Obtener todos los psicólogos para administración
router.get('/psicologos', (req, res) => {
  try {
    const psicologos = db.findAll('psicologos');
    res.json(psicologos);
  } catch (error) {
    console.error('Error al obtener psicólogos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/admin/psicologos - Crear nuevo psicólogo
router.post('/psicologos', (req, res) => {
  try {
    const {
      nombre,
      apellido,
      email,
      telefono,
      especialidades,
      descripcion,
      experiencia,
      educacion,
      precioBase,
      foto,
      timezone
    } = req.body;

    // Validaciones
    if (!nombre || !apellido || !email || !especialidades || !precioBase) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: nombre, apellido, email, especialidades, precioBase'
      });
    }

    if (!Array.isArray(especialidades) || especialidades.length === 0) {
      return res.status(400).json({
        error: 'Especialidades debe ser un array con al menos una especialidad'
      });
    }

    // Verificar que el email no esté en uso
    const psicologos = db.findAll('psicologos');
    const emailExiste = psicologos.some(p => p.email === email);
    
    if (emailExiste) {
      return res.status(409).json({ error: 'Ya existe un psicólogo con ese email' });
    }

    const nuevoPsicologo = {
      nombre,
      apellido,
      email,
      telefono,
      especialidades,
      descripcion,
      experiencia,
      educacion,
      precioBase: parseFloat(precioBase),
      foto: foto || '/uploads/default-avatar.jpg',
      timezone: timezone || 'America/Argentina/Buenos_Aires',
      activo: true
    };

    const psicologo = db.create('psicologos', nuevoPsicologo);
    res.status(201).json(psicologo);

  } catch (error) {
    console.error('Error al crear psicólogo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/admin/psicologos/:id - Actualizar psicólogo
router.put('/psicologos/:id', (req, res) => {
  try {
    const psicologo = db.findById('psicologos', req.params.id);
    
    if (!psicologo) {
      return res.status(404).json({ error: 'Psicólogo no encontrado' });
    }

    const {
      nombre,
      apellido,
      email,
      telefono,
      especialidades,
      descripcion,
      experiencia,
      educacion,
      precioBase,
      foto,
      timezone,
      activo
    } = req.body;

    // Verificar email único (si se está cambiando)
    if (email && email !== psicologo.email) {
      const psicologos = db.findAll('psicologos');
      const emailExiste = psicologos.some(p => p.email === email && p.id !== req.params.id);
      
      if (emailExiste) {
        return res.status(409).json({ error: 'Ya existe un psicólogo con ese email' });
      }
    }

    const actualizaciones = {};
    if (nombre !== undefined) actualizaciones.nombre = nombre;
    if (apellido !== undefined) actualizaciones.apellido = apellido;
    if (email !== undefined) actualizaciones.email = email;
    if (telefono !== undefined) actualizaciones.telefono = telefono;
    if (especialidades !== undefined) actualizaciones.especialidades = especialidades;
    if (descripcion !== undefined) actualizaciones.descripcion = descripcion;
    if (experiencia !== undefined) actualizaciones.experiencia = experiencia;
    if (educacion !== undefined) actualizaciones.educacion = educacion;
    if (precioBase !== undefined) actualizaciones.precioBase = parseFloat(precioBase);
    if (foto !== undefined) actualizaciones.foto = foto;
    if (timezone !== undefined) actualizaciones.timezone = timezone;
    if (activo !== undefined) actualizaciones.activo = activo;

    const psicologoActualizado = db.update('psicologos', req.params.id, actualizaciones);
    res.json(psicologoActualizado);

  } catch (error) {
    console.error('Error al actualizar psicólogo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/admin/psicologos/:id - Eliminar psicólogo
router.delete('/psicologos/:id', (req, res) => {
  try {
    const psicologo = db.findById('psicologos', req.params.id);
    
    if (!psicologo) {
      return res.status(404).json({ error: 'Psicólogo no encontrado' });
    }

    // Verificar si tiene reservas activas
    const reservas = db.findByQuery('reservas', { psicologoId: req.params.id });
    const reservasActivas = reservas.filter(r => r.estado === 'confirmada');
    
    if (reservasActivas.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el psicólogo porque tiene reservas activas' 
      });
    }

    const eliminado = db.delete('psicologos', req.params.id);
    
    if (eliminado) {
      // También eliminar sus horarios
      const horarios = db.findByQuery('horarios', { psicologoId: req.params.id });
      horarios.forEach(horario => {
        db.delete('horarios', horario.id);
      });
      
      res.json({ mensaje: 'Psicólogo eliminado exitosamente' });
    } else {
      res.status(404).json({ error: 'Psicólogo no encontrado' });
    }

  } catch (error) {
    console.error('Error al eliminar psicólogo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============= HORARIOS =============

// GET /api/admin/horarios/:psicologoId - Obtener horarios de un psicólogo
router.get('/horarios/:psicologoId', (req, res) => {
  try {
    const horarios = db.findByQuery('horarios', { psicologoId: req.params.psicologoId });
    res.json(horarios);
  } catch (error) {
    console.error('Error al obtener horarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/admin/horarios - Crear horario para un psicólogo
router.post('/horarios', (req, res) => {
  try {
    const { psicologoId, diaSemana, slots, timezone } = req.body;

    // Validaciones
    if (!psicologoId || !diaSemana || !slots || !Array.isArray(slots)) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: psicologoId, diaSemana, slots'
      });
    }

    // Verificar que el psicólogo existe
    const psicologo = db.findById('psicologos', psicologoId);
    if (!psicologo) {
      return res.status(404).json({ error: 'Psicólogo no encontrado' });
    }

    // Validar formato de slots
    for (const slot of slots) {
      if (!slot.hora || typeof slot.hora !== 'string') {
        return res.status(400).json({ error: 'Cada slot debe tener una hora válida' });
      }
    }

    // Verificar si ya existe horario para ese día
    const horariosExistentes = db.findByQuery('horarios', { psicologoId, diaSemana });
    if (horariosExistentes.length > 0) {
      return res.status(409).json({ 
        error: 'Ya existe un horario para ese día de la semana' 
      });
    }

    const nuevoHorario = {
      psicologoId,
      diaSemana: diaSemana.toLowerCase(),
      slots: slots.map(slot => ({
        hora: slot.hora,
        duracion: slot.duracion || 50,
        precio: slot.precio || psicologo.precioBase
      })),
      timezone: timezone || psicologo.timezone || 'America/Argentina/Buenos_Aires'
    };

    const horario = db.create('horarios', nuevoHorario);
    res.status(201).json(horario);

  } catch (error) {
    console.error('Error al crear horario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/admin/horarios/:id - Actualizar horario
router.put('/horarios/:id', (req, res) => {
  try {
    const horario = db.findById('horarios', req.params.id);
    
    if (!horario) {
      return res.status(404).json({ error: 'Horario no encontrado' });
    }

    const { slots, timezone } = req.body;

    const actualizaciones = {};
    if (slots !== undefined) {
      // Validar formato de slots
      if (!Array.isArray(slots)) {
        return res.status(400).json({ error: 'Slots debe ser un array' });
      }
      
      for (const slot of slots) {
        if (!slot.hora || typeof slot.hora !== 'string') {
          return res.status(400).json({ error: 'Cada slot debe tener una hora válida' });
        }
      }
      
      actualizaciones.slots = slots.map(slot => ({
        hora: slot.hora,
        duracion: slot.duracion || 50,
        precio: slot.precio
      }));
    }
    
    if (timezone !== undefined) actualizaciones.timezone = timezone;

    const horarioActualizado = db.update('horarios', req.params.id, actualizaciones);
    res.json(horarioActualizado);

  } catch (error) {
    console.error('Error al actualizar horario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/admin/horarios/:id - Eliminar horario
router.delete('/horarios/:id', (req, res) => {
  try {
    const eliminado = db.delete('horarios', req.params.id);
    
    if (eliminado) {
      res.json({ mensaje: 'Horario eliminado exitosamente' });
    } else {
      res.status(404).json({ error: 'Horario no encontrado' });
    }

  } catch (error) {
    console.error('Error al eliminar horario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============= ESPECIALIDADES =============

// GET /api/admin/especialidades - Obtener todas las especialidades
router.get('/especialidades', (req, res) => {
  try {
    const especialidades = db.findAll('especialidades');
    res.json(especialidades);
  } catch (error) {
    console.error('Error al obtener especialidades:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/admin/especialidades - Crear nueva especialidad
router.post('/especialidades', (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    // Verificar que no exista ya
    const especialidades = db.findAll('especialidades');
    const existeNombre = especialidades.some(e => 
      e.nombre.toLowerCase() === nombre.toLowerCase()
    );

    if (existeNombre) {
      return res.status(409).json({ error: 'Ya existe una especialidad con ese nombre' });
    }

    const nuevaEspecialidad = { nombre, descripcion };
    const especialidad = db.create('especialidades', nuevaEspecialidad);
    
    res.status(201).json(especialidad);

  } catch (error) {
    console.error('Error al crear especialidad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router; 