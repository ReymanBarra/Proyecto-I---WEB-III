// Sistema de alertas y notificaciones
class SistemaAlertas {
    constructor() {
        this.container = null;
        this.activeAlerts = [];
        this.init();
    }

    // Inicializar container de alertas
    init() {
        // Crear container si no existe
        if (!document.getElementById('alertContainer')) {
            const container = document.createElement('div');
            container.id = 'alertContainer';
            container.className = 'alert-container';
            document.body.appendChild(container);
            this.container = container;
        } else {
            this.container = document.getElementById('alertContainer');
        }
    }

    // Mostrar alerta de éxito
    mostrarExito(mensaje, duracion = 5000) {
        return this.mostrarAlerta('success', mensaje, duracion);
    }

    // Mostrar alerta de error
    mostrarError(mensaje, duracion = 8000) {
        return this.mostrarAlerta('error', mensaje, duracion);
    }

    // Mostrar alerta de advertencia
    mostrarAdvertencia(mensaje, duracion = 6000) {
        return this.mostrarAlerta('warning', mensaje, duracion);
    }

    // Mostrar alerta de información
    mostrarInfo(mensaje, duracion = 5000) {
        return this.mostrarAlerta('info', mensaje, duracion);
    }

    // Método principal para mostrar alertas
    mostrarAlerta(tipo, mensaje, duracion) {
        const alertId = this.generateId();
        const iconos = {
            success: 'icon-success',
            error: 'icon-error',
            warning: 'icon-warning',
            info: 'icon-info'
        };

        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${tipo}`;
        alertElement.setAttribute('data-alert-id', alertId);
        alertElement.innerHTML = `
            <div class="alert-content">
                <div class="alert-icon">
                    <i class="${iconos[tipo]}"></i>
                </div>
                <div class="alert-message">
                    ${this.escapeHtml(mensaje)}
                </div>
                <button class="alert-close" onclick="alertas.cerrarAlerta('${alertId}')">
                    <i class="icon-close"></i>
                </button>
            </div>
            <div class="alert-progress">
                <div class="alert-progress-bar"></div>
            </div>
        `;

        // Agregar al container
        this.container.appendChild(alertElement);

        // Animar entrada
        setTimeout(() => {
            alertElement.classList.add('show');
        }, 10);

        // Animar barra de progreso
        const progressBar = alertElement.querySelector('.alert-progress-bar');
        if (duracion > 0) {
            progressBar.style.animation = `alertProgress ${duracion}ms linear`;
        }

        // Agregar a lista activa
        this.activeAlerts.push({
            id: alertId,
            element: alertElement,
            timeout: null
        });

        // Auto-cerrar si tiene duración
        if (duracion > 0) {
            const alertObj = this.activeAlerts.find(a => a.id === alertId);
            if (alertObj) {
                alertObj.timeout = setTimeout(() => {
                    this.cerrarAlerta(alertId);
                }, duracion);
            }
        }

        return alertId;
    }

    // Cerrar alerta específica
    cerrarAlerta(alertId) {
        const alertIndex = this.activeAlerts.findIndex(a => a.id === alertId);
        if (alertIndex === -1) return;

        const alertObj = this.activeAlerts[alertIndex];
        
        // Cancelar timeout si existe
        if (alertObj.timeout) {
            clearTimeout(alertObj.timeout);
        }

        // Animar salida
        alertObj.element.classList.add('hide');

        // Remover del DOM después de la animación
        setTimeout(() => {
            if (alertObj.element && alertObj.element.parentNode) {
                alertObj.element.parentNode.removeChild(alertObj.element);
            }
        }, 300);

        // Remover de la lista
        this.activeAlerts.splice(alertIndex, 1);
    }

    // Cerrar todas las alertas
    cerrarTodas() {
        const alertIds = [...this.activeAlerts.map(a => a.id)];
        alertIds.forEach(id => this.cerrarAlerta(id));
    }

    // Mostrar confirmación personalizada
    mostrarConfirmacion(mensaje, opciones = {}) {
        return new Promise((resolve) => {
            const config = {
                titulo: 'Confirmar acción',
                textoConfirmar: 'Confirmar',
                textoCancelar: 'Cancelar',
                tipo: 'warning',
                ...opciones
            };

            const confirmId = this.generateId();
            const overlay = document.createElement('div');
            overlay.className = 'confirm-overlay';
            overlay.innerHTML = `
                <div class="confirm-container">
                    <div class="confirm-header">
                        <div class="confirm-icon">
                            <i class="icon-${config.tipo}"></i>
                        </div>
                        <h3>${this.escapeHtml(config.titulo)}</h3>
                    </div>
                    <div class="confirm-body">
                        <p>${this.escapeHtml(mensaje)}</p>
                    </div>
                    <div class="confirm-footer">
                        <button class="btn btn-secondary" id="confirmCancel-${confirmId}">
                            ${config.textoCancelar}
                        </button>
                        <button class="btn btn-${config.tipo === 'error' ? 'danger' : 'primary'}" id="confirmAccept-${confirmId}">
                            ${config.textoConfirmar}
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            // Animar entrada
            setTimeout(() => {
                overlay.classList.add('show');
            }, 10);

            // Eventos
            document.getElementById(`confirmCancel-${confirmId}`).addEventListener('click', () => {
                this.cerrarConfirmacion(overlay);
                resolve(false);
            });

            document.getElementById(`confirmAccept-${confirmId}`).addEventListener('click', () => {
                this.cerrarConfirmacion(overlay);
                resolve(true);
            });

            // Cerrar con ESC
            const handleKeydown = (e) => {
                if (e.key === 'Escape') {
                    document.removeEventListener('keydown', handleKeydown);
                    this.cerrarConfirmacion(overlay);
                    resolve(false);
                }
            };
            document.addEventListener('keydown', handleKeydown);

            // Focus en botón de confirmar
            setTimeout(() => {
                document.getElementById(`confirmAccept-${confirmId}`).focus();
            }, 100);
        });
    }

    // Cerrar confirmación
    cerrarConfirmacion(overlay) {
        overlay.classList.add('hide');
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
    }

    // Mostrar alerta de carga
    mostrarCarga(mensaje = 'Cargando...') {
        const loadingId = this.generateId();
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.setAttribute('data-loading-id', loadingId);
        overlay.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>${this.escapeHtml(mensaje)}</p>
            </div>
        `;

        document.body.appendChild(overlay);

        // Animar entrada
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);

        return loadingId;
    }

    // Cerrar alerta de carga
    cerrarCarga(loadingId) {
        const overlay = document.querySelector(`[data-loading-id="${loadingId}"]`);
        if (overlay) {
            overlay.classList.add('hide');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        }
    }

    // Generar ID único
    generateId() {
        return 'alert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Escapar HTML para prevenir XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Métodos de conveniencia para errores comunes
    errorConexion() {
        return this.mostrarError(API_CONFIG.MESSAGES.ERROR.NETWORK);
    }

    errorAutenticacion() {
        return this.mostrarError(API_CONFIG.MESSAGES.ERROR.AUTH);
    }

    errorServidor() {
        return this.mostrarError(API_CONFIG.MESSAGES.ERROR.SERVER);
    }

    errorValidacion(mensaje = API_CONFIG.MESSAGES.ERROR.VALIDATION) {
        return this.mostrarError(mensaje);
    }

    // Confirmar eliminación
    confirmarEliminacion(item = 'este elemento') {
        return this.mostrarConfirmacion(
            `¿Está seguro de que desea eliminar ${item}? Esta acción no se puede deshacer.`,
            {
                titulo: 'Confirmar eliminación',
                textoConfirmar: 'Eliminar',
                textoCancelar: 'Cancelar',
                tipo: 'error'
            }
        );
    }
}

// Instancia global del sistema de alertas
const alertas = new SistemaAlertas();