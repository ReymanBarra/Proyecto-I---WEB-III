// Clase para manejar todas las peticiones al API de categorías
class CategoriaAPI {
    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
        this.headers = getAuthHeaders();
    }

    // Método privado para hacer peticiones fetch
    async makeRequest(url, options = {}) {
        try {
            const defaultOptions = {
                headers: this.headers,
                timeout: API_CONFIG.TIMEOUT
            };

            const finalOptions = { ...defaultOptions, ...options };
            
            // Crear controller para timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), finalOptions.timeout);
            
            finalOptions.signal = controller.signal;
            delete finalOptions.timeout;

            const response = await fetch(url, finalOptions);
            clearTimeout(timeoutId);

            // Verificar si la respuesta es exitosa
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            return { success: true, data };

        } catch (error) {
            console.error('Error en petición API:', error);
            
            // Manejar diferentes tipos de errores
            if (error.name === 'AbortError') {
                return { success: false, error: 'Tiempo de espera agotado' };
            }
            
            if (error.message.includes('404')) {
                return { success: false, error: API_CONFIG.MESSAGES.ERROR.NOT_FOUND };
            }

            return { 
                success: false, 
                error: error.message || API_CONFIG.MESSAGES.ERROR.NETWORK 
            };
        }
    }

    // GET: Obtener todas las categorías
    async obtenerTodas() {
        const url = this.baseUrl;
        return await this.makeRequest(url, {
            method: 'GET'
        });
    }

    // GET: Obtener categoría por ID
    async obtenerPorId(id) {
        if (!id || id <= 0) {
            return { success: false, error: 'ID inválido' };
        }

        const url = `${this.baseUrl}?id=${encodeURIComponent(id)}`;
        return await this.makeRequest(url, {
            method: 'GET'
        });
    }

    // POST: Crear nueva categoría
    async crear(nombre) {
        if (!nombre || nombre.trim() === '') {
            return { success: false, error: 'El nombre es requerido' };
        }

        const url = this.baseUrl;
        return await this.makeRequest(url, {
            method: 'POST',
            body: JSON.stringify({
                nombre: nombre.trim()
            })
        });
    }

    // PUT: Actualizar categoría existente
    async actualizar(id, nombre) {
        if (!id || id <= 0) {
            return { success: false, error: 'ID inválido' };
        }

        if (!nombre || nombre.trim() === '') {
            return { success: false, error: 'El nombre es requerido' };
        }

        const url = `${this.baseUrl}?id=${encodeURIComponent(id)}`;
        return await this.makeRequest(url, {
            method: 'PUT',
            body: JSON.stringify({
                nombre: nombre.trim()
            })
        });
    }

    // DELETE: Eliminar categoría
    async eliminar(id) {
        if (!id || id <= 0) {
            return { success: false, error: 'ID inválido' };
        }

        const url = `${this.baseUrl}?id=${encodeURIComponent(id)}`;
        return await this.makeRequest(url, {
            method: 'DELETE'
        });
    }

    // Método para validar la conexión con el API
    async validarConexion() {
        try {
            const response = await this.obtenerTodas();
            if (response.success) {
                console.log(' Conexión con API establecida correctamente');
                return true;
            } else {
                console.error(' Error en conexión con API:', response.error);
                return false;
            }
        } catch (error) {
            console.error(' Error validando conexión:', error);
            return false;
        }
    }
}

// Crear instancia global del API
const categoriaAPI = new CategoriaAPI();