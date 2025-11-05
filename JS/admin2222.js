// Datos y configuraciones
const CONFIG = { 
    codigoAcceso: 'admin123',
    registrosEjemplo: [
        {id: 1, nombre: "Juan", apellidos: "Pérez López", carrera: "Programación", turno: "Matutino", grupo: "4AVP", correo: "juan.perez@cetis120.edu.mx", institucion: "Secretaría de Educación", estado: "Pendiente"},
        {id: 2, nombre: "María", apellidos: "García Rodríguez", carrera: "Contabilidad", turno: "Vespertino", grupo: "4BVP", correo: "maria.garcia@cetis120.edu.mx", institucion: "Secretaría de Salud", estado: "En proceso"},
        {id: 3, nombre: "Carlos", apellidos: "Hernández Martínez", carrera: "Electrónica", turno: "Matutino", grupo: "4CVP", correo: "carlos.hernandez@cetis120.edu.mx", institucion: "Secretaría de Desarrollo Social", estado: "Completado"}
    ]
};

// Estado global
let registros = JSON.parse(localStorage.getItem('registrosServicioSocial')) || CONFIG.registrosEjemplo;
let registroEditando = null;
let tiempoHabilitacion = null;

// Referencias a elementos DOM
const elementos = {};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    inicializarElementos();
    configurarEventListeners();
    
    // Verificar si ya hay una sesión activa
    if (localStorage.getItem('adminSesionActiva') === 'true') {
        iniciarSesion();
    }
    
    // Cargar datos de habilitación si existen
    const habilitacionGuardada = localStorage.getItem('habilitacionCartas');
    if (habilitacionGuardada) {
        tiempoHabilitacion = JSON.parse(habilitacionGuardada);
        actualizarTiempoRestante();
    }
});

function inicializarElementos() {
    // Elementos de login
    elementos.formularioAdmin = document.getElementById('formulario-admin');
    elementos.adminCodigo = document.getElementById('admin-codigo');
    elementos.errorAdminCodigo = document.getElementById('error-admin-codigo');
    elementos.adminPanel = document.getElementById('admin-panel');
    elementos.adminUsuarioActivo = document.getElementById('admin-usuario-activo');
    elementos.btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
    
    // Elementos de estadísticas
    elementos.totalRegistros = document.getElementById('total-registros');
    elementos.totalProgramacion = document.getElementById('total-programacion');
    elementos.totalContabilidad = document.getElementById('total-contabilidad');
    elementos.totalElectronica = document.getElementById('total-electronica');
    
    // Elementos de habilitación
    elementos.btnHabilitar = document.getElementById('btn-habilitar');
    elementos.tiempoRestante = document.getElementById('tiempo-restante');
    
    // Elementos de filtros
    elementos.buscador = document.getElementById('buscador-admin');
    elementos.fTurno = document.getElementById('filtro-turno');
    elementos.fCarrera = document.getElementById('filtro-carrera');
    elementos.fGrupo = document.getElementById('filtro-grupo');
    
    // Elementos de resultados
    elementos.reporteAdmin = document.getElementById('reporte-admin');
    elementos.modalDetalle = document.getElementById('modal-detalle');
    elementos.modalCerrar = document.querySelector('.modal-cerrar');
    elementos.btnCerrarModal = document.getElementById('btn-cerrar-modal');
}

function configurarEventListeners() {
    elementos.formularioAdmin?.addEventListener('submit', manejarLogin);
    elementos.btnCerrarSesion?.addEventListener('click', cerrarSesion);
    elementos.btnHabilitar?.addEventListener('click', habilitarCartas);
    elementos.modalCerrar?.addEventListener('click', cerrarModalDetalle);
    elementos.btnCerrarModal?.addEventListener('click', cerrarModalDetalle);
    
    // Filtros
    [elementos.buscador, elementos.fTurno, elementos.fCarrera].forEach(el => 
        el?.addEventListener('change', aplicarFiltros));
    elementos.fGrupo?.addEventListener('input', aplicarFiltros);
}

function manejarLogin(e) {
    e.preventDefault();
    const codigo = elementos.adminCodigo.value.trim();
    
    if (!codigo) {
        elementos.errorAdminCodigo.textContent = 'El código de acceso es obligatorio';
        return;
    }
    
    if (codigo === CONFIG.codigoAcceso) {
        iniciarSesion();
        elementos.errorAdminCodigo.textContent = '';
    } else {
        elementos.errorAdminCodigo.textContent = 'Código de acceso incorrecto';
    }
}

function iniciarSesion() {
    localStorage.setItem('adminSesionActiva', 'true');
    document.querySelector('.contenedor-inicio-sesion').style.display = 'none';
    elementos.adminPanel.style.display = 'block';
    elementos.adminUsuarioActivo.textContent = 'Administrador';
    cargarDatos();
    actualizarEstadisticas();
}

function cerrarSesion() {
    localStorage.removeItem('adminSesionActiva');
    elementos.adminPanel.style.display = 'none';
    document.querySelector('.contenedor-inicio-sesion').style.display = 'block';
    elementos.adminCodigo.value = '';
    elementos.errorAdminCodigo.textContent = '';
}

function cargarDatos() {
    try {
        registros = JSON.parse(localStorage.getItem('registrosServicioSocial')) || CONFIG.registrosEjemplo;
        aplicarFiltros();
        actualizarEstadisticas();
    } catch (error) {
        registros = CONFIG.registrosEjemplo;
    }
}

function actualizarEstadisticas() {
    if (elementos.totalRegistros) {
        elementos.totalRegistros.textContent = registros.length;
    }
    
    if (elementos.totalProgramacion) {
        elementos.totalProgramacion.textContent = registros.filter(r => r.carrera === 'Programación').length;
    }
    
    if (elementos.totalContabilidad) {
        elementos.totalContabilidad.textContent = registros.filter(r => r.carrera === 'Contabilidad').length;
    }
    
    if (elementos.totalElectronica) {
        elementos.totalElectronica.textContent = registros.filter(r => r.carrera === 'Electrónica').length;
    }
}

function aplicarFiltros() {
    const buscador = elementos.buscador?.value.toLowerCase() || '';
    const turno = elementos.fTurno?.value || '';
    const carrera = elementos.fCarrera?.value || '';
    const grupo = elementos.fGrupo?.value.toLowerCase() || '';
    
    const datosFiltrados = registros.filter(registro => {
        if (buscador && ![registro.nombre, registro.apellidos, registro.correo].some(v => 
            v?.toString().toLowerCase().includes(buscador))) return false;
        if (turno && registro.turno !== turno) return false;
        if (carrera && registro.carrera !== carrera) return false;
        if (grupo && registro.grupo?.toLowerCase().includes(grupo) === false) return false;
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
    
    elementos.reporteAdmin.innerHTML = datos.map(registro => `
        <div class="reporte-card">
            <div class="titulo">${registro.nombre} ${registro.apellidos}</div>
            <div class="detalle">
                <b>Carrera:</b> ${registro.carrera} &nbsp;
                <b>Turno:</b> ${registro.turno || '-'} &nbsp;
                <b>Grupo:</b> ${registro.grupo || '-'}<br>
                <b>Correo:</b> ${registro.correo || '-'} &nbsp;
                <b>Institución:</b> ${registro.institucion || 'No asignada'}
            </div>
            <div class="acciones-card">
                <button class="btn-ver" onclick="verDetalleCompleto(${registro.id})">
                    <i class="fas fa-eye"></i> Ver Detalle
                </button>
                <button class="btn-editar" onclick="editarRegistro(${registro.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-eliminar" onclick="eliminarRegistro(${registro.id})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

window.verDetalleCompleto = function(id) {
    const registro = registros.find(r => r.id === id);
    if (!registro) return;
    
    const contenido = `
        <div class="detalle-registro">
            <div class="seccion-detalle">
                <h3>Información Personal</h3>
                <div class="detalle-grid">
                    <div class="detalle-item"><label>Nombre:</label><span>${registro.nombre}</span></div>
                    <div class="detalle-item"><label>Apellidos:</label><span>${registro.apellidos}</span></div>
                    <div class="detalle-item"><label>Correo:</label><span>${registro.correo}</span></div>
                </div>
            </div>
            <div class="seccion-detalle">
                <h3>Información Académica</h3>
                <div class="detalle-grid">
                    <div class="detalle-item"><label>Carrera:</label><span>${registro.carrera}</span></div>
                    <div class="detalle-item"><label>Turno:</label><span>${registro.turno || '-'}</span></div>
                    <div class="detalle-item"><label>Grupo:</label><span>${registro.grupo || '-'}</span></div>
                </div>
            </div>
            <div class="seccion-detalle">
                <h3>Servicio Social</h3>
                <div class="detalle-grid">
                    <div class="detalle-item"><label>Institución:</label><span>${registro.institucion || 'No asignada'}</span></div>
                    <div class="detalle-item"><label>Estado:</label><span>${registro.estado || 'Pendiente'}</span></div>
                </div>
            </div>
        </div>
    `;
    
    document.querySelector('.modal-body').innerHTML = contenido;
    elementos.modalDetalle.style.display = 'block';
};

function cerrarModalDetalle() {
    elementos.modalDetalle.style.display = 'none';
}

window.editarRegistro = function(id) {
    registroEditando = registros.find(r => r.id === id);
    if (registroEditando) {
        // Aquí iría la lógica para abrir un modal de edición
        // Por ahora, solo mostraremos un alert
        alert(`Editar registro de: ${registroEditando.nombre} ${registroEditando.apellidos}`);
    }
};

window.eliminarRegistro = function(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este registro?')) return;
    
    registros = registros.filter(r => r.id !== id);
    localStorage.setItem('registrosServicioSocial', JSON.stringify(registros));
    cargarDatos();
    alert('Registro eliminado correctamente');
};

function habilitarCartas() {
    const ahora = new Date();
    const finHabilitacion = new Date(ahora.getTime() + 4 * 60 * 60 * 1000);
    
    tiempoHabilitacion = {
        habilitado: true,
        fin: finHabilitacion.getTime()
    };
    
    localStorage.setItem('habilitacionCartas', JSON.stringify(tiempoHabilitacion));
    actualizarTiempoRestante();
    
    alert('La generación de cartas ha sido habilitada por 4 horas.');
}

function actualizarTiempoRestante() {
    if (!tiempoHabilitacion || !tiempoHabilitacion.habilitado) {
        elementos.tiempoRestante.textContent = 'No habilitado';
        return;
    }
    
    const ahora = new Date().getTime();
    const tiempoRestanteMs = tiempoHabilitacion.fin - ahora;
    
    if (tiempoRestanteMs <= 0) {
        elementos.tiempoRestante.textContent = 'No habilitado';
        localStorage.removeItem('habilitacionCartas');
        tiempoHabilitacion = null;
        return;
    }
    
    const horas = Math.floor(tiempoRestanteMs / (1000 * 60 * 60));
    const minutos = Math.floor((tiempoRestanteMs % (1000 * 60 * 60)) / (1000 * 60));
    
    elementos.tiempoRestante.textContent = `${horas} horas y ${minutos} minutos`;
    
    setTimeout(actualizarTiempoRestante, 60000);
}