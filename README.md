# 🧠 PsicoAgenda

**Sistema de gestión y reservas para consultas psicológicas**

PsicoAgenda es una aplicación web completa que permite gestionar reservas de citas con psicólogos, administrar especialidades, horarios y proporcionar una interfaz intuitiva tanto para pacientes como para administradores.

## 🚀 Características Principales

### Para Pacientes
- 🔍 **Búsqueda de psicólogos** por especialidad y nombre
- 📅 **Visualización de horarios** disponibles en tiempo real
- 💰 **Información de precios** por sesión
- ✅ **Reserva de citas** con confirmación instantánea
- 📧 **Confirmación de reservas** con detalles completos

### Para Administradores
- 👥 **Gestión de psicólogos** (agregar, editar, eliminar)
- 🏷️ **Administración de especialidades**
- ⏰ **Configuración de horarios** por psicólogo
- 📊 **Visualización de reservas** y estadísticas
- 🗂️ **Panel de control** centralizado

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web minimalista
- **SQLite3** - Base de datos liviana
- **Moment.js** - Manejo de fechas y horarios
- **UUID** - Generación de identificadores únicos
- **CORS** - Manejo de cross-origin requests
- **Helmet** - Seguridad HTTP headers
- **Morgan** - Logger de peticiones HTTP

### Frontend
- **React** - Biblioteca de interfaces de usuario
- **React Router** - Navegación entre componentes
- **Axios** - Cliente HTTP para APIs
- **Moment.js** - Manejo de fechas en frontend
- **CSS3** - Estilos modernos y responsivos

## 📁 Estructura del Proyecto

```
psico-app/
├── backend/                    # Servidor Node.js
│   ├── models/                # Modelos de datos
│   │   └── Database.js        # Configuración de base de datos
│   ├── routes/                # Rutas de la API
│   │   ├── admin.js           # Endpoints de administración
│   │   ├── agenda.js          # Gestión de horarios
│   │   ├── psicologos.js      # CRUD de psicólogos
│   │   └── reservas.js        # Sistema de reservas
│   ├── scripts/               # Scripts auxiliares
│   │   └── seed-data.js       # Datos de prueba
│   ├── data/                  # Archivos JSON de datos
│   ├── index.js               # Punto de entrada del servidor
│   └── package.json           # Dependencias del backend
├── frontend/                   # Aplicación React
│   ├── public/                # Archivos públicos
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   │   ├── Home.js        # Página principal
│   │   │   ├── Admin.js       # Panel administrativo
│   │   │   ├── PsicologoAgenda.js  # Vista de horarios
│   │   │   └── ...            # Otros componentes
│   │   ├── services/          # Servicios de API
│   │   │   └── api.js         # Configuración de Axios
│   │   ├── App.js             # Componente principal
│   │   └── index.js           # Punto de entrada React
│   └── package.json           # Dependencias del frontend
└── README.md                  # Documentación
```

## 🔧 Instalación y Configuración

### Prerrequisitos
- **Node.js** (versión 14 o superior)
- **npm** (incluido con Node.js)
- **Git** (para clonar el repositorio)

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/psico-app.git
cd psico-app
```

### 2. Configurar el Backend
```bash
cd backend
npm install
```

### 3. Configurar el Frontend
```bash
cd ../frontend
npm install
```

### 4. Inicializar datos de prueba (opcional)
```bash
cd ../backend
npm run seed
```

## 🚀 Ejecución

### Levantar el Backend (Puerto 5000)
```bash
cd backend
npm run dev
```

### Levantar el Frontend (Puerto 3000)
```bash
cd frontend
npm start
```

### URLs de Acceso
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/health
- **Panel Admin**: http://localhost:3000/admin

## 📊 API Endpoints

### Psicólogos
- `GET /api/psicologos` - Obtener lista de psicólogos
- `GET /api/psicologos/:id` - Obtener psicólogo específico
- `POST /api/psicologos` - Crear nuevo psicólogo
- `PUT /api/psicologos/:id` - Actualizar psicólogo
- `DELETE /api/psicologos/:id` - Eliminar psicólogo

### Reservas
- `GET /api/reservas` - Obtener todas las reservas
- `POST /api/reservas` - Crear nueva reserva
- `GET /api/reservas/:id` - Obtener reserva específica
- `DELETE /api/reservas/:id` - Cancelar reserva

### Agenda
- `GET /api/agenda/:psicologoId` - Obtener horarios disponibles
- `POST /api/agenda/:psicologoId` - Configurar horarios

### Admin
- `GET /api/admin/especialidades` - Gestionar especialidades
- `POST /api/admin/especialidades` - Crear especialidad
- `DELETE /api/admin/especialidades/:id` - Eliminar especialidad

## 🎨 Funcionalidades Detalladas

### Sistema de Reservas
1. **Selección de psicólogo** por especialidad
2. **Visualización de calendario** con horarios disponibles
3. **Formulario de reserva** con validaciones
4. **Confirmación inmediata** con detalles de la cita
5. **Gestión de disponibilidad** automática

### Panel de Administración
1. **Dashboard** con estadísticas
2. **CRUD completo** de psicólogos
3. **Gestión de especialidades**
4. **Configuración de horarios** por profesional
5. **Visualización de reservas** activas

### Características Técnicas
- ✅ **Responsive Design** - Compatible con móviles y tablets
- ✅ **Validaciones** en frontend y backend
- ✅ **Manejo de errores** robusto
- ✅ **Estado en tiempo real** de horarios
- ✅ **Filtros de búsqueda** avanzados
- ✅ **Interfaz intuitiva** y moderna

## 🔧 Configuración Avanzada

### Variables de Entorno
Crear archivo `.env` en el backend:
```env
PORT=5000
NODE_ENV=development
DB_PATH=./data/psicologia.db
```

### Base de Datos
El sistema utiliza SQLite para almacenamiento local. Los datos se inicializan automáticamente con:
- **Psicólogos** de ejemplo
- **Especialidades** predefinidas
- **Horarios** de muestra

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Scripts Disponibles

### Backend
- `npm start` - Ejecutar servidor en producción
- `npm run dev` - Ejecutar con nodemon para desarrollo
- `npm run seed` - Inicializar datos de prueba

### Frontend
- `npm start` - Ejecutar aplicación React
- `npm run build` - Crear build de producción
- `npm test` - Ejecutar tests

## 🐛 Solución de Problemas

### Error de CORS
Si encuentras errores de CORS, verifica que el backend esté corriendo en el puerto 5000.

### Base de datos
Si hay problemas con la base de datos, ejecuta:
```bash
cd backend
npm run seed
```

### Dependencias
Si faltan dependencias, ejecuta:
```bash
npm install
```

## 📧 Contacto

Para reportar bugs, solicitar features o hacer preguntas, por favor abre un issue en GitHub.

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

---

**Desarrollado con ❤️ para facilitar el acceso a servicios de salud mental** 