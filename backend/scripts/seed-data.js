const db = require('../models/Database');
const moment = require('moment-timezone');

// Función para limpiar y regenerar datos de ejemplo
function seedDatabase() {
  console.log('🌱 Iniciando seed de la base de datos...');

  try {
    // Limpiar datos existentes (excepto especialidades que ya se inicializan automáticamente)
    db.writeFile('psicologos.json', []);
    db.writeFile('horarios.json', []);
    db.writeFile('reservas.json', []);
    db.writeFile('usuarios.json', []);

    // Crear psicólogos de ejemplo
    const psicologos = [
      {
        nombre: 'Ana',
        apellido: 'García',
        email: 'ana.garcia@psicologo.com',
        telefono: '+54 11 1234-5678',
        especialidades: ['Ansiedad', 'Depresión', 'Terapia Cognitivo Conductual'],
        descripcion: 'Psicóloga especializada en trastornos de ansiedad y depresión con más de 10 años de experiencia. Enfoque cognitivo-conductual.',
        experiencia: 'Más de 10 años de experiencia en psicología clínica',
        educacion: 'Licenciada en Psicología - Universidad de Buenos Aires, Máster en Terapia Cognitivo Conductual',
        precioBase: 8000,
        foto: '/uploads/ana-garcia.jpg',
        timezone: 'America/Argentina/Buenos_Aires',
        activo: true
      },
      {
        nombre: 'Carlos',
        apellido: 'Rodríguez',
        email: 'carlos.rodriguez@psicologo.com',
        telefono: '+54 11 2345-6789',
        especialidades: ['Terapia de Pareja', 'Terapia Familiar', 'Trauma'],
        descripcion: 'Especialista en terapia sistémica familiar y de pareja. Enfoque humanístico y sistémico.',
        experiencia: '8 años especializándose en terapia familiar y de pareja',
        educacion: 'Licenciado en Psicología - Universidad Católica Argentina, Posgrado en Terapia Sistémica',
        precioBase: 9000,
        foto: '/uploads/carlos-rodriguez.jpg',
        timezone: 'America/Argentina/Buenos_Aires',
        activo: true
      },
      {
        nombre: 'María',
        apellido: 'López',
        email: 'maria.lopez@psicologo.com',
        telefono: '+54 11 3456-7890',
        especialidades: ['Psicología Infantil', 'Trastornos Alimentarios', 'Autoestima'],
        descripcion: 'Psicóloga infantil con especialización en trastornos alimentarios y desarrollo de autoestima en niños y adolescentes.',
        experiencia: '12 años trabajando con niños y adolescentes',
        educacion: 'Licenciada en Psicología - Universidad del Salvador, Especialización en Psicología Infantil',
        precioBase: 7500,
        foto: '/uploads/maria-lopez.jpg',
        timezone: 'America/Argentina/Buenos_Aires',
        activo: true
      },
      {
        nombre: 'Roberto',
        apellido: 'Fernández',
        email: 'roberto.fernandez@psicologo.com',
        telefono: '+54 11 4567-8901',
        especialidades: ['Adicciones', 'Trauma', 'Terapia Cognitivo Conductual'],
        descripcion: 'Especialista en tratamiento de adicciones y trauma. Amplia experiencia en rehabilitación y recuperación.',
        experiencia: '15 años en tratamiento de adicciones y trauma',
        educacion: 'Licenciado en Psicología - Universidad de Belgrano, Máster en Adicciones',
        precioBase: 9500,
        foto: '/uploads/roberto-fernandez.jpg',
        timezone: 'America/Argentina/Buenos_Aires',
        activo: true
      },
      {
        nombre: 'Laura',
        apellido: 'Martínez',
        email: 'laura.martinez@psicologo.com',
        telefono: '+54 11 5678-9012',
        especialidades: ['Ansiedad', 'Autoestima', 'Terapia de Pareja'],
        descripcion: 'Psicóloga con enfoque integrativo, especializada en trastornos de ansiedad y fortalecimiento de la autoestima.',
        experiencia: '6 años de práctica clínica privada',
        educacion: 'Licenciada en Psicología - Universidad Argentina J.F. Kennedy',
        precioBase: 7000,
        foto: '/uploads/laura-martinez.jpg',
        timezone: 'America/Argentina/Buenos_Aires',
        activo: true
      }
    ];

    // Crear los psicólogos
    const psicologosCreados = [];
    psicologos.forEach(psicologo => {
      const nuevo = db.create('psicologos', psicologo);
      psicologosCreados.push(nuevo);
      console.log(`✅ Psicólogo creado: ${nuevo.nombre} ${nuevo.apellido}`);
    });

    // Crear horarios para cada psicólogo
    const diasSemana = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const horariosTipo = [
      { inicio: '09:00', fin: '12:00' }, // Mañana
      { inicio: '14:00', fin: '18:00' }, // Tarde
      { inicio: '19:00', fin: '21:00' }  // Noche
    ];

    psicologosCreados.forEach((psicologo, index) => {
      // Asignar diferentes tipos de horarios a cada psicólogo
      const tiposAsignados = [
        [0, 1], // Ana: mañana y tarde
        [1, 2], // Carlos: tarde y noche
        [0, 2], // María: mañana y noche
        [0, 1, 2], // Roberto: todo el día
        [1]     // Laura: solo tarde
      ];

      const tiposParaEste = tiposAsignados[index] || [1];

      diasSemana.forEach(dia => {
        tiposParaEste.forEach(tipoIndex => {
          const tipo = horariosTipo[tipoIndex];
          const slots = [];

          // Generar slots cada 1 hora
          let horaActual = moment(tipo.inicio, 'HH:mm');
          const horaFin = moment(tipo.fin, 'HH:mm');

          while (horaActual.isBefore(horaFin)) {
            slots.push({
              hora: horaActual.format('HH:mm'),
              duracion: 50,
              precio: psicologo.precioBase
            });
            horaActual.add(1, 'hour');
          }

          if (slots.length > 0) {
            const horario = {
              psicologoId: psicologo.id,
              diaSemana: dia,
              slots,
              timezone: 'America/Argentina/Buenos_Aires'
            };

            db.create('horarios', horario);
          }
        });
      });

      console.log(`📅 Horarios creados para ${psicologo.nombre} ${psicologo.apellido}`);
    });

    // Crear algunas reservas de ejemplo (opcional)
    const fechasEjemplo = [
      moment().add(1, 'day'),
      moment().add(3, 'days'),
      moment().add(5, 'days')
    ];

    const pacientesEjemplo = [
      { nombre: 'Juan Pérez', email: 'juan.perez@email.com', telefono: '+54 11 9876-5432' },
      { nombre: 'María González', email: 'maria.gonzalez@email.com', telefono: '+54 11 8765-4321' },
      { nombre: 'Pedro Silva', email: 'pedro.silva@email.com', telefono: '+54 11 7654-3210' }
    ];

    fechasEjemplo.forEach((fecha, index) => {
      if (index < psicologosCreados.length && index < pacientesEjemplo.length) {
        const psicologo = psicologosCreados[index];
        const paciente = pacientesEjemplo[index];
        
        const reserva = {
          psicologoId: psicologo.id,
          fecha: fecha.format('YYYY-MM-DD'),
          hora: '10:00',
          paciente,
          timezone: 'America/Argentina/Buenos_Aires',
          estado: 'confirmada',
          fechaReserva: new Date().toISOString(),
          precio: psicologo.precioBase
        };

        db.create('reservas', reserva);
        console.log(`📝 Reserva creada para ${paciente.nombre} con ${psicologo.nombre}`);
      }
    });

    console.log('🎉 Seed completado exitosamente!');
    console.log('📊 Datos creados:');
    console.log(`   - ${psicologosCreados.length} psicólogos`);
    console.log(`   - ${db.findAll('horarios').length} horarios`);
    console.log(`   - ${db.findAll('reservas').length} reservas`);
    console.log(`   - ${db.findAll('especialidades').length} especialidades`);

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase; 