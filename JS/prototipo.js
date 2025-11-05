// Agregar al inicio del archivo
// <script src="form-utils.js"></script> - Asegúrate de incluir esta referencia en el HTML

function manejarCambioArchivo(inputFile, checkboxId) {
    const checkbox = document.getElementById(checkboxId);
    if (checkbox) {
        checkbox.checked = inputFile.files.length > 0;
        
        // Limpiar información de archivo existente si se sube uno nuevo
        if (inputFile.files.length > 0) {
            const fileInfo = inputFile.parentNode.querySelector('.file-info');
            if (fileInfo) {
                fileInfo.remove();
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const documentos = [
        { fileId: 'fileActaNacimiento', checkboxId: 'actaNacimiento', key: 'acta' },
        { fileId: 'fileCurp', checkboxId: 'curpDoc', key: 'curp' },
        { fileId: 'fileCertificadoSecundaria', checkboxId: 'certificadoSecundaria', key: 'secundaria' },
        { fileId: 'fileCertificadoBachillerato', checkboxId: 'certificadoBachillerato', key: 'bachillerato' },
        { fileId: 'fileCartaLiberacionPracticas', checkboxId: 'cartaLiberacionPracticas', key: 'practica' },
        { fileId: 'fileConstanciasCompetencia', checkboxId: 'constanciasCompetencia', key: 'constancia' },
        { fileId: 'filePagoBancomer', checkboxId: 'pagoBancomer', key: 'bancomer' }
    ];

    // VERIFICAR MODO EDICIÓN Y CARGAR DATOS
    const urlParams = new URLSearchParams(window.location.search);
    const editarId = urlParams.get('editar');
    let formularioExistente = null;
    
    if (editarId) {
        formularioExistente = obtenerFormularioPorId(editarId);
        if (formularioExistente) {
            cargarDatosEnFormulario(formularioExistente, 'prototipo');
            // Cambiar el título para indicar modo edición
            const titulo = document.querySelector('.title');
            if (titulo) {
                titulo.textContent = titulo.textContent + ' (Editando)';
            }
            // Cambiar texto del botón de enviar
            const btnEnviar = document.querySelector('button[type="submit"]');
            if (btnEnviar) {
                btnEnviar.textContent = 'Actualizar Formulario';
            }
        } else {
            alert('No se encontró el formulario solicitado');
        }
    }

    documentos.forEach(doc => {
        const inputFile = document.getElementById(doc.fileId);
        const checkbox = document.getElementById(doc.checkboxId);

        if (inputFile && checkbox) {
            inputFile.addEventListener('change', function() {
                manejarCambioArchivo(this, doc.checkboxId);
            });
            
            // Solo marcar checkbox si no estamos en modo edición o si no hay archivo existente
            if (!editarId) {
                checkbox.checked = inputFile.files.length > 0;
            }
        }
    });

    const formPrototipo = document.getElementById('formPrototipo');
    if (formPrototipo) {
        formPrototipo.addEventListener('submit', function(e) {
            e.preventDefault();

            // Validación de archivos
            let valido = true;
            let mensaje = '';

            documentos.forEach(function(doc) {
                const input = document.getElementById(doc.fileId);
                const file = input.files[0];
                input.classList.remove('input-error');

                // Solo validar si no hay archivo existente
                if (!file && (!formularioExistente || !formularioExistente.documentos || !formularioExistente.documentos[doc.key])) {
                    valido = false;
                    mensaje += `Debe adjuntar el archivo de "${input.previousElementSibling.textContent}".\n`;
                    input.classList.add('input-error');
                } else if (file) {
                    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
                    if (!validTypes.includes(file.type)) {
                        valido = false;
                        mensaje += `El archivo de "${input.previousElementSibling.textContent}" debe ser PDF, JPG o PNG.\n`;
                        input.classList.add('input-error');
                    }
                }
            });

            if (!valido) {
                alert(mensaje);
                return;
            }

            const form = e.target;
            const data = {
                id: editarId ? parseInt(editarId) : Date.now(),
                tipo_titulacion: 'prototipo',
                fecha: form.fecha.value,
                turno: form.turno.value,
                grupo: form.grupo.value,
                nombre: form.nombre.value,
                especialidad: form.especialidad.value,
                no_de_control: form.no_de_control.value,
                no_de_celular: form.no_de_celular.value,
                no_de_tel_adicional: form.no_de_tel_adicional.value,
                correo_electronico: form.correo_electronico.value,
                nombre_proyecto: form.nombre_proyecto ? form.nombre_proyecto.value : '',
                asesor: form.asesor ? form.asesor.value : '',
                documentos: {}
            };

            documentos.forEach(doc => {
                const input = document.getElementById(doc.fileId);
                if (input && input.files.length > 0) {
                    data.documentos[doc.key] = {
                        nombre: input.files[0].name,
                    };
                } else if (formularioExistente && formularioExistente.documentos && formularioExistente.documentos[doc.key]) {
                    // Mantener el documento existente si no se subió uno nuevo
                    data.documentos[doc.key] = formularioExistente.documentos[doc.key];
                }
            });

            const arr = JSON.parse(localStorage.getItem('formulariosUsuarios') || '[]');
            
            if (editarId) {
                // Actualizar el formulario existente
                const index = arr.findIndex(form => form.id == editarId);
                if (index !== -1) {
                    arr[index] = data;
                }
            } else {
                // Agregar nuevo formulario
                arr.push(data);
            }
            
            localStorage.setItem('formulariosUsuarios', JSON.stringify(arr));

            const mensajeExito = editarId ? 
                'Formulario actualizado correctamente' : 
                'Formulario enviado correctamente';
                
            alert(mensajeExito);
            
            // Redirigir al admin después de guardar
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);
        });
    }
});