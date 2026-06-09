export function Navbar() {
    const currentPath = window.location.pathname;
    const isRoot = !currentPath.includes('/views/');
    const r = isRoot ? '' : '../';
    const b = isRoot ? 'views/' : '';

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
            <a href="${r}index.html" class="nav-logo">
                <i class="fa-solid fa-house-medical"></i>
                <span>CLIMAS</span>
            </a>

            <div class="nav-links">
                <a href="${r}index.html" class="nav-link ${isActive('index.html')}">Inicio</a>
                <a href="${b}doctors.html" class="nav-link ${isActive('doctors.html')}">Especialidades</a>
                <a href="${b}about.html" class="nav-link ${isActive('about.html')}">Sobre Nosotros</a>
                <a href="${b}contacto.html" class="nav-link ${isActive('contacto.html')}">Contacto</a>
                <a href="${b}schedule.html" class="nav-link ${isActive('schedule.html')}">Agendar Cita</a>
                ${session ? `<a href="${b}${session.roles?.includes('DOCTOR') ? 'doctor_dashboard.html' : (session.roles?.includes('ADMIN') ? 'admin_dashboard.html' : 'user_dashboard.html')}" class="nav-link ${isActive('dashboard')}">Mi Panel</a>
                       <a href="#" id="logout-link" class="nav-link" style="color: #e74c3c;">Salir</a>`
                    : `<a href="${b}login.html" class="btn-cta">Portal Doctores</a>`
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
            localStorage.removeItem('user_session');
            const r = !window.location.pathname.includes('/views/') ? 'index.html' : '../index.html';
            window.location.href = r;
        });
    }
}
