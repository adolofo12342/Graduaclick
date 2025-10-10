document.addEventListener('DOMContentLoaded', function() {
    const formulariosUsuarios = JSON.parse(localStorage.getItem('formulariosUsuarios') || '[]');

    if (formulariosUsuarios.length > 0) {
        const latestFormData = formulariosUsuarios[formulariosUsuarios.length - 1];

        document.getElementById('displayControlNumber').textContent = latestFormData.no_de_control || '';
        document.getElementById('displayCurp').textContent = latestFormData.curp || '';
        document.getElementById('displayName').textContent = latestFormData.nombre || '';
        document.getElementById('displayDob').textContent = latestFormData.fecha_nacimiento || '';
        document.getElementById('displayPobState').textContent = latestFormData.estado_nacimiento || '';
        document.getElementById('displayPobMunicipality').textContent = latestFormData.municipio_nacimiento || '';
        document.getElementById('displayNationality').textContent = latestFormData.nacionalidad || '';
        document.getElementById('displaySex').textContent = latestFormData.sexo || '';
    }
});