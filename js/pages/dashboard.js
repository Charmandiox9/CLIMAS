export function DashboardPage(doctor) {
    // Datos de ejemplo (Mock data) para que se vea lleno
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
                <div class="card-actions">
                    <button class="btn-view"><i class="fa-solid fa-eye"></i></button>
                    <button class="btn-check"><i class="fa-solid fa-check"></i></button>
                </div>
            </div>
        </div>
    `).join('');

    return `
    <div class="dashboard-container container">
        <header class="dash-header">
            <div class="welcome-text">
                <h1>Agenda de Hoy</h1>
                <p>Bienvenido, <strong>Dr. ${doctor.nombreCompleto}</strong> | ${new Date().toLocaleDateString()}</p>
            </div>
        </header>

        <div class="dash-layout">
            <aside class="dash-sidebar">
                <div class="profile-section">
                    <img src="${doctor.FotoPerfil}" alt="Doctor" class="doctor-avatar">
                    <h3>${doctor.Especialidad}</h3>
                </div>
                <nav class="dash-nav">
                    <a href="#" class="active"><i class="fa-solid fa-calendar-day"></i> Hoy</a>
                    <a href="#"><i class="fa-solid fa-users"></i> Pacientes</a>
                    <a href="#"><i class="fa-solid fa-gear"></i> Ajustes</a>
                </nav>
            </aside>

            <main class="dash-main">
                <div class="timeline-container">
                    ${appointmentCards}
                </div>
            </main>
        </div>
    </div>
    `;
}