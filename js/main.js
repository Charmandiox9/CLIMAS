import { formatDate } from './modules/utils.js';
import { Navbar } from './components/navbar.js'
import { initScheduleEvents, SchedulePage } from './pages/Schedule.js';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('navbar').innerHTML = Navbar()
  
  const scheduleContainer = document.getElementById('schedule-page');

  if(scheduleContainer) {
    scheduleContainer.innerHTML = SchedulePage();
  }
  initScheduleEvents();
});

