function formatUserDate(dateStr) {
    const [y, m, d] = dateStr.split('-');
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${parseInt(d)} ${months[parseInt(m)-1]} ${y}`;
}

function filterUserAppointments(filtro) {
    const slots = document.querySelectorAll('#user-appointments-list .appointment-slot');
    const noMsg = document.querySelector('.user-no-citas');
    const today = new Date('2026-04-28');
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    let visible = 0;
    slots.forEach(slot => {
        const d = new Date(slot.dataset.date + 'T00:00:00');
        let show = false;
        if (filtro === 'semana') {
            show = d >= startOfWeek && d <= endOfWeek;
        } else if (filtro === 'mes') {
            show = d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
        } else {
            show = true;
        }
        slot.style.display = show ? 'flex' : 'none';
        if (show) visible++;
    });
    if (noMsg) noMsg.style.display = visible === 0 ? 'block' : 'none';
}

export function UserDashboardPage(user) {
    const userName = user.name || user.nombreCompleto || 'Usuario';

    const misCitas = [
        { date: "2026-04-28", hour: "09:00", doctor: "Dr. Diego Messi",  especialidad: "Traumatología", motivo: "Control Post-Operatorio", status: "Confirmado" },
        { date: "2026-04-30", hour: "11:00", doctor: "Dr. Daniel Durán", especialidad: "Cardiología",   motivo: "Evaluación Cardíaca",    status: "Pendiente"  },
        { date: "2026-04-23", hour: "10:00", doctor: "Dr. Diego Messi",  especialidad: "Traumatología", motivo: "Consulta Inicial",        status: "Confirmado" },
        { date: "2026-03-15", hour: "09:30", doctor: "Dr. Diego Messi",    especialidad: "Traumatología", motivo: "Primera Consulta",        status: "Confirmado" },
        { date: "2026-03-10", hour: "14:00", doctor: "Dr. Daniel Durán",  especialidad: "Cardiología",   motivo: "Examen de rutina",        status: "Confirmado" },
        { date: "2026-04-30", hour: "15:00", doctor: "Dr. Martin Castillo", especialidad: "Neurología",  motivo: "Evaluación Mental",       status: "Pendiente"  },
        { date: "2026-03-05", hour: "10:00", doctor: "Dr. Martin Castillo", especialidad: "Neurología",  motivo: "Examen de rutina",        status: "Confirmado" },
    ];

    const historialClinico = {
        "Dr. Diego Messi": [
            { fecha: "2026-03-15", motivo: "Primera Consulta", diagnostico: "Esguince de rodilla grado II",   tratamiento: "Reposo 15 días, antiinflamatorios" },
            { fecha: "2026-04-23", motivo: "Consulta Inicial", diagnostico: "Evolución satisfactoria",        tratamiento: "Ejercicios de rehabilitación" },
            { fecha: "2026-04-28", motivo: "Control Post-Operatorio", diagnostico: "Recuperación completa",          tratamiento: "Alta médica" },
        ],
        "Dr. Daniel Durán": [
            { fecha: "2026-03-10", motivo: "Examen de rutina",  diagnostico: "Leve hipertensión arterial",  tratamiento: "Medicación diaria, control en 1 mes" },
            { fecha: "2026-04-30", motivo: "Evaluación Cardíaca", diagnostico: "Pendiente de evaluación",  tratamiento: "Pendiente" },
        ],
        "Dr. Martin Castillo": [
            { fecha: "2026-03-10", motivo: "Examen de rutina",  diagnostico: "Divergencia neuronal",  tratamiento: "Medicación diaria, control en 1 mes" },
            { fecha: "2026-04-30", motivo: "Evaluación Mental", diagnostico: "Pendiente de evaluación",  tratamiento: "Pendiente" },
        ],        
    };

    const today = new Date('2026-04-28');
    const proximas = misCitas.filter(c => new Date(c.date + 'T00:00:00') >= today);
    const doctoresConsultados = [...new Set(misCitas.map(c => c.doctor))].length;
    const proximaCita = proximas.length > 0 ? proximas[0] : null;

    const citasCards = misCitas.map(c => `
        <div class="appointment-slot" data-date="${c.date}">
            <div class="time-marker">${c.hour}</div>
            <div class="patient-card">
                <div class="card-status status-${c.status.toLowerCase().replace(/ /g, '-')}"></div>
                <div class="card-info">
                    <h4>${c.doctor}</h4>
                    <p><i class="fa-solid fa-stethoscope"></i> ${c.especialidad} — ${c.motivo}</p>
                    <small><i class="fa-regular fa-calendar"></i> ${formatUserDate(c.date)}</small>
                </div>
                <div class="card-badge status-badge-${c.status.toLowerCase().replace(/ /g, '-')}">${c.status}</div>
            </div>
        </div>
    `).join('');

    const doctorOptions = Object.keys(historialClinico).map(doc =>
        `<option value="${doc}">${doc}</option>`
    ).join('');

    const historialPanels = Object.entries(historialClinico).map(([doc, consultas]) => `
        <div class="historial-paciente-panel" data-doctor="${doc}" style="display:none;">
            <div class="historial-paciente-header">
                <div class="historial-avatar"><i class="fa-solid fa-user-doctor"></i></div>
                <div>
                    <h3>${doc}</h3>
                    <span>${consultas.length} consulta${consultas.length !== 1 ? 's' : ''} registrada${consultas.length !== 1 ? 's' : ''}</span>
                </div>
            </div>
            <div class="historial-consultas">
                ${consultas.map(c => `
                    <div class="historial-consulta-card">
                        <div class="historial-consulta-fecha">
                            <i class="fa-regular fa-calendar-check"></i>
                            <span>${formatUserDate(c.fecha)}</span>
                        </div>
                        <div class="historial-consulta-body">
                            <div class="historial-row">
                                <span class="historial-label"><i class="fa-solid fa-stethoscope"></i> Motivo</span>
                                <span>${c.motivo}</span>
                            </div>
                            <div class="historial-row">
                                <span class="historial-label"><i class="fa-solid fa-microscope"></i> Diagnóstico</span>
                                <span>${c.diagnostico}</span>
                            </div>
                            <div class="historial-row">
                                <span class="historial-label"><i class="fa-solid fa-pills"></i> Tratamiento</span>
                                <span>${c.tratamiento}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    return `
    <div class="dashboard-container container">
        <div class="dash-layout">
            <aside class="dash-sidebar">
                <div class="profile-section">
                    <div class="user-avatar-icon"><i class="fa-solid fa-circle-user"></i></div>
                    <h3>${userName}</h3>
                    <p>Paciente</p>
                </div>
                <nav class="dash-nav">
                    <a href="#" class="nav-btn activate" data-target="user-section-inicio">
                        <i class="fa-solid fa-house-medical"></i> Inicio
                    </a>
                    <hr>
                    <a href="#" class="nav-btn" data-target="user-section-citas">
                        <i class="fa-solid fa-calendar-day"></i> Mis Citas
                    </a>
                    <hr>
                    <a href="#" class="nav-btn" data-target="user-section-historial">
                        <i class="fa-solid fa-file-medical"></i> Historial Clínico
                    </a>
                    <hr>
                    <a href="#" id="user-logout-btn" class="logout-link">
                        <i class="fa-solid fa-right-from-bracket"></i> Cerrar Sesión
                    </a>
                </nav>
            </aside>

            <main class="dash-main">

                <section id="user-section-inicio" class="content-section">
                    <h2><i class="fa-solid fa-house-medical"></i> Bienvenido, ${userName}</h2>
                    <p class="section-subtitle">Aquí tienes un resumen de tu actividad médica en CLIMAS.</p>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <i class="fa-solid fa-calendar-check stat-icon"></i>
                            <div class="stat-info">
                                <span class="stat-value">${proximas.length}</span>
                                <span class="stat-label">Próximas citas</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <i class="fa-solid fa-user-doctor stat-icon"></i>
                            <div class="stat-info">
                                <span class="stat-value">${doctoresConsultados}</span>
                                <span class="stat-label">Doctores consultados</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <i class="fa-solid fa-clipboard-list stat-icon"></i>
                            <div class="stat-info">
                                <span class="stat-value">${misCitas.length}</span>
                                <span class="stat-label">Citas totales</span>
                            </div>
                        </div>
                    </div>
                    ${proximaCita ? `
                    <div class="proxima-cita-card">
                        <div class="proxima-cita-header">
                            <i class="fa-solid fa-bell"></i>
                            <h3>Próxima cita</h3>
                        </div>
                        <div class="proxima-cita-body">
                            <p><strong>${proximaCita.doctor}</strong> — ${proximaCita.especialidad}</p>
                            <p><i class="fa-regular fa-calendar"></i> ${formatUserDate(proximaCita.date)} a las ${proximaCita.hour}</p>
                            <p><i class="fa-solid fa-notes-medical"></i> ${proximaCita.motivo}</p>
                            <span class="card-badge status-badge-${proximaCita.status.toLowerCase().replace(/ /g, '-')}">${proximaCita.status}</span>
                        </div>
                    </div>` : ''}
                </section>

                <section id="user-section-citas" class="content-section" style="display:none;">
                    <div class="section-header-flex">
                        <h2><i class="fa-solid fa-calendar-day"></i> Mis Citas</h2>
                        <div class="citas-filter">
                            <label for="user-filtro-citas"><i class="fa-solid fa-filter"></i></label>
                            <select id="user-filtro-citas">
                                <option value="semana">Esta semana</option>
                                <option value="mes">Este mes</option>
                                <option value="todo">Todas</option>
                            </select>
                        </div>
                    </div>
                    <div class="timeline-container" id="user-appointments-list">
                        ${citasCards}
                    </div>
                    <p class="no-citas-msg user-no-citas" style="display:none; padding:20px; color:#a0aec0; text-align:center;">
                        <i class="fa-regular fa-calendar-xmark"></i> No hay citas para el período seleccionado.
                    </p>
                </section>

                <section id="user-section-historial" class="content-section" style="display:none;">
                    <div class="section-header-flex">
                        <h2><i class="fa-solid fa-file-medical"></i> Historial Clínico</h2>
                    </div>
                    <div class="historial-selector-wrapper">
                        <label for="user-selector-doctor"><i class="fa-solid fa-user-doctor"></i> Filtrar por doctor:</label>
                        <select id="user-selector-doctor">
                            <option value="">— Selecciona un doctor —</option>
                            ${doctorOptions}
                        </select>
                    </div>
                    <div id="user-historial-content">
                        <div class="historial-empty-state">
                            <i class="fa-solid fa-folder-open"></i>
                            <p>Selecciona un doctor para ver tu historial de consultas.</p>
                        </div>
                        ${historialPanels}
                    </div>
                </section>

            </main>
        </div>
    </div>
    `;
}

export function initUserDashboardEvents() {
    const buttons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');

    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = btn.getAttribute('data-target');
            if (!target) return;

            buttons.forEach(b => b.classList.remove('activate'));
            sections.forEach(s => s.style.display = 'none');

            btn.classList.add('activate');
            document.getElementById(target).style.display = 'block';
        });
    });

    const logoutBtn = document.getElementById('user-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm("¿Estás seguro que deseas cerrar sesión?")) {
                localStorage.removeItem('user_session');
                window.location.href = '../index.html';
            }
        });
    }

    const filtroUser = document.getElementById('user-filtro-citas');
    if (filtroUser) {
        filterUserAppointments(filtroUser.value);
        filtroUser.addEventListener('change', () => filterUserAppointments(filtroUser.value));
    }

    const selectorDoctor = document.getElementById('user-selector-doctor');
    if (selectorDoctor) {
        selectorDoctor.addEventListener('change', () => {
            const doc = selectorDoctor.value;
            document.querySelectorAll('#user-historial-content .historial-paciente-panel').forEach(p => p.style.display = 'none');
            const emptyState = document.querySelector('#user-historial-content .historial-empty-state');
            if (emptyState) emptyState.style.display = doc ? 'none' : 'flex';
            if (doc) {
                const panel = document.querySelector(`#user-historial-content .historial-paciente-panel[data-doctor="${doc}"]`);
                if (panel) panel.style.display = 'block';
            }
        });
    }
}
