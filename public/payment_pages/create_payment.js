const API_URL = window.ENV ? window.ENV.API_URL : "https://api.artdance.mishu-soft.org/";
const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("payment-date").value = new Date().toISOString().substring(0, 10);
    cargarSelectorEstudiantes();
    document.getElementById("student-select").addEventListener("change", consultarMoraEstudiante);
    document.getElementById("payment-form").addEventListener("submit", procesarPagoCaja);
});

async function cargarSelectorEstudiantes() {
    const select = document.getElementById("student-select");
    try {
        const response = await fetch(`${API_URL}students/`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("No se pudo obtener el catálogo de alumnos.");
        
        const estudiantes = await response.json();
        select.innerHTML = `<option value="">-- Elige un estudiante --</option>`;
        estudiantes.forEach(est => {
            select.innerHTML += `<option value="${est.id}">${est.name} (ID: ${est.id})</option>`;
        });
    } catch (error) {
        mostrarError(error.message);
    }
}

async function consultarMoraEstudiante() {
    const studentId = document.getElementById("student-select").value;
    const warningBox = document.getElementById("debt-warning-box");
    const debtText = document.getElementById("debt-amount-text");

    if (!studentId) {
        warningBox.classList.add("hidden");
        return;
    }

    try {
        const response = await fetch(`${API_URL}students/${studentId}/`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) throw new Error();
        
        const estudiante = await response.json();
        const deuda = parseFloat(estudiante.calculate_debt || 0);

        debtText.innerText = `S/. ${deuda.toFixed(2)}`;
        warningBox.className = "debt-box";

        if (deuda > 0) {
            warningBox.classList.add("debt-alert");
        } else {
            warningBox.classList.add("debt-clear");
        }

    } catch (error) {
        debtText.innerText = "Error consultando saldo";
    }
}

async function procesarPagoCaja(e) {
    e.preventDefault();
    const btnSubmit = document.getElementById("btn-submit");
    btnSubmit.disabled = true;

    const payload = {
        student: parseInt(document.getElementById("student-select").value),
        amount: parseFloat(document.getElementById("payment-amount").value),
        payment_date: document.getElementById("payment-date").value
    };

    try {
        const response = await fetch(`${API_URL}payments/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Fallo en el servidor al registrar el recibo.");
        window.location.href = "payments.html";

    } catch (error) {
        mostrarError(error.message);
        btnSubmit.disabled = false;
    }
}

function mostrarError(msg) {
    const box = document.getElementById("error-box");
    box.innerText = msg;
    box.classList.remove("hidden");
}