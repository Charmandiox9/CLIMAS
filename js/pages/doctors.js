const req = await fetch("../assets/data/equipomedico.json");

if (!req.ok) {
  throw new Error(`HTTP ${req.status}`);
}

  const data = await req.json();
  const doctors = (data.doctors ?? []).filter((d) => d.nombreCompleto);
  const container = document.getElementById("doctor-list");
  if (!container) return;

  doctors.forEach((doctor) => {
    const card = crearTarjeta(doctor);
    container.appendChild(card);
  });

  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-ver-mas");
    if (!btn) return;

    const card = btn.closest(".doctor-card");
    const wasOpen = card.classList.contains("is-open");

    container.querySelectorAll(".doctor-card.is-open").forEach((c) => {
      c.classList.remove("is-open");
      c.querySelector(".btn-ver-mas").textContent = "Ver perfil";
    });

  if (!wasOpen) {
    card.classList.add("is-open");
  }
});