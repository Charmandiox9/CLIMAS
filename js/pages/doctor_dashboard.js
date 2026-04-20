export function DashboardPage(doctor) {
    const appointments = [
        { hour: "09:00", patient: "Alan Brito", reason: "Control Post-Operatorio", status: "Confirmado" },
        { hour: "10:30", patient: "Elena Nito", reason: "Consulta General", status: "Pendiente" },
        { hour: "12:00", patient: "Zacarias Labarca", reason: "Revisión de Exámenes", status: "En espera" }
    ];

    const appointmentCards = appointments.map(app => `
        <div class="appointment-slot">
            <div class="time-marker">${app.hour}</div>
            <div class="patient-card">
                <div class="card-status status-${app.status.toLowerCase().replace(" ", "-")}"></div>
                <div class="card-info">
                    <h4>${app.patient}</h4>
                    <p><i class="fa-solid fa-notes-medical"></i> ${app.reason}</p>
                </div>
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
                    <h2>Agenda de Citas</h2>
                    <div class="timeline-container">${appointmentCards}</div>
                </section>

                <section id="section-horario" class="content-section" style="display:none;">
                    <div class="section-header-flex">
                        <h2>Mi Disponibilidad Semanal</h2>
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
                alert(`Horario actualizado para el ${day}: ${newHours}`);

                btn.parentElement.querySelector('.hours-val').innerText = newHours;
            }
        });
    });
}
