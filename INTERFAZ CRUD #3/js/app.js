// Archivo principal del CRUD de Categorías
// Inicialización y funciones globales

// Variables globales
let categorias = [];
let modalCategoria = null;
let dataTableCategorias = null;

// Función de inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando CRUD de Categorías...');
    
    // Verificar que el contenedor existe
    const container = document.getElementById('dataTableContainer');
    
    if (!container) {
        console.error('❌ ERROR CRÍTICO: Container dataTableContainer no encontrado');
        alert('Error crítico: Container no encontrado. Revise el HTML.');
        return;
    }
    
    // Verificar configuración
    if (!API_CONFIG || !API_CONFIG.BASE_URL) {
        console.error('❌ Error: Configuración del API no encontrada');
        if (typeof alertas !== 'undefined') {
            alertas.mostrarError('Error de configuración. Verifique el archivo config.js');
        } else {
            alert('Error de configuración. Verifique el archivo config.js');
        }
        return;
    }

    // Inicializar componentes
    inicializarComponentes();
    
    // Validar conexión con API
    validarConexionAPI();
    
    // Cargar datos iniciales
    cargarCategorias();
    
    console.log('✅ CRUD de Categorías inicializado correctamente');
});

// Inicializar todos los componentes
function inicializarComponentes() {
    try {
        // Inicializar DataTable
        dataTableCategorias = new DataTableCategoria('dataTableContainer');
        
        // Inicializar Modal
        modalCategoria = new ModalCategoria();
        
        // Hacer variables y funciones accesibles globalmente
        window.modalCategoria = modalCategoria;
        window.dataTableCategorias = dataTableCategorias;
        window.editarCategoria = editarCategoria;
        window.eliminarCategoria = eliminarCategoria;
        window.cargarCategorias = cargarCategorias;
        
        console.log('✅ Componentes inicializados correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando componentes:', error);
        alert('Error crítico al inicializar la aplicación. Revise la consola.');
    }
}

// Validar conexión con el API
async function validarConexionAPI() {
    try {
        const isValid = await categoriaAPI.validarConexion();
        if (!isValid) {
            alertas.mostrarAdvertencia(
                'No se pudo establecer conexión con el API. Verifique que el servidor esté funcionando.',
                0 // No auto-cerrar
            );
        }
    } catch (error) {
        console.error('❌ Error validando conexión:', error);
    }
}

// Cargar todas las categorías
async function cargarCategorias() {
    try {
        // Verificar que DataTable esté inicializado
        if (!dataTableCategorias) {
            console.error('❌ DataTable no está inicializado');
            return;
        }
        
        // Mostrar loading en DataTable
        dataTableCategorias.showLoading();
        
        // Hacer petición al API
        const response = await categoriaAPI.obtenerTodas();
        
        if (response.success) {
            categorias = response.data || [];
            dataTableCategorias.setData(categorias);
            
            if (categorias.length === 0) {
                alertas.mostrarInfo('No hay categorías registradas. ¡Crea la primera!');
            }
            
        } else {
            console.error('❌ Error cargando categorías:', response.error);
            alertas.mostrarError('Error al cargar las categorías: ' + response.error);
        }
        
    } catch (error) {
        console.error(' Error inesperado cargando categorías:', error);
        alertas.mostrarError('Error inesperado al cargar las categorías');
    }
}

// Editar categoría (función global llamada desde DataTable)
// Editar una categoría existente
async function editarCategoria(id) {
    try {
        // Buscar categoría en los datos locales primero
        let categoria = categorias.find(c => c.id == id);
        
        if (!categoria) {
            // Si no está en local, buscar en API
            const response = await categoriaAPI.obtenerPorId(id);
            
            if (response.success && response.data) {
                categoria = response.data;
            } else {
                alertas.mostrarError('No se pudo cargar la información de la categoría');
                return;
            }
        }
        
        // Abrir modal de edición
        if (window.modalCategoria) {
            window.modalCategoria.abrir(categoria);
        } else if (typeof modalCategoria !== 'undefined' && modalCategoria) {
            modalCategoria.abrir(categoria);
        } else {
            console.error('❌ Modal no disponible para edición');
            alertas.mostrarError('Error: Modal no inicializado');
        }
        
    } catch (error) {
        console.error('❌ Error editando categoría:', error);
        alertas.mostrarError('Error al intentar editar la categoría');
    }
}

// Eliminar categoría (función global llamada desde DataTable)
async function eliminarCategoria(id) {
    try {
        console.log(`🗑️ Intentando eliminar categoría ID: ${id}`);
        
        // Buscar el nombre de la categoría para el mensaje de confirmación
        const categoria = categorias.find(c => c.id == id);
        const nombreCategoria = categoria ? categoria.nombre : `ID ${id}`;
        
        // Confirmar eliminación
        const confirmado = await alertas.confirmarEliminacion(`la categoría "${nombreCategoria}"`);
        
        if (!confirmado) {
            console.log('❌ Eliminación cancelada por el usuario');
            return;
        }
        
        // Mostrar loading
        const loadingId = alertas.mostrarCarga('Eliminando categoría...');
        
        // Hacer petición de eliminación
        const response = await categoriaAPI.eliminar(id);
        
        // Cerrar loading
        alertas.cerrarCarga(loadingId);
        
        if (response.success) {
            console.log('✅ Categoría eliminada exitosamente');
            
            // Actualizar DataTable
            dataTableCategorias.removeRow(id);
            
            // Actualizar array local
            categorias = categorias.filter(c => c.id != id);
            
            // Mostrar mensaje de éxito
            alertas.mostrarExito(API_CONFIG.MESSAGES.SUCCESS.DELETE);
            
        } else {
            console.error('❌ Error eliminando categoría:', response.error);
            alertas.mostrarError('Error al eliminar la categoría: ' + response.error);
        }
        
    } catch (error) {
        console.error('❌ Error inesperado eliminando categoría:', error);
        alertas.mostrarError('Error inesperado al eliminar la categoría');
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
        alertas.errorConexion();
    } else if (error.message.includes('401') || error.message.includes('KEY')) {
        alertas.errorAutenticacion();
    } else {
        alertas.errorServidor();
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
    console.log('📊 Estado de la aplicación:');
    console.log('- Categorías cargadas:', categorias.length);
    console.log('- DataTable inicializado:', !!dataTableCategorias);
    console.log('- Modal inicializado:', !!modalCategoria);
    console.log('- API configurado:', !!categoriaAPI);
    console.log('- URL del API:', API_CONFIG.BASE_URL);
}

// Función para probar la conexión manualmente
async function probarConexion() {
    console.log('🔍 Probando conexión con API...');
    
    const loadingId = alertas.mostrarCarga('Probando conexión...');
    
    try {
        const response = await categoriaAPI.obtenerTodas();
        alertas.cerrarCarga(loadingId);
        
        if (response.success) {
            alertas.mostrarExito('Conexión con API exitosa');
            console.log('✅ Conexión exitosa:', response.data);
        } else {
            alertas.mostrarError('Error de conexión: ' + response.error);
            console.error('❌ Error de conexión:', response.error);
        }
    } catch (error) {
        alertas.cerrarCarga(loadingId);
        alertas.mostrarError('Error de conexión: ' + error.message);
        console.error('❌ Error de conexión:', error);
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
    console.error('❌ Error global de JavaScript:', e.error);
    
    if (e.error && e.error.message && e.error.message.includes('fetch')) {
        alertas.errorConexion();
    }
});

// Manejar errores de promesas no capturadas
window.addEventListener('unhandledrejection', function(e) {
    console.error('❌ Promesa rechazada no manejada:', e.reason);
    
    if (e.reason && e.reason.message && e.reason.message.includes('fetch')) {
        alertas.errorConexion();
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