const API_URL = window.ENV ? window.ENV.API_URL : "https://api.artdance.mishu-soft.org/";

document.getElementById("create-student-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const errorBox = document.getElementById("error-box");
    errorBox.classList.add("hidden");

    const studentData = {
        name: document.getElementById("student-name").value.trim(),
        birth_date: document.getElementById("student-birth").value || null,
        district: document.getElementById("student-district").value,
        address: document.getElementById("student-address").value.trim() || null,
        parent_1_name: document.getElementById("parent1-name").value.trim() || null,
        parent_1_number: document.getElementById("parent1-phone").value.trim() || null,
        parent_2_name: document.getElementById("parent2-name").value.trim() || null,
        parent_2_number: document.getElementById("parent2-phone").value.trim() || null
    };

    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${API_URL}students/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(studentData)
        });

        // 🌟 REGLA DE ORO: Validar primero el estado de la respuesta del servidor
        if (!response.ok) {
            // Si el servidor envía un error (como el 500), leemos la respuesta como texto plano
            const textoError = await response.text();
            
            // Si contiene HTML de error, mostramos un mensaje genérico limpio en la UI
            if (textoError.includes("<!DOCTYPE") || response.status === 500) {
                throw new Error(`Error interno del servidor (Código 500). Avisa al administrador del backend.`);
            }
            
            // Si es un error de validación común (400 Bad Request), intentamos leer el JSON
            const datosError = JSON.parse(textoError);
            throw new Error(datosError.name || datosError.detail || "Error en los datos enviados.");
        }

        // 🌟 Si llegamos aquí, la respuesta es un 200/201 OK seguro. Ya podemos parsear el JSON.
        const data = await response.json();
        console.log("Estudiante registrado con éxito:", data);
        window.location.href = "students.html";

    } catch (error) {
        console.error("Fallo de guardado:", error);
        errorBox.innerText = error.message;
        errorBox.classList.remove("hidden");
    }
});