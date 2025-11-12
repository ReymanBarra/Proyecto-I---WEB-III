// Clase para manejar modales de categorías
class ModalCategoria {
    constructor() {
        this.modalElement = null;
        this.isOpen = false;
        this.isEditMode = false;
        this.currentId = null;
        
        this.createModal();
        this.bindEvents();
    }

    // Crear estructura del modal
    createModal() {
        const modalHTML = `
            <div class="modal-overlay" id="modalOverlay" style="display: none;">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2 id="modalTitle">Nueva Categoría</h2>
                        <button class="modal-close" id="modalClose">
                            <i class="icon-close"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <form id="formCategoria" novalidate>
                            <div class="form-group">
                                <label for="inputNombre" class="form-label">
                                    Nombre de la Categoría *
                                </label>
                                <input 
                                    type="text" 
                                    id="inputNombre" 
                                    name="nombre"
                                    class="form-input" 
                                    placeholder="Ingrese el nombre de la categoría"
                                    maxlength="100"
                                    required
                                    autocomplete="off"
                                >
                                <div class="form-error" id="errorNombre"></div>
                                <div class="form-hint">
                                    Máximo 100 caracteres
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="btnCancelar">
                            Cancelar
                        </button>
                        <button type="submit" form="formCategoria" class="btn btn-primary" id="btnGuardar">
                            <span class="btn-text">Guardar</span>
                            <div class="btn-loading" style="display: none;">
                                <div class="loading-spinner-sm"></div>
                                Guardando...
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Agregar al body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modalElement = document.getElementById('modalOverlay');
    }

    // Vincular eventos
    bindEvents() {
        // Cerrar modal
        document.getElementById('modalClose').addEventListener('click', () => {
            this.cerrar();
        });

        document.getElementById('btnCancelar').addEventListener('click', () => {
            this.cerrar();
        });

        // Cerrar al hacer clic fuera del modal
        this.modalElement.addEventListener('click', (e) => {
            if (e.target === this.modalElement) {
                this.cerrar();
            }
        });

        // Cerrar con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.cerrar();
            }
        });

        // Submit del formulario
        document.getElementById('formCategoria').addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardar();
        });

        // Validación en tiempo real
        document.getElementById('inputNombre').addEventListener('input', (e) => {
            this.validateField('nombre', e.target.value);
        });

        // Limpiar errores al escribir
        document.getElementById('inputNombre').addEventListener('focus', () => {
            this.clearError('nombre');
        });
    }

    // Abrir modal para nueva categoría
    abrir(categoria = null) {
        this.isEditMode = !!categoria;
        this.currentId = categoria ? categoria.id : null;

        // Configurar título y botón
        const title = document.getElementById('modalTitle');
        const btnText = document.querySelector('#btnGuardar .btn-text');
        
        if (!title || !btnText) {
            console.error('❌ Elementos del modal no encontrados');
            return;
        }
        
        if (this.isEditMode) {
            title.textContent = 'Editar Categoría';
            btnText.textContent = 'Actualizar';
        } else {
            title.textContent = 'Nueva Categoría';
            btnText.textContent = 'Guardar';
        }

        // Llenar campos si es edición
        if (categoria) {
            document.getElementById('inputNombre').value = categoria.nombre;
        } else {
            // Limpiar campos para nueva categoría
            document.getElementById('inputNombre').value = '';
        }

        // Mostrar modal
        if (this.modalElement) {
            this.modalElement.style.display = 'flex';
            // Agregar clase show para la animación CSS
            setTimeout(() => {
                this.modalElement.classList.add('show');
            }, 10); // Pequeño delay para que la transición funcione
            
            this.isOpen = true;
        } else {
            console.error('❌ modalElement no existe');
        }
        
        // Focus en el primer campo
        setTimeout(() => {
            document.getElementById('inputNombre').focus();
        }, 100);

        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';
    }

    // Cerrar modal
    cerrar() {
        if (!this.isOpen) return;

        // Quitar clase show para animación
        this.modalElement.classList.remove('show');
        
        // Ocultar después de la animación
        setTimeout(() => {
            this.modalElement.style.display = 'none';
        }, 300); // Tiempo de la transición CSS
        
        this.isOpen = false;
        this.isEditMode = false;
        this.currentId = null;

        // Limpiar formulario
        this.limpiarFormulario();

        // Restaurar scroll del body
        document.body.style.overflow = 'auto';
    }

    // Limpiar formulario y errores
    limpiarFormulario() {
        const form = document.getElementById('formCategoria');
        form.reset();
        this.clearAllErrors();
        this.setButtonLoading(false);
    }

    // Guardar categoría
    async guardar() {
        const nombre = document.getElementById('inputNombre').value.trim();

        // Validar formulario
        if (!this.validateForm(nombre)) {
            return;
        }

        // Mostrar loading
        this.setButtonLoading(true);

        try {
            let response;
            
            if (this.isEditMode) {
                // Actualizar categoría existente
                response = await categoriaAPI.actualizar(this.currentId, nombre);
            } else {
                // Crear nueva categoría
                response = await categoriaAPI.crear(nombre);
            }

            if (response.success) {
                // Éxito
                const mensaje = this.isEditMode 
                    ? API_CONFIG.MESSAGES.SUCCESS.UPDATE
                    : API_CONFIG.MESSAGES.SUCCESS.CREATE;
                
                alertas.mostrarExito(mensaje);
                
                // Cerrar modal
                this.cerrar();
                
                // Recargar datos
                await cargarCategorias();
                
            } else {
                // Error del API
                alertas.mostrarError(response.error || 'Error al guardar la categoría');
            }

        } catch (error) {
            console.error('Error al guardar categoría:', error);
            alertas.mostrarError('Error inesperado al guardar la categoría');
        } finally {
            this.setButtonLoading(false);
        }
    }

    // Validar formulario completo
    validateForm(nombre) {
        let isValid = true;

        // Validar nombre
        if (!this.validateField('nombre', nombre)) {
            isValid = false;
        }

        return isValid;
    }

    // Validar campo individual
    validateField(field, value) {
        switch (field) {
            case 'nombre':
                if (!value || value.trim() === '') {
                    this.setError('nombre', 'El nombre es requerido');
                    return false;
                }
                if (value.length > 100) {
                    this.setError('nombre', 'El nombre no puede exceder 100 caracteres');
                    return false;
                }
                if (value.length < 2) {
                    this.setError('nombre', 'El nombre debe tener al menos 2 caracteres');
                    return false;
                }
                this.clearError('nombre');
                return true;
                
            default:
                return true;
        }
    }

    // Mostrar error en campo
    setError(field, message) {
        const errorElement = document.getElementById(`error${field.charAt(0).toUpperCase() + field.slice(1)}`);
        const inputElement = document.getElementById(`input${field.charAt(0).toUpperCase() + field.slice(1)}`);
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        inputElement.classList.add('error');
    }

    // Limpiar error de campo
    clearError(field) {
        const errorElement = document.getElementById(`error${field.charAt(0).toUpperCase() + field.slice(1)}`);
        const inputElement = document.getElementById(`input${field.charAt(0).toUpperCase() + field.slice(1)}`);
        
        errorElement.style.display = 'none';
        inputElement.classList.remove('error');
    }

    // Limpiar todos los errores
    clearAllErrors() {
        const errorElements = this.modalElement.querySelectorAll('.form-error');
        const inputElements = this.modalElement.querySelectorAll('.form-input');
        
        errorElements.forEach(el => el.style.display = 'none');
        inputElements.forEach(el => el.classList.remove('error'));
    }

    // Controlar estado de loading del botón
    setButtonLoading(isLoading) {
        const btnText = document.querySelector('#btnGuardar .btn-text');
        const btnLoading = document.querySelector('#btnGuardar .btn-loading');
        const btnGuardar = document.getElementById('btnGuardar');
        
        if (isLoading) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'flex';
            btnGuardar.disabled = true;
        } else {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            btnGuardar.disabled = false;
        }
    }
}