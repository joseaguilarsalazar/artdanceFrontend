let todasLasClases = [];
const API_URL = window.ENV ? window.ENV.API_URL : "https://api.artdance.mishu-soft.org/";

// Diccionario utilitario para traducir los códigos de Django al español
const diasDiccionario = {
    'MON': 'Lunes', 'TUE': 'Martes', 'WED': 'Miércoles',
    'THU': 'Jueves', 'FRI': 'Viernes', 'SAT': 'Sábado', 'SUN': 'Domingo'
};

document.addEventListener("DOMContentLoaded", () => {
    cargarClasesProgramadas();
    configurarFiltros();
    document.getElementById("btn-nueva-clase").addEventListener("click", () => {
        window.location.href = "create_course.html";
    });
});

async function cargarClasesProgramadas() {
    const tbody = document.getElementById("courses-tbody");
    const token = localStorage.getItem("token");

    try {
        // En Django REST Framework, CourseClass suele mapearse como course-classes/ o courseclasses/
        const response = await fetch(`${API_URL}classes/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error("Error al descargar los horarios.");

        todasLasClases = await response.json();
        filtrarYRenderizar();

    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="color:red; font-weight:bold;">${error.message} (Verifica la ruta en el router de Django)</td></tr>`;
    }
}

function filtrarYRenderizar() {
    const dayFilter = document.getElementById("day-filter").value;
    const teacherSearch = document.getElementById("search-teacher").value.toLowerCase().trim();

    const resultado = todasLasClases.filter(clase => {
        const coincideDia = dayFilter === "" || clase.day_of_week === dayFilter;
        
        // Manejo seguro por si el objeto anidado viene serializado o expandido (clase.teacher.name o clase.teacher_name)
        const nombreProfesor = typeof clase.teacher === 'object' ? clase.teacher.name : (clase.teacher_name || "");
        const coincideProfesor = nombreProfesor.toLowerCase().includes(teacherSearch);

        return coincideDia && coincideProfesor;
    });

    renderizarTabla(resultado);
}

// Reemplaza la función renderizarTabla existente por esta versión:
function renderizarTabla(clases) {
    const tbody = document.getElementById("courses-tbody");
    tbody.innerHTML = "";

    if (clases.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center">No hay clases programadas con estos criterios.</td></tr>`;
        return;
    }

    clases.forEach(clase => {
        const fila = document.createElement("tr");
        
        const nombreCurso = typeof clase.course === 'object' ? clase.course.name : (clase.course_name || "Curso");
        const costoCurso = typeof clase.course === 'object' ? clase.course.monthly_cost : (clase.monthly_cost || "100.00");
        const nombreProfesor = typeof clase.teacher === 'object' ? clase.teacher.name : (clase.teacher_name || "Asignado");
        
        const inicio = clase.start_hour ? clase.start_hour.substring(0, 5) : "--:--";
        const fin = clase.end_hour ? clase.end_hour.substring(0, 5) : "--:--";

        let textoDias = "No asignado";
        if (clase.days_of_week && Array.isArray(clase.days_of_week)) {
            textoDias = clase.days_of_week
                .map(diaCodigo => diasDiccionario[diaCodigo] || diaCodigo)
                .join(" - ");
        }

        fila.innerHTML = `
            <td>${clase.id}</td>
            <td><strong>${nombreCurso}</strong></td>
            <td>${nombreProfesor}</td>
            <td><span style="font-weight:500; color:#333;">${textoDias}</span></td>
            <td><span class="time-badge">${inicio} - ${fin}</span></td>
            <td>S/. ${costoCurso}</td>
            <td class="text-center">
                <div class="options-dropdown">
                    <button class="btn-dots">⋮</button>
                    <div class="dropdown-menu">
                        <a href="edit_course.html?id=${clase.id}">Editar Horario</a>
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(fila);
    });
}

// 🌟 Añade esto al final de courses.js para dar interactividad a los 3 puntos:
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

function configurarFiltros() {
    document.getElementById("day-filter").addEventListener("change", filtrarYRenderizar);
    document.getElementById("search-teacher").addEventListener("input", filtrarYRenderizar);
}