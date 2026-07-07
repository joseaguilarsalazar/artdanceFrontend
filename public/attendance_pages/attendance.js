const API_URL = window.ENV ? window.ENV.API_URL : "https://api.artdance.mishu-soft.org/";
const token = localStorage.getItem("token");

let todasLasClases = [];

// Mapeo para calcular días en el calendario nativo de JavaScript (0: Domingo, 1: Lunes, etc.)
const mapaDiasJS = { 'SUN': 0, 'MON': 1, 'TUE': 2, 'WED': 3, 'THU': 4, 'FRI': 5, 'SAT': 6 };

document.addEventListener("DOMContentLoaded", () => {
    inicializarModulo();
    document.getElementById("class-select").addEventListener("change", manejarCambioClase);
    document.getElementById("btn-save-attendance").addEventListener("click", enviarAsistenciaMasiva);
});

// 1. Descarga inicial e hidratación de filtros cruzados
async function inicializarModulo() {
    try {
        const resClasses = await fetch(`${API_URL}course-classes/`, { headers: { "Authorization": `Bearer ${token}` } });
        if (!resClasses.ok) throw new Error("No se pudo cargar la grilla de clases.");
        todasLasClases = await resClasses.get_success_headers ? [] : await resClasses.json();

        // Rellenar selectores de apoyo
        const filterCourse = document.getElementById("filter-course");
        const filterTeacher = document.getElementById("filter-teacher");
        
        // Sets para extraer valores únicos y evitar duplicados en los dropdowns
        const cursosVistos = new Set();
        const profesVistos = new Set();

        todasLasClases.forEach(c => {
            const nomCurso = typeof c.course === 'object' ? c.course.name : c.course_name;
            const nomProfe = typeof c.teacher === 'object' ? c.teacher.name : c.teacher_name;
            cursosVistos.add(nomCurso);
            profesVistos.add(nomProfe);
        });

        cursosVistos.forEach(cur => filterCourse.innerHTML += `<option value="${cur}">${cur}</option>`);
        profesVistos.forEach(prof => filterTeacher.innerHTML += `<option value="${prof}">${prof}</option>`);

        // Eventos para reactivar el selector principal al cambiar filtros secundarios
        const actualizarSelectorClase = () => {
            const cSel = filterCourse.value;
            const tSel = filterTeacher.value;
            const classSelect = document.getElementById("class-select");
            
            classSelect.innerHTML = `<option value="">-- Elige una opción --</option>`;
            
            todasLasClases.forEach(clase => {
                const nomC = typeof clase.course === 'object' ? clase.course.name : clase.course_name;
                const nomT = typeof clase.teacher === 'object' ? clase.teacher.name : clase.teacher_name;
                
                if ((cSel === "" || nomC === cSel) && (tSel === "" || nomT === tSel)) {
                    classSelect.innerHTML += `<option value="${clase.id}">ID ${clase.id}: ${nomC} con ${nomT}</option>`;
                }
            });
        };

        filterCourse.addEventListener("change", actualizarSelectorClase);
        filterTeacher.addEventListener("change", actualizarSelectorClase);
        actualizarSelectorClase();

    } catch (error) {
        mostrarAlerta(error.message, "error");
    }
}

// 2. Ejecutar cálculos de fecha e inyección de alumnos al cambiar la clase
function manejarCambioClase() {
    const classId = document.getElementById("class-select").value;
    const rosterSection = document.getElementById("roster-section");

    if (!classId) {
        rosterSection.classList.add("hidden");
        return;
    }

    const claseSeleccionada = todasLasClases.find(c => c.id == classId);
    if (!claseSeleccionada) return;

    // 🌟 LECCIÓN DE ALTO NIVEL: Calcular la última fecha permitida según days_of_week
    calcularUltimaFechaValida(claseSeleccionada.days_of_week);

    // Renderizar los alumnos cargados en esa clase específica
    renderizarAlumnosRoster(claseSeleccionada.students || []);
    rosterSection.classList.remove("hidden");
}

// Algoritmo retrospectivo de fechas
function calcularUltimaFechaValida(diasPermitidos) {
    const dateInput = document.getElementById("attendance-date");
    if (!diasPermitidos || !Array.isArray(diasPermitidos) || diasPermitidos.length === 0) {
        // Fallback si no viene array: hoy
        dateInput.value = new Date().toISOString().substring(0, 10);
        return;
    }

    // Convertir ["MON", "WED"] a números JS [1, 3]
    const indicesPermitidos = diasPermitidos.map(d => mapaDiasJS[d]);

    let fechaBuscada = new Date(); // Empezamos desde hoy en el huso horario local
    
    // Bucle hacia atrás (máximo 7 iteraciones para dar con el día correcto de la semana)
    for (let i = 0; i < 7; i++) {
        if (indicesPermitidos.includes(fechaBuscada.getDay())) {
            break; // ¡Encontrado!
        }
        fechaBuscada.setDate(fechaBuscada.getDate() - 1); // Retroceder un día
    }

    // Formatear a YYYY-MM-DD para inyectar en el input HTML5
    const yyyy = fechaBuscada.getFullYear();
    const mm = String(fechaBuscada.getMonth() + 1).padStart(2, '0');
    const dd = String(fechaBuscada.getDate()).padStart(2, '0');
    
    dateInput.value = `${yyyy}-${mm}-${dd}`;
}

function renderizarAlumnosRoster(alumnos) {
    const tbody = document.getElementById("roster-tbody");
    tbody.innerHTML = "";

    if (alumnos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center">No hay alumnos matriculados en esta clase.</td></tr>`;
        return;
    }

    alumnos.forEach(alumno => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${alumno.id}</td>
            <td><strong>${alumno.name}</strong></td>
            <td class="text-center">
                <input type="checkbox" class="absent-checkbox" data-student-id="${alumno.id}">
            </td>
        `;
        tbody.appendChild(fila);
    });
}

// 3. Empaquetar y enviar el lote completo al backend
async function enviarAsistenciaMasiva() {
    const classId = document.getElementById("class-select").value;
    const fechaAsistencia = document.getElementById("attendance-date").value;
    const btnSave = document.getElementById("btn-save-attendance");

    if (!fechaAsistencia) {
        mostrarAlerta("Por favor, selecciona una fecha válida.", "error");
        return;
    }

    btnSave.disabled = true;
    btnSave.innerText = "Guardando registro...";

    // Recolectar estados e invertir la lógica solicitada
    const registros = [];
    document.querySelectorAll(".absent-checkbox").forEach(checkbox => {
        const sId = checkbox.getAttribute("data-student-id");
        
        registros.append({
            student_id: parseInt(sId),
            // 🌟 SI está checked (true) -> Faltó, por ende present = false
            present: !checkbox.checked 
        });
    });

    const payload = {
        date: fechaAsistencia,
        course_class_id: parseInt(classId),
        records: registros
    };

    try {
        const response = await fetch(`${API_URL}attendance/bulk-save/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Error al intentar impactar las asistencias en el servidor.");

        mostrarAlerta("¡Asistencia del día guardada correctamente!", "success");
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        mostrarAlerta(error.message, "error");
    } finally {
        btnSave.disabled = false;
        btnSave.innerText = "💾 Guardar Registro de Asistencia";
    }
}

function mostrarAlerta(msg, tipo) {
    const box = document.getElementById("alert-box");
    box.innerText = msg;
    box.className = `alert-box ${tipo === "error" ? "alert-danger" : "alert-success"}`;
    setTimeout(() => box.classList.add("hidden"), 4000);
}