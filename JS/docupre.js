

document.querySelectorAll('.subir-docs input[type="file"]').forEach(function(input) {
    input.addEventListener('change', function(e) {
        let lista = input.parentElement.parentElement.querySelector('.lista-archivos');
        if (!lista) {
            lista = document.createElement('div');
            lista.className = 'lista-archivos';
            input.parentElement.parentElement.appendChild(lista);
        }
        if (input.files.length === 0) {
            lista.innerHTML = '';
            return;
        }
        let nombres = Array.from(input.files).map(f => `<li>${f.name}</li>`).join('');
        lista.innerHTML = `<ul>${nombres}</ul>`;
    });
});