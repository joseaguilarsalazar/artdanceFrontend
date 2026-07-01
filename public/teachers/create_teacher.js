const API_URL = window.ENV ? window.ENV.API_URL : "https://api.artdance.mishu-soft.org/";

document.getElementById("create-teacher-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById("error-box");
    errorBox.classList.add("hidden");

    const payload = {
        name: document.getElementById("teacher-name").value.trim(),
        is_active: true
    };

    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${API_URL}teachers/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.name || errData.detail || "Error al procesar la inserción.");
        }

        window.location.href = "teachers.html";
    } catch (error) {
        errorBox.innerText = error.message;
        errorBox.classList.remove("hidden");
    }
});