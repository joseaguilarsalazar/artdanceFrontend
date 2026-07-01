const API_URL = window.ENV ? window.ENV.API_URL : "https://api.artdance.mishu-soft.org/";
let studentId = null;

document.addEventListener("DOMContentLoaded", () => {
    // 🌟 LECCIÓN PARA TRAINEES: Extraer parámetros de búsqueda de la barra de direcciones
    const params = new URLSearchParams(window.location.search);
    studentId = params.get("id");

    if (!studentId) {
        alert("Falta el identificador del alumno.");
        window.location.href = "students.html";
        return;
    }

    obtenerEstudiante(studentId);
});

// 1. Fase de Lectura (Precarga de datos actuales)
async function obtenerEstudiante(id) {
    const token = localStorage.getItem("token");
    const errorBox = document.getElementById("error-box");

    try {
        const response = await fetch(`${API_URL}students/${id}/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error("El estudiante solicitado no existe en los registros.");

        const student = await response.json();

        // Rellenar las cajas de texto del formulario
        document.getElementById("edit-title").innerText = `Modificar a: ${student.name}`;
        document.getElementById("edit-name").value = student.name;
        document.getElementById("edit-birth").value = student.birth_date || "";
        document.getElementById("edit-district").value = student.district;
        document.getElementById("edit-address").value = student.address || "";
        document.getElementById("edit-parent1-name").value = student.parent_1_name || "";
        document.getElementById("edit-parent1-phone").value = student.parent_1_number || "";
        document.getElementById("edit-parent2-name").value = student.parent_2_name || "";
        document.getElementById("edit-parent2-phone").value = student.parent_2_number || "";

    } catch (error) {
        console.error(error);
        errorBox.innerText = error.message;
        errorBox.classList.remove("hidden");
    }
}

// 2. Fase de Escritura (Impacto mediante PUT)
document.getElementById("edit-student-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const errorBox = document.getElementById("error-box");
    const token = localStorage.getItem("token");

    const updatedData = {
        name: document.getElementById("edit-name").value.trim(),
        birth_date: document.getElementById("edit-birth").value || null,
        district: document.getElementById("edit-district").value,
        address: document.getElementById("edit-address").value.trim() || null,
        parent_1_name: document.getElementById("edit-parent1-name").value.trim() || null,
        parent_1_number: document.getElementById("edit-parent1-phone").value.trim() || null,
        parent_2_name: document.getElementById("edit-parent2-name").value.trim() || null,
        parent_2_number: document.getElementById("edit-parent2-phone").value.trim() || null
    };

    try {
        const response = await fetch(`${API_URL}students/${studentId}/`, {
            method: "PUT", // O PATCH si solo enviaras un fragmento parcial
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || "Ocurrió un error al actualizar el registro.");
        }

        console.log("Cambios guardados con éxito.");
        window.location.href = "students.html";

    } catch (error) {
        console.error(error);
        errorBox.innerText = error.message;
        errorBox.classList.remove("hidden");
    }
});