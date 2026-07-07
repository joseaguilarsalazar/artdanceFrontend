const API_URL = window.ENV ? window.ENV.API_URL : "https://api.artdance.mishu-soft.org/";
const token = localStorage.getItem("token");
let paymentId = null;

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    paymentId = params.get("id");

    if (!paymentId) {
        window.location.href = "payments.html";
        return;
    }

    precargarDetallesPago();
    document.getElementById("edit-payment-form").addEventListener("submit", actualizarPago);
    document.getElementById("btn-delete-payment").addEventListener("click", eliminarPagoFisico);
});

// 1. Obtener la información del recibo a editar
async function precargarDetallesPago() {
    try {
        const response = await fetch(`${API_URL}payments/${paymentId}/`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("El registro de cobro no existe o fue removido.");

        const pago = await response.json();

        document.getElementById("recibo-id-title").innerText = pago.id;
        document.getElementById("edit-amount").value = pago.amount;
        document.getElementById("edit-date").value = pago.payment_date;

        const nombreAlumno = typeof pago.student === 'object' ? pago.student.name : (pago.student_name || `ID Estudiante: ${pago.student}`);
        document.getElementById("student-name-display").innerText = nombreAlumno;

    } catch (error) {
        mostrarError(error.message);
    }
}

// 2. Guardar modificaciones vía PUT/PATCH
async function actualizarPago(e) {
    e.preventDefault();
    const btnSubmit = document.getElementById("btn-submit");
    btnSubmit.disabled = true;

    const payload = {
        amount: parseFloat(document.getElementById("edit-amount").value),
        payment_date: document.getElementById("edit-date").value
    };

    try {
        const response = await fetch(`${API_URL}payments/${paymentId}/`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("No se pudieron guardar las modificaciones en el servidor.");
        window.location.href = "payments.html";

    } catch (error) {
        mostrarError(error.message);
        btnSubmit.disabled = false;
    }
}

// 3. 🌟 ELIMINAR REGISTRO VÍA METHOD DELETE
async function eliminarPagoFisico() {
    const confirmacion = confirm(`⚠️ ¿Estás absolutamente seguro de que deseas ELIMINAR el recibo de pago #${paymentId}?\nEsta acción alterará el estado de cuenta y la mora del alumno de inmediato.`);
    if (!confirmacion) return;

    const btnDelete = document.getElementById("btn-delete-payment");
    btnDelete.disabled = true;
    btnDelete.innerText = "Eliminando...";

    try {
        const response = await fetch(`${API_URL}payments/${paymentId}/`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error("El servidor rechazó la solicitud de eliminación.");

        console.log(`Recibo #${paymentId} destruido correctamente.`);
        window.location.href = "payments.html";

    } catch (error) {
        mostrarError(error.message);
        btnDelete.disabled = false;
        btnDelete.innerText = "💥 Eliminar Recibo";
    }
}

function mostrarError(msg) {
    const box = document.getElementById("error-box");
    box.innerText = msg;
    box.classList.remove("hidden");
}