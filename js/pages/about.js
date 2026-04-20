export function AboutPage() {
    return `
    <div class="about-page-wrapper">
        <section class="about-hero">
            <div class="container">
                <h1>Nuestra Institución</h1>
                <p>Liderando la salud en la Región de Coquimbo.</p>
            </div>
        </section>

        <section class="about-content">
            <div class="container">
                <div class="about-grid">
                    <div class="about-image-placeholder" style="overflow: hidden; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: none; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                        <img src="../assets/img/hospital-bg.png" alt="Hospital CLIMAS" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div class="about-text">
                        <h2>Historia y Compromiso</h2>
                        <p>CLIMAS nace de la necesidad de proveer una atención médica de alta complejidad en la IV Región, vinculada directamente a la formación académica de la Universidad Católica del Norte.</p>
                        <div class="mission-card">
                            <h3>Misión Institucional</h3>
                            <p>Brindar salud con calidad técnica y calidez humana, fomentando la investigación y el bienestar regional.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
    `;
}