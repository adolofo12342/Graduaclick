// Configuración general de la aplicación
const APP_CONFIG = {
    institution: {
        name: "CETIS 120",
        address: "Av. Francisco I. Madero Oriente No.4923. Col. Ciudad Industrial, C.P. 58200",
        phone: "443 323 23 79 Ext. 103",
        email: "cetis120.dir@dgeti.sems.gob.mx"
    },
    serviceSocial: {
        requiredHours: 480,
        allowedInstitutions: "Gobierno"
    },
    academic: {
        semesters: [4, 5, 6],
        groups: ["A", "B"],
        shifts: ["Matutino", "Vespertino"],
        specialties: [
            "Programación",
            "Contabilidad", 
            "Administración",
            "Electrónica",
            "Mecánica"
        ]
    }
};

// Utilidades de formato
const Formatter = {
    formatPhone: function(phone) {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        }
        return phone;
    },
    
    formatDate: function(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    },
    
    capitalizeWords: function(str) {
        if (!str) return '';
        return str.replace(/\b\w/g, l => l.toUpperCase());
    }
};

// Utilidades de validación
const Validator = {
    isRequired: function(value) {
        return value && value.toString().trim().length > 0;
    },
    
    isEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    isNumber: function(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    },
    
    isInRange: function(value, min, max) {
        const num = parseFloat(value);
        return num >= min && num <= max;
    },
    
    hasMinLength: function(value, minLength) {
        return value && value.toString().length >= minLength;
    },
    
    hasExactLength: function(value, exactLength) {
        return value && value.toString().length === exactLength;
    }
};