// Agrega un evento al formulario de inicio de sesión
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita el envío tradicional del formulario

    // Obtiene los valores de los campos del formulario
    const correo = document.getElementById('correo').value;
    const contraseña = document.getElementById('contraseña').value;

    // Realiza la solicitud de inicio de sesión
    fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            correo: correo,
            contraseña: contraseña,
        }),
    })
    .then(response => {
        // Verifica que la respuesta sea correcta
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.message || 'Error en la solicitud de inicio de sesión');
            });
        }
        return response.json();
    })
    .then(data => {
        // Verifica la respuesta del inicio de sesión
        if (data.message === "Inicio de sesión exitoso") {
            // Almacena el token si está presente en la respuesta
            if (data.token) {
                localStorage.setItem('token', data.token);
                console.log('Token obtenido:', data.token);
                // Carga los datos de los perros y redirige
                loadDogData();
            } else {
                throw new Error('Token no disponible en la respuesta.');
            }
        } else {
            // Muestra un mensaje de error si el inicio de sesión falla
            alert(data.message || 'Error en el inicio de sesión');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Ocurrió un error al intentar iniciar sesión. Intenta de nuevo.");
    });
});

// Función para cargar los datos de los perros y redirigir
function loadDogData() {
    const token = localStorage.getItem('token');
    
    // Verifica si el token está presente
    if (!token) {
        alert("No estás autorizado. Por favor, inicia sesión.");
        return; // Detiene la ejecución si no hay token
    }

    console.log('Token enviado:', token); // Verificar que el token sea correcto

    // Carga los datos de la base de datos y redirige
    fetch('http://localhost:3000/api/perros', {
        method: 'GET', // Asegúrate de que sea un GET
        headers: {
            'Authorization': `Bearer ${token}` // Incluye el token en las cabeceras
        }
    })
    .then(response => {
        console.log('Respuesta del servidor:', response); // Verifica la respuesta
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(text || 'Error al cargar los datos de perros');
            });
        }
        return response.json();
    })
    .then(data => {
        // Almacena los datos en localStorage
        localStorage.setItem('perrosData', JSON.stringify(data));
        // Redirige a la página de Tinder
        window.location.href = '../principal/tinder.html'; 
    })
    .catch(error => {
        console.error('Error al cargar los datos:', error);
        alert(`Ocurrió un error al cargar los datos: ${error.message}`); // Muestra el mensaje de error específico
    });
}

// Manejo del clic en el botón "Tinder"
document.getElementById('btnTinder').addEventListener('click', function() {
    loadDogData(); // Carga los datos de los perros al hacer clic en el botón
}); 
