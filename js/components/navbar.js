export function Navbar() {
    const currentPath = window.location.pathname;

    const isActive = (path) => currentPath.includes(path) ? 'active' : '';

    let session = null;
    try {
        const stored = localStorage.getItem('user_session');
        if (stored && stored !== 'undefined') {
            session = JSON.parse(stored);
        }
    } catch (e) {
        console.error('Error parsing session data');
    }

    return `
    <nav class="nav-container">
        <div class="container nav-content">
            <a href="index.html" class="nav-logo">
                <i class="fa-solid fa-house-medical"></i>
                <span>CLIMAS</span>
            </a>

            <button class="menu-toggle" id="menu-toggle">
                <i class="fa-solid fa-bars"></i>
            </button>

            <div class="nav-links">
                <a href="index.html" class="nav-link ${isActive('index.html')}">Inicio</a>
                <a href="doctors.html" class="nav-link ${isActive('doctors.html')}">Especialidades</a>
                <a href="about.html" class="nav-link ${isActive('about.html')}">Sobre Nosotros</a>
                <a href="contact.html" class="nav-link ${isActive('contact.html')}">Contacto</a>
                <a href="schedule.html" class="nav-link ${isActive('schedule.html')}">Agendar Cita</a>
                ${session ? `<a href="dashboard.html" class="nav-link ${isActive('dashboard.html')}">Mi Panel</a>
                       <a href="#" id="logout-link" class="nav-link" style="color: #e74c3c;">Salir</a>`
                    : `<a href="login.html" class="btn-cta">Portal Doctores</a>`
                }
            </div>
        </div>
    </nav>
    `;
}

export function initLogoutEvent() {
    const logoutBtn = document.getElementById('logout-link');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user_session'); // Limpia la sesión
            window.location.href = 'index.html';    // Pa la casa
        });
    }
}