import { apiFetch } from '../utils/api.js';

let doctoresBD = [];
let especialidadesBD = [];

const schedules = {
  "09:00 AM": "09:00",
  "10:00 AM": "10:00",
  "11:00 AM": "11:00",
  "01:00 PM": "13:00",
  "02:00 PM": "14:00",
  "03:00 PM": "15:00"
};


export const SchedulePage = () => {
  return `
    <div class="schedule-page-wrapper">
      <section class="schedule-hero">
        <div class="container">
          <h1>Agendar Cita</h1>
          <p>Gestione su atención médica de forma rápida y sencilla</p>
        </div>
      </section>

      <section class="schedule-content">
        <div class="container">
          <form id="schedule-form" class="schedule-form-grid">
            
            <div class="selection-card">
              <h3>Especialidad</h3>
              <label for="specialty">Seleccione el área de atención:</label>
              <select id="specialty" name="specialty" required>
                <option value="" disabled selected>Cargando especialidades...</option>
              </select>
            </div>

            <div class="selection-card">
              <h3>Médico</h3>
              <label for="doctor">Profesional disponible:</label>
              <select id="doctor" name="doctor" required disabled>
                <option value="" disabled selected>Seleccione especialidad primero</option>
              </select>
            </div>

              <h3>Fecha de Atención</h3>
              <label for="fecha">Seleccione un día:</label>
              <input type="date" id="fecha" name="fecha" required>
            </div>

            <div class="selection-card">
              <h3>Horario</h3>
              <label for="schedule">Horas disponibles:</label>
              <select id="schedule" name="schedule" required>
                <option value="" disabled selected>Seleccione un horario</option>
                ${Object.entries(schedules).map(([label, val]) => `
                  <option value="${val}">${label}</option>
                `).join('')}
              </select>
            </div>

            <div class="form-actions">
              <button type="submit" class="submit-btn">Confirmar Cita Médica</button>
            </div>
          </form>
        </div>
      </section>
    </div>
  `;
}

export const initScheduleEvents = async () => {
  const form = document.getElementById('schedule-form');
  const specialtySelect = document.getElementById('specialty');
  const doctorSelect = document.getElementById('doctor');
  const fechaInput = document.getElementById('fecha');

  if (!specialtySelect || !doctorSelect) return;

  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  if(fechaInput) fechaInput.min = today;

  try {
    const areas = await apiFetch('/area?isActive=true');
    doctoresBD = await apiFetch('/user/doctors');
    
    specialtySelect.innerHTML = `
      <option value="" disabled selected>Seleccione especialidad</option>
      ${areas.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
    `;
  } catch (error) {
    console.error("Error cargando datos:", error);
  }

  specialtySelect.addEventListener('change', (e) => {
    const selectedAreaId = e.target.value;
    const docsInArea = doctoresBD.filter(d => d.doctor?.area?.id === selectedAreaId);

    doctorSelect.disabled = false;
    doctorSelect.innerHTML = `
      <option value="" disabled selected>Seleccione un médico</option>
      ${docsInArea.map(doc => `<option value="${doc.doctor?.id}">Dr(a). ${doc.firstName} ${doc.lastName}</option>`).join('')}
    `;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const sessionStr = localStorage.getItem('user_session');
    if (!sessionStr) {
      alert("Debe iniciar sesión como paciente para agendar citas.");
      window.location.href = 'login.html';
      return;
    }
    const session = JSON.parse(sessionStr);

    if (!session.roles?.includes('PATIENT')) {
      alert("Solo pacientes pueden agendar citas.");
      return;
    }

    const formData = new FormData(form);
    const doctorId = formData.get('doctor');
    const fecha = formData.get('fecha');
    const hora = formData.get('schedule');
    
    const dateTime = new Date(`${fecha}T${hora}:00`);

    try {
      await apiFetch('/consultation', {
        method: 'POST',
        body: JSON.stringify({
          dateTime: dateTime.toISOString(),
          reason: "Consulta agendada por web",
          doctorId: doctorId,
          patientId: session.patient?.id || session.id // Handle potential missing patient.id
        })
      });

      alert("Cita confirmada exitosamente.");
      window.location.href = 'user_dashboard.html';
    } catch (error) {
      alert(`Error al agendar cita: ${error.message}`);
    }
  });
};