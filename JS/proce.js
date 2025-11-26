// LÓGICA ESPECÍFICA PARA LA PÁGINA DE PROCESO
class ProcesoSistema {
    constructor() {
        this.sistema = sistema;
        this.inicializar();
    }

    inicializar() {
        this.actualizarInfoPeriodo();
        this.iniciarCountdown();
        this.configurarEventListeners();
    }

    configurarEventListeners() {
        // Event listeners específicos de la página de proceso
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.actualizarInfoPeriodo();
            }
        });
    }

    actualizarInfoPeriodo() {
        const config = this.sistema.config;
        const fechaInicio = new Date(config.periodo.inicio);
        const fechaFin = new Date(config.periodo.fin);
        const hoy = new Date();

        // Actualizar fechas en la interfaz
        document.getElementById('fecha-inicio-proceso').textContent = 
            fechaInicio.toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

        document.getElementById('fecha-fin-proceso').textContent = 
            fechaFin.toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

        // Actualizar estado
        const estadoElement = document.getElementById('estado-proceso');
        if (config.sistemaActivo && hoy >= fechaInicio && hoy <= fechaFin) {
            estadoElement.textContent = 'ACTIVO';
            estadoElement.className = 'badge badge-success';
        } else if (!config.sistemaActivo) {
            estadoElement.textContent = 'SISTEMA DESACTIVADO';
            estadoElement.className = 'badge badge-error';
        } else if (hoy < fechaInicio) {
            estadoElement.textContent = 'PRÓXIMAMENTE';
            estadoElement.className = 'badge badge-warning';
        } else {
            estadoElement.textContent = 'FINALIZADO';
            estadoElement.className = 'badge badge-error';
        }
    }

    iniciarCountdown() {
        const updateCountdown = () => {
            const fechaFin = new Date(this.sistema.config.periodo.fin);
            const hoy = new Date();
            const diffTime = fechaFin - hoy;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const countdownElement = document.getElementById('dias-countdown');
            
            if (diffDays > 0) {
                countdownElement.textContent = diffDays;
                countdownElement.style.color = 'white';
            } else if (diffDays === 0) {
                countdownElement.textContent = 'ÚLTIMO DÍA';
                countdownElement.style.color = '#ffeb3b';
            } else {
                countdownElement.textContent = 'FINALIZADO';
                countdownElement.style.color = '#ff6b6b';
            }
        };

        // Actualizar inmediatamente y cada hora
        updateCountdown();
        setInterval(updateCountdown, 60 * 60 * 1000);
    }

    // Método para verificar si el período está activo
    verificarPeriodoActivo() {
        const config = this.sistema.config;
        const hoy = new Date();
        const fechaInicio = new Date(config.periodo.inicio);
        const fechaFin = new Date(config.periodo.fin);

        return config.sistemaActivo && hoy >= fechaInicio && hoy <= fechaFin;
    }

    // Método para obtener días restantes
    obtenerDiasRestantes() {
        const fechaFin = new Date(this.sistema.config.periodo.fin);
        const hoy = new Date();
        const diffTime = fechaFin - hoy;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Método para formatear fecha
    formatearFecha(fecha) {
        return fecha.toLocaleDateString('es-MX', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.procesoSistema = new ProcesoSistema();
    
    // Actualizar cada minuto para el countdown
    setInterval(() => {
        window.procesoSistema.actualizarInfoPeriodo();
    }, 60000);
});