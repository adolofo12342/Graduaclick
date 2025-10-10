
document.addEventListener('DOMContentLoaded', function() {
    const accenl = document.querySelector('.accenl');
    const dropdown = document.querySelector('.dropdown');
    const inises = document.querySelector('.inises');

    accenl.addEventListener('click', function(e) {
        e.preventDefault();
        dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
    });
    document.addEventListener('click', function(e) {
        if (!inises.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
});