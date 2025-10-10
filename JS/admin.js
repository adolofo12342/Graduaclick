const CONFIG = { codigoAcceso: '12345' };
const estadoApp = { usuarioActivo: null, datos: [], filtros: { buscador: '', turno: '', carrera: '', grupo: '', tipo: '' } };
const elementos = {};

document.addEventListener('DOMContentLoaded', () => {
    inicializarElementos();
    configurarEventListeners();
});

function inicializarElementos() {
    elementos.formularioAdmin = document.getElementById('formulario-admin');
    elementos.adminCodigo = document.getElementById('admin-codigo');
    elementos.errorAdminCodigo = document.getElementById('error-admin-codigo');
    elementos.adminPanel = document.getElementById('admin-panel');
    elementos.adminUsuarioActivo = document.getElementById('admin-usuario-activo');
    elementos.btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
    
    elementos.totalRegistros = document.getElementById('total-registros');
    elementos.totalDirecta = document.getElementById('total-directa');
    elementos.totalPrototipo = document.getElementById('total-prototipo');
    elementos.totalCarreras = document.getElementById('total-carreras');
    
    elementos.buscador = document.getElementById('buscador-admin');
    elementos.fTurno = document.getElementById('filtro-turno');
    elementos.fCarrera = document.getElementById('filtro-carrera');
    elementos.fGrupo = document.getElementById('filtro-grupo');
    elementos.fTipo = document.getElementById('filtro-tipo');
    
    elementos.reporteAdmin = document.getElementById('reporte-admin');
    elementos.modalDetalle = document.getElementById('modal-detalle');
    elementos.modalCerrar = document.querySelector('.modal-cerrar');
}

function configurarEventListeners() {
    elementos.formularioAdmin?.addEventListener('submit', manejarLogin);
    elementos.btnCerrarSesion?.addEventListener('click', () => location.reload());
    [elementos.buscador, elementos.fTurno, elementos.fCarrera, elementos.fGrupo, elementos.fTipo].forEach(e => e?.addEventListener('input', aplicarFiltros));
    elementos.modalCerrar?.addEventListener('click', cerrarModalDetalle);
}

function manejarLogin(e) {
    e.preventDefault();
    const codigo = elementos.adminCodigo.value.trim();
    elementos.errorAdminCodigo.textContent = !codigo ? 'El código de acceso es obligatorio' : 
        codigo === CONFIG.codigoAcceso ? (iniciarSesion(), '') : 'Código de acceso incorrecto';
}

function iniciarSesion() {
    estadoApp.usuarioActivo = 'Administrador';
    document.querySelector('.contenedor-inicio-sesion').style.display = 'none';
    elementos.adminPanel.style.display = 'block';
    elementos.adminUsuarioActivo.textContent = estadoApp.usuarioActivo;
    cargarDatos();
    actualizarEstadisticas();
}

function cargarDatos() {
    try {
        estadoApp.datos = JSON.parse(localStorage.getItem('formulariosUsuarios') || '[]');
        cargarOpcionesFiltros();
        aplicarFiltros();
        actualizarEstadisticas();
    } catch (error) {
        estadoApp.datos = [];
    }
}

function actualizarEstadisticas() {
    const datos = estadoApp.datos;
    
    if (elementos.totalRegistros) {
        elementos.totalRegistros.textContent = datos.length;
    }
    
    if (elementos.totalDirecta) {
        elementos.totalDirecta.textContent = datos.filter(d => d.tipo_titulacion === 'directa').length;
    }
    
    if (elementos.totalPrototipo) {
        elementos.totalPrototipo.textContent = datos.filter(d => d.tipo_titulacion === 'prototipo').length;
    }
    
    if (elementos.totalCarreras) {
        const carrerasUnicas = new Set(datos.map(d => d.especialidad).filter(Boolean));
        elementos.totalCarreras.textContent = carrerasUnicas.size;
    }
}

function cargarOpcionesFiltros() {
    const cargarFiltro = (elemento, prop) => {
        if (!elemento) return;
        const opciones = [...new Set(estadoApp.datos.map(d => d[prop]).filter(Boolean))];
        elemento.innerHTML = '<option value="">Todos</option>' + opciones.map(o => `<option value="${o}">${o}</option>`).join('');
    };
    
    cargarFiltro(elementos.fTurno, 'turno');
    cargarFiltro(elementos.fCarrera, 'especialidad');
    cargarFiltro(elementos.fGrupo, 'grupo');
}

function aplicarFiltros() {
    const filtros = {
        buscador: elementos.buscador?.value.toLowerCase() || '',
        turno: elementos.fTurno?.value || '',
        carrera: elementos.fCarrera?.value || '',
        grupo: elementos.fGrupo?.value || '',
        tipo: elementos.fTipo?.value || ''
    };
    
    const datosFiltrados = estadoApp.datos.filter(d => {
        if (filtros.buscador && ![d.nombre, d.no_de_control, d.correo_electronico].some(v => v?.toString().toLowerCase().includes(filtros.buscador))) return false;
        if (filtros.turno && d.turno !== filtros.turno) return false;
        if (filtros.carrera && d.especialidad !== filtros.carrera) return false;
        if (filtros.grupo && d.grupo !== filtros.grupo) return false;
        if (filtros.tipo && d.tipo_titulacion !== filtros.tipo) return false;
        return true;
    });
    
    renderizarLista(datosFiltrados);
}

function renderizarLista(datos) {
    if (!elementos.reporteAdmin) return;
    
    if (datos.length === 0) {
        elementos.reporteAdmin.innerHTML = '<div class="sin-resultados">No se encontraron resultados.</div>';
        return;
    }
    
    const grupos = {
        'Titulación Directa': datos.filter(d => d.tipo_titulacion === 'directa'),
        'Prototipo': datos.filter(d => d.tipo_titulacion === 'prototipo'),
        'Otros': datos.filter(d => !d.tipo_titulacion || !['directa','prototipo'].includes(d.tipo_titulacion))
    };
    
    elementos.reporteAdmin.innerHTML = Object.entries(grupos).map(([titulo, grupo]) => 
        grupo.length > 0 ? `<h3 class="seccion-titulo">${titulo} (${grupo.length})</h3>${generarHTMLLista(grupo)}` : ''
    ).join('');
}

function generarHTMLLista(datos) {
    return datos.map(d => {
        const tipo = d.tipo_titulacion;
        const badge = tipo === 'directa' ? ['badge-directa','Directa'] : 
                     tipo === 'prototipo' ? ['badge-prototipo','Prototipo'] : ['badge-otro','Otro'];
        
        return `
            <div class="reporte-card">
                <div class="titulo">${d.nombre} <span class="badge ${badge[0]}">${badge[1]}</span></div>
                <div class="detalle">
                    <b>No. Control:</b> ${d.no_de_control} &nbsp;
                    <b>Turno:</b> ${d.turno || '-'} &nbsp;
                    <b>Especialidad:</b> ${d.especialidad || '-'}<br>
                    <b>Correo:</b> ${d.correo_electronico || '-'}
                </div>
                <div class="acciones-card">
                    <button class="btn-ver" onclick="verDetalleCompleto(${d.id})">👁 Ver Detalle</button>
                    <button class="btn-eliminar" onclick="eliminarRegistro(${d.id})">🗑 Eliminar</button>
                </div>
            </div>
        `;
    }).join('');
}

window.verDetalleCompleto = function(id) {
    const registro = estadoApp.datos.find(x => x.id === id);
    if (!registro) return;
    
    let contenido = `
        <div class="detalle-registro">
            <div class="seccion-detalle">
                <h3>Información Personal</h3>
                <div class="detalle-grid">
                    <div class="detalle-item"><label>Nombre:</label><span>${registro.nombre}</span></div>
                    <div class="detalle-item"><label>No. Control:</label><span>${registro.no_de_control}</span></div>
                    <div class="detalle-item"><label>Correo:</label><span>${registro.correo_electronico}</span></div>
                    <div class="detalle-item"><label>Fecha:</label><span>${registro.fecha}</span></div>
                </div>
            </div>
            <div class="seccion-detalle">
                <h3>Información Académica</h3>
                <div class="detalle-grid">
                    <div class="detalle-item"><label>Turno:</label><span>${registro.turno || '-'}</span></div>
                    <div class="detalle-item"><label>Especialidad:</label><span>${registro.especialidad}</span></div>
                    <div class="detalle-item"><label>Grupo:</label><span>${registro.grupo || '-'}</span></div>
                    <div class="detalle-item"><label>Tipo:</label><span>${registro.tipo_titulacion === 'directa' ? 'Directa' : registro.tipo_titulacion === 'prototipo' ? 'Prototipo' : 'Otro'}</span></div>
                </div>
            </div>`;
    
    if (registro.tipo_titulacion === 'directa') {
        contenido += `
            <div class="seccion-detalle">
                <h3>Información de Titulación Directa</h3>
                <div class="detalle-grid">
                    <div class="detalle-item"><label>Empresa:</label><span>${registro.empresa || '-'}</span></div>
                    <div class="detalle-item"><label>Puesto:</label><span>${registro.puesto || '-'}</span></div>
                </div>
            </div>`;
    } else if (registro.tipo_titulacion === 'prototipo') {
        contenido += `
            <div class="seccion-detalle">
                <h3>Información de Prototipo</h3>
                <div class="detalle-grid">
                    <div class="detalle-item"><label>Proyecto:</label><span>${registro.nombre_proyecto || '-'}</span></div>
                    <div class="detalle-item"><label>Asesor:</label><span>${registro.asesor || '-'}</span></div>
                </div>
            </div>`;
    }
    
    if (registro.documentos && Object.keys(registro.documentos).length > 0) {
        contenido += `
            <div class="seccion-detalle">
                <h3>Documentos Adjuntos</h3>
                <div class="detalle-documentos">
                    ${Object.keys(registro.documentos).map(doc => `
                        <div class="documento-item">
                            <div class="documento-info">📄 <span>${doc}</span></div>
                            <div class="documento-acciones">
                                <button class="btn-inspeccionar" onclick="window.open('${registro.documentos[doc]}', '_blank')">Ver Archivo</button>
                                <button class="btn-baja" onclick="darDeBajaDocumento(${registro.id}, '${doc}')">Dar de Baja</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>`;
    }
    
    document.querySelector('.modal-body').innerHTML = contenido + '</div>';
    elementos.modalDetalle.style.display = 'block';
};

function cerrarModalDetalle() {
    elementos.modalDetalle.style.display = 'none';
}

window.darDeBajaDocumento = function(id, nombreDocumento) {
    if (!confirm(`¿Dar de baja "${nombreDocumento}"?`)) return;
    const datos = JSON.parse(localStorage.getItem('formulariosUsuarios') || '[]');
    const usuario = datos.find(u => u.id === id);
    if (usuario && usuario.documentos) {
        delete usuario.documentos[nombreDocumento];
        localStorage.setItem('formulariosUsuarios', JSON.stringify(datos));
        cargarDatos();
        verDetalleCompleto(id);
        alert('Documento dado de baja');
    }
};

window.eliminarRegistro = function(id) {
    if (!confirm('¿Eliminar registro? Esta acción no se puede deshacer.')) return;
    
    const nuevosDatos = estadoApp.datos.filter(d => d.id !== id);
    localStorage.setItem('formulariosUsuarios', JSON.stringify(nuevosDatos));
    cargarDatos();
    alert('Registro eliminado');
};