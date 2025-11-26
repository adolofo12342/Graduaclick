
             document.querySelectorAll('.icono1').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            });
        });

        document.querySelector('.botonenviar').addEventListener('click', function() {
            const nombre = document.getElementById('nombre').value;
            const email = document.getElementById('email').value;
            const asunto = document.getElementById('asunto').value;
            const mensaje = document.getElementById('mensaje').value;
            
            if(nombre && email && asunto && mensaje) {
                alert('¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.');
                document.getElementById('nombre').value = '';
                document.getElementById('email').value = '';
                document.getElementById('asunto').value = '';
                document.getElementById('mensaje').value = '';
            } else {
                alert('Por favor, completa todos los campos del formulario.');
            }
        });
    