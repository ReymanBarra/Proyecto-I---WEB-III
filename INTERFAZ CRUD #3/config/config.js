// Configuración del API (sin autenticación)
const API_CONFIG = {
    // URL base del API - URL actualizada para usar con XAMPP
    BASE_URL: 'http://localhost/PROYECTO%20I%20-%20WEB%20III%20API/Proyecto-I---WEB-III-API/controlador/categoria.php',
    
    // Headers por defecto para todas las peticiones (sin KEY)
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json'
    },
    
    // Tiempo de espera para peticiones (en milisegundos)
    TIMEOUT: 10000,
    
    // Configuración de mensajes
    MESSAGES: {
        SUCCESS: {
            CREATE: 'Categoría creada exitosamente',
            UPDATE: 'Categoría actualizada exitosamente', 
            DELETE: 'Categoría eliminada exitosamente',
            LOAD: 'Datos cargados correctamente'
        },
        ERROR: {
            NETWORK: 'Error de conexión. Verifique su conexión a internet',
            NOT_FOUND: 'Categoría no encontrada',
            VALIDATION: 'Datos incompletos o inválidos',
            SERVER: 'Error interno del servidor',
            GENERAL: 'Ha ocurrido un error inesperado'
        },
        CONFIRM: {
            DELETE: '¿Está seguro de que desea eliminar esta categoría?'
        }
    }
};

// Función para obtener headers por defecto (sin autenticación)
function getAuthHeaders() {
    return API_CONFIG.DEFAULT_HEADERS;
}

// Función para construir URLs completas
function buildApiUrl(endpoint = '') {
    return endpoint ? `${API_CONFIG.BASE_URL}${endpoint}` : API_CONFIG.BASE_URL;
}