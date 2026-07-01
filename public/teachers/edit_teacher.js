const API_URL = window.ENV ? window.ENV.API_URL : "https://api.artdance.mishu-soft.org/";
let teacherId = null;

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    teacherId = params.get("id");

    if (!teacherId) {
        window.location.href = "teachers.html";
        return;
    }
    obtenerProfesor(teacherId);
});

async function obtenerProfesor(id) {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${API_URL}teachers/${id}/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error("El profesor solicitado no existe.");
        const teacher = await response.json();

        document.getElementById("edit-title").innerText = `Modificar a: ${teacher.name}`;
        document.getElementById("edit-name").value = teacher.name;
    } catch (error) {
        document.getElementById("error-box").innerText = error.message;
        document.getElementById("error-box").classList.remove("hidden");
    }
}

document.getElementById("edit-teacher-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${API_URL}teachers/${teacherId}/`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: document.getElementById("edit-name").value.trim() })
        });

        if (!response.ok) throw new Error("Ocurrió un problema al guardar los cambios.");
        window.location.href = "teachers.html";
    } catch (error) {
        document.getElementById("error-box").innerText = error.message;
        document.getElementById("error-box").classList.remove("hidden");
    }
});