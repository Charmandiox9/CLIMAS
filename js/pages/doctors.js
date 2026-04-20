const req = await fetch("../assets/data/equipomedico.json");

if (!req.ok) {
  throw new Error(`HTTP ${req.status}`);
}

const data = await req.json();
const doctors = (data.doctors ?? []).filter((d) => d.nombreCompleto);

const container = document.getElementById("doctor-list");

container.innerHTML = doctors
  .map(
    (doctor) => 
        `<article class="doctor-card">
        
        <h2 class="doctor-name">${doctor.nombreCompleto}</h2>
        
        <div class="doctor-details"> 
            <p>Especialidad: ${doctor.Especialidad}</p>
            <p>Experiencia: ${doctor["AñosExperiencia"]} años</p>
            <p>Ubicación: ${doctor.Ubicacion}</p>
            <p>Calificación: ${doctor.Calificacion}</p>
            <p>Disponibilidad: ${doctor.Disponibilidad}</p>
        </div>

      </article>`
  )
  .join("");

container.addEventListener("click", (event) => {
  const card = event.target.closest(".doctor-card");
  if (!card) return;

  const wasOpen = card.classList.contains("is-open");

  container.querySelectorAll(".doctor-card.is-open").forEach((item) => {
    item.classList.remove("is-open");
  });

  if (!wasOpen) {
    card.classList.add("is-open");
  }
});