document.addEventListener("DOMContentLoaded", () => {
    const sidebarContainer = document.getElementById("sidebar-container");
    
    // Safety guard: si la página no requiere el componente, omitir
    if (!sidebarContainer) return;

    // Inyectamos la estructura incluyendo el nuevo botón interactivo (hamburguesa)
    sidebarContainer.innerHTML = `
        <div class="sidebar" id="main-sidebar">
            <button id="sidebar-toggle" class="sidebar-toggle" title="Alternar menú">☰</button>
            <div class="sidebar-brand">ArtDance Studio</div>
            <ul class="sidebar-menu">
                <li><a href="/index.html" id="nav-index">Inicio</a></li>
                <li><a href="/students/students.html" id="nav-students">Estudiantes</a></li>
                <li><a href="/teachers/teachers.html" id="nav-teachers">Profesores</a></li>
                <li><a href="/courses/courses.html" id="nav-courses">Cursos</a></li>
                <li><a href="/attendance.html" id="nav-attendance">Asistencias</a></li>
                <li><a href="/statistics.html" id="nav-statistics">Estadísticas</a></li>
            </ul>
            <div class="sidebar-footer">
                <button id="logout-btn" class="logout-btn">Cerrar Sesión</button>
            </div>
        </div>
    `;

    // Resaltado de la ruta activa en el menú
    const currentPath = window.location.pathname;
    if (currentPath.includes("index.html") || currentPath === "/") {
        document.getElementById("nav-index")?.classList.add("active");
    } else if (currentPath.includes("students/students.html")) {
        document.getElementById("nav-students")?.classList.add("active");
    } else if (currentPath.includes("teachers/teachers.html")) {
        document.getElementById("nav-teachers")?.classList.add("active");
    } else if (currentPath.includes("courses/courses.html")) {
        document.getElementById("nav-courses")?.classList.add("active");
    } else if (currentPath.includes("attendance.html")) {
        document.getElementById("nav-attendance")?.classList.add("active");
    } else if (currentPath.includes("statistics.html")) {
        document.getElementById("nav-statistics")?.classList.add("active");
    }

    // 🌟 NUEVO: Lógica de alternancia (Show/Hide) para los alumnos
    const sidebarToggle = document.getElementById("sidebar-toggle");
    const mainSidebar = document.getElementById("main-sidebar");

    sidebarToggle.addEventListener("click", () => {
        mainSidebar.classList.toggle("collapsed");
    });

    // Control de cierre de sesión
    document.getElementById("logout-btn").addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login.html";
    });
});