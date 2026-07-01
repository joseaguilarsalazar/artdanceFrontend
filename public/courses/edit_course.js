const API_URL = window.ENV ? window.ENV.API_URL : "https://api.artdance.mishu-soft.org/";
const token = localStorage.getItem("token");
let classId = null;

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    classId = params.get("id");

    if (!classId) {
        window.location.href = "courses.html";
        return;
    }

    inicializarYPrecargar();
});

async function inicializarYPrecargar() {
    const teacherSelect = document.getElementById("teacher-select");

    try {
        // 1. Descargar catálogo de profesores activos
        const resTeachers = await fetch(`${API_URL}teachers/`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!resTeachers.ok) throw new Error("No se pudo cargar la lista de profesores.");
        
        const listaProfesores = await resTeachers.json();
        teacherSelect.innerHTML = `<option value="">-- Selecciona un docente --</option>`;
        listaProfesores.filter(t => t.is_active !== false).forEach(t => {
            teacherSelect.innerHTML += `<option value="${t.id}">${t.name}</option>`;
        });

        // 2. Descargar el registro específico del horario (CourseClass)
        const resClass = await fetch(`${API_URL}classes/${classId}/`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!resClass.ok) throw new Error("No se pudo recuperar los detalles del horario.");
        
        const clase = await resClass.json();

        // 3. Hidratar los campos del formulario
        const nombreCurso = typeof clase.course === 'object' ? clase.course.name : (clase.course_name || "Especialidad");
        document.getElementById("course-name-display").innerText = nombreCurso;
        
        // Seleccionar el ID del profesor asignado
        teacherSelect.value = typeof clase.course === 'object' ? clase.teacher.id : clase.teacher;
        
        // Formatear horas (hh:mm:ss -> hh:mm)
        document.getElementById("start-hour").value = clase.start_hour ? clase.start_hour.substring(0, 5) : "";
        document.getElementById("end-hour").value = clase.end_hour ? clase.end_hour.substring(0, 5) : "";

        // Activar los checkboxes de los días guardados en el array JSON
        if (clase.days_of_week && Array.isArray(clase.days_of_week)) {
            clase.days_of_week.forEach(dia => {
                const checkbox = document.querySelector(`input[name="class-days"][value="${dia}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }

    } catch (error) {
        mostrarError(error.message);
    }
}

// 4. Enviar los cambios mediante PUT
document.getElementById("edit-course-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const btnSubmit = document.getElementById("btn-submit");
    btnSubmit.disabled = true;
    btnSubmit.innerText = "Guardando...";

    const checkboxesMarcados = document.querySelectorAll('input[name="class-days"]:checked');
    const diasSeleccionados = Array.from(checkboxesMarcados).map(cb => cb.value);

    try {
        if (diasSeleccionados.length === 0) {
            throw new Error("Debes seleccionar al menos un día de la semana.");
        }

        // Recuperar los valores seleccionados
        const teacherSelectValue = document.getElementById("teacher-select").value;

        const payload = {
            teacher: parseInt(teacherSelectValue),
            days_of_week: diasSeleccionados,
            start_hour: document.getElementById("start-hour").value + ":00",
            end_hour: document.getElementById("end-hour").value + ":00"
        };

        const response = await fetch(`${API_URL}classes/${classId}/`, {
            method: "PATCH", // Usamos PATCH para modificar solo el bloque horario sin alterar el ForeignKey del curso
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || "Error al actualizar el horario.");
        }

        window.location.href = "courses.html";

    } catch (error) {
        mostrarError(error.message);
        btnSubmit.disabled = false;
        btnSubmit.innerText = "Guardar Cambios";
    }
});

function mostrarError(msg) {
    const box = document.getElementById("error-box");
    box.innerText = msg;
    box.classList.remove("hidden");
}