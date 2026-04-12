const specialtiesList = [
    { name: "Medicina General", icon: "fa-stethoscope" },
    { name: "Pediatría", icon: "fa-baby" },
    { name: "Cardiología", icon: "fa-heart-pulse" },
    { name: "Neurología", icon: "fa-brain" },
    { name: "Traumatología", icon: "fa-bone" },
    { name: "Kinesiología", icon: "fa-person-walking" }
];

export function Specialties() {
    const cards = specialtiesList.map(item => `
        <div class="specialty-card">
            <i class="fa-solid ${item.icon} specialty-icon"></i>
            <h3>${item.name}</h3>
            <p>Ver especialistas disponibles →</p>
        </div>
    `).join('');

    return `
    <section class="specialties-section">
        <div class="container">
            <div class="section-header">
                <h2>Nuestras Especialidades</h2>
            </div>
            <div class="specialty-slider">
                ${cards}
            </div>
        </div>
    </section>
    `;
}