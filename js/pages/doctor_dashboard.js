function formatDate(dateStr) {
    const [y, m, d] = dateStr.split('-');
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${parseInt(d)} ${months[parseInt(m)-1]} ${y}`;
}

function filterAppointments(filtro) {
    const slots = document.querySelectorAll('#appointments-list .appointment-slot');
    const noMsg = document.querySelector('.no-citas-msg');
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

export async function DashboardPage(doctor) {
    const appointments = [
        { date: "2026-04-28", hour: "09:00", patient: "Alan Brito", reason: "Control Post-Operatorio", status: "Confirmado"},
        { date: "2026-04-28", hour: "10:30", patient: "Elena Nito", reason: "Consulta General", status: "Pendiente"},
        { date: "2026-04-29", hour: "11:00", patient: "Zacarias Labarca",  reason: "Revisión de Exámenes", status: "En espera"}
    ];

    const appointmentCards = appointments.map(app => `
        <div class="appointment-slot" data-date="${app.date}">
            <div class="time-marker">${app.hour}</div>
            <div class="patient-card">
                <div class="card-status status-${app.status.toLowerCase().replace(/ /g, '-')}"></div>
                <div class="card-info">
                    <h4>${app.patient}</h4>
                    <p><i class="fa-solid fa-notes-medical"></i> ${app.reason}</p>
                    <small><i class="fa-regular fa-calendar"></i> ${formatDate(app.date)}</small>
                </div>
                <div class="card-badge status-badge-${app.status.toLowerCase().replace(/ /g, '-')}">${app.status}</div>
            </div>
        </div>
    `).join('');
    
    let scheduleRows = "";
    
    let horarioDoctor = doctor.schedule;

    if (horarioDoctor) {
        for (let dia in horarioDoctor) {
            let horas = horarioDoctor[dia];
            scheduleRows += `
        <div class="schedule-row">
            <span class="day-label">` + dia + `</span>
            <span class="hours-val">` + horas + `</span>
            <button class="btn-edit-slot" data-day="` + dia + `"><i class="fa-solid fa-pen"></i></button>
        </div>
            `;
        }
    } else {
        scheduleRows = "<p style='padding: 20px; color: #a0aec0;'>No tiene horario asignado o debe volver a iniciar sesión para actualizar sus datos.</p>";
    }

    const consultasPorPaciente = {
        102: [
            { fecha: "2026-03-15", motivo: "Consulta Inicial",        diagnostico: "Esguince de rodilla grado II",  tratamiento: "Reposo 15 días, antiinflamatorios" },
            { fecha: "2026-04-28", motivo: "Control Post-Operatorio", diagnostico: "Evolución satisfactoria",        tratamiento: "Ejercicios de rehabilitación" },
        ]
    };

    let historialPacientes = [];
    try {
        const res = await fetch('../assets/data/equipomedico.json');
        const data = await res.json();
        historialPacientes = data.users
            .filter(u => u.role === 'user')
            .map(u => ({
                id: u.id,
                nombre: u.name,
                consultas: consultasPorPaciente[u.id] || []
            }));
    } catch (e) {
        console.error('Error cargando pacientes:', e);
    }
    

    const historialOptions = historialPacientes.map(p =>
        `<option value="${p.id}">${p.nombre}</option>`
    ).join('');

    const historialCards = historialPacientes.map(p => `
        <div class="historial-paciente-panel" data-paciente-id="${p.id}" style="display:none;">
            <div class="historial-paciente-header">
                <div class="historial-avatar"><i class="fa-solid fa-user-injured"></i></div>
                <div>
                    <h3>${p.nombre}</h3>
                    <span>${p.consultas.length} consulta${p.consultas.length !== 1 ? 's' : ''} registrada${p.consultas.length !== 1 ? 's' : ''}</span>
                </div>
            </div>
            <div class="historial-consultas">
                ${p.consultas.map(c => `
                    <div class="historial-consulta-card">
                        <div class="historial-consulta-fecha">
                            <i class="fa-regular fa-calendar-check"></i>
                            <span>${formatDate(c.fecha)}</span>
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
                    <img src="../assets/${doctor.FotoPerfil || 'img/drs/default.png'}" class="doctor-avatar">
                    <h3>Dr. ${doctor.nombreCompleto}</h3>
                    <p>${doctor.Especialidad}</p>
                </div>
                <nav class="dash-nav">
                    <a href="#" class="nav-btn activate" data-target="section-citas">
                        <i class="fa-solid fa-calendar-day"></i> Mis Citas
                    </a>
                    <hr>
                    <a href="#" class="nav-btn" data-target="section-historial">
                        <i class="fa-solid fa-file-medical"></i> Historial Clínico
                    </a>
                    <hr>
                    <a href="#" class="nav-btn" data-target="section-horario">
                        <i class="fa-solid fa-clock"></i> Mi Horario
                    </a>
                    <hr>
                    <a href="#" id="logout-btn" class="logout-link">
                        <i class="fa-solid fa-right-from-bracket"></i> Cerrar Sesión
                    </a>
                </nav>
            </aside>

            <main class="dash-main">

                <section id="section-citas" class="content-section">
                    <div class="section-header-flex">
                        <h2><i class="fa-solid fa-calendar-day"></i> Agenda de Citas</h2>
                        <div class="citas-filter">
                            <label for="filtro-citas"><i class="fa-solid fa-filter"></i></label>
                            <select id="filtro-citas">
                                <option value="semana">Esta semana</option>
                                <option value="mes">Este mes</option>
                                <option value="todo">Todas</option>
                            </select>
                        </div>
                    </div>
                    <div class="timeline-container" id="appointments-list">
                        ${appointmentCards}
                    </div>
                    <p class="no-citas-msg" style="display:none; padding:20px; color:#a0aec0; text-align:center;">
                        <i class="fa-regular fa-calendar-xmark"></i> No hay citas para el período seleccionado.
                    </p>
                </section>

                <section id="section-historial" class="content-section" style="display:none;">
                    <div class="section-header-flex">
                        <h2><i class="fa-solid fa-file-medical"></i> Historial Clínico</h2>
                    </div>
                    <div class="historial-selector-wrapper">
                        <label for="selector-paciente"><i class="fa-solid fa-user-injured"></i> Seleccionar paciente:</label>
                        <select id="selector-paciente">
                            <option value="">— Selecciona un paciente —</option>
                            ${historialOptions}
                        </select>
                    </div>
                    <div id="historial-content">
                        <div class="historial-empty-state">
                            <i class="fa-solid fa-folder-open"></i>
                            <p>Selecciona un paciente para ver su historial clínico.</p>
                        </div>
                        ${historialCards}
                    </div>
                </section>

                <section id="section-horario" class="content-section" style="display:none;">
                    <div class="section-header-flex">
                        <h2><i class="fa-solid fa-clock"></i> Mi Disponibilidad Semanal</h2>
                        <button id="btn-add-exception" class="btn-cta-small">Agregar Excepción</button>
                    </div>
                    <div class="schedule-grid-container">
                        ${scheduleRows || '<p>No hay horario configurado.</p>'}
                    </div>
                    <div class="info-note">
                        <i class="fa-solid fa-circle-info"></i>
                        <p>Estos horarios son visibles para los pacientes en el módulo de agendamiento.</p>
                    </div>
                </section>

            </main>
        </div>
    </div>
    `;
}

export function initDashboardEvents() {

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

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm("¿Estás seguro que deseas cerrar sesión?")) {
                localStorage.removeItem('user_session');
                window.location.href = '../index.html';
            }
        });
    }

    const editButtons = document.querySelectorAll('.btn-edit-slot');
    editButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const day = btn.getAttribute('data-day');
            const newHours = prompt(`Editar horario para el ${day}:`, "09:00 - 17:00");
            if (newHours) {
                btn.parentElement.querySelector('.hours-val').innerText = newHours;
            }
        });
    });

    const filtroCitas = document.getElementById('filtro-citas');
    if (filtroCitas) {
        filterAppointments(filtroCitas.value);
        filtroCitas.addEventListener('change', () => filterAppointments(filtroCitas.value));
    }

    const selectorPaciente = document.getElementById('selector-paciente');
    if (selectorPaciente) {
        selectorPaciente.addEventListener('change', () => {
            const id = selectorPaciente.value;
            document.querySelectorAll('.historial-paciente-panel').forEach(p => p.style.display = 'none');
            const emptyState = document.querySelector('#historial-content .historial-empty-state');
            if (emptyState) emptyState.style.display = id ? 'none' : 'flex';
            if (id) {
                const panel = document.querySelector(`.historial-paciente-panel[data-paciente-id="${id}"]`);
                if (panel) panel.style.display = 'block';
            }
        });
    }
}
