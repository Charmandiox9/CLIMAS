import { formatDate } from './modules/utils.js';
import { Navbar } from './components/navbar.js'

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('navbar').innerHTML = Navbar()
});

