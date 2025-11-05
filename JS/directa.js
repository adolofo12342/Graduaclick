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

function mostrarConfirmacion(mensaje, callback) {
    const modal = document.createElement('div');
    modal.className = 'confirmation-modal';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Confirmar acción</h3>
            <p>${mensaje}</p>
            <div class="modal-buttons">
                <button class="btn btn-secondary" id="cancelAction">Cancelar</button>
                <button class="btn btn-danger" id="confirmAction">Confirmar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('cancelAction').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    document.getElementById('confirmAction').addEventListener('click', () => {
        callback();
        document.body.removeChild(modal);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const documentos = [
        { fileId: 'fileActaNacimiento', checkboxId: 'actaNacimiento' },
        { fileId: 'fileCurp', checkboxId: 'curpDoc' },
        { fileId: 'fileCertificadoSecundaria', checkboxId: 'certificadoSecundaria' },
        { fileId: 'fileCertificadoBachillerato', checkboxId: 'certificadoBachillerato' },
        { fileId: 'fileCartaLiberacionPracticas', checkboxId: 'cartaLiberacionPracticas' },
        { fileId: 'fileConstanciasCompetencia', checkboxId: 'constanciasCompetencia' },
        { fileId: 'filePagoBancomer', checkboxId: 'pagoBancomer' }
    ];

    // VERIFICAR MODO EDICIÓN Y CARGAR DATOS
    const urlParams = new URLSearchParams(window.location.search);
    const editarId = urlParams.get('editar');
    let formularioExistente = null;
    
    if (editarId) {
        formularioExistente = obtenerFormularioPorId(editarId);
        if (formularioExistente) {
            cargarDatosEnFormulario(formularioExistente, 'directa');
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

    // Botón de cancelar
    const cancelarBtn = document.getElementById('cancelarBtn');
    if (cancelarBtn) {
        cancelarBtn.addEventListener('click', function() {
            mostrarConfirmacion('¿Estás seguro de que deseas cancelar? Se perderán todos los cambios no guardados.', function() {
                window.location.href = 'admin.html';
            });
        });
    }

    const formTitulacion = document.getElementById('formTitulacion');
    if (formTitulacion) {
        formTitulacion.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this); 
            const datosUsuario = {};
            for (let [key, value] of formData.entries()) {
                datosUsuario[key] = value;
            }

            datosUsuario.tipo_titulacion = 'directa';

            // Procesar documentos
            datosUsuario.documentos = {};
            documentos.forEach(doc => {
                const inputFile = document.getElementById(doc.fileId);
                if (inputFile && inputFile.files.length > 0) {
                    datosUsuario.documentos[doc.checkboxId] = {
                        nombre: inputFile.files[0].name,
                    };
                } else if (formularioExistente && formularioExistente.documentos && formularioExistente.documentos[doc.checkboxId]) {
                    // Mantener el documento existente si no se subió uno nuevo
                    datosUsuario.documentos[doc.checkboxId] = formularioExistente.documentos[doc.checkboxId];
                }
            });

            // Si estamos editando, usar el ID existente, de lo contrario crear uno nuevo
            if (editarId) {
                datosUsuario.id = parseInt(editarId);
            } else {
                datosUsuario.id = Date.now();
            }

            let formulariosUsuarios = JSON.parse(localStorage.getItem('formulariosUsuarios') || '[]');
            
            // Si estamos editando, reemplazar el formulario existente
            if (editarId) {
                const index = formulariosUsuarios.findIndex(form => form.id == editarId);
                if (index !== -1) {
                    formulariosUsuarios[index] = datosUsuario;
                }
            } else {
                // Si es nuevo, agregarlo
                formulariosUsuarios.push(datosUsuario);
            }
            
            localStorage.setItem('formulariosUsuarios', JSON.stringify(formulariosUsuarios));

            const mensaje = editarId ? 
                'Formulario actualizado correctamente' : 
                'Formulario enviado correctamente';
                
            alert(mensaje);
            
            // Redirigir al admin después de guardar
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);
        });
    }
});