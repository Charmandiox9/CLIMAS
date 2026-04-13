export function Navbar() {
    const currentPath = window.location.pathname;

    const isActive = (path) => currentPath.includes(path) ? 'active' : '';

    return `
    <nav class="nav-container">
        <div class="container nav-content">
            <a href="index.html" class="nav-logo">
                <i class="fa-solid fa-house-medical"></i>
                <span>CLIMAS</span>
            </a>
            <div class="nav-links">
                <a href="index.html" class="nav-link ${isActive('index.html')}">Inicio</a>
                <a href="doctors.html" class="nav-link ${isActive('doctors.html')}">Especialidades</a>
                <a href="about.html" class="nav-link ${isActive('about.html')}">Sobre Nosotros</a>
                <a href="schedule.html" class="nav-link ${isActive('schedule.html')}">Agendar Cita</a>
            </div>
        </div>
    </nav>
    `;
}