const specialties = {
  "Cardiología": ["Dr. Juan Pérez", "Dra. María Gómez"],
  "Neurología": ["Dr. Carlos López", "Dra. Ana Martínez"],
  "Pediatría": ["Dr. Luis Rodríguez", "Dra. Laura Sánchez"],
  "Medicina General": ["Dr. Andrés Fernández", "Dra. Sofía Ramírez"],
  "Kinesiología": ["Dr. Pablo Torres", "Dra. Camila Díaz"],
  "Traumatología": ["Dr. Diego Morales", "Dra. Valentina Castro"]
}

const schedules = {
  "Lunes": ["9:00 AM", "10:00 AM", "11:00 AM"],
  "Martes": ["1:00 PM", "2:00 PM", "3:00 PM"],
  "Miércoles": ["9:00 AM", "10:00 AM", "11:00 AM"],
  "Jueves": ["1:00 PM", "2:00 PM", "3:00 PM"],
  "Viernes": ["9:00 AM", "10:00 AM", "11:00 AM"]
}


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
                <option value="" disabled selected>Seleccione especialidad</option>
                ${Object.keys(specialties).map(s => `<option value="${s}">${s}</option>`).join('')}
              </select>
            </div>

            <div class="selection-card">
              <h3>Médico</h3>
              <label for="doctor">Profesional disponible:</label>
              <select id="doctor" name="doctor" required disabled>
                <option value="" disabled selected>Seleccione especialidad primero</option>
              </select>
            </div>

            <div class="selection-card">
              <h3>Horario</h3>
              <label for="schedule">Días y horas disponibles:</label>
              <select id="schedule" name="schedule" required>
                <option value="" disabled selected>Seleccione un horario</option>
                ${Object.entries(schedules).map(([day, times]) => `
                  <optgroup label="${day}">
                    ${times.map(t => `<option value="${day} ${t}">${t}</option>`).join('')}
                  </optgroup>
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

export const initScheduleEvents = () => {
  const form = document.getElementById('schedule-form');
  const specialtySelect = document.getElementById('specialty');
  const doctorSelect = document.getElementById('doctor');

  if (!specialtySelect || !doctorSelect) return;

  specialtySelect.addEventListener('change', (e) => {
    const selectedSpecialty = e.target.value;
    const doctors = specialties[selectedSpecialty];

    doctorSelect.disabled = false;

    doctorSelect.innerHTML = `
      <option value="" disabled selected>Seleccione un médico</option>
      ${doctors.map(doc => `<option value="${doc}">${doc}</option>`).join('')}
    `;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {
      especialidad: formData.get('specialty'),
      doctor: formData.get('doctor'),
      horario: formData.get('schedule')
    };

    console.log("Cita agendada:", data);
    alert(`Cita confirmada con el ${data.doctor}`);
  });
};