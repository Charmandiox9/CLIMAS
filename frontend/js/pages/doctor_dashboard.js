import { apiFetch } from '../utils/api.js';

function formatDate(dateStr) {
    const d = new Date(dateStr);
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function filterAppointments(filtro) {
    const slots = document.querySelectorAll('#appointments-list .appointment-slot');
    const noMsg = document.querySelector('.no-citas-msg');
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    let visible = 0;
    slots.forEach(slot => {
        const d = new Date(slot.dataset.date);
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
    const doctorName = doctor.firstName ? `Dr(a). ${doctor.firstName} ${doctor.lastName}` : `Dr. ${doctor.nombreCompleto}`;
    let appointments = [];
    let consultasPorPaciente = {};
    let historialPacientes = [];

    try {
        const consultas = await apiFetch(`/consultation/user/${doctor.id}`);
        
        appointments = consultas.map(c => {
            const d = new Date(c.dateTime);
            return {
                date: c.dateTime,
                hour: `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`,
                patient: `${c.patient?.user?.firstName || 'N/A'} ${c.patient?.user?.lastName || ''}`,
                patientId: c.patientId,
                reason: c.reason || 'Consulta General',
                status: c.status
            };
        });

        const pacientesMap = new Map();

        consultas.forEach(c => {
            if (!c.patient) return;
            const patId = c.patientId;
            const patName = `${c.patient.user?.firstName || 'N/A'} ${c.patient.user?.lastName || ''}`;
            
            if (!pacientesMap.has(patId)) {
                pacientesMap.set(patId, { id: patId, nombre: patName, consultas: [] });
            }
            
            if (c.medicalRecord) {
                pacientesMap.get(patId).consultas.push({
                    fecha: c.dateTime,
                    motivo: c.reason,
                    diagnostico: c.medicalRecord.diagnosis,
                    tratamiento: c.medicalRecord.prescription || c.medicalRecord.clinicalNotes
                });
            }
        });

        historialPacientes = Array.from(pacientesMap.values());
    } catch (e) {
        console.error('Error cargando citas del doctor:', e);
    }
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
    let horarioDoctor = doctor.schedule || { "Lunes a Viernes": "09:00 - 17:00" };

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
                    <img src="../assets/img/drs/default.png" class="doctor-avatar">
                    <h3>${doctorName}</h3>
                    <p>${doctor.doctor?.area?.name || 'Médico'}</p>
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
                    ${(doctor.roles && doctor.roles.length > 1) ? `
                    <hr>
                    <div class="role-switcher" style="padding: 5px 15px;">
                        <p style="font-size:12px; color:#a0aec0; margin-bottom:10px; font-weight:bold;">CAMBIAR DE PANEL</p>
                        ${doctor.roles.includes('PATIENT') ? `<a href="user_dashboard.html" class="nav-btn" style="margin-bottom:5px; background:#e2e8f0; color:#2c3e50;"><i class="fa-solid fa-user-injured"></i> Panel Paciente</a>` : ''}
                        ${doctor.roles.includes('ADMIN') ? `<a href="admin_dashboard.html" class="nav-btn" style="margin-bottom:5px; background:#e2e8f0; color:#2c3e50;"><i class="fa-solid fa-user-tie"></i> Panel Admin</a>` : ''}
                    </div>
                    ` : ''}
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
            const target = btn.getAttribute('data-target');
            if (!target) return;
            e.preventDefault();

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
