const API_URL = window.ENV ? window.ENV.API_URL : "https://api.artdance.mishu-soft.org/";
const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => {
    inicializarFormulario();
    configurarComportamientoNuevoCurso();
});

// 1. Descargar datos bases de la API para rellenar los Selects de la pantalla
async function inicializarFormulario() {
    const courseSelect = document.getElementById("course-select");
    const teacherSelect = document.getElementById("teacher-select");

    try {
        // Cargar Cursos
        const resCourses = await fetch(`${API_URL}courses/`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        // Cargar Profesores
        const resTeachers = await fetch(`${API_URL}teachers/`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!resCourses.ok || !resTeachers.ok) throw new Error("Fallo al inicializar dependencias del formulario.");

        const listaCursos = await resCourses.json();
        const listaProfesores = await resTeachers.json();

        // Armar el Select de Cursos
        courseSelect.innerHTML = `<option value="">-- Selecciona un curso existente --</option>`;
        listaCursos.forEach(c => {
            courseSelect.innerHTML += `<option value="${c.id}">${c.name} (S/. ${c.monthly_cost})</option>`;
        });
        // Agregar el gatillo especial al final
        courseSelect.innerHTML += `<option value="REGISTRAR_NUEVO" style="font-weight:bold; color:#007bff;">➕ [ Registrar un nuevo curso... ]</option>`;

        // Armar el Select de Profesores (Filtrar solo los activos si tu modelo hereda is_active)
        teacherSelect.innerHTML = `<option value="">-- Selecciona un docente --</option>`;
        listaProfesores.filter(t => t.is_active !== false).forEach(t => {
            teacherSelect.innerHTML += `<option value="${t.id}">${t.name}</option>`;
        });

    } catch (error) {
        mostrarError(error.message);
    }
}

// 2. Controlar la aparición de los campos ocultos de nuevo curso
function configurarComportamientoNuevoCurso() {
    const courseSelect = document.getElementById("course-select");
    const newCourseBlock = document.getElementById("new-course-block");
    const newCourseName = document.getElementById("new-course-name");

    courseSelect.addEventListener("change", () => {
        if (courseSelect.value === "REGISTRAR_NUEVO") {
            newCourseBlock.classList.remove("hidden");
            newCourseName.required = true;
        } else {
            newCourseBlock.classList.add("hidden");
            newCourseName.required = false;
        }
    });
}

// 3. Procesar el Submit del Formulario Unificado
document.getElementById("unified-course-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const btnSubmit = document.getElementById("btn-submit");
    const courseSelectValue = document.getElementById("course-select").value;
    
    btnSubmit.disabled = true;
    btnSubmit.innerText = "Procesando...";

    try {
        let finalCourseId = courseSelectValue;

        // 🌟 DECISIÓN INTELIGENTE: Si eligió crear un nuevo curso base primero
        if (courseSelectValue === "REGISTRAR_NUEVO") {
            const coursePayload = {
                name: document.getElementById("new-course-name").value.trim(),
                monthly_cost: parseFloat(document.getElementById("new-course-cost").value)
            };

            const courseResponse = await fetch(`${API_URL}courses/`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(coursePayload)
            });

            if (!courseResponse.ok) {
                const errData = await courseResponse.json();
                throw new Error(errData.detail || "No se pudo registrar la nueva especialidad base.");
            }

            const nuevoCursoCreado = await courseResponse.json();
            finalCourseId = nuevoCursoCreado.id; // 🔑 Capturamos el ID asignado por Django
            console.log(`Paso 1 completado. Curso creado con ID: ${finalCourseId}`);
        }

        // 🌟 PASO 2: Registrar el horario programado asignándole el finalCourseId
        const checkboxesMarcados = document.querySelectorAll('input[name="class-days"]:checked');
        const diasSeleccionados = Array.from(checkboxesMarcados).map(cb => cb.value);

        // Validación de seguridad en el cliente
        if (diasSeleccionados.length === 0) {
            throw new Error("Debes seleccionar al menos un día para programar la clase.");
        }

        const classPayload = {
            course: parseInt(finalCourseId),
            teacher: parseInt(document.getElementById("teacher-select").value),
            
            // 🌟 MODIFICADO: Enviamos el array completo al nuevo campo JSON del backend
            days_of_week: diasSeleccionados, 
            
            start_hour: document.getElementById("start-hour").value + ":00",
            end_hour: document.getElementById("end-hour").value + ":00"
        };

        const classResponse = await fetch(`${API_URL}classes/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(classPayload)
        });

        if (!classResponse.ok) {
            const errData = await classResponse.json();
            throw new Error(errData.detail || "Fallo al programar el horario de la clase.");
        }

        console.log("Paso 2 completado. Clase programada exitosamente.");
        window.location.href = "courses.html";

    } catch (error) {
        console.error(error);
        mostrarError(error.message);
        btnSubmit.disabled = false;
        btnSubmit.innerText = "Guardar y Programar Clase";
    }
});

function mostrarError(msg) {
    const box = document.getElementById("error-box");
    box.innerText = msg;
    box.classList.remove("hidden");
}