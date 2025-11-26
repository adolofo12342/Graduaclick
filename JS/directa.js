// Configuración de estados y municipios válidos para actas de nacimiento mexicanas
const estadosMunicipios = {
    "Aguascalientes": ["Aguascalientes", "Asientos", "Calvillo", "Cosío", "Jesús María"],
    "Baja California": ["Mexicali", "Tijuana", "Ensenada", "Playas de Rosarito", "Tecate"],
    "Baja California Sur": ["La Paz", "Los Cabos", "Comondú", "Loreto", "Mulegé"],
    "Campeche": ["Campeche", "Carmen", "Champotón", "Calkiní", "Hecelchakán"],
    "Chiapas": ["Tuxtla Gutiérrez", "Tapachula", "San Cristóbal de las Casas", "Comitán", "Chiapa de Corzo"],
    "Chihuahua": ["Chihuahua", "Juárez", "Cuauhtémoc", "Delicias", "Parral"],
    "Coahuila": ["Saltillo", "Torreón", "Monclova", "Piedras Negras", "Acuña"],
    "Colima": ["Colima", "Manzanillo", "Tecomán", "Villa de Álvarez", "Coquimatlán"],
    "Durango": ["Durango", "Gómez Palacio", "Lerdo", "Canatlán", "Nuevo Ideal"],
    "Estado de México": ["Toluca", "Ecatepec", "Nezahualcóyotl", "Naucalpan", "Tlalnepantla"],
    "Guanajuato": ["León", "Irapuato", "Celaya", "Salamanca", "Guanajuato"],
    "Guerrero": ["Chilpancingo", "Acapulco", "Iguala", "Zihuatanejo", "Taxco"],
    "Hidalgo": ["Pachuca", "Tulancingo", "Tizayuca", "Huejutla", "Apan"],
    "Jalisco": ["Guadalajara", "Zapopan", "Tlaquepaque", "Tonalá", "Puerto Vallarta"],
    "Michoacán": ["Morelia", "Uruapan", "Lázaro Cárdenas", "Zamora", "Pátzcuaro"],
    "Morelos": ["Cuernavaca", "Jiutepec", "Temixco", "Cuautla", "Yautepec"],
    "Nayarit": ["Tepic", "Santiago Ixcuintla", "Compostela", "Bahía de Banderas", "Xalisco"],
    "Nuevo León": ["Monterrey", "Guadalupe", "San Nicolás", "Apodaca", "San Pedro"],
    "Oaxaca": ["Oaxaca", "Salina Cruz", "Juchitán", "Tuxtepec", "Huajuapan"],
    "Puebla": ["Puebla", "Tehuacán", "San Martín Texmelucan", "Atlixco", "Cholula"],
    "Querétaro": ["Querétaro", "San Juan del Río", "Corregidora", "El Marqués", "Tequisquiapan"],
    "Quintana Roo": ["Cancún", "Chetumal", "Playa del Carmen", "Cozumel", "Felipe Carrillo Puerto"],
    "San Luis Potosí": ["San Luis Potosí", "Soledad", "Ciudad Valles", "Matehuala", "Rioverde"],
    "Sinaloa": ["Culiacán", "Mazatlán", "Los Mochis", "Guasave", "Ahome"],
    "Sonora": ["Hermosillo", "Ciudad Obregón", "Nogales", "Guaymas", "San Luis Río Colorado"],
    "Tabasco": ["Villahermosa", "Cárdenas", "Comalcalco", "Macuspana", "Huimanguillo"],
    "Tamaulipas": ["Reynosa", "Matamoros", "Nuevo Laredo", "Tampico", "Ciudad Victoria"],
    "Tlaxcala": ["Tlaxcala", "Apizaco", "Huamantla", "Chiautempan", "Calpulalpan"],
    "Veracruz": ["Veracruz", "Xalapa", "Coatzacoalcos", "Córdoba", "Orizaba"],
    "Yucatán": ["Mérida", "Valladolid", "Tizimín", "Progreso", "Kanasín"],
    "Zacatecas": ["Zacatecas", "Fresnillo", "Guadalupe", "Jerez", "Río Grande"]
};

// Variable para controlar si se ha generado el PDF
let pdfGenerado = false;

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formTitulacion');
    const fechaInput = document.getElementById('fecha');
    
    // Establecer fecha actual
    if (fechaInput) {
        fechaInput.value = new Date().toISOString().split('T')[0];
    }
    
    // Cargar estados en el select
    cargarEstados();
    
    // Configurar evento para cargar municipios cuando se seleccione un estado
    const estadoSelect = document.getElementById('estado_nacimiento');
    estadoSelect.addEventListener('change', cargarMunicipios);
    
    // Configurar eventos para checkboxes y archivos
    configurarCheckboxesYArchivos();
    
    // Configurar evento de envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validarFormulario()) {
            procesarEnvioFormulario();
        }
    });
    
    // Configurar evento para el botón de generar PDF
    document.getElementById('generarPDF').addEventListener('click', function() {
        if (validarFormulario()) {
            generarPDF();
        }
    });
    
    // Prevenir que el usuario salga sin generar el PDF
    window.addEventListener('beforeunload', function(e) {
        if (!pdfGenerado) {
            e.preventDefault();
            e.returnValue = '¡Atención! No has generado tu PDF. Si sales ahora, perderás los datos ingresados.';
            return e.returnValue;
        }
    });
});

function cargarEstados() {
    const estadoSelect = document.getElementById('estado_nacimiento');
    estadoSelect.innerHTML = '<option value="">Seleccione estado</option>';
    
    Object.keys(estadosMunicipios).sort().forEach(estado => {
        const option = document.createElement('option');
        option.value = estado;
        option.textContent = estado;
        estadoSelect.appendChild(option);
    });
}

function cargarMunicipios() {
    const estadoSelect = document.getElementById('estado_nacimiento');
    const municipioSelect = document.getElementById('municipio_nacimiento');
    const estado = estadoSelect.value;
    
    municipioSelect.innerHTML = '<option value="">Seleccione municipio</option>';
    
    if (estado && estadosMunicipios[estado]) {
        municipioSelect.disabled = false;
        estadosMunicipios[estado].forEach(municipio => {
            const option = document.createElement('option');
            option.value = municipio;
            option.textContent = municipio;
            municipioSelect.appendChild(option);
        });
    } else {
        municipioSelect.disabled = true;
    }
}

function configurarCheckboxesYArchivos() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    checkboxes.forEach((checkbox, index) => {
        checkbox.addEventListener('change', function() {
            fileInputs[index].required = this.checked;
            if (!this.checked) {
                fileInputs[index].value = '';
            }
        });
    });

    fileInputs.forEach(input => {
        input.addEventListener('change', function() {
            const checkbox = this.previousElementSibling.previousElementSibling;
            if (this.files.length > 0) {
                checkbox.checked = true;
                // Guardar archivo en localStorage temporal
                guardarArchivoTemporal(this);
            } else {
                checkbox.checked = false;
            }
        });
    });
}

function guardarArchivoTemporal(fileInput) {
    const file = fileInput.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const archivoData = {
            nombre: file.name,
            tipo: file.type,
            datos: e.target.result,
            timestamp: Date.now()
        };
        
        // Guardar en localStorage con un ID único
        const fileId = `temp_${fileInput.name}_${Date.now()}`;
        localStorage.setItem(fileId, JSON.stringify(archivoData));
        
        // Guardar referencia en el input
        fileInput.setAttribute('data-file-id', fileId);
    };
    reader.readAsDataURL(file);
}

function validarFormulario() {
    const requiredFields = document.querySelectorAll('input[required], select[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#e74c3c';
            isValid = false;
        } else {
            field.style.borderColor = '#cfd8dc';
        }
    });

    const checkboxes = document.querySelectorAll('input[type="checkbox"][required]');
    checkboxes.forEach(checkbox => {
        if (!checkbox.checked) {
            checkbox.parentElement.style.background = '#fdf2f2';
            isValid = false;
        } else {
            checkbox.parentElement.style.background = '#f4f7fa';
        }
    });

    const fileInputs = document.querySelectorAll('input[type="file"][required]');
    fileInputs.forEach(input => {
        if (input.files.length === 0) {
            input.style.borderColor = '#e74c3c';
            isValid = false;
        } else {
            input.style.borderColor = '#cfd8dc';
        }
    });

    if (!isValid) {
        alert('❌ Por favor, complete todos los campos obligatorios y suba los documentos requeridos.');
    }

    return isValid;
}

function procesarEnvioFormulario() {
    const formData = new FormData(document.getElementById('formTitulacion'));
    const datosFormulario = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        tipo_titulacion: 'directa',
        fecha: formData.get('fecha'),
        turno: formData.get('turno'),
        grupo: formData.get('grupo'),
        primer_apellido: formData.get('primer_apellido'),
        segundo_apellido: formData.get('segundo_apellido'),
        nombre: formData.get('nombre'),
        especialidad: formData.get('especialidad'),
        no_de_control: formData.get('no_de_control'),
        fecha_nacimiento: formData.get('fecha_nacimiento'),
        nacionalidad: formData.get('nacionalidad'),
        estado_nacimiento: formData.get('estado_nacimiento'),
        municipio_nacimiento: formData.get('municipio_nacimiento'),
        no_de_celular: formData.get('no_de_celular'),
        no_de_tel_adicional: formData.get('no_de_tel_adicional'),
        correo_electronico: formData.get('correo_electronico'),
        documentos: {}
    };

    // Guardar archivos en localStorage
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        if (input.files.length > 0) {
            const fileId = input.getAttribute('data-file-id');
            if (fileId) {
                datosFormulario.documentos[input.name] = fileId;
            }
        }
    });

    guardarDatos(datosFormulario);
    
    alert('✅ Formulario enviado correctamente. Ahora genera tu PDF.');
    
    // Habilitar el botón de PDF
    document.getElementById('generarPDF').style.display = 'block';
}

function guardarDatos(datos) {
    let formulariosExistentes = JSON.parse(localStorage.getItem('formulariosUsuarios') || '[]');
    formulariosExistentes.push(datos);
    localStorage.setItem('formulariosUsuarios', JSON.stringify(formulariosExistentes));
}

function generarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Obtener datos del formulario
    const formData = new FormData(document.getElementById('formTitulacion'));
    
    // Configuración del PDF
    doc.setFontSize(16);
    doc.text('Resumen de Trámite de Titulación', 20, 20);
    doc.setFontSize(12);
    
    let yPos = 40;
    
    // Datos personales
    doc.setFont(undefined, 'bold');
    doc.text('DATOS PERSONALES', 20, yPos);
    yPos += 10;
    doc.setFont(undefined, 'normal');
    
    doc.text(`Nombre: ${formData.get('nombre')} ${formData.get('primer_apellido')} ${formData.get('segundo_apellido')}`, 20, yPos);
    yPos += 8;
    doc.text(`Número de Control: ${formData.get('no_de_control')}`, 20, yPos);
    yPos += 8;
    doc.text(`Especialidad: ${formData.get('especialidad')}`, 20, yPos);
    yPos += 8;
    doc.text(`Turno: ${formData.get('turno')}`, 20, yPos);
    yPos += 8;
    doc.text(`Grupo: ${formData.get('grupo')}`, 20, yPos);
    yPos += 8;
    doc.text(`Fecha de Nacimiento: ${formData.get('fecha_nacimiento')}`, 20, yPos);
    yPos += 8;
    doc.text(`Lugar de Nacimiento: ${formData.get('municipio_nacimiento')}, ${formData.get('estado_nacimiento')}`, 20, yPos);
    yPos += 8;
    doc.text(`Nacionalidad: ${formData.get('nacionalidad')}`, 20, yPos);
    yPos += 8;
    doc.text(`Teléfono: ${formData.get('no_de_celular')}`, 20, yPos);
    yPos += 8;
    doc.text(`Correo Electrónico: ${formData.get('correo_electronico')}`, 20, yPos);
    yPos += 15;
    
    // Documentos entregados
    doc.setFont(undefined, 'bold');
    doc.text('DOCUMENTOS ENTREGADOS', 20, yPos);
    yPos += 10;
    doc.setFont(undefined, 'normal');
    
    const documentos = [
        'Acta de Nacimiento',
        'CURP',
        'Certificado de Secundaria',
        'Certificado de Bachillerato',
        'Carta de Liberación de Servicio Social',
        'Carta de Liberación de Prácticas Profesionales',
        '5 Constancias de Competencia',
        '6 Fotografías T/Diploma',
        '2 Fotografías T/Título',
        'Pago generado en BBVA'
    ];
    
    documentos.forEach(docTexto => {
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }
        doc.text(`✓ ${docTexto}`, 25, yPos);
        yPos += 7;
    });
    
    // Información adicional
    yPos += 10;
    doc.setFont(undefined, 'bold');
    doc.text('INFORMACIÓN ADICIONAL', 20, yPos);
    yPos += 10;
    doc.setFont(undefined, 'normal');
    doc.text('Fecha de envío: ' + new Date().toLocaleDateString(), 20, yPos);
    yPos += 8;
    doc.text('Este documento sirve como comprobante de recepción de documentos.', 20, yPos);
    yPos += 8;
    doc.text('Conserve este PDF para cualquier aclaración.', 20, yPos);
    
    // Guardar PDF
    const nombreArchivo = `resumen_titulacion_${formData.get('no_de_control')}.pdf`;
    doc.save(nombreArchivo);
    
    // Marcar que el PDF fue generado
    pdfGenerado = true;
    
    // Permitir salir de la página
    window.removeEventListener('beforeunload', arguments.callee);
    
    alert(' PDF generado correctamente. Ahora puede cerrar esta página.');
}