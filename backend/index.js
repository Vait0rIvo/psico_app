const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');

// Importar rutas
const psicologosRoutes = require('./routes/psicologos');
const agendaRoutes = require('./routes/agenda');
const reservasRoutes = require('./routes/reservas');
const adminRoutes = require('./routes/admin');

// Importar base de datos y seed
const db = require('./models/Database');

// Función para inicializar datos si es necesario
async function initializeDataIfNeeded() {
  try {
    const psicologos = db.findAll('psicologos');
    
    // Si no hay psicólogos, ejecutar seed automáticamente
    if (psicologos.length === 0) {
      console.log('🌱 No se encontraron psicólogos, inicializando datos...');
      
             // Importar y ejecutar seed
       const seedDatabase = require('./scripts/seed-data');
       await seedDatabase();
      
      console.log('✅ Datos inicializados correctamente');
    } else {
      console.log(`📊 Base de datos ya contiene ${psicologos.length} psicólogos`);
    }
  } catch (error) {
    console.error('❌ Error al inicializar datos:', error);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet());

// Configuración CORS para producción
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://psico-app-black.vercel.app', process.env.FRONTEND_URL]
    : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes de psicólogos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas de la API
app.use('/api/psicologos', psicologosRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/admin', adminRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor de psicología funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    psicologos: db.findAll('psicologos').length,
    especialidades: db.findAll('especialidades').length
  });
});

// Endpoint para reinicializar datos (útil para debugging)
app.post('/api/admin/seed', async (req, res) => {
  try {
    console.log('🌱 Ejecutando seed manual...');
    const seedDatabase = require('./scripts/seed-data');
    await seedDatabase();
    
    res.json({
      success: true,
      message: 'Datos reinicializados correctamente',
      data: {
        psicologos: db.findAll('psicologos').length,
        especialidades: db.findAll('especialidades').length
      }
    });
  } catch (error) {
    console.error('Error en seed manual:', error);
    res.status(500).json({
      success: false,
      error: 'Error al reinicializar datos'
    });
  }
});

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📋 Health check disponible en: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  
  // Inicializar datos si es necesario
  await initializeDataIfNeeded();
});

module.exports = app; 