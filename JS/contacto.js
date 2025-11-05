document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.contacto-form');
    if (form) {
        form.addEventListener('submit', function (e) {
            alert('¡Gracias por tu comentario y calificación!');
        });
    }

    const menuLinks = document.querySelectorAll('.lista a');
    menuLinks.forEach(link => {
        link.addEventListener('mouseenter', function () {
            this.style.color = 'rgb(0, 123, 255)';
        });
        link.addEventListener('mouseleave', function () {
            this.style.color = 'rgb(52, 58, 64)';
        });
    });
});
document.addEventListener('DOMContentLoaded', function() {
    const estrellas = document.querySelectorAll('#calificacion-estrellas .fa-star');
    const inputCalificacion = document.getElementById('calificacion');
    const form = document.getElementById('form-contacto');
    const agradecimiento = document.getElementById('agradecimiento');

    estrellas.forEach((estrella, idx) => {
        estrella.addEventListener('mouseenter', () => {
            estrellas.forEach((e, i) => {
                e.classList.toggle('seleccionada', i <= idx);
            });
        });
        estrella.addEventListener('mouseleave', () => {
            estrellas.forEach((e, i) => {
                e.classList.toggle('seleccionada', i < (inputCalificacion.value || 0));
            });
        });
        estrella.addEventListener('click', () => {
            inputCalificacion.value = idx + 1;
            estrellas.forEach((e, i) => {
                e.classList.toggle('seleccionada', i <= idx);
            });
        });
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        form.querySelector('button[type="submit"]').style.display = 'none';
        agradecimiento.style.display = 'flex';
        form.reset();
        estrellas.forEach(e => e.classList.remove('seleccionada'));
        inputCalificacion.value = '';
    });
});