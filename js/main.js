import { Navbar, initLogoutEvent } from './components/navbar.js';
import { Footer } from './components/footer.js';
import { Hero } from './components/hero.js';
import { Specialties } from './components/specialties.js';
import { AboutPage } from './pages/about.js';
import { initScheduleEvents, SchedulePage } from './pages/schedule.js';
import { LoginPage, initLoginEvents } from './pages/login.js';
import { DashboardPage, initDashboardEvents } from './pages/doctor_dashboard.js';
import { UserDashboardPage, initUserDashboardEvents } from './pages/user_dashboard.js';

document.addEventListener('DOMContentLoaded', async () => {

    const navbarElement = document.getElementById('navbar');
    const footerElement = document.getElementById('footer');

    if (navbarElement) navbarElement.innerHTML = Navbar();
    if (footerElement) footerElement.innerHTML = Footer();
    
    initLogoutEvent();

    const path = window.location.pathname;
    
    let session = null;
    try {
        const stored = localStorage.getItem('user_session');
        if (stored && stored !== 'undefined') {
            session = JSON.parse(stored);
        }
    } catch (e) {
        console.error("Invalid session JSON");
    }

    if (path.includes('dashboard') && !session) {
        window.location.href = 'login.html';
        return;
    }

    const loginContainer = document.getElementById('login-page');
    const dashContainer = document.getElementById('dashboard-page');

    if (loginContainer) {
        loginContainer.innerHTML = LoginPage();
        initLoginEvents();
    }

    if (dashContainer && session) {
        dashContainer.innerHTML = DashboardPage(session);
    }   

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

    const doctorDashContainer = document.getElementById('doctor_dashboard-page');

    if (doctorDashContainer) {
        if (!session) {
            window.location.href = 'login.html';
        } else {
            doctorDashContainer.innerHTML = await DashboardPage(session);
            initDashboardEvents();
        }
    }

    const userDashContainer = document.getElementById('user_dashboard-page');

    if (userDashContainer) {
        if (!session) {
            window.location.href = 'login.html';
        } else {
            userDashContainer.innerHTML = UserDashboardPage(session);
            initUserDashboardEvents();
        }
    }
});