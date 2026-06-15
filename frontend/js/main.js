import { Navbar, initLogoutEvent } from './components/navbar.js';
import { Footer } from './components/footer.js';
import { Hero } from './components/hero.js';
import { Specialties } from './components/specialties.js';
import { AboutPage } from './pages/about.js';
import { initScheduleEvents, SchedulePage } from './pages/schedule.js';
import { LoginPage, initLoginEvents } from './pages/login.js';
import { DashboardPage, initDashboardEvents as initDoctorDashboardEvents } from './pages/doctor_dashboard.js';
import { AdminDashboardPage, initDashboardEvents as initAdminDashboardEvents } from './pages/admin_dashboard.js';
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

    const skeletonHTML = `
        <style>
            @keyframes pulse-sk { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
            .skeleton-box { background: #e2e8f0; border-radius: 8px; animation: pulse-sk 1.5s infinite ease-in-out; }
            .skeleton-container { display: flex; gap: 20px; padding: 20px; max-width: 1200px; margin: 0 auto; height: 100vh;}
            .skeleton-sidebar { width: 250px; height: 100%; display: flex; flex-direction: column; gap: 15px; }
            .skeleton-main { flex: 1; display: flex; flex-direction: column; gap: 20px; }
        </style>
        <div class="skeleton-container">
            <div class="skeleton-sidebar">
                <div class="skeleton-box" style="height: 150px; border-radius: 12px;"></div>
                <div class="skeleton-box" style="height: 40px;"></div>
                <div class="skeleton-box" style="height: 40px;"></div>
                <div class="skeleton-box" style="height: 40px;"></div>
            </div>
            <div class="skeleton-main">
                <div class="skeleton-box" style="height: 60px; border-radius: 12px;"></div>
                <div class="skeleton-box" style="height: 200px; border-radius: 12px;"></div>
                <div class="skeleton-box" style="flex: 1; border-radius: 12px;"></div>
            </div>
        </div>
    `;

    const heroContainer = document.getElementById('hero');
    const aboutContainer = document.getElementById('about-page');
    const scheduleContainer = document.getElementById('schedule-page');

    if (heroContainer) {
        heroContainer.innerHTML = Hero();
        const specialtiesContainer = document.getElementById('specialties');
        if (specialtiesContainer) {
            specialtiesContainer.innerHTML = `
                <div style="display:flex; justify-content:center; gap:20px; padding:40px;">
                    <div style="width:200px; height:150px; background:#e2e8f0; border-radius:12px; animation:pulse-sk 1.5s infinite ease-in-out;"></div>
                    <div style="width:200px; height:150px; background:#e2e8f0; border-radius:12px; animation:pulse-sk 1.5s infinite ease-in-out;"></div>
                    <div style="width:200px; height:150px; background:#e2e8f0; border-radius:12px; animation:pulse-sk 1.5s infinite ease-in-out;"></div>
                </div>
            `;
            Specialties().then(html => specialtiesContainer.innerHTML = html);
        }
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
            doctorDashContainer.innerHTML = skeletonHTML;
            DashboardPage(session).then(html => {
                doctorDashContainer.innerHTML = html;
                initDoctorDashboardEvents();
            });
        }
    }

    const userDashContainer = document.getElementById('user_dashboard-page');

    if (userDashContainer) {
        if (!session) {
            window.location.href = 'login.html';
        } else {
            userDashContainer.innerHTML = skeletonHTML;
            UserDashboardPage(session).then(html => {
                userDashContainer.innerHTML = html;
                initUserDashboardEvents();
            });
        }
    }

    const adminDashContainer = document.getElementById('admin_dashboard-page');

    if (adminDashContainer) {
        const session = JSON.parse(localStorage.getItem('user_session'));
        if (session && session.roles && session.roles.includes('ADMIN')) {
            adminDashContainer.innerHTML = skeletonHTML;
            AdminDashboardPage(session).then(html => {
                adminDashContainer.innerHTML = html;
                initAdminDashboardEvents();
            });
        } else {
            window.location.href = 'login.html';
        }
    }


});