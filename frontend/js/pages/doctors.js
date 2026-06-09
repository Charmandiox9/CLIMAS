import { apiFetch } from '../utils/api.js';

function crearIcono(clases) {
    const i = document.createElement("i");
    i.className = clases;
    return i;
}

function crearTarjeta(userDoc) {
    const card = document.createElement("div");
    card.className = "doctor-card";

    const photoWrap = document.createElement("div");
    photoWrap.className = "doctor-photo-wrap";

    const img = document.createElement("img");
    img.className = "doctor-photo";

    img.src = `../assets/img/drs/default.png`; // Fallback image for now

    img.alt = `Dr. ${userDoc.firstName} ${userDoc.lastName}`;

    img.addEventListener("error", () => {
        img.src = "../assets/img/drs/default.png";
        img.onerror = null;
    });
    photoWrap.appendChild(img);

    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    const nombre = document.createElement("h3");
    nombre.className = "doctor-name";
    nombre.textContent = `Dr. ${userDoc.firstName} ${userDoc.lastName}`;

    const especialidad = document.createElement("span");
    especialidad.className = "doctor-specialty";
    especialidad.appendChild(crearIcono("fa-solid fa-stethoscope"));
    especialidad.append(` ${userDoc.doctor?.area?.name || 'Especialidad General'}`);

    const stars = document.createElement("div");
    stars.className = "doctor-stars";
    const calificacion = 5; // Static for now as DB doesn't have ratings
    for (let i = 0; i < 5; i++) {
        stars.appendChild(crearIcono(`fa-${i < calificacion ? "solid" : "regular"} fa-star`));
    }
    const ratingNum = document.createElement("span");
    ratingNum.className = "rating-num";
    ratingNum.textContent = "5.0";
    stars.appendChild(ratingNum);

    const meta = document.createElement("div");
    meta.className = "doctor-meta";

    const spanUbicacion = document.createElement("span");
    spanUbicacion.appendChild(crearIcono("fa-solid fa-location-dot"));
    spanUbicacion.append(` CLIMAS Antofagasta`);

    const spanAnios = document.createElement("span");
    spanAnios.appendChild(crearIcono("fa-solid fa-briefcase-medical"));
    spanAnios.append(` Licencia: ${userDoc.doctor?.medicalLicense || 'N/A'}`);

    meta.appendChild(spanUbicacion);
    meta.appendChild(spanAnios);

    const btnVerMas = document.createElement("button");
    btnVerMas.className = "btn-ver-mas";
    btnVerMas.textContent = "Ver perfil ";
    btnVerMas.appendChild(crearIcono("fa-solid fa-chevron-down"));

    cardBody.appendChild(nombre);
    cardBody.appendChild(especialidad);
    cardBody.appendChild(stars);
    cardBody.appendChild(meta);
    cardBody.appendChild(btnVerMas);

    const details = document.createElement("div");
    details.className = "doctor-details";

    const detailRow = document.createElement("div");
    detailRow.className = "detail-row";
    detailRow.appendChild(crearIcono("fa-solid fa-clock"));
    const spanDisponibilidad = document.createElement("span");
    spanDisponibilidad.textContent = "Lunes a Viernes, 09:00 - 17:00";
    detailRow.appendChild(spanDisponibilidad);

    const bio = document.createElement("p");
    bio.className = "doctor-bio";
    bio.textContent = "Profesional altamente capacitado con amplia experiencia en su área de especialidad. Dedicado a brindar la mejor atención posible a sus pacientes.";

    const btnAgendar = document.createElement("a");
    btnAgendar.className = "btn-agendar";
    btnAgendar.href = "schedule.html";
    btnAgendar.appendChild(crearIcono("fa-solid fa-calendar-check"));
    btnAgendar.append(" Agendar cita");

    details.appendChild(detailRow);
    details.appendChild(bio);
    details.appendChild(btnAgendar);

    card.appendChild(photoWrap);
    card.appendChild(cardBody);
    card.appendChild(details);

    return card;
}


document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("doctor-list");
    if (!container) return;

    try {
        const doctors = await apiFetch('/user/doctors');
        
        doctors.forEach((doctor) => {
            container.appendChild(crearTarjeta(doctor));
        });

        container.addEventListener("click", (e) => {
            const btn = e.target.closest(".btn-ver-mas");
            if (!btn) return;

            const card = btn.closest(".doctor-card");
            const wasOpen = card.classList.contains("is-open");

            container.querySelectorAll(".doctor-card.is-open").forEach((c) => {
                c.classList.remove("is-open");
                const b = c.querySelector(".btn-ver-mas");
                b.textContent = "Ver perfil ";
                b.appendChild(crearIcono("fa-solid fa-chevron-down"));
            });

            if (!wasOpen) {
                card.classList.add("is-open");
                btn.textContent = "Ocultar ";
                btn.appendChild(crearIcono("fa-solid fa-chevron-up"));
            }
        });

    } catch (err) {
        console.error("Error cargando médicos:", err);
        const msg = document.createElement("p");
        msg.textContent = "No se pudieron cargar los médicos.";
        msg.style.cssText = "text-align:center;color:#64748b;padding:40px";
        container.appendChild(msg);
    }
});