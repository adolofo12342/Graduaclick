// Funciones utilitarias para formularios
function cargarDatosEnFormulario(datos, tipoFormulario) {
    if (!datos) return;
    
    // Campos comunes a ambos formularios
    const camposComunes = {
        'fecha': datos.fecha,
        'turno': datos.turno,
        'grupo': datos.grupo,
        'nombre': datos.nombre,
        'especialidad': datos.especialidad,
        'correo_electronico': datos.correo_electronico,
        'no_de_celular': datos.no_de_celular,
        'no_de_tel_adicional': datos.no_de_tel_adicional
    };
    
    // Llenar campos comunes
    Object.keys(camposComunes).forEach(campo => {
        const elemento = document.getElementById(campo);
        if (elemento && camposComunes[campo]) {
            elemento.value = camposComunes[campo];
        }
    });
    
    // Campos específicos por tipo de formulario
    if (tipoFormulario === 'directa') {
        const camposDirecta = {
            'numero_control': datos.numero_control,
            'fecha_nacimiento': datos.fecha_nacimiento,
            'estado_nacimiento': datos.estado_nacimiento,
            'municipio_nacimiento': datos.municipio_nacimiento,
            'nacionalidad': datos.nacionalidad,
            'sexo': datos.sexo
        };
        
        Object.keys(camposDirecta).forEach(campo => {
            const elemento = document.getElementById(campo);
            if (elemento && camposDirecta[campo]) {
                elemento.value = camposDirecta[campo];
            }
        });
    }
    
    if (tipoFormulario === 'prototipo') {
        const camposPrototipo = {
            'no_de_control': datos.no_de_control,
            'nombre_proyecto': datos.nombre_proyecto,
            'asesor': datos.asesor
        };
        
        Object.keys(camposPrototipo).forEach(campo => {
            const elemento = document.getElementById(campo);
            if (elemento && camposPrototipo[campo]) {
                elemento.value = camposPrototipo[campo];
            }
        });
    }
    
    // Actualizar checkboxes de documentos
    actualizarCheckboxesDocumentos(datos.documentos, tipoFormulario);
}

function actualizarCheckboxesDocumentos(documentos, tipoFormulario) {
    if (!documentos) return;
    
    const mapeoDocumentos = {
        'directa': [
            { key: 'actaNacimiento', checkboxId: 'actaNacimiento', fileId: 'fileActaNacimiento' },
            { key: 'curpDoc', checkboxId: 'curpDoc', fileId: 'fileCurp' },
            { key: 'certificadoSecundaria', checkboxId: 'certificadoSecundaria', fileId: 'fileCertificadoSecundaria' },
            { key: 'certificadoBachillerato', checkboxId: 'certificadoBachillerato', fileId: 'fileCertificadoBachillerato' },
            { key: 'cartaLiberacionPracticas', checkboxId: 'cartaLiberacionPracticas', fileId: 'fileCartaLiberacionPracticas' },
            { key: 'constanciasCompetencia', checkboxId: 'constanciasCompetencia', fileId: 'fileConstanciasCompetencia' },
            { key: 'pagoBancomer', checkboxId: 'pagoBancomer', fileId: 'filePagoBancomer' }
        ],
        'prototipo': [
            { key: 'acta', checkboxId: 'actaNacimiento', fileId: 'fileActaNacimiento' },
            { key: 'curp', checkboxId: 'curpDoc', fileId: 'fileCurp' },
            { key: 'secundaria', checkboxId: 'certificadoSecundaria', fileId: 'fileCertificadoSecundaria' },
            { key: 'bachillerato', checkboxId: 'certificadoBachillerato', fileId: 'fileCertificadoBachillerato' },
            { key: 'practica', checkboxId: 'cartaLiberacionPracticas', fileId: 'fileCartaLiberacionPracticas' },
            { key: 'constancia', checkboxId: 'constanciasCompetencia', fileId: 'fileConstanciasCompetencia' },
            { key: 'bancomer', checkboxId: 'pagoBancomer', fileId: 'filePagoBancomer' }
        ]
    };
    
    const documentosMapeo = mapeoDocumentos[tipoFormulario] || [];
    
    documentosMapeo.forEach(doc => {
        const checkbox = document.getElementById(doc.checkboxId);
        const fileInput = document.getElementById(doc.fileId);
        
        if (checkbox && documentos[doc.key]) {
            checkbox.checked = true;
            
            // Mostrar información del archivo existente
            if (fileInput) {
                const fileName = documentos[doc.key].nombre || 'Archivo cargado';
                // Crear elemento para mostrar el nombre del archivo existente
                let fileInfo = fileInput.parentNode.querySelector('.file-info');
                if (!fileInfo) {
                    fileInfo = document.createElement('div');
                    fileInfo.className = 'file-info';
                    fileInfo.style.fontSize = '0.9em';
                    fileInfo.style.color = '#28a745';
                    fileInfo.style.marginTop = '5px';
                    fileInput.parentNode.appendChild(fileInfo);
                }
                fileInfo.textContent = `Archivo actual: ${fileName}`;
            }
        }
    });
}

function obtenerFormularioPorId(id) {
    const formulariosUsuarios = JSON.parse(localStorage.getItem('formulariosUsuarios') || '[]');
    return formulariosUsuarios.find(form => form.id == id);
}