import { apiFetch } from '../utils/api.js';

export async function AdminDashboardPage(admin) {
  let users = [];
  let doctors = [];
  let specialties = [];
  let appointments = [];

  try {
    users = await apiFetch('/user');
    doctors = await apiFetch('/user/doctors');
    const areas = await apiFetch('/area');
    specialties = areas.map(a => a.name);
    
    const consultationsData = await apiFetch('/consultation');
    appointments = consultationsData.map(c => {
      const d = new Date(c.dateTime);
      return {
        hour: `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`,
        patient: `${c.patient?.user?.firstName || 'N/A'} ${c.patient?.user?.lastName || ''}`,
        reason: c.reason || 'Consulta General',
        status: c.status
      };
    });
  } catch (error) {
    console.error("Error cargando datos de admin", error);
  }

  const usersCards = users.map(user => `
    <div class="user-card">
      <h4>ID: ${user.id}</h4>
      <h4>${user.firstName} ${user.lastName}</h4>
      <h4>${user.email}</h4>
    </div>
  `).join('');

  const doctorsCards = doctors.map(doc => `
    <div class="doctor-card">
      <img src="../assets/img/drs/default.png" class="doctor-avatar">
      <h4>ID: ${doc.doctor?.id}</h4>
      <h4>Dr(a). ${doc.firstName} ${doc.lastName}</h4>
      <h4>${doc.email}</h4>
      <h4>${doc.doctor?.area?.name || 'General'}</h4>
      <h4>Licencia: ${doc.doctor?.medicalLicense || 'N/A'}</h4>
    </div>
  `).join('');

  const specialtiesCards = specialties.map(specialty => `
    <div class="specialty-card">
      <h4>${specialty}</h4>
    </div>
  `).join('');

  const appointmentCards = appointments.map(app => `
    <div class="appointment-slot">
      <div class="time-marker">${app.hour}</div>
      <div class="patient-card">
        <div class="card-status status-${app.status.toLowerCase().replace(/ /g, "-")}"></div>
        <div class="card-info">
          <h4>${app.patient}</h4>
          <p><i class="fa-solid fa-notes-medical"></i> ${app.reason}</p>
        </div>
      </div>
    </div>
  `).join('');

  return `
  <div class="dashboard-container container">
    <div class="dash-layout">
      <aside class="dash-sidebar">
        <div class="profile-section">
          <img src="../assets/img/drs/Gemini_Generated_Image_rst2fvrst2fvrst2.png" class="doctor-avatar">
          <h3>${admin.firstName} ${admin.lastName}</h3>
          <p>Administrador</p>
        </div>
        <nav class="dash-nav">
          <a href="#" class="nav-btn activate" data-target="section-usuarios">
            <i class="fa-solid fa-users"></i> Usuarios
          </a>
          <hr>
          <a href="#" class="nav-btn" data-target="section-doctores">
            <i class="fa-solid fa-user-doctor"></i> Doctores
          </a>
          <hr>
          <a href="#" class="nav-btn" data-target="section-especialidades">
            <i class="fa-solid fa-stethoscope"></i> Especialidades
          </a>
          <hr>
          <a href="#" class="nav-btn" data-target="section-citas">
            <i class="fa-solid fa-calendar-day"></i> Agenda de Citas
          </a>
          ${(admin.roles && admin.roles.length > 1) ? `
          <hr>
          <div class="role-switcher" style="padding: 5px 15px;">
              <p style="font-size:12px; color:#a0aec0; margin-bottom:10px; font-weight:bold;">CAMBIAR DE PANEL</p>
              ${admin.roles.includes('PATIENT') ? `<a href="user_dashboard.html" class="nav-btn" style="margin-bottom:5px; background:#e2e8f0; color:#2c3e50;"><i class="fa-solid fa-user-injured"></i> Panel Paciente</a>` : ''}
              ${admin.roles.includes('DOCTOR') ? `<a href="doctor_dashboard.html" class="nav-btn" style="margin-bottom:5px; background:#e2e8f0; color:#2c3e50;"><i class="fa-solid fa-user-md"></i> Panel Médico</a>` : ''}
          </div>
          ` : ''}
          <hr>
          <a href="#" id="logout-btn" class="logout-link">
            <i class="fa-solid fa-right-from-bracket"></i> Cerrar Sesión
          </a>
        </nav>
      </aside>

      <main class="dash-main">
        <section id="section-usuarios" class="content-section">
          <h2>Usuarios</h2>
          <div class="timeline-container">${usersCards}</div>
        </section>

        <section id="section-doctores" class="content-section" style="display:none">
          <h2>Doctores</h2>
          <div class="timeline-container">${doctorsCards}</div>
        </section>

        <section id="section-especialidades" class="content-section" style="display:none">
          <h2>Especialidades</h2>
          <div class="timeline-container">${specialtiesCards}</div>
        </section>

        <section id="section-citas" class="content-section" style="display:none">
          <h2>Agenda de Citas</h2>
          <div class="timeline-container">${appointmentCards}</div>
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
      const targetSection = document.getElementById(target);
      if (targetSection) targetSection.style.display = 'block';
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