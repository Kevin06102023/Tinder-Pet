document.getElementById('register-owner-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

    const formData = new FormData(event.target);
    
    try {  
        const response = await fetch('http://127.0.0.1:3000/api/auth/register-owner', {
            method: 'POST',
            body: JSON.stringify({
                nombre: formData.get('nombre'),          // Obtener el nombre del formulario
                correo: formData.get('correo'),          // Obtener el correo del formulario
                contraseña: formData.get('contraseña')   // Obtener la contraseña del formulario
            }),
            headers: {
                'Content-Type': 'application/json' // Asegúrate de que el backend acepte JSON
            }
        });

        const data = await response.json();
        console.log(data); // Para depurar y ver la respuesta completa

        if (response.ok) {
            // Guardar el ID del propietario en localStorage
            localStorage.setItem('idPropietario', data.idPropietario);
            // Redirigir a la página de registro de mascotas con el ID del propietario
            window.location.href = `../principal/Registro_mascota.html?idPropietario=${data.idPropietario}`; // Cambié 'id' a 'idPropietario'
        } else {
            // Manejar el error
            alert(data.message || "Error al registrar el propietario"); // Mensaje de error
        }
    } catch (error) {
        console.error("Error en el registro del propietario:", error);
        alert("Ocurrió un error en el registro del propietario."); // Mensaje en caso de error en la petición
    }
});
