let perros = []; // Array para almacenar los perros
let indiceActual = 0; // Índice del perro actual

// Función para cargar perros
function cargarPerros() {
    const token = localStorage.getItem('token');

   if (!token) {
       alert('Por favor, inicie sesión para ver los perros.');
       window.location.href = 'login.html'; // Redirige a la página de inicio de sesión
        return; // Salimos si no hay token
    }

    fetch('http://localhost:3000/api/perros', {
        headers: {
            'Authorization': `Bearer ${token}` // Incluir token si es necesario
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la solicitud de perros: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log('Datos de respuesta:', data);
        if (Array.isArray(data.perros)) { // Verifica que 'data.perros' sea un array
            perros = data.perros; // Almacena los perros en el array
            mostrarPerro(indiceActual); // Muestra el primer perro
        } else {
            console.error('Formato inesperado en la respuesta:', data);
            alert('Error: formato de respuesta inesperado.');
        }
    })
    .catch(error => {
        console.error('Error al cargar los perros:', error);
        alert('Hubo un problema al cargar los perros.');
    });
}

// Función para mostrar el perro actual
function mostrarPerro(indice) {
    if (indice < 0 || indice >= perros.length) {
        alert('No hay más perros disponibles.');
        indiceActual = 0; // Reinicia el índice
        mostrarPerro(indiceActual); // Muestra el primer perro
        return; // Salimos de la función
    }

    const perro = perros[indice];
    document.getElementById('perro-imagen').src = perro.foto; // Asegúrate de que 'foto' sea la clave correcta
    document.getElementById('perro-nombre').textContent = perro.nombre; // Asegúrate de que 'nombre' sea la clave correcta
    document.getElementById('perro-descripcion').textContent = perro.biografia; // Asegúrate de que 'biografia' sea la clave correcta
}

// Evento de clic para "Me Gusta"
document.getElementById('me-gusta').addEventListener('click', function() {
    if (perros[indiceActual]) {
        console.log('¡Me gusta!', perros[indiceActual].nombre);
        // Aquí podrías enviar la acción de "Me Gusta" al servidor si es necesario
        indiceActual++;
        mostrarPerro(indiceActual); // Muestra el siguiente perro
    }
});

// Evento de clic para "No Me Gusta"
document.getElementById('no-me-gusta').addEventListener('click', function() {
    if (perros[indiceActual]) {
        console.log('No me gusta', perros[indiceActual].nombre);
        // Aquí podrías enviar la acción de "No Me Gusta" al servidor si es necesario
        indiceActual++;
        mostrarPerro(indiceActual); // Muestra el siguiente perro
    }
});

// Evento de clic para "Siguiente"
document.getElementById('siguiente').addEventListener('click', function() {
    indiceActual++;
    mostrarPerro(indiceActual); // Muestra el siguiente perro
});

// Llama a la función para cargar perros al iniciar
cargarPerros();
