// Configuración del sistema
const CONFIG = {
    sistemaActivo: true,
    periodo: {
        inicio: '2025-08-01',
        fin: '2025-09-30'
    },
    passwordAdmin: 'admin2024' // PIN que solicitaste
};

// Estado de la aplicación
const estadoApp = {
    solicitudes: [],
    mensajes: [],
    usuario: 'Administrador',
    autenticado: false
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    verificarAutenticacion();
    configurarEventListenersLogin();
});

function verificarAutenticacion() {
    const auth = localStorage.getItem('adminAuth');
    if (auth === 'true') {
        estadoApp.autenticado = true;
        mostrarPanelAdmin();
    } else {
        mostrarLogin();
    }
}

function configurarEventListenersLogin() {
    // Botón de login
    document.getElementById('btn-login').addEventListener('click', verificarLogin);
    
    // Enter en el input de PIN
    document.getElementById('pin-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            verificarLogin();
        }
    });
}

function verificarLogin() {
    const pinInput = document.getElementById('pin-input');
    const errorMsg = document.getElementById('login-error');
    const pin = pinInput.value.trim();
    
    if (pin === CONFIG.passwordAdmin) {
        // Login exitoso
        estadoApp.autenticado = true;
        localStorage.setItem('adminAuth', 'true');
        mostrarPanelAdmin();
    } else {
        // Login fallido
        errorMsg.classList.remove('hidden');
        pinInput.value = '';
        pinInput.focus();
        
        // Efecto de vibración en el input
        pinInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
            pinInput.style.animation = '';
        }, 500);
    }
}

function mostrarPanelAdmin() {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('admin-content').classList.remove('hidden');
    
    // Inicializar el panel de administración
    inicializarAdmin();
    cargarDatos();
    configurarEventListeners();
    actualizarUI();
}

function mostrarLogin() {
    document.getElementById('login-container').classList.remove('hidden');
    document.getElementById('admin-content').classList.add('hidden');
    document.getElementById('pin-input').focus();
}

function cerrarSesion() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        estadoApp.autenticado = false;
        localStorage.removeItem('adminAuth');
        mostrarLogin();
    }
}

function inicializarAdmin() {
    // Cargar configuración del sistema
    const configGuardada = localStorage.getItem('configSistema');
    if (configGuardada) {
        Object.assign(CONFIG, JSON.parse(configGuardada));
    }
}

function cargarDatos() {
    // Cargar solicitudes
    const solicitudesGuardadas = localStorage.getItem('solicitudesServicioSocial');
    if (solicitudesGuardadas) {
        estadoApp.solicitudes = JSON.parse(solicitudesGuardadas);
    }
    
    // Cargar mensajes
    const mensajesGuardados = localStorage.getItem('mensajesContacto');
    if (mensajesGuardados) {
        estadoApp.mensajes = JSON.parse(mensajesGuardados);
        actualizarBuzon();
    }
    
    // Cargar opciones de filtros
    cargarOpcionesFiltros();
    actualizarEstadisticas();
    actualizarTablaSolicitudes();
}

function guardarDatos() {
    localStorage.setItem('solicitudesServicioSocial', JSON.stringify(estadoApp.solicitudes));
    localStorage.setItem('mensajesContacto', JSON.stringify(estadoApp.mensajes));
    localStorage.setItem('configSistema', JSON.stringify(CONFIG));
}

function configurarEventListeners() {
    // Botón de logout
    document.getElementById('btn-logout').addEventListener('click', function(e) {
        e.preventDefault();
        cerrarSesion();
    });
    
    // Control del sistema
    document.getElementById('btn-toggle-system').addEventListener('click', toggleSistema);
    document.getElementById('btn-config-period').addEventListener('click', mostrarConfigPeriodo);
    document.getElementById('btn-guardar-periodo').addEventListener('click', guardarPeriodo);
    document.getElementById('btn-cancelar-periodo').addEventListener('click', ocultarConfigPeriodo);
    
    // Filtros
    document.getElementById('filtro-especialidad').addEventListener('change', actualizarTablaSolicitudes);
    document.getElementById('filtro-turno').addEventListener('change', actualizarTablaSolicitudes);
    document.getElementById('filtro-gobierno').addEventListener('change', actualizarTablaSolicitudes);
    document.getElementById('filtro-estado').addEventListener('change', actualizarTablaSolicitudes);
    document.getElementById('buscar-admin').addEventListener('input', actualizarTablaSolicitudes);
    
    // Listados
    document.getElementById('btn-generar-excel').addEventListener('click', exportarExcel);
    document.getElementById('btn-ver-listado').addEventListener('click', generarListado);
    
    // Modal
    document.getElementById('btn-cerrar-modal').addEventListener('click', cerrarModal);
    
    // Cerrar modal al hacer clic fuera
    document.getElementById('modal-detalle').addEventListener('click', function(e) {
        if (e.target === this) {
            cerrarModal();
        }
    });
}

// CONTROL DEL SISTEMA
function toggleSistema() {
    CONFIG.sistemaActivo = !CONFIG.sistemaActivo;
    guardarDatos();
    actualizarUI();
    
    const mensaje = CONFIG.sistemaActivo 
        ? 'Sistema activado correctamente' 
        : 'Sistema desactivado correctamente';
    
    alert(mensaje);
}

function mostrarConfigPeriodo() {
    document.getElementById('config-periodo').classList.remove('hidden');
    document.getElementById('fecha-inicio-periodo').value = CONFIG.periodo.inicio;
    document.getElementById('fecha-fin-periodo').value = CONFIG.periodo.fin;
}

function ocultarConfigPeriodo() {
    document.getElementById('config-periodo').classList.add('hidden');
}

function guardarPeriodo() {
    const inicio = document.getElementById('fecha-inicio-periodo').value;
    const fin = document.getElementById('fecha-fin-periodo').value;
    
    if (!inicio || !fin) {
        alert('Por favor, complete ambas fechas');
        return;
    }
    
    if (new Date(fin) <= new Date(inicio)) {
        alert('La fecha de fin debe ser posterior a la fecha de inicio');
        return;
    }
    
    CONFIG.periodo.inicio = inicio;
    CONFIG.periodo.fin = fin;
    guardarDatos();
    actualizarUI();
    ocultarConfigPeriodo();
    
    alert('Período actualizado correctamente');
}

function actualizarUI() {
    // Actualizar estado del sistema
    const statusText = document.getElementById('status-text');
    const statusPeriodo = document.getElementById('status-periodo');
    const toggleBtn = document.getElementById('btn-toggle-system');
    
    if (CONFIG.sistemaActivo) {
        statusText.textContent = 'SISTEMA ACTIVO';
        statusText.className = 'status-active';
        toggleBtn.textContent = 'Desactivar Sistema';
        toggleBtn.className = 'btn btn-warning';
    } else {
        statusText.textContent = 'SISTEMA INACTIVO';
        statusText.className = 'status-inactive';
        toggleBtn.textContent = 'Activar Sistema';
        toggleBtn.className = 'btn btn-success';
    }
    
    // Formatear período
    const inicio = new Date(CONFIG.periodo.inicio).toLocaleDateString('es-MX', {
        day: 'numeric', month: 'short'
    });
    const fin = new Date(CONFIG.periodo.fin).toLocaleDateString('es-MX', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
    
    statusPeriodo.textContent = `${inicio} - ${fin}`;
}

// GESTIÓN DE SOLICITUDES - CORREGIDO
function cargarOpcionesFiltros() {
    const especialidades = [...new Set(estadoApp.solicitudes.map(s => s.especialidad).filter(Boolean))];
    const filtroEspecialidad = document.getElementById('filtro-especialidad');
    const listadoEspecialidad = document.getElementById('listado-especialidad');
    
    // Limpiar opciones existentes (excepto la primera)
    while (filtroEspecialidad.children.length > 1) {
        filtroEspecialidad.removeChild(filtroEspecialidad.lastChild);
    }
    while (listadoEspecialidad.children.length > 1) {
        listadoEspecialidad.removeChild(listadoEspecialidad.lastChild);
    }
    
    especialidades.forEach(esp => {
        const option = document.createElement('option');
        option.value = esp;
        option.textContent = esp;
        filtroEspecialidad.appendChild(option.cloneNode(true));
        listadoEspecialidad.appendChild(option);
    });
}

function actualizarTablaSolicitudes() {
    const cuerpoTabla = document.getElementById('cuerpo-tabla-solicitudes');
    const filtros = obtenerFiltros();

    const solicitudesFiltradas = estadoApp.solicitudes.filter(solicitud => {
        const coincideEspecialidad = !filtros.especialidad || solicitud.especialidad === filtros.especialidad;
        const coincideTurno = !filtros.turno || solicitud.turno === filtros.turno;
        const coincideGobierno = !filtros.gobierno || solicitud.tipoGobierno === filtros.gobierno;
        const coincideBusqueda = !filtros.busqueda || 
            solicitud.nombre.toLowerCase().includes(filtros.busqueda) ||
            solicitud.numeroControl.includes(filtros.busqueda);

        return coincideEspecialidad && coincideTurno && coincideGobierno && coincideBusqueda;
    });

    cuerpoTabla.innerHTML = solicitudesFiltradas.map((solicitud, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${solicitud.nombre} ${solicitud.primerApellido} ${solicitud.segundoApellido || ''}</td>
            <td>${solicitud.numeroControl}</td>
            <td>${solicitud.especialidad}</td>
            <td>${solicitud.turno}</td>
            <td>${solicitud.institucion}</td>
            <td>${solicitud.tipoGobierno}</td>
            <td>${solicitud.fechaSolicitud}</td>
            <td>
                <button class="btn btn-secondary" onclick="verDetalles('${solicitud.id}')">
                    👁 Ver
                </button>
                <button class="btn btn-danger" onclick="eliminarSolicitud('${solicitud.id}')">
                    🗑 Eliminar
                </button>
            </td>
        </tr>
    `).join('');
}

function obtenerFiltros() {
    return {
        especialidad: document.getElementById('filtro-especialidad').value,
        turno: document.getElementById('filtro-turno').value,
        gobierno: document.getElementById('filtro-gobierno').value,
        estado: document.getElementById('filtro-estado').value,
        busqueda: document.getElementById('buscar-admin').value.toLowerCase()
    };
}

function verDetalles(id) {
    const solicitud = estadoApp.solicitudes.find(s => s.id === id);
    if (!solicitud) return;

    const modalBody = document.getElementById('modal-detalle-body');
    modalBody.innerHTML = `
        <div class="detalle-grid">
            <div class="detalle-item">
                <label>Nombre Completo:</label>
                <span>${solicitud.nombre} ${solicitud.primerApellido} ${solicitud.segundoApellido || ''}</span>
            </div>
            <div class="detalle-item">
                <label>Número de Control:</label>
                <span>${solicitud.numeroControl}</span>
            </div>
            <div class="detalle-item">
                <label>CURP:</label>
                <span>${solicitud.curp || 'No especificado'}</span>
            </div>
            <div class="detalle-item">
                <label>Especialidad:</label>
                <span>${solicitud.especialidad}</span>
            </div>
            <div class="detalle-item">
                <label>Turno:</label>
                <span>${solicitud.turno}</span>
            </div>
            <div class="detalle-item">
                <label>Grupo:</label>
                <span>${solicitud.grupo || 'No especificado'}</span>
            </div>
            <div class="detalle-item">
                <label>Institución:</label>
                <span>${solicitud.institucion}</span>
            </div>
            <div class="detalle-item">
                <label>Persona a Cargo:</label>
                <span>${solicitud.personaCargo || 'No especificado'}</span>
            </div>
            <div class="detalle-item">
                <label>Puesto:</label>
                <span>${solicitud.puesto || 'No especificado'}</span>
            </div>
            <div class="detalle-item">
                <label>Profesión:</label>
                <span>${solicitud.profesion || 'No especificado'}</span>
            </div>
            <div class="detalle-item">
                <label>Tipo de Gobierno:</label>
                <span>${solicitud.tipoGobierno}</span>
            </div>
            <div class="detalle-item">
                <label>Período:</label>
                <span>${solicitud.fechaInicio || 'No especificado'} - ${solicitud.fechaTermino || 'No especificado'}</span>
            </div>
            <div class="detalle-item" style="grid-column: 1 / -1;">
                <label>Actividades:</label>
                <span>${solicitud.actividades || 'No especificado'}</span>
            </div>
        </div>
    `;
    document.getElementById('modal-detalle').classList.remove('hidden');
}

function cerrarModal() {
    document.getElementById('modal-detalle').classList.add('hidden');
}

function eliminarSolicitud(id) {
    if (!confirm('¿Está seguro de eliminar esta solicitud? Esta acción no se puede deshacer.')) {
        return;
    }
    
    estadoApp.solicitudes = estadoApp.solicitudes.filter(s => s.id !== id);
    guardarDatos();
    actualizarTablaSolicitudes();
    actualizarEstadisticas();
    alert('Solicitud eliminada correctamente');
}

// GENERACIÓN DE LISTADOS
function generarListado() {
    const especialidad = document.getElementById('listado-especialidad').value;
    const turno = document.getElementById('listado-turno').value;
    const tipoGobierno = document.getElementById('listado-tipo-gobierno').value;
    
    const solicitudesFiltradas = estadoApp.solicitudes.filter(s => {
        return (
            (!especialidad || s.especialidad === especialidad) &&
            (!turno || s.turno === turno) &&
            (!tipoGobierno || s.tipoGobierno === tipoGobierno)
        );
    });
    
    const cuerpoListado = document.getElementById('cuerpo-listado');
    cuerpoListado.innerHTML = solicitudesFiltradas.map((s, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${s.nombre}</td>
            <td>${s.primerApellido}</td>
            <td>${s.segundoApellido || ''}</td>
            <td>${s.numeroControl}</td>
            <td>${s.institucion}</td>
            <td>${s.personaCargo || 'No especificado'}</td>
            <td>${s.puesto || 'No especificado'}</td>
            <td>${s.profesion || 'No especificado'}</td>
            <td>${s.tipoGobierno}</td>
        </tr>
    `).join('');
    
    document.getElementById('contenedor-listado').classList.remove('hidden');
}

function exportarExcel() {
    const especialidad = document.getElementById('listado-especialidad').value;
    const turno = document.getElementById('listado-turno').value;
    const tipoGobierno = document.getElementById('listado-tipo-gobierno').value;
    
    const solicitudesFiltradas = estadoApp.solicitudes.filter(s => {
        return (
            (!especialidad || s.especialidad === especialidad) &&
            (!turno || s.turno === turno) &&
            (!tipoGobierno || s.tipoGobierno === tipoGobierno)
        );
    });
    
    if (solicitudesFiltradas.length === 0) {
        alert('No hay datos para exportar');
        return;
    }
    
    const datosExportar = solicitudesFiltradas.map((s, index) => ({
        '#': index + 1,
        'Nombre': s.nombre,
        'Primer Apellido': s.primerApellido,
        'Segundo Apellido': s.segundoApellido || '',
        'Número Control': s.numeroControl,
        'Institución': s.institucion,
        'Persona a Cargo': s.personaCargo || 'No especificado',
        'Puesto': s.puesto || 'No especificado',
        'Profesión': s.profesion || 'No especificado',
        'Tipo Gobierno': s.tipoGobierno,
        'Especialidad': s.especialidad,
        'Turno': s.turno,
        'Fecha Solicitud': s.fechaSolicitud
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(datosExportar);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Listado Servicio Social');
    
    // Ajustar anchos de columna
    const colWidths = [
        { wch: 5 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
        { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 },
        { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 10 }, { wch: 12 }
    ];
    worksheet['!cols'] = colWidths;
    
    const nombreArchivo = `servicio_social_${especialidad || 'todos'}_${turno || 'todos'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, nombreArchivo);
}

// ESTADÍSTICAS - CORREGIDO
function actualizarEstadisticas() {
    document.getElementById('total-solicitudes').textContent = estadoApp.solicitudes.length;
    
    const hoy = new Date().toISOString().split('T')[0];
    const solicitudesHoy = estadoApp.solicitudes.filter(s => s.fechaSolicitud === hoy).length;
    document.getElementById('solicitudes-hoy').textContent = solicitudesHoy;
    
    // Calcular especialidad más solicitada
    const especialidadesCount = {};
    estadoApp.solicitudes.forEach(s => {
        if (s.especialidad) {
            especialidadesCount[s.especialidad] = (especialidadesCount[s.especialidad] || 0) + 1;
        }
    });
    
    let topEspecialidad = '-';
    let maxCount = 0;
    
    for (const [especialidad, count] of Object.entries(especialidadesCount)) {
        if (count > maxCount) {
            maxCount = count;
            topEspecialidad = especialidad;
        }
    }
    
    document.getElementById('top-especialidad').textContent = topEspecialidad;
}

// BUZÓN DE CONTACTO - FUNCIÓN FALTANTE
function actualizarBuzon() {
    const buzonContainer = document.getElementById('buzon-mensajes');
    
    if (estadoApp.mensajes.length === 0) {
        buzonContainer.innerHTML = '<p class="text-center">No hay mensajes en el buzón</p>';
        return;
    }
    
    buzonContainer.innerHTML = estadoApp.mensajes.map((mensaje, index) => `
        <div class="buzon-item">
            <div class="buzon-header">
                <span class="buzon-nombre">${mensaje.nombre || 'Anónimo'}</span>
                <span class="buzon-fecha">${mensaje.fecha || 'Fecha no disponible'}</span>
            </div>
            <div class="buzon-asunto">${mensaje.asunto || 'Sin asunto'}</div>
            <div class="buzon-mensaje">${mensaje.mensaje || 'Sin mensaje'}</div>
        </div>
    `).join('');
}

// Agregar animación de shake al CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);