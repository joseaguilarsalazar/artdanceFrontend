// Base de datos local en memoria para manejar el estado de los filtros
let todosLosEstudiantes = [];

const API_URL = window.ENV ? window.ENV.API_URL : "https://api.artdance.mishu-soft.org/";

// Inicializador principal
document.addEventListener("DOMContentLoaded", () => {
    cargarEstudiantes();
    configurarFiltros();
    configurarEventosGlobales();
});

// 1. Obtener los datos del Backend (Django REST Framework)
async function cargarEstudiantes() {
    const tbody = document.getElementById("students-tbody");
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${API_URL}students/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        // 🌟 Validación previa antes de invocar .json()
        if (!response.ok) {
            if (response.status === 500) {
                throw new Error("El servidor sufrió un fallo interno (500) al procesar el listado.");
            }
            const errData = await response.json();
            throw new Error(errData.detail || "No se pudo obtener la lista.");
        }

        todosLosEstudiantes = await response.json();
        renderizarTabla(todosLosEstudiantes);

    } catch (error) {
        console.error("Error cargando estudiantes:", error);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="color:red; font-weight:bold;">${error.message}</td></tr>`;
    }
}

// 2. Pintar las filas en el documento HTML
function renderizarTabla(estudiantes) {
    const tbody = document.getElementById("students-tbody");
    tbody.innerHTML = "";

    if (estudiantes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center">No se encontraron estudiantes registrados.</td></tr>`;
        return;
    }

    estudiantes.forEach(student => {
        const fila = document.createElement("tr");
        
        // Formatear moneda para la deuda (asumiendo que viene de calculate_debt)
        const deuda = student.calculate_debt !== undefined ? `$${student.calculate_debt}` : "$0.00";

        fila.innerHTML = `
            <td>${student.id}</td>
            <td><strong>${student.name}</strong></td>
            <td>${student.district || 'No asignado'}</td>
            <td>${student.enrollment_date || 'N/A'}</td>
            <td style="color: ${student.calculate_debt > 0 ? '#dc3545' : '#28a745'}; font-weight:bold;">${deuda}</td>
            <td class="text-center">
                <div class="options-dropdown">
                    <button class="btn-dots">⋮</button>
                    <div class="dropdown-menu">
                        <a href="edit_student.html?id=${student.id}">Editar</a>
                        <button onclick="eliminarEstudianteLogico(${student.id})">Inactivar</button>
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(fila);
    });
}

// 3. Sistema de Filtros en Tiempo Real (Vanilla JavaScript)
function configurarFiltros() {
    const searchInput = document.getElementById("search-input");
    const districtFilter = document.getElementById("district-filter");

    const ejecutarFiltro = () => {
        const textoBusqueda = searchInput.value.toLowerCase().trim();
        const distritoSeleccionado = districtFilter.value;

        const resultadoFiltrado = todosLosEstudiantes.filter(student => {
            const coincideNombre = student.name.toLowerCase().includes(textoBusqueda);
            const coincideDistrito = distritoSeleccionado === "" || student.district === distritoSeleccionado;
            return coincideNombre && coincideDistrito;
        });

        renderizarTabla(resultadoFiltrado);
    };

    // Escuchar eventos de tipeo y cambio de select
    searchInput.addEventListener("input", ejecutarFiltro);
    districtFilter.addEventListener("change", ejecutarFiltro);
}

// 4. Delegación de eventos y Control de Cierre de Dropdowns
function configurarEventosGlobales() {
    // Escuchar clicks en todo el documento para controlar los menús desplegables
    document.addEventListener("click", (e) => {
        // Si el usuario hace click en el botón de los 3 puntos
        if (e.target.classList.contains("btn-dots")) {
            // Buscamos el menú hermano de ese botón específico y cambiamos su visibilidad
            const menuActual = e.target.nextElementSibling;
            
            // Cerramos todos los demás menús abiertos primero para que no se encimen
            document.querySelectorAll(".dropdown-menu").forEach(m => {
                if (m !== menuActual) m.classList.remove("show");
            });

            menuActual.classList.toggle("show");
            return;
        }

        // Si hacen click en cualquier otro lado de la pantalla, cerramos los menús activos
        document.querySelectorAll(".dropdown-menu").forEach(m => m.classList.remove("show"));
    });

    // Botón crear nuevo estudiante (Ruteo básico de simulación por ahora)
    document.getElementById("btn-nuevo-estudiante").addEventListener("click", () => {
        window.location.href = "create_student.html";
    });
}

// Marcador de posición para funciones complementarias de entrenamiento
function eliminarEstudianteLogico(id) {
    alert(`Muestra de entrenamiento: Acción inactivar estudiante ID: ${id}`);
}