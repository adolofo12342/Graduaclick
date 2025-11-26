document.addEventListener('DOMContentLoaded', function() {
            const formulario = document.getElementById('formulario');
            const usuarioInput = document.getElementById('usuario');
            const contrasenaInput = document.getElementById('contraseña');
            const toggleContrasenaBtn = document.getElementById('contra');
            
            // Corregir los IDs de los elementos de error
            const errorUsuario = document.getElementById('error usuario');
            const errorContrasena = document.getElementById('error contrasena');
            
            // Función para mostrar/ocultar contraseña
            toggleContrasenaBtn.addEventListener('click', function() {
                if (contrasenaInput.type === 'password') {
                    contrasenaInput.type = 'text';
                    toggleContrasenaBtn.classList.add('active');
                } else {
                    contrasenaInput.type = 'password';
                    toggleContrasenaBtn.classList.remove('active');
                }
            });
            
            // Validación en tiempo real
            usuarioInput.addEventListener('input', function() {
                validarEmail(usuarioInput.value);
            });
            
            contrasenaInput.addEventListener('input', function() {
                validarContrasena(contrasenaInput.value);
            });
            
            // Validación al enviar el formulario
            formulario.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const esEmailValido = validarEmail(usuarioInput.value);
                const esContrasenaValida = validarContrasena(contrasenaInput.value);
                
                if (esEmailValido && esContrasenaValida) {
                    // Simular envío exitoso
                    const boton = document.getElementById('boton');
                    boton.classList.add('loading');
                    boton.textContent = '';
                    
                   setTimeout(() => {
    alert('¡Inicio de sesión exitoso!');
    formulario.reset();
    boton.classList.remove('loading');
    boton.textContent = 'Iniciar Sesión';

    window.location.href = "p1.html";  
}, 1500);

                }
            });
            
            function validarEmail(email) {
                const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                
                if (!email) {
                    mostrarError(usuarioInput, errorUsuario, 'El correo electrónico es obligatorio');
                    return false;
                } else if (!regex.test(email)) {
                    mostrarError(usuarioInput, errorUsuario, 'Por favor, introduce un correo electrónico válido');
                    return false;
                } else {
                    limpiarError(usuarioInput, errorUsuario);
                    return true;
                }
            }
            
            function validarContrasena(contrasena) {
                if (!contrasena) {
                    mostrarError(contrasenaInput, errorContrasena, 'La contraseña es obligatoria');
                    return false;
                } else if (contrasena.length < 6) {
                    mostrarError(contrasenaInput, errorContrasena, 'La contraseña debe tener al menos 6 caracteres');
                    return false;
                } else {
                    limpiarError(contrasenaInput, errorContrasena);
                    return true;
                }
            }
            
            function mostrarError(input, elementoError, mensaje) {
                input.style.borderColor = '#e74c3c';
                elementoError.textContent = mensaje;
                elementoError.style.display = 'block';
            }
            
            function limpiarError(input, elementoError) {
                input.style.borderColor = '#2ecc71';
                elementoError.textContent = '';
                elementoError.style.display = 'none';
            }
        });