// DataTable Simple con jQuery + Modal integrado
class DataTableCategoria {
    constructor(containerId) {
        this.$container = $(`#${containerId}`);
        this.data = [];
        this.filteredData = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        
        this.init();
    }

    init() {
        // Crear estructura HTML simplificada
        this.$container.html(`
            <div class="datatable-container">
                <div class="datatable-header">
                    <button class="btn btn-primary" id="btnNuevaCategoria">Nueva Categoría</button>
                    <input type="text" id="searchInput" placeholder="Buscar..." class="search-input">
                </div>
                <div class="datatable-wrapper">
                    <table class="datatable">
                        <thead>
                            <tr>
                                <th onclick="dataTable.sort('id')">ID</th>
                                <th onclick="dataTable.sort('nombre')">Nombre</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="datatableBody"></tbody>
                    </table>
                </div>
                <div class="datatable-footer">
                    <span id="paginationInfo"></span>
                    <div>
                        <button id="btnPrev">Anterior</button>
                        <button id="btnNext">Siguiente</button>
                    </div>
                </div>
            </div>
        `);

        // Eventos simples
        $('#searchInput').on('input', (e) => this.search(e.target.value));
        $('#btnNuevaCategoria').on('click', () => this.nuevaCategoria());
        $('#btnPrev').on('click', () => this.prevPage());
        $('#btnNext').on('click', () => this.nextPage());
    }

    // === FUNCIONES DE MODAL INTEGRADO ===
    
    async nuevaCategoria() {
        const nombre = prompt(' Ingrese el nombre de la nueva categoría:');
        
        if (nombre === null) return; // Usuario canceló
        
        if (!nombre.trim()) {
            alert(' El nombre no puede estar vacío');
            return;
        }

        try {
            const response = await categoriaAPI.crear(nombre.trim());
            
            if (response.success) {
                mostrarExito('Categoría creada correctamente');
                // Recargar datos inmediatamente
                console.log(' Forzando recarga después de crear...');
                setTimeout(async () => {
                    await this.recargarDatos();
                }, 100);
            } else {
                mostrarError('Error al crear la categoría: ' + response.error);
            }
        } catch (error) {
            mostrarError('Error inesperado al crear la categoría');
            console.error(error);
        }
    }

    async editarCategoria(id) {
        const categoria = this.data.find(c => c.id == id);
        if (!categoria) {
            mostrarError('Categoría no encontrada');
            return;
        }

        const nuevoNombre = prompt(' Editar categoría:', categoria.nombre);
        
        if (nuevoNombre === null) return; // Usuario canceló
        
        if (!nuevoNombre.trim()) {
            alert(' El nombre no puede estar vacío');
            return;
        }

        if (nuevoNombre.trim() === categoria.nombre) {
            alert('ℹ No se realizaron cambios');
            return;
        }

        try {
            const response = await categoriaAPI.actualizar(id, nuevoNombre.trim());
            
            if (response.success) {
                mostrarExito('Categoría actualizada correctamente');
                // Recargar datos inmediatamente
                console.log('Forzando recarga después de editar...');
                setTimeout(async () => {
                    await this.recargarDatos();
                }, 100);
            } else {
                mostrarError('Error al actualizar la categoría: ' + response.error);
            }
        } catch (error) {
            mostrarError('Error inesperado al actualizar la categoría');
            console.error(error);
        }
    }

    async eliminarCategoria(id) {
        const categoria = this.data.find(c => c.id == id);
        const nombreCategoria = categoria ? categoria.nombre : `ID ${id}`;
        
        const confirmado = confirm(` ¿Está seguro de eliminar la categoría "${nombreCategoria}"?`);
        
        if (!confirmado) return;

        try {
            const response = await categoriaAPI.eliminar(id);
            
            if (response.success) {
                mostrarExito('Categoría eliminada correctamente');
                setTimeout(async () => {
                    await this.recargarDatos();
                }, 100);
            } else {
                mostrarError('Error al eliminar la categoría: ' + response.error);
            }
        } catch (error) {
            mostrarError('Error inesperado al eliminar la categoría');
            console.error(error);
        }
    }

    // Función fallback para recargar datos directamente
    async recargarDatos() {
        try {
            this.showLoading();
            const response = await categoriaAPI.obtenerTodas();
            
            if (response.success) {
                this.setData(response.data || []);
                // También actualizar el array global
                if (window.categorias !== undefined) {
                    window.categorias = response.data || [];
                }
            } else {
                mostrarError('Error al recargar datos: ' + response.error);
            }
        } catch (error) {
            mostrarError('Error inesperado al recargar datos');
            console.error(error);
        }
    }

    setData(data) {
        this.data = data || [];
        this.filteredData = [...this.data];
        this.currentPage = 1;
        this.render();
    }

    search(term) {
        this.filteredData = this.data.filter(item => 
            item.nombre.toLowerCase().includes(term.toLowerCase())
        );
        this.currentPage = 1;
        this.render();
    }

    sort(column) {
        this.filteredData.sort((a, b) => {
            let valA = column === 'id' ? parseInt(a[column]) : a[column].toLowerCase();
            let valB = column === 'id' ? parseInt(b[column]) : b[column].toLowerCase();
            return valA > valB ? 1 : -1;
        });
        this.render();
    }

    render() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageData = this.filteredData.slice(start, end);

        if (pageData.length === 0) {
            $('#datatableBody').html(`
                <tr><td colspan="3" class="no-data">No hay datos</td></tr>
            `);
        } else {
            const rows = pageData.map(item => `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.nombre}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="dataTableCategorias.editarCategoria(${item.id})">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="dataTableCategorias.eliminarCategoria(${item.id})">Eliminar</button>
                    </td>
                </tr>
            `).join('');
            $('#datatableBody').html(rows);
        }

        this.updatePagination();
    }

    updatePagination() {
        const total = this.filteredData.length;
        const totalPages = Math.ceil(total / this.itemsPerPage);
        
        $('#paginationInfo').text(`${total} registros - Página ${this.currentPage} de ${totalPages}`);
        $('#btnPrev').prop('disabled', this.currentPage === 1);
        $('#btnNext').prop('disabled', this.currentPage >= totalPages);
    }

    prevPage() {
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

    showLoading() {
        $('#datatableBody').html('<tr><td colspan="3" class="loading">Cargando...</td></tr>');
    }

    // Función para recargar datos directamente desde el API
    async recargarDatos() {
        try {
            console.log(' Recargando datos desde API...');
            this.showLoading();
            const response = await categoriaAPI.obtenerTodas();
            
            if (response.success) {
                console.log(' Datos recargados exitosamente:', response.data);
                this.setData(response.data || []);
                // Actualizar también variables globales
                categorias = response.data || [];
                if (typeof window !== 'undefined') {
                    window.categorias = categorias;
                }
            } else {
                console.error(' Error recargando:', response.error);
                mostrarError('Error al recargar datos: ' + response.error);
            }
        } catch (error) {
            console.error(' Error inesperado recargando:', error);
            mostrarError('Error inesperado al recargar datos');
        }
    }

    removeRow(id) {
        $(`tr:has(button[onclick*="${id}"])`).fadeOut(300);
    }
}