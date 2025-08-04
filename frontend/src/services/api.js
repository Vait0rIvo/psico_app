import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ============= PSICÓLOGOS =============

export const getPsicologos = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.especialidad) params.append('especialidad', filtros.especialidad);
    if (filtros.disponible) params.append('disponible', filtros.disponible);
    
    const response = await api.get(`/psicologos?${params}`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener psicólogos');
  }
};

export const getPsicologo = async (id) => {
  try {
    const response = await api.get(`/psicologos/${id}`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener psicólogo');
  }
};

export const getEspecialidades = async () => {
  try {
    const response = await api.get('/psicologos/especialidades/list');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener especialidades');
  }
};

// ============= AGENDA =============

export const getAgenda = async (psicologoId, filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.fecha) params.append('fecha', filtros.fecha);
    if (filtros.timezone) params.append('timezone', filtros.timezone);
    
    const response = await api.get(`/agenda/${psicologoId}?${params}`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener agenda');
  }
};

export const verificarDisponibilidad = async (psicologoId, fecha, hora) => {
  try {
    const params = new URLSearchParams({ fecha, hora });
    const response = await api.get(`/agenda/${psicologoId}/disponibilidad?${params}`);
    return response.data;
  } catch (error) {
    throw new Error('Error al verificar disponibilidad');
  }
};

// ============= RESERVAS =============

export const crearReserva = async (reservaData) => {
  try {
    const response = await api.post('/reservas', reservaData);
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      throw new Error('El horario ya está reservado');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data.error || 'Datos de reserva inválidos');
    }
    throw new Error('Error al crear reserva');
  }
};

export const getReserva = async (id) => {
  try {
    const response = await api.get(`/reservas/${id}`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener reserva');
  }
};

export const getReservas = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.psicologoId) params.append('psicologoId', filtros.psicologoId);
    if (filtros.email) params.append('email', filtros.email);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.fecha) params.append('fecha', filtros.fecha);
    
    const response = await api.get(`/reservas?${params}`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener reservas');
  }
};

export const cancelarReserva = async (id, motivo = '') => {
  try {
    const response = await api.put(`/reservas/${id}/cancelar`, { motivo });
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      throw new Error(error.response.data.error || 'No se puede cancelar la reserva');
    }
    throw new Error('Error al cancelar reserva');
  }
};

// ============= ADMINISTRACIÓN =============

// Psicólogos Admin
export const getAdminPsicologos = async () => {
  try {
    const response = await api.get('/admin/psicologos');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener psicólogos (admin)');
  }
};

export const crearPsicologo = async (psicologoData) => {
  try {
    const response = await api.post('/admin/psicologos', psicologoData);
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      throw new Error('Ya existe un psicólogo con ese email');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data.error || 'Datos del psicólogo inválidos');
    }
    throw new Error('Error al crear psicólogo');
  }
};

export const actualizarPsicologo = async (id, psicologoData) => {
  try {
    const response = await api.put(`/admin/psicologos/${id}`, psicologoData);
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      throw new Error('Ya existe un psicólogo con ese email');
    } else if (error.response?.status === 404) {
      throw new Error('Psicólogo no encontrado');
    }
    throw new Error('Error al actualizar psicólogo');
  }
};

export const eliminarPsicologo = async (id) => {
  try {
    const response = await api.delete(`/admin/psicologos/${id}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      throw new Error(error.response.data.error || 'No se puede eliminar el psicólogo');
    } else if (error.response?.status === 404) {
      throw new Error('Psicólogo no encontrado');
    }
    throw new Error('Error al eliminar psicólogo');
  }
};

// Horarios Admin
export const getHorariosPsicologo = async (psicologoId) => {
  try {
    const response = await api.get(`/admin/horarios/${psicologoId}`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener horarios');
  }
};

export const crearHorario = async (horarioData) => {
  try {
    const response = await api.post('/admin/horarios', horarioData);
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      throw new Error('Ya existe un horario para ese día de la semana');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data.error || 'Datos del horario inválidos');
    }
    throw new Error('Error al crear horario');
  }
};

export const actualizarHorario = async (id, horarioData) => {
  try {
    const response = await api.put(`/admin/horarios/${id}`, horarioData);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Horario no encontrado');
    }
    throw new Error('Error al actualizar horario');
  }
};

export const eliminarHorario = async (id) => {
  try {
    const response = await api.delete(`/admin/horarios/${id}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Horario no encontrado');
    }
    throw new Error('Error al eliminar horario');
  }
};

// Especialidades Admin
export const getAdminEspecialidades = async () => {
  try {
    const response = await api.get('/admin/especialidades');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener especialidades (admin)');
  }
};

export const crearEspecialidad = async (especialidadData) => {
  try {
    const response = await api.post('/admin/especialidades', especialidadData);
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      throw new Error('Ya existe una especialidad con ese nombre');
    }
    throw new Error('Error al crear especialidad');
  }
};

// ============= UTILIDADES =============

export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('Error al verificar estado del servidor');
  }
};

// Función para detectar timezone del usuario
export const getUserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export default api; 