// Obtener idPropietario desde localStorage
const idPropietario = localStorage.getItem('idPropietario');

// Verificar que el idPropietario no esté vacío
if (!idPropietario) {
    alert("El ID del propietario no es válido.");
    window.location.href = '../principal/Inicio.html'; // Redirigir a la página principal si el ID no es válido
} else {
    // Asignar idPropietario al campo oculto en el formulario
    document.getElementById('idPropietario').value = idPropietario;

    // Configurar el envío del formulario
    document.getElementById('form-registro-mascota').addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

        const formData = new FormData(event.target); // Crear un objeto FormData del formulario

        try {
            const response = await fetch('http://127.0.0.1:3000/api/auth/register-pet', {
                method: 'POST',
                body: formData // Enviar los datos del formulario
            });

            const data = await response.json(); // Parsear la respuesta a JSON

            if (response.ok) {
                // Redirigir a la página de inicio con un mensaje de éxito
                window.location.href = `../principal/Inicio.html?message=Registro exitoso`;
            } else {
                alert("Error: " + (data.message || "No se pudo registrar la mascota.")); // Mostrar mensaje de error
            }
        } catch (error) {
            console.error("Error en el registro de la mascota:", error); // Mostrar error en la consola
            alert("Ocurrió un error en el registro de la mascota."); // Mensaje de error para el usuario
        }
    });
}
