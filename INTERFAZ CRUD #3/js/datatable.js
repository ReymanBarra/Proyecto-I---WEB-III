// Clase para crear y manejar DataTable personalizado
class DataTableCategoria {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        
        if (!this.container) {
            console.error('❌ Container no encontrado:', containerId);
            throw new Error(`Container con ID '${containerId}' no encontrado`);
        }
        
        this.data = [];
        this.filteredData = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.searchTerm = '';
        
        this.init();
    }

    // Inicializar la estructura del DataTable
    init() {
        this.container.innerHTML = `
            <div class="datatable-container">
                <!-- Header con búsqueda y botones -->
                <div class="datatable-header">
                    <div class="datatable-actions">
                        <button class="btn btn-primary" id="btnNuevaCategoria">
                            <i class="icon-plus"></i>
                            Nueva Categoría
                        </button>
                    </div>
                    <div class="datatable-search">
                        <input type="text" id="searchInput" placeholder="Buscar categorías..." class="search-input">
                        <i class="icon-search"></i>
                    </div>
                </div>

                <!-- Tabla -->
                <div class="datatable-wrapper">
                    <table class="datatable">
                        <thead>
                            <tr>
                                <th data-column="id" class="sortable">
                                    ID <span class="sort-icon"></span>
                                </th>
                                <th data-column="nombre" class="sortable">
                                    Nombre <span class="sort-icon"></span>
                                </th>
                                <th class="actions-column">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody id="datatableBody">
                            <!-- Las filas se generan dinámicamente -->
                        </tbody>
                    </table>
                </div>

                <!-- Loading y estados vacíos -->
                <div class="datatable-loading" id="datatableLoading" style="display: none;">
                    <div class="loading-spinner"></div>
                    <p>Cargando datos...</p>
                </div>

                <div class="datatable-empty" id="datatableEmpty" style="display: none;">
                    <i class="icon-empty"></i>
                    <p>No hay categorías para mostrar</p>
                    <button class="btn btn-primary" onclick="cargarCategorias()">Recargar</button>
                </div>

                <!-- Footer con paginación e información -->
                <div class="datatable-footer">
                    <div class="datatable-info">
                        <span id="datatableInfo">Mostrando 0 de 0 registros</span>
                    </div>
                    <div class="datatable-pagination">
                        <button class="btn btn-sm btn-secondary" id="btnPrevPage" disabled>
                            <i class="icon-prev"></i>
                        </button>
                        <span class="pagination-info">
                            Página <span id="currentPageSpan">1</span> de <span id="totalPagesSpan">1</span>
                        </span>
                        <button class="btn btn-sm btn-secondary" id="btnNextPage" disabled>
                            <i class="icon-next"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    // Vincular eventos
    bindEvents() {
        // Búsqueda
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.search(e.target.value);
        });

        // Ordenamiento
        const sortableHeaders = this.container.querySelectorAll('th.sortable');
        sortableHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                const column = header.getAttribute('data-column');
                this.sort(column);
            });
        });

        // Paginación
        document.getElementById('btnPrevPage').addEventListener('click', () => {
            this.previousPage();
        });

        document.getElementById('btnNextPage').addEventListener('click', () => {
            this.nextPage();
        });

        // Botón nueva categoría
        const btnNuevaCategoria = document.getElementById('btnNuevaCategoria');
        if (btnNuevaCategoria) {
            btnNuevaCategoria.addEventListener('click', () => {
                if (window.modalCategoria) {
                    window.modalCategoria.abrir();
                } else if (typeof modalCategoria !== 'undefined' && modalCategoria) {
                    modalCategoria.abrir();
                } else {
                    console.error('❌ Modal no está definido');
                    alert('Error: Modal no inicializado. Recargue la página.');
                }
            });
        } else {
            console.error('❌ Botón btnNuevaCategoria no encontrado');
        }
    }

    // Cargar datos en la tabla
    setData(data) {
        this.data = data || [];
        this.filteredData = [...this.data];
        this.currentPage = 1;
        this.render();
    }

    // Buscar en los datos
    search(term) {
        this.searchTerm = term.toLowerCase().trim();
        
        if (this.searchTerm === '') {
            this.filteredData = [...this.data];
        } else {
            this.filteredData = this.data.filter(item => 
                item.id.toString().includes(this.searchTerm) ||
                item.nombre.toLowerCase().includes(this.searchTerm)
            );
        }
        
        this.currentPage = 1;
        this.render();
    }

    // Ordenar datos
    sort(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }

        this.filteredData.sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];

            // Convertir a números si es posible
            if (!isNaN(aVal) && !isNaN(bVal)) {
                aVal = Number(aVal);
                bVal = Number(bVal);
            }

            if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        this.updateSortIcons();
        this.render();
    }

    // Actualizar iconos de ordenamiento
    updateSortIcons() {
        const headers = this.container.querySelectorAll('th.sortable');
        headers.forEach(header => {
            const icon = header.querySelector('.sort-icon');
            const column = header.getAttribute('data-column');
            
            if (column === this.sortColumn) {
                icon.className = `sort-icon ${this.sortDirection === 'asc' ? 'sort-asc' : 'sort-desc'}`;
            } else {
                icon.className = 'sort-icon';
            }
        });
    }

    // Paginación
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.render();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.render();
        }
    }

    // Renderizar tabla
    render() {
        const tbody = document.getElementById('datatableBody');
        const loading = document.getElementById('datatableLoading');
        const empty = document.getElementById('datatableEmpty');
        
        // Ocultar loading y empty
        loading.style.display = 'none';
        empty.style.display = 'none';

        if (this.filteredData.length === 0) {
            tbody.innerHTML = '';
            empty.style.display = 'block';
            this.updateFooter();
            return;
        }

        // Calcular paginación
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredData.length);
        const pageData = this.filteredData.slice(startIndex, endIndex);

        // Generar filas
        tbody.innerHTML = pageData.map(item => `
            <tr data-id="${item.id}">
                <td>${item.id}</td>
                <td class="nombre-cell">${this.escapeHtml(item.nombre)}</td>
                <td class="actions-cell">
                    <button class="btn btn-sm btn-warning btn-editar" 
                            onclick="editarCategoria(${item.id})" 
                            title="Editar categoría">
                        <span class="icon-edit"></span>Editar
                    </button>
                    <button class="btn btn-sm btn-danger btn-eliminar" 
                            onclick="eliminarCategoria(${item.id})" 
                            title="Eliminar categoría">
                        <span class="icon-delete"></span>Eliminar
                    </button>
                </td>
            </tr>
        `).join('');

        this.updateFooter();
    }

    // Actualizar información del footer
    updateFooter() {
        const info = document.getElementById('datatableInfo');
        const currentPageSpan = document.getElementById('currentPageSpan');
        const totalPagesSpan = document.getElementById('totalPagesSpan');
        const btnPrev = document.getElementById('btnPrevPage');
        const btnNext = document.getElementById('btnNextPage');

        const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endIndex = Math.min(this.currentPage * this.itemsPerPage, this.filteredData.length);
        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage) || 1;

        // Información
        if (this.filteredData.length > 0) {
            info.textContent = `Mostrando ${startIndex} a ${endIndex} de ${this.filteredData.length} registros`;
        } else {
            info.textContent = 'No hay registros para mostrar';
        }

        // Paginación
        currentPageSpan.textContent = this.currentPage;
        totalPagesSpan.textContent = totalPages;

        btnPrev.disabled = this.currentPage <= 1;
        btnNext.disabled = this.currentPage >= totalPages;
    }

    // Mostrar loading
    showLoading() {
        const loading = document.getElementById('datatableLoading');
        const empty = document.getElementById('datatableEmpty');
        const tbody = document.getElementById('datatableBody');
        
        tbody.innerHTML = '';
        empty.style.display = 'none';
        loading.style.display = 'block';
    }

    // Actualizar una fila específica
    updateRow(categoria) {
        const index = this.data.findIndex(item => item.id == categoria.id);
        if (index !== -1) {
            this.data[index] = categoria;
            this.search(this.searchTerm); // Reaplica filtros
        }
    }

    // Agregar nueva fila
    addRow(categoria) {
        this.data.unshift(categoria); // Agregar al inicio
        this.search(this.searchTerm); // Reaplica filtros
    }

    // Eliminar fila
    removeRow(id) {
        this.data = this.data.filter(item => item.id != id);
        this.search(this.searchTerm); // Reaplica filtros
    }

    // Escapar HTML para prevenir XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}