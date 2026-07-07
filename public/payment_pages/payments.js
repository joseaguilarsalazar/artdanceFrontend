let todosLosPagos = [];
const API_URL = window.ENV ? window.ENV.API_URL : "https://api.artdance.mishu-soft.org/";

document.addEventListener("DOMContentLoaded", () => {
    cargarHistorialPagos();
    configurarFiltros();
    configurarEventosDropdowns();
    document.getElementById("btn-nuevo-pago").addEventListener("click", () => {
        window.location.href = "create_payment.html";
    });
});

async function cargarHistorialPagos() {
    const tbody = document.getElementById("payments-tbody");
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${API_URL}payments/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error("Fallo al descargar los registros de tesorería.");

        todosLosPagos = await response.json();
        filtrarYRenderizar();

    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="color:red; font-weight:bold;">${error.message}</td></tr>`;
    }
}

function filtrarYRenderizar() {
    const studentSearch = document.getElementById("search-student").value.toLowerCase().trim();
    const dateFilter = document.getElementById("date-filter").value;

    const resultado = todosLosPagos.filter(pago => {
        const nombreAlumno = typeof pago.student === 'object' ? pago.student.name : (pago.student_name || "Alumno");
        const coincideAlumno = nombreAlumno.toLowerCase().includes(studentSearch);
        const coincideFecha = dateFilter === "" || pago.payment_date === dateFilter;

        return coincideAlumno && coincideFecha;
    });

    renderizarTabla(resultado);
}

function renderizarTabla(pagos) {
    const tbody = document.getElementById("payments-tbody");
    tbody.innerHTML = "";

    if (pagos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center">No se registran transacciones bajo esos criterios.</td></tr>`;
        return;
    }

    pagos.forEach(pago => {
        const fila = document.createElement("tr");
        const nombreAlumno = typeof pago.student === 'object' ? pago.student.name : (pago.student_name || `ID Estudiante: ${pago.student}`);
        
        fila.innerHTML = `
            <td>#${pago.id}</td>
            <td><strong>${nombreAlumno}</strong></td>
            <td><span class="money-text">S/. ${pago.amount}</span></td>
            <td>${pago.payment_date}</td>
            <td class="text-center">
                <div class="options-dropdown">
                    <button class="btn-dots">⋮</button>
                    <div class="dropdown-menu">
                        <a href="edit_payment.html?id=${pago.id}">Editar Recibo</a>
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(fila);
    });
}

function configurarFiltros() {
    document.getElementById("search-student").addEventListener("input", filtrarYRenderizar);
    document.getElementById("date-filter").addEventListener("change", filtrarYRenderizar);
}

function configurarEventosDropdowns() {
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-dots")) {
            const menuActual = e.target.nextElementSibling;
            document.querySelectorAll(".dropdown-menu").forEach(m => {
                if (m !== menuActual) m.classList.remove("show");
            });
            menuActual.classList.toggle("show");
            return;
        }
        document.querySelectorAll(".dropdown-menu").forEach(m => m.classList.remove("show"));
    });
}