import { Navbar } from './components/navbar.js';
import { Footer } from './components/footer.js';
import { Hero } from './components/hero.js';
import { Specialties } from './components/specialties.js';
import { AboutPage } from './pages/about.js';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('navbar').innerHTML = Navbar();
    document.getElementById('footer').innerHTML = Footer();

    const heroContainer = document.getElementById('hero');
    const aboutContainer = document.getElementById('about-page');

    if (heroContainer) {
        heroContainer.innerHTML = Hero();
        document.getElementById('specialties').innerHTML = Specialties();
    }

    if (aboutContainer) {
        aboutContainer.innerHTML = AboutPage();
    }
});