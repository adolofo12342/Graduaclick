document.addEventListener('DOMContentLoaded', () => {
    const formularioRegistro = document.getElementById('formulario-registro');
    const nombreInput = document.getElementById('nombre');
    const emailInput = document.getElementById('email');
    const contrasenaRegistroInput = document.getElementById('contrasena-registro');
    const confirmarContrasenaInput = document.getElementById('confirmar-contrasena');

    const errorNombre = document.getElementById('error-nombre');
    const errorEmail = document.getElementById('error-email');
    const errorContrasenaRegistro = document.getElementById('error-contrasena-registro');
    const errorConfirmarContrasena = document.getElementById('error-confirmar-contrasena');

    formularioRegistro.addEventListener('submit', (e) => { 
        e.preventDefault();

        let isValid = true;

        errorNombre.textContent = '';
        errorEmail.textContent = '';
        errorContrasenaRegistro.textContent = '';
        errorConfirmarContrasena.textContent = '';

        errorNombre.style.display = 'none';
        errorEmail.style.display = 'none';
        errorContrasenaRegistro.style.display = 'none';
        errorConfirmarContrasena.style.display = 'none';

        if (nombreInput.value.trim() === '') {
            errorNombre.textContent = 'El nombre completo es obligatorio.';
            errorNombre.style.display = 'block';
            isValid = false;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailInput.value.trim() === '') {
            errorEmail.textContent = 'El correo electrónico es obligatorio.';
            errorEmail.style.display = 'block';
            isValid = false;
        } else if (!emailPattern.test(emailInput.value)) {
            errorEmail.textContent = 'Introduce un correo electrónico válido.';
            errorEmail.style.display = 'block';
            isValid = false;
        }

        if (contrasenaRegistroInput.value.trim() === '') {
            errorContrasenaRegistro.textContent = 'La contraseña es obligatoria.';
            errorContrasenaRegistro.style.display = 'block';
            isValid = false;
        } else if (contrasenaRegistroInput.value.length < 8) {
            errorContrasenaRegistro.textContent = 'La contraseña debe tener al menos 8 caracteres.';
            errorContrasenaRegistro.style.display = 'block';
            isValid = false;
        }

        if (confirmarContrasenaInput.value.trim() === '') {
            errorConfirmarContrasena.textContent = 'Confirma tu contraseña.';
            errorConfirmarContrasena.style.display = 'block';
            isValid = false;
        } else if (confirmarContrasenaInput.value !== contrasenaRegistroInput.value) {
            errorConfirmarContrasena.textContent = 'Las contraseñas no coinciden.';
            errorConfirmarContrasena.style.display = 'block';
            isValid = false;
        }

        if (isValid) {
            alert('¡Registro exitoso!');
            formularioRegistro.reset();
            window.location.href = 'iniciar sesion.html';
        }
    });
});