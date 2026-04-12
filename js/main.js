import { Navbar } from './components/navbar.js';
import { Footer } from './components/footer.js';
import { Hero } from './components/hero.js';
import { Specialties } from './components/specialties.js';
import { AboutPage } from './pages/about.js';
import { initScheduleEvents, SchedulePage } from './pages/Schedule.js';

document.addEventListener('DOMContentLoaded', () => {
    const navbarElement = document.getElementById('navbar');
    const footerElement = document.getElementById('footer');

    if (navbarElement) navbarElement.innerHTML = Navbar();
    if (footerElement) footerElement.innerHTML = Footer();

    const heroContainer = document.getElementById('hero');
    const aboutContainer = document.getElementById('about-page');
    const scheduleContainer = document.getElementById('schedule-page');

    if (heroContainer) {
        heroContainer.innerHTML = Hero();
        const specialtiesContainer = document.getElementById('specialties');
        if (specialtiesContainer) specialtiesContainer.innerHTML = Specialties();
    }

    if (aboutContainer) {
        aboutContainer.innerHTML = AboutPage();
    }

    if (scheduleContainer) {
        scheduleContainer.innerHTML = SchedulePage();
        initScheduleEvents(); 
    }
});