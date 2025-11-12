// Archivo principal del CRUD de Categorías
// Inicialización y funciones globales

// Variables globales
let categorias = [];
let dataTableCategorias = null;

// === FUNCIONES DE ALERTAS SIMPLES ===
function mostrarExito(mensaje) {
    console.log('✅ ' + mensaje);
    alert('✅ ' + mensaje);
}

function mostrarError(mensaje) {
    console.error('❌ ' + mensaje);
    alert('❌ ' + mensaje);
}

function mostrarInfo(mensaje) {
    console.log('ℹ️ ' + mensaje);
    alert('ℹ️ ' + mensaje);
}

function confirmar(mensaje) {
    return confirm('❓ ' + mensaje);
}



// === FUNCIONES PRINCIPALES (GLOBALES) ===

// Función para recargar datos (llamada desde varios lugares)
async function recargarDatos() {
    await cargarCategorias();
}

// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', function() {
    console.log(' Inicializando CRUD de Categorías...');
    
    // Verificar que el contenedor existe
    const container = document.getElementById('dataTableContainer');
    
    if (!container) {
        console.error(' ERROR CRÍTICO: Container dataTableContainer no encontrado');
        mostrarError('Error crítico: Container no encontrado. Revise el HTML.');
        return;
    }
    
    // Verificar configuración
    if (!API_CONFIG || !API_CONFIG.BASE_URL) {
        console.error(' Error: Configuración del API no encontrada');
        mostrarError('Error de configuración. Verifique el archivo config.js');
        return;
    }

    // Inicializar componentes
    inicializarComponentes();
    
    // Validar conexión con API
    validarConexionAPI();
    
    // Cargar datos iniciales
    cargarCategorias();
    
    console.log(' CRUD de Categorías inicializado correctamente');
});

// Inicializar todos los componentes
function inicializarComponentes() {
    try {
        console.log('🔧 Iniciando componentes...');
        
        // Inicializar DataTable con modal integrado
        console.log('🔧 Creando DataTable...');
        dataTableCategorias = new DataTableCategoria('dataTableContainer');
        console.log('DataTable creado:', !!dataTableCategorias);
        
        // Hacer variables accesibles globalmente
        window.dataTableCategorias = dataTableCategorias;
        window.cargarCategorias = cargarCategorias;
        window.categorias = categorias;
        
        console.log(' Verificando asignaciones globales:');
        console.log('  - window.dataTableCategorias:', !!window.dataTableCategorias);
        
        console.log(' Componentes inicializados correctamente');
        
    } catch (error) {
        console.error(' Error inicializando componentes:', error);
        alert('Error crítico al inicializar la aplicación. Revise la consola.');
    }
}

// Validar conexión con el API
async function validarConexionAPI() {
    try {
        const isValid = await categoriaAPI.validarConexion();
        if (!isValid) {
        mostrarInfo(
                'No se pudo establecer conexión con el API. Verifique que el servidor esté funcionando.'
            );
        }
    } catch (error) {
        console.error(' Error validando conexión:', error);
    }
}

// Cargar todas las categorías
async function cargarCategorias() {
    try {
        // Verificar que DataTable esté inicializado
        if (!dataTableCategorias) {
            console.error(' DataTable no está inicializado');
            return;
        }
        
        // Mostrar loading en DataTable
        dataTableCategorias.showLoading();
        
        // Hacer petición al API
        const response = await categoriaAPI.obtenerTodas();
        
        if (response.success) {
            categorias = response.data || [];
            window.categorias = categorias; // Actualizar también la referencia global
            dataTableCategorias.setData(categorias);
            
            if (categorias.length === 0) {
                mostrarInfo('No hay categorías registradas. ¡Crea la primera!');
            }
            
        } else {
            console.error(' Error cargando categorías:', response.error);
            mostrarError('Error al cargar las categorías: ' + response.error);
        }
        
    } catch (error) {
        console.error(' Error inesperado cargando categorías:', error);
        mostrarError('Error inesperado al cargar las categorías');
    }
}

// Función para recargar datos (llamada desde varios lugares)
async function recargarDatos() {
    await cargarCategorias();
}

// Función para manejar errores de red
function manejarErrorRed(error) {
    console.error('Error de red:', error);
    
    if (error.message.includes('fetch')) {
        mostrarError('Error de conexión con el servidor');
    } else if (error.message.includes('401') || error.message.includes('KEY')) {
        mostrarError('Error de autenticación');
    } else {
        mostrarError('Error del servidor');
    }
}

// Función utilitaria para validar datos
function validarDatosCategoria(categoria) {
    if (!categoria) {
        return { valido: false, error: 'Datos de categoría no proporcionados' };
    }
    
    if (!categoria.nombre || categoria.nombre.trim() === '') {
        return { valido: false, error: 'El nombre de la categoría es requerido' };
    }
    
    if (categoria.nombre.length > 100) {
        return { valido: false, error: 'El nombre no puede exceder 100 caracteres' };
    }
    
    return { valido: true };
}

// Funciones de utilidad para debugging
function mostrarEstadoAplicacion() {
    console.log(' Estado de la aplicación:');
    console.log('- Categorías cargadas:', categorias.length);
    console.log('- DataTable inicializado:', !!dataTableCategorias);
    console.log('- Modal inicializado:', !!modalCategoria);
    console.log('- API configurado:', !!categoriaAPI);
    console.log('- URL del API:', API_CONFIG.BASE_URL);
}

// Función para probar la conexión manualmente
async function probarConexion() {
    console.log('🔧 Probando conexión con API...');
    
    try {
        const response = await categoriaAPI.obtenerTodas();
        
        if (response.success) {
            mostrarExito('Conexión con API exitosa');
            console.log(' Conexión exitosa:', response.data);
        } else {
            mostrarError('Error de conexión: ' + response.error);
            console.error(' Error de conexión:', response.error);
        }
    } catch (error) {
        mostrarError('Error de conexión: ' + error.message);
        console.error(' Error de conexión:', error);
    }
}

// Event listeners adicionales
document.addEventListener('keydown', function(e) {
    // Tecla F5 para recargar datos (en lugar de página completa)
    if (e.key === 'F5' && e.ctrlKey) {
        e.preventDefault();
        recargarDatos();
    }
    
    // Ctrl+N para nueva categoría
    if (e.key === 'n' && e.ctrlKey) {
        e.preventDefault();
        if (modalCategoria && !modalCategoria.isOpen) {
            modalCategoria.abrir();
        }
    }
});

// Manejar errores globales de JavaScript
window.addEventListener('error', function(e) {
    console.error(' Error global de JavaScript:', e.error);
    
    if (e.error && e.error.message && e.error.message.includes('fetch')) {
        mostrarError('Error de conexión con el servidor');
    }
});

// Manejar errores de promesas no capturadas
window.addEventListener('unhandledrejection', function(e) {
    console.error(' Promesa rechazada no manejada:', e.reason);
    
    if (e.reason && e.reason.message && e.reason.message.includes('fetch')) {
        mostrarError('Error de conexión con el servidor');
        e.preventDefault(); // Prevenir que aparezca en consola como error no manejado
    }
});

// Exponer funciones útiles al objeto window para debugging
if (typeof window !== 'undefined') {
    window.debugCRUD = {
        mostrarEstado: mostrarEstadoAplicacion,
        probarConexion: probarConexion,
        recargarDatos: recargarDatos,
        categorias: () => categorias
    };
    
    console.log('🔧 Funciones de debug disponibles en window.debugCRUD');
}