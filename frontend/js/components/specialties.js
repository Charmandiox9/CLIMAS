import { apiFetch } from '../utils/api.js';

function getIconForArea(areaName) {
    const nameStr = areaName.toLowerCase();
    if (nameStr.includes('cardi')) return 'fa-heart-pulse';
    if (nameStr.includes('pediatr')) return 'fa-baby';
    if (nameStr.includes('neuro')) return 'fa-brain';
    if (nameStr.includes('trauma')) return 'fa-bone';
    if (nameStr.includes('kine')) return 'fa-person-walking';
    if (nameStr.includes('odont')) return 'fa-tooth';
    if (nameStr.includes('oftalm')) return 'fa-eye';
    return 'fa-stethoscope';
}

export async function Specialties() {
    let cards = '';
    try {
        const areas = await apiFetch('/area?isActive=true');
        cards = areas.map(item => `
            <div class="specialty-card">
                <i class="fa-solid ${getIconForArea(item.name)} specialty-icon"></i>
                <h3>${item.name}</h3>
                <p>Ver especialistas disponibles →</p>
            </div>
        `).join('');
    } catch (error) {
        console.error("Error al cargar especialidades", error);
        cards = '<p style="text-align:center;">No se pudieron cargar las especialidades.</p>';
    }

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