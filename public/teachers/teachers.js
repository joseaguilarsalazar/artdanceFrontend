let todosLosProfesores = [];
const API_URL = window.ENV ? window.ENV.API_URL : "https://api.artdance.mishu-soft.org/";

document.addEventListener("DOMContentLoaded", () => {
    cargarProfesores();
    configurarFiltros();
    configurarEventosGlobales();
});

async function cargarProfesores() {
    const tbody = document.getElementById("teachers-tbody");
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${API_URL}teachers/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("No se pudo descargar el listado de profesores.");
        }

        todosLosProfesores = await response.json();
        filtrarYRenderizar();

    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="4" class="text-center" style="color:red; font-weight:bold;">${error.message}</td></tr>`;
    }
}

function filtrarYRenderizar() {
    const searchInput = document.getElementById("search-input").value.toLowerCase().trim();
    const statusFilter = document.getElementById("status-filter").value;

    const resultadoFiltrado = todosLosProfesores.filter(teacher => {
        const coincideNombre = teacher.name.toLowerCase().includes(searchInput);
        
        let coincideEstado = true;
        if (statusFilter === "activos") coincideEstado = teacher.is_active === true;
        if (statusFilter === "inactivos") coincideEstado = teacher.is_active === false;

        return coincideNombre && coincideEstado;
    });

    renderizarTabla(resultadoFiltrado);
}

function renderizarTabla(profesores) {
    const tbody = document.getElementById("teachers-tbody");
    tbody.innerHTML = "";

    if (profesores.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center">No se encontraron profesores con los criterios seleccionados.</td></tr>`;
        return;
    }

    profesores.forEach(teacher => {
        const fila = document.createElement("tr");
        
        const badgeEstado = teacher.is_active 
            ? `<span class="badge badge-active">Activo</span>` 
            : `<span class="badge badge-inactive">Inactivo</span>`;

        const botonAccionLogica = teacher.is_active
            ? `<button onclick="cambiarEstadoProfesor(${teacher.id}, false)">Inactivar</button>`
            : `<button onclick="cambiarEstadoProfesor(${teacher.id}, true)">Activar de nuevo</button>`;

        fila.innerHTML = `
            <td>${teacher.id}</td>
            <td><strong>${teacher.name}</strong></td>
            <td>${badgeEstado}</td>
            <td class="text-center">
                <div class="options-dropdown">
                    <button class="btn-dots">⋮</button>
                    <div class="dropdown-menu">
                        <a href="edit_teacher.html?id=${teacher.id}">Editar</a>
                        ${botonAccionLogica}
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(fila);
    });
}

function configurarFiltros() {
    document.getElementById("search-input").addEventListener("input", filtrarYRenderizar);
    document.getElementById("status-filter").addEventListener("change", filtrarYRenderizar);
}

function configurarEventosGlobales() {
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

    document.getElementById("btn-nuevo-profesor").addEventListener("click", () => {
        window.location.href = "create_teacher.html";
    });
}

// 🌟 LECCIÓN DE PRODUCCIÓN: Uso de PATCH para alteración parcial de un registro (is_active)
window.cambiarEstadoProfesor = async function(id, nuevoEstado) {
    const token = localStorage.getItem("token");
    const alerta = document.getElementById("status-alert");

    try {
        const response = await fetch(`${API_URL}teachers/${id}/`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ is_active: nuevoEstado })
        });

        if (!response.ok) throw new Error("No se pudo cambiar el estado del docente.");

        alerta.innerText = `Profesor actualizado satisfactoriamente.`;
        alerta.classList.remove("hidden");
        setTimeout(() => alerta.classList.add("hidden"), 3000);

        // Recargamos los datos para actualizar la UI en caliente
        cargarProfesores();

    } catch (error) {
        alert(error.message);
    }
};