// Variables globales
let currentStep = 1;
const totalSteps = 4;
let autoSaveTimeout;

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
});

// Inicializar el formulario
function initializeForm() {
    // Mostrar el primer paso
    showStep(currentStep);
    
    // Cargar datos guardados
    loadSavedData();
    
    // Configurar eventos de los botones
    document.getElementById('btn-next').addEventListener('click', nextStep);
    document.getElementById('btn-prev').addEventListener('click', prevStep);
    document.getElementById('form-solicitud-completo').addEventListener('submit', submitForm);
    document.getElementById('btn-load-data').addEventListener('click', loadSavedData);
    document.getElementById('btn-clear-data').addEventListener('click', clearSavedData);
    
    // Configurar validación en tiempo real
    setupRealTimeValidation();
    
    // Configurar guardado automático
    setupAutoSave();
    
    // Configurar fecha mínima para fecha de inicio (hoy)
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fecha-inicio').min = today;
    
    // Configurar dependencia entre fechas
    document.getElementById('fecha-inicio').addEventListener('change', function() {
        const fechaInicio = this.value;
        document.getElementById('fecha-termino').min = fechaInicio;
    });
}

// Configurar guardado automático
function setupAutoSave() {
    const fields = document.querySelectorAll('[data-save="true"]');
    
    fields.forEach(field => {
        field.addEventListener('input', function() {
            // Usar debounce para evitar guardar en cada tecla
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(() => {
                saveFormData();
                showSaveStatus('💾 Guardado automáticamente', 'saved');
            }, 1000);
            
            // Mostrar estado de guardando
            showSaveStatus('⏳ Guardando...', 'saving');
        });
        
        field.addEventListener('change', function() {
            saveFormData();
            showSaveStatus('💾 Guardado automáticamente', 'saved');
        });
    });
}

// Mostrar estado de guardado
function showSaveStatus(message, status) {
    const statusElement = document.getElementById('save-status');
    statusElement.textContent = message;
    statusElement.className = status;
}

// Guardar datos del formulario en Local Storage
function saveFormData() {
    const formData = getFormData();
    localStorage.setItem('cetis120_form_data', JSON.stringify(formData));
    localStorage.setItem('cetis120_last_save', new Date().toISOString());
}

// Cargar datos guardados del Local Storage
function loadSavedData() {
    const savedData = localStorage.getItem('cetis120_form_data');
    const lastSave = localStorage.getItem('cetis120_last_save');
    
    if (savedData) {
        try {
            const formData = JSON.parse(savedData);
            
            // Llenar los campos con los datos guardados
            for (const key in formData) {
                const field = document.getElementById(key);
                if (field && formData[key] !== null && formData[key] !== '') {
                    field.value = formData[key];
                    
                    // Disparar evento change para campos select
                    if (field.tagName === 'SELECT') {
                        field.dispatchEvent(new Event('change'));
                    }
                }
            }
            
            // Mostrar mensaje de éxito
            const lastSaveDate = lastSave ? new Date(lastSave).toLocaleString('es-MX') : 'desconocida';
            showAlert(`Datos cargados correctamente (Último guardado: ${lastSaveDate})`, 'success');
            
        } catch (error) {
            console.error('Error al cargar datos guardados:', error);
            showAlert('Error al cargar los datos guardados', 'error');
        }
    } else {
        showAlert('No hay datos guardados previamente', 'info');
    }
}

// Limpiar datos guardados
function clearSavedData() {
    if (confirm('¿Está seguro de que desea eliminar todos los datos guardados? Esta acción no se puede deshacer.')) {
        localStorage.removeItem('cetis120_form_data');
        localStorage.removeItem('cetis120_last_save');
        
        // Limpiar el formulario
        document.getElementById('form-solicitud-completo').reset();
        
        showAlert('Datos eliminados correctamente', 'success');
        showSaveStatus('💾 Listo para guardar', 'saved');
    }
}

// Obtener datos del formulario
function getFormData() {
    return {
        'primer-apellido': document.getElementById('primer-apellido').value,
        'segundo-apellido': document.getElementById('segundo-apellido').value,
        'nombre': document.getElementById('nombre').value,
        'edad': document.getElementById('edad').value,
        'sexo': document.getElementById('sexo').value,
        'domicilio': document.getElementById('domicilio').value,
        'colonia': document.getElementById('colonia').value,
        'cp': document.getElementById('cp').value,
        'telefono': document.getElementById('telefono').value,
        'especialidad': document.getElementById('especialidad').value,
        'semestre': document.getElementById('semestre').value,
        'grupo': document.getElementById('grupo').value,
        'turno': document.getElementById('turno').value,
        'numero-control': document.getElementById('numero-control').value,
        'curp': document.getElementById('curp').value,
        'fecha-inicio': document.getElementById('fecha-inicio').value,
        'fecha-termino': document.getElementById('fecha-termino').value,
        'institucion': document.getElementById('institucion').value,
        'persona-cargo': document.getElementById('persona-cargo').value,
        'puesto': document.getElementById('puesto').value,
        'profesion': document.getElementById('profesion').value,
        'direccion-institucion': document.getElementById('direccion-institucion').value,
        'telefono-institucion': document.getElementById('telefono-institucion').value,
        'tipo-gobierno': document.getElementById('tipo-gobierno').value,
        'actividades': document.getElementById('actividades').value
    };
}

// Mostrar un paso específico
function showStep(step) {
    // Ocultar todos los pasos
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar el paso actual
    document.getElementById(`step-${step}`).classList.add('active');
    
    // Actualizar indicadores de pasos
    document.querySelectorAll('.step').forEach((stepElement, index) => {
        if (index + 1 <= step) {
            stepElement.classList.add('active');
        } else {
            stepElement.classList.remove('active');
        }
    });
    
    // Actualizar barra de progreso
    const progressPercentage = ((step - 1) / (totalSteps - 1)) * 100;
    document.getElementById('form-progress').style.width = `${progressPercentage}%`;
    
    // Actualizar visibilidad de botones
    updateButtonVisibility(step);
}

// Siguiente paso
function nextStep() {
    if (validateStep(currentStep)) {
        if (currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
        }
    }
}

// Paso anterior
function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

// Actualizar visibilidad de botones
function updateButtonVisibility(step) {
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const btnSubmit = document.getElementById('btn-submit');
    
    if (step === 1) {
        btnPrev.style.display = 'none';
        btnNext.style.display = 'inline-block';
        btnSubmit.style.display = 'none';
    } else if (step === totalSteps) {
        btnPrev.style.display = 'inline-block';
        btnNext.style.display = 'none';
        btnSubmit.style.display = 'inline-block';
    } else {
        btnPrev.style.display = 'inline-block';
        btnNext.style.display = 'inline-block';
        btnSubmit.style.display = 'none';
    }
}

// Validar paso actual
function validateStep(step) {
    let isValid = true;
    const stepElement = document.getElementById(`step-${step}`);
    const requiredFields = stepElement.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            markFieldAsInvalid(field);
            isValid = false;
        } else {
            markFieldAsValid(field);
            
            // Validaciones específicas por campo
            if (field.id === 'curp' && !validateCURP(field.value)) {
                markFieldAsInvalid(field);
                showAlert('La CURP debe tener 18 caracteres', 'error');
                isValid = false;
            }
            
            if (field.id === 'cp' && !validateCP(field.value)) {
                markFieldAsInvalid(field);
                showAlert('El código postal debe tener 5 dígitos', 'error');
                isValid = false;
            }
            
            if (field.id === 'telefono' && !validatePhone(field.value)) {
                markFieldAsInvalid(field);
                showAlert('El teléfono debe tener 10 dígitos', 'error');
                isValid = false;
            }
            
            if (field.id === 'telefono-institucion' && !validatePhone(field.value)) {
                markFieldAsInvalid(field);
                showAlert('El teléfono de la institución debe tener 10 dígitos', 'error');
                isValid = false;
            }
        }
    });
    
    return isValid;
}

// Validar CURP
function validateCURP(curp) {
    return curp.length === 18;
}

// Validar código postal
function validateCP(cp) {
    return /^\d{5}$/.test(cp);
}

// Validar teléfono
function validatePhone(phone) {
    return /^\d{10}$/.test(phone);
}

// Marcar campo como inválido
function markFieldAsInvalid(field) {
    field.style.borderColor = '#e74c3c';
    field.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.2)';
}

// Marcar campo como válido
function markFieldAsValid(field) {
    field.style.borderColor = '#2ecc71';
    field.style.boxShadow = '0 0 0 2px rgba(46, 204, 113, 0.2)';
}

// Configurar validación en tiempo real
function setupRealTimeValidation() {
    const fields = document.querySelectorAll('input, select, textarea');
    
    fields.forEach(field => {
        field.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                markFieldAsInvalid(this);
            } else {
                markFieldAsValid(this);
            }
        });
    });
}

// Mostrar alerta
function showAlert(message, type) {
    const alertDiv = document.getElementById('alert-formulario');
    alertDiv.innerHTML = `
        <div class="alert alert-${type}">
            ${message}
        </div>
    `;
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        alertDiv.innerHTML = '';
    }, 5000);
}

// Enviar formulario
function submitForm(e) {
    e.preventDefault();
    
    if (validateStep(currentStep)) {
        // Guardar datos antes de generar PDF
        saveFormData();
        
        showAlert('Formulario completado correctamente. Generando PDF...', 'success');
        
        // Simular generación de PDF
        setTimeout(() => {
            showAlert('PDF generado exitosamente. Puede descargarlo ahora.', 'success');
            
            // Aquí iría la lógica real para generar el PDF
            // generatePDF();
        }, 2000);
    } else {
        showAlert('Por favor, complete todos los campos requeridos correctamente', 'error');
    }
}

// Generar PDF (función de ejemplo)
function generatePDF() {
    // Esta función usaría la biblioteca jsPDF para generar el documento
    // Por ahora es solo un marcador de posición
    
    // Ejemplo básico de cómo podría ser:
    /*
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Agregar contenido al PDF
    doc.text('Solicitud de Servicio Social - CETIS 120', 20, 20);
    
    // Recopilar datos del formulario
    const formData = getFormData();
    
    // Agregar datos al PDF
    let yPosition = 40;
    for (const key in formData) {
        doc.text(`${key}: ${formData[key]}`, 20, yPosition);
        yPosition += 10;
    }
    
    // Guardar el PDF
    doc.save('solicitud-servicio-social.pdf');
    */
}
// --- MANEJO DE PASOS ---
const steps = document.querySelectorAll(".form-step");
const circles = document.querySelectorAll(".step");
const nextBtns = document.querySelectorAll(".next");
const backBtns = document.querySelectorAll(".back");
let current = 0;

// Siguiente
nextBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        steps[current].classList.remove("active");
        circles[current].classList.remove("active");
        current++;
        steps[current].classList.add("active");
        circles[current].classList.add("active");
        updateProgress();
    });
});

// Atrás
backBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        steps[current].classList.remove("active");
        circles[current].classList.remove("active");
        current--;
        steps[current].classList.add("active");
        circles[current].classList.add("active");
        updateProgress();
    });
});

// Barra
function updateProgress() {
    const bar = document.getElementById("progress-bar");
    bar.style.width = ((current + 1) / 4 * 100) + "%";
}

// --- GUARDAR SOLICITUD ---
function guardarSolicitud() {

    let solicitud = {
        nombre: document.getElementById("nombre").value,
        primer_apellido: document.getElementById("primer_apellido").value,
        segundo_apellido: document.getElementById("segundo_apellido").value,
        edad: document.getElementById("edad").value,
        curp: document.getElementById("curp").value,
        telefono: document.getElementById("telefono").value,
        especialidad: document.getElementById("especialidad").value,
        semestre: document.getElementById("semestre").value,
        grupo: document.getElementById("grupo").value,
        turno: document.getElementById("turno").value,
        actividades: document.getElementById("actividades").value,
        fecha_envio: new Date().toLocaleString()
    };

    let lista = JSON.parse(localStorage.getItem("solicitudes")) || [];

    lista.push(solicitud);

    localStorage.setItem("solicitudes", JSON.stringify(lista));

    alert("Solicitud enviada ✔");

    window.location.href = "panel-admin.html";
}
