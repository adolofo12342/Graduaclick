// CONFIGURACIÓN
const CONFIG = { 
    codigoAcceso: 'admin2024'
};

const estadoApp = { 
    usuarioActivo: null, 
    datos: [], 
    datosModificados: {},
    intentosLogin: 0,
    maxIntentos: 3
};

const elementosDOM = {};

document.addEventListener('DOMContentLoaded', () => {
    inicializarElementos();
    configurarEventListeners();
});

function inicializarElementos() {
    const elementosIds = [
        'formulario-admin', 'admin-codigo', 'error-admin-codigo', 'admin-panel', 
        'admin-usuario-activo', 'btn-cerrar-sesion', 'btn-generar-listado', 
        'total-registros', 'total-directa', 'total-prototipo', 'total-carreras', 
        'buscador-admin', 'filtro-turno', 'filtro-carrera', 'filtro-grupo', 
        'filtro-tipo', 'reporte-admin', 'modal-detalle', 'documentos-admin',
        'modal-documentos', 'lista-documentos', 'info-estudiante-docs'
    ];
    
    elementosIds.forEach(id => {
        const clave = id.replace(/-./g, match => match[1].toUpperCase());
        elementosDOM[clave] = document.getElementById(id);
    });
    
    elementosDOM.modalCerrar = document.querySelector('.modal-cerrar');
}

function configurarEventListeners() {
    elementosDOM.formularioAdmin?.addEventListener('submit', manejarLogin);
    elementosDOM.btnCerrarSesion?.addEventListener('click', cerrarSesion);
    elementosDOM.btnGenerarListado?.addEventListener('click', mostrarListadoCompleto);
    
    [elementosDOM.buscadorAdmin, elementosDOM.filtroTurno, elementosDOM.filtroCarrera, 
     elementosDOM.filtroGrupo, elementosDOM.filtroTipo].forEach(elemento => {
        elemento?.addEventListener('input', aplicarFiltros);
    });
    
    elementosDOM.modalCerrar?.addEventListener('click', cerrarModalDetalle);
}

function manejarLogin(evento) {
    evento.preventDefault();
    const codigo = elementosDOM.adminCodigo.value.trim();
    
    if (!codigo) {
        mostrarError('El código de acceso es obligatorio');
        return;
    }
    
    if (estadoApp.intentosLogin >= estadoApp.maxIntentos) {
        mostrarError('Demasiados intentos fallidos. Por favor, recargue la página.');
        return;
    }
    
    if (codigo === CONFIG.codigoAcceso) {
        iniciarSesion();
    } else {
        estadoApp.intentosLogin++;
        const intentosRestantes = estadoApp.maxIntentos - estadoApp.intentosLogin;
        mostrarError(`Código incorrecto. Intentos restantes: ${intentosRestantes}`);
        
        if (estadoApp.intentosLogin >= estadoApp.maxIntentos) {
            elementosDOM.adminCodigo.disabled = true;
            elementosDOM.btnAdminIniciar.disabled = true;
        }
    }
}

function mostrarError(mensaje) {
    elementosDOM.errorAdminCodigo.textContent = mensaje;
    elementosDOM.errorAdminCodigo.style.display = 'block';
    elementosDOM.errorAdminCodigo.style.animation = 'shake 0.5s ease-in-out';
    
    setTimeout(() => {
        elementosDOM.errorAdminCodigo.style.animation = '';
    }, 500);
}

function iniciarSesion() {
    estadoApp.usuarioActivo = 'Administrador';
    estadoApp.intentosLogin = 0;
    
    document.querySelector('.contenedor-inicio-sesion').style.display = 'none';
    elementosDOM.adminPanel.style.display = 'block';
    elementosDOM.adminUsuarioActivo.textContent = estadoApp.usuarioActivo;
    
    cargarDatos();
    actualizarEstadisticas();
}

function cerrarSesion() {
    if (Object.keys(estadoApp.datosModificados).length > 0) {
        if (!confirm('Tiene cambios sin guardar. ¿Está seguro de cerrar sesión?')) {
            return;
        }
    }
    location.reload();
}

function cargarDatos() {
    try {
        const datosCompletos = localStorage.getItem('formulariosCompletos');
        const datosUsuarios = localStorage.getItem('formulariosUsuarios');
        
        if (datosCompletos && datosCompletos !== 'null' && datosCompletos !== 'undefined') {
            estadoApp.datos = JSON.parse(datosCompletos);
        } else if (datosUsuarios && datosUsuarios !== 'null' && datosUsuarios !== 'undefined') {
            const datosParseados = JSON.parse(datosUsuarios);
            if (Array.isArray(datosParseados)) {
                estadoApp.datos = datosParseados.map(formatearRegistro);
                localStorage.setItem('formulariosCompletos', JSON.stringify(estadoApp.datos));
            } else {
                estadoApp.datos = [];
            }
        } else {
            estadoApp.datos = [];
        }
        
        cargarOpcionesFiltros();
        aplicarFiltros();
        actualizarEstadisticas();
        cargarDocumentos();
        
    } catch (error) {
        console.error('Error cargando datos:', error);
        estadoApp.datos = [];
        alert('Error al cargar los datos. Por favor, recargue la página.');
    }
}

function generarIdUnico() {
    return `registro-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function formatearRegistro(item) {
    return {
        id: item.id || generarIdUnico(),
        nombre: item.nombre || '',
        primer_apellido: item.primer_apellido || '',
        segundo_apellido: item.segundo_apellido || '',
        numero_control: item.no_de_control || item.numero_control || '',
        municipio_nacimiento: item.municipio_nacimiento || '',
        estado_nacimiento: item.estado_nacimiento || '',
        tipo_titulacion: item.tipo_titulacion || '',
        curp: item.curp || '',
        folio_secundaria: item.folio_secundaria || '',
        folio_bachillerato: item.folio_bachillerato || '',
        fecha_nacimiento: item.fecha_nacimiento || '',
        especialidad: item.especialidad || '',
        turno: item.turno || '',
        grupo: item.grupo || '',
        correo_electronico: item.correo_electronico || '',
        nombre_proyecto: item.nombre_proyecto || '',
        asesor: item.asesor || '',
        empresa: item.empresa || '',
        puesto: item.puesto || '',
        fecha_registro: item.fecha_registro || new Date().toISOString(),
        documentos: item.documentos || {}
    };
}

function actualizarEstadisticas() {
    const datos = estadoApp.datos;
    elementosDOM.totalRegistros.textContent = datos.length;
    elementosDOM.totalDirecta.textContent = datos.filter(x => x.tipo_titulacion === 'directa').length;
    elementosDOM.totalPrototipo.textContent = datos.filter(x => x.tipo_titulacion === 'prototipo').length;
    elementosDOM.totalCarreras.textContent = new Set(datos.map(x => x.especialidad).filter(Boolean)).size;
}

function cargarOpcionesFiltros() {
    const cargarFiltro = (elemento, propiedad) => {
        if (!elemento) return;
        const opciones = [...new Set(estadoApp.datos.map(d => d[propiedad]).filter(Boolean))];
        elemento.innerHTML = '<option value="">Todos</option>' + 
            opciones.map(valor => `<option value="${escapeHtml(valor)}">${escapeHtml(valor)}</option>`).join('');
    };
    
    cargarFiltro(elementosDOM.filtroTurno, 'turno');
    cargarFiltro(elementosDOM.filtroCarrera, 'especialidad');
    cargarFiltro(elementosDOM.filtroGrupo, 'grupo');
}

function aplicarFiltros() {
    const filtros = {
        busqueda: elementosDOM.buscadorAdmin?.value.toLowerCase() || '',
        turno: elementosDOM.filtroTurno?.value || '',
        carrera: elementosDOM.filtroCarrera?.value || '',
        grupo: elementosDOM.filtroGrupo?.value || '',
        tipo: elementosDOM.filtroTipo?.value || ''
    };
    
    const datosFiltrados = estadoApp.datos.filter(dato => 
        (!filtros.busqueda || 
         [dato.nombre, dato.numero_control, dato.correo_electronico, dato.primer_apellido, dato.segundo_apellido]
            .some(valor => valor?.toString().toLowerCase().includes(filtros.busqueda))) &&
        (!filtros.turno || dato.turno === filtros.turno) &&
        (!filtros.carrera || dato.especialidad === filtros.carrera) &&
        (!filtros.grupo || dato.grupo === filtros.grupo) &&
        (!filtros.tipo || dato.tipo_titulacion === filtros.tipo)
    );
    
    renderizarLista(datosFiltrados);
}

function renderizarLista(datos) {
    if (!elementosDOM.reporteAdmin) return;
    
    if (datos.length === 0) {
        elementosDOM.reporteAdmin.innerHTML = '<div class="sin-resultados">No se encontraron resultados.</div>';
        return;
    }
    
    const agrupados = {
        'Titulación Directa': datos.filter(d => d.tipo_titulacion === 'directa'),
        'Prototipo': datos.filter(d => d.tipo_titulacion === 'prototipo'),
        'Otros': datos.filter(d => !d.tipo_titulacion || !['directa','prototipo'].includes(d.tipo_titulacion))
    };
    
    elementosDOM.reporteAdmin.innerHTML = Object.entries(agrupados).map(([titulo, grupo]) => 
        grupo.length ? `<h3 class="seccion-titulo">${titulo} (${grupo.length})</h3>${generarHTMLGrupo(grupo)}` : ''
    ).join('');
}

function generarHTMLGrupo(datos) {
    return datos.map(dato => {
        const [clase, texto] = 
            dato.tipo_titulacion === 'directa' ? ['badge-directa', 'Directa'] : 
            dato.tipo_titulacion === 'prototipo' ? ['badge-prototipo', 'Prototipo'] : 
            ['badge-otro', 'Otro'];
        
        const tieneDocumentos = dato.documentos && Object.keys(dato.documentos).length > 0;
        const botonDocumentos = tieneDocumentos ? 
            `<button class="btn-documentos" onclick="verDocumentos('${dato.id}')">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                </svg>
                Ver Documentos
            </button>` : '';
        
        return `
            <div class="reporte-card">
                <div class="titulo">${escapeHtml(dato.nombre)} <span class="badge ${clase}">${texto}</span></div>
                <div class="detalle">
                    <b>No. Control:</b> ${escapeHtml(dato.numero_control)} &nbsp; 
                    <b>Turno:</b> ${escapeHtml(dato.turno || '-')} &nbsp; 
                    <b>Especialidad:</b> ${escapeHtml(dato.especialidad || '-')}<br>
                    <b>Correo:</b> ${escapeHtml(dato.correo_electronico || '-')}
                </div>
                <div class="acciones-card">
                    <button class="btn-ver" onclick="verDetalleCompleto('${dato.id}')">
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                        Ver Detalle
                    </button>
                    ${botonDocumentos}
                    <button class="btn-eliminar" onclick="eliminarRegistro('${dato.id}')">
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                        Eliminar
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// =============================================
// Gestión de Documentos
// =============================================

function cargarDocumentos() {
    const documentosContainer = elementosDOM.documentosAdmin;
    const datos = estadoApp.datos;
    
    if (datos.length === 0) {
        documentosContainer.innerHTML = '<div class="sin-resultados">No hay documentos cargados</div>';
        return;
    }
    
    const estudiantesConDocumentos = datos.filter(estudiante => 
        estudiante.documentos && Object.keys(estudiante.documentos).length > 0
    );
    
    if (estudiantesConDocumentos.length === 0) {
        documentosContainer.innerHTML = '<div class="sin-resultados">No hay documentos cargados</div>';
        return;
    }
    
    let html = '';
    estudiantesConDocumentos.forEach(estudiante => {
        const numDocumentos = Object.keys(estudiante.documentos).length;
        html += `
            <div class="documento-card">
                <div class="documento-info">
                    <strong>${escapeHtml(estudiante.nombre)} ${escapeHtml(estudiante.primer_apellido)} ${escapeHtml(estudiante.segundo_apellido || '')}</strong>
                    <div>Control: ${escapeHtml(estudiante.numero_control)}</div>
                    <div>Especialidad: ${escapeHtml(estudiante.especialidad)}</div>
                    <div>Documentos: ${numDocumentos}</div>
                </div>
                <div class="documento-acciones">
                    <button class="btn-documentos" onclick="verDocumentos('${estudiante.id}')">
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                        </svg>
                        Ver Documentos
                    </button>
                </div>
            </div>
        `;
    });
    
    documentosContainer.innerHTML = html;
}

function verDocumentos(id) {
    const estudiante = estadoApp.datos.find(e => e.id === id);
    if (!estudiante || !estudiante.documentos) {
        alert('No se encontraron documentos para este estudiante');
        return;
    }
    
    // Mostrar información del estudiante
    elementosDOM.infoEstudianteDocs.innerHTML = `
        <h3>${escapeHtml(estudiante.nombre)} ${escapeHtml(estudiante.primer_apellido)} ${escapeHtml(estudiante.segundo_apellido || '')}</h3>
        <div><strong>Número de Control:</strong> ${escapeHtml(estudiante.numero_control)}</div>
        <div><strong>Especialidad:</strong> ${escapeHtml(estudiante.especialidad)}</div>
        <div><strong>Correo:</strong> ${escapeHtml(estudiante.correo_electronico)}</div>
    `;
    
    // Mostrar lista de documentos
    const listaDocumentos = elementosDOM.listaDocumentos;
    let html = '';
    
    Object.keys(estudiante.documentos).forEach(fileId => {
        const archivoData = localStorage.getItem(fileId);
        if (archivoData) {
            try {
                const archivo = JSON.parse(archivoData);
                html += `
                    <div class="documento-item">
                        <div class="documento-nombre">${escapeHtml(archivo.nombre)}</div>
                        <div class="documento-acciones">
                            <button class="btn-descargar" onclick="descargarDocumento('${fileId}')">
                                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                                </svg>
                                Descargar
                            </button>
                            <button class="btn-ver-doc" onclick="verDocumento('${fileId}')">
                                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                                </svg>
                                Ver
                            </button>
                        </div>
                    </div>
                `;
            } catch (error) {
                console.error('Error procesando documento:', error);
            }
        }
    });
    
    listaDocumentos.innerHTML = html || '<div class="sin-resultados">No se pudieron cargar los documentos</div>';
    elementosDOM.modalDocumentos.style.display = 'block';
}

function descargarDocumento(fileId) {
    const archivoData = localStorage.getItem(fileId);
    if (!archivoData) {
        alert('Documento no encontrado');
        return;
    }
    
    try {
        const archivo = JSON.parse(archivoData);
        const link = document.createElement('a');
        link.href = archivo.datos;
        link.download = archivo.nombre;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error descargando documento:', error);
        alert('Error al descargar el documento');
    }
}

function verDocumento(fileId) {
    const archivoData = localStorage.getItem(fileId);
    if (!archivoData) {
        alert('Documento no encontrado');
        return;
    }
    
    try {
        const archivo = JSON.parse(archivoData);
        
        if (archivo.tipo === 'application/pdf') {
            const ventana = window.open();
            ventana.document.write(`
                <html>
                    <head><title>${archivo.nombre}</title></head>
                    <body style="margin:0;">
                        <iframe src="${archivo.datos}" width="100%" height="100%" style="border:none;"></iframe>
                    </body>
                </html>
            `);
        } else if (archivo.tipo.startsWith('image/')) {
            const ventana = window.open();
            ventana.document.write(`
                <html>
                    <head><title>${archivo.nombre}</title></head>
                    <body style="margin:0; display:flex; justify-content:center; align-items:center; height:100vh; background:#f5f5f5;">
                        <img src="${archivo.datos}" style="max-width:100%; max-height:100%;" alt="${archivo.nombre}">
                    </body>
                </html>
            `);
        } else {
            descargarDocumento(fileId);
        }
    } catch (error) {
        console.error('Error viendo documento:', error);
        alert('Error al visualizar el documento');
    }
}

function descargarTodosDocumentos() {
    alert('Función de descarga múltiple en desarrollo. Por ahora, descargue los documentos individualmente.');
}

function cerrarModalDocumentos() {
    elementosDOM.modalDocumentos.style.display = 'none';
}

// =============================================
// Listado Completo y Exportación a Excel
// =============================================

function mostrarListadoCompleto() {
    const cuerpoTabla = document.getElementById('cuerpo-tabla-listado');
    if (!cuerpoTabla) {
        console.error('Elemento cuerpo-tabla-listado no encontrado');
        return;
    }
    
    const datosFiltrados = estadoApp.datos.filter(d => 
        ['prototipo', 'directa'].includes(d.tipo_titulacion)
    );
    
    if (datosFiltrados.length === 0) {
        cuerpoTabla.innerHTML = `<tr><td colspan="13" class="no-data">No se encontraron registros de ProTOTIPO o DIRECTA</td></tr>`;
    } else {
        cuerpoTabla.innerHTML = datosFiltrados.map((formulario, indice) => {
            const [claseTipo, texto] = 
                formulario.tipo_titulacion === 'directa' ? ['badge-directa', 'Directa'] : 
                ['badge-prototipo', 'Prototipo'];
            
            const estiloInput = 'width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 12px;';
            
            return `
                <tr>
                    <td>${indice + 1}</td>
                    <td>${escapeHtml(formulario.nombre)}</td>
                    <td>${escapeHtml(formulario.primer_apellido)}</td>
                    <td>${escapeHtml(formulario.segundo_apellido || '')}</td>
                    <td>${escapeHtml(formulario.numero_control)}</td>
                    <td>${escapeHtml(formulario.municipio_nacimiento || '')}</td>
                    <td>${escapeHtml(formulario.estado_nacimiento || '')}</td>
                    <td><span class="badge ${claseTipo}">${texto}</span></td>
                    <td><input type="text" value="${escapeHtml(formulario.curp || '')}" style="${estiloInput}" onchange="actualizarCampoListado('${formulario.id}', 'curp', this.value)" placeholder="Ingresar CURP"></td>
                    <td><input type="text" value="${escapeHtml(formulario.folio_secundaria || '')}" style="${estiloInput}" onchange="actualizarCampoListado('${formulario.id}', 'folio_secundaria', this.value)" placeholder="Ingresar folio"></td>
                    <td><input type="text" value="${escapeHtml(formulario.folio_bachillerato || '')}" style="${estiloInput}" onchange="actualizarCampoListado('${formulario.id}', 'folio_bachillerato', this.value)" placeholder="Ingresar folio"></td>
                    <td><input type="date" value="${escapeHtml(formulario.fecha_nacimiento || '')}" style="${estiloInput}" onchange="actualizarCampoListado('${formulario.id}', 'fecha_nacimiento', this.value)"></td>
                    <td>${escapeHtml(formulario.especialidad || '')}</td>
                </tr>`;
        }).join('');
    }
    
    document.getElementById('modal-listado').style.display = 'block';
}

function cerrarModalListado() {
    if (Object.keys(estadoApp.datosModificados).length > 0) {
        if (!confirm('Tiene cambios sin guardar. ¿Está seguro de cerrar?')) {
            return;
        }
    }
    document.getElementById('modal-listado').style.display = 'none';
    estadoApp.datosModificados = {};
}

function actualizarCampoListado(id, campo, valor) {
    if (!estadoApp.datosModificados[id]) {
        estadoApp.datosModificados[id] = {};
    }
    estadoApp.datosModificados[id][campo] = valor;
    
    document.querySelectorAll(`input[onchange*="${id}"]`).forEach(input => {
        input.style.backgroundColor = '#fff3cd';
    });
}

function guardarTodosLosCambios() {
    if (Object.keys(estadoApp.datosModificados).length === 0) {
        alert('No hay cambios para guardar');
        return;
    }
    
    try {
        Object.keys(estadoApp.datosModificados).forEach(id => {
            const cambios = estadoApp.datosModificados[id];
            const indiceRegistro = estadoApp.datos.findIndex(d => d.id === id);
            
            if (indiceRegistro !== -1) {
                Object.assign(estadoApp.datos[indiceRegistro], cambios);
            }
        });
        
        localStorage.setItem('formulariosCompletos', JSON.stringify(estadoApp.datos));
        estadoApp.datosModificados = {};
        
        document.querySelectorAll('input[style*="background-color: #fff3cd"]').forEach(input => {
            input.style.backgroundColor = '';
        });
        
        alert('Todos los cambios han sido guardados correctamente');
        
    } catch (error) {
        console.error('Error guardando cambios:', error);
        alert('Error al guardar los cambios');
    }
}

function exportarListadoExcel() {
    try {
        // Crear datos para exportar desde los datos actuales
        const datosExportar = estadoApp.datos
            .filter(d => ['prototipo', 'directa'].includes(d.tipo_titulacion))
            .map((registro, index) => ({
                '#': index + 1,
                'Nombre(s)': registro.nombre || '',
                '1er Apellido': registro.primer_apellido || '',
                '2do Apellido': registro.segundo_apellido || '',
                'Número Control': registro.numero_control || '',
                'Municipio': registro.municipio_nacimiento || '',
                'Estado': registro.estado_nacimiento || '',
                'Tipo Titulación': registro.tipo_titulacion === 'directa' ? 'Directa' : 'Prototipo',
                'CURP': registro.curp || '',
                'Folio Secundaria': registro.folio_secundaria || '',
                'Folio Bachillerato': registro.folio_bachillerato || '',
                'Fecha Nacimiento': registro.fecha_nacimiento || '',
                'Especialidad': registro.especialidad || ''
            }));

        if (datosExportar.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(datosExportar);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Listado Formularios");
        
        // Ajustar el ancho de las columnas
        const colWidths = [
            { wch: 5 },   // #
            { wch: 20 },  // Nombre(s)
            { wch: 15 },  // 1er Apellido
            { wch: 15 },  // 2do Apellido
            { wch: 15 },  // Número Control
            { wch: 15 },  // Municipio
            { wch: 15 },  // Estado
            { wch: 15 },  // Tipo Titulación
            { wch: 20 },  // CURP
            { wch: 15 },  // Folio Secundaria
            { wch: 15 },  // Folio Bachillerato
            { wch: 15 },  // Fecha Nacimiento
            { wch: 20 }   // Especialidad
        ];
        worksheet['!cols'] = colWidths;

        XLSX.writeFile(workbook, `listado_formularios_${new Date().toISOString().split('T')[0]}.xlsx`);
        
        alert('Listado exportado correctamente a Excel');
        
    } catch (error) {
        console.error('Error exportando a Excel:', error);
        alert('Error al exportar a Excel: ' + error.message);
    }
}

function escapeHtml(texto) {
    if (!texto) return '';
    return texto.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// =============================================
// Funciones globales
// =============================================

window.verDetalleCompleto = function(id) {
    const registro = estadoApp.datos.find(x => x.id === id);
    if (!registro) {
        alert('Registro no encontrado');
        return;
    }
    
    let contenido = `
        <div class="detalle-registro">
            <div class="seccion-detalle">
                <h3>Información Personal</h3>
                <div class="detalle-grid">
                    <div class="detalle-item"><label>Nombre:</label><span>${escapeHtml(registro.nombre)} ${escapeHtml(registro.primer_apellido)} ${escapeHtml(registro.segundo_apellido || '')}</span></div>
                    <div class="detalle-item"><label>No. Control:</label><span>${escapeHtml(registro.numero_control)}</span></div>
                    <div class="detalle-item"><label>Correo:</label><span>${escapeHtml(registro.correo_electronico)}</span></div>
                    <div class="detalle-item"><label>Fecha Nacimiento:</label><span>${escapeHtml(registro.fecha_nacimiento || 'No registrada')}</span></div>
                    <div class="detalle-item"><label>CURP:</label><span>${escapeHtml(registro.curp || 'No registrada')}</span></div>
                    <div class="detalle-item"><label>Folio Secundaria:</label><span>${escapeHtml(registro.folio_secundaria || 'No registrado')}</span></div>
                    <div class="detalle-item"><label>Folio Bachillerato:</label><span>${escapeHtml(registro.folio_bachillerato || 'No registrado')}</span></div>
                </div>
            </div>
            <div class="seccion-detalle">
                <h3>Información Académica</h3>
                <div class="detalle-grid">
                    <div class="detalle-item"><label>Turno:</label><span>${escapeHtml(registro.turno || '-')}</span></div>
                    <div class="detalle-item"><label>Especialidad:</label><span>${escapeHtml(registro.especialidad)}</span></div>
                    <div class="detalle-item"><label>Grupo:</label><span>${escapeHtml(registro.grupo || '-')}</span></div>
                    <div class="detalle-item"><label>Tipo:</label><span>${registro.tipo_titulacion === 'directa' ? 'Directa' : registro.tipo_titulacion === 'prototipo' ? 'Prototipo' : 'Otro'}</span></div>
                </div>
            </div>`;
    
    if (registro.tipo_titulacion === 'directa') {
        contenido += `
            <div class="seccion-detalle">
                <h3>Información de Titulación Directa</h3>
                <div class="detalle-grid">
                    <div class="detalle-item"><label>Empresa:</label><span>${escapeHtml(registro.empresa || '-')}</span></div>
                    <div class="detalle-item"><label>Puesto:</label><span>${escapeHtml(registro.puesto || '-')}</span></div>
                </div>
            </div>`;
    } else if (registro.tipo_titulacion === 'prototipo') {
        contenido += `
            <div class="seccion-detalle">
                <h3>Información de Prototipo</h3>
                <div class="detalle-grid">
                    <div class="detalle-item"><label>Proyecto:</label><span>${escapeHtml(registro.nombre_proyecto || '-')}</span></div>
                    <div class="detalle-item"><label>Asesor:</label><span>${escapeHtml(registro.asesor || '-')}</span></div>
                </div>
            </div>`;
    }
    
    if (registro.documentos && Object.keys(registro.documentos).length > 0) {
        contenido += `
            <div class="seccion-detalle">
                <h3>Documentos Entregados</h3>
                <div class="detalle-grid">
                    <div class="detalle-item">
                        <label>Documentos:</label>
                        <span>${Object.keys(registro.documentos).length} documentos cargados</span>
                    </div>
                    <div class="detalle-item">
                        <label></label>
                        <span><button class="btn-ver" onclick="verDocumentos('${registro.id}')">Ver Documentos</button></span>
                    </div>
                </div>
            </div>`;
    }
    
    document.querySelector('.modal-body').innerHTML = contenido + '</div>';
    elementosDOM.modalDetalle.style.display = 'block';
};

function cerrarModalDetalle() {
    elementosDOM.modalDetalle.style.display = 'none';
}

window.eliminarRegistro = function(id) {
    if (!confirm('¿Está seguro de eliminar este registro? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        const registro = estadoApp.datos.find(d => d.id === id);
        
        if (registro && registro.documentos) {
            Object.keys(registro.documentos).forEach(fileId => {
                localStorage.removeItem(fileId);
            });
        }
        
        const nuevosDatos = estadoApp.datos.filter(d => d.id !== id);
        estadoApp.datos = nuevosDatos;
        
        localStorage.setItem('formulariosCompletos', JSON.stringify(nuevosDatos));
        
        aplicarFiltros();
        actualizarEstadisticas();
        cargarDocumentos();
        
        alert('Registro eliminado correctamente');
        
    } catch (error) {
        console.error('Error eliminando registro:', error);
        alert('Error al eliminar el registro');
    }
};

// Asignar funciones globales
window.cerrarModalListado = cerrarModalListado;
window.actualizarCampoListado = actualizarCampoListado;
window.guardarTodosLosCambios = guardarTodosLosCambios;
window.exportarListadoExcel = exportarListadoExcel;
window.verDocumentos = verDocumentos;
window.descargarDocumento = descargarDocumento;
window.verDocumento = verDocumento;
window.cerrarModalDocumentos = cerrarModalDocumentos;
window.descargarTodosDocumentos = descargarTodosDocumentos;

// Animación de shake para errores
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);