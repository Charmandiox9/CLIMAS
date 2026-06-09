import { apiFetch } from '../utils/api.js';

export function LoginPage() {
    return `
    <div class="login-container">
        <form class="login-card" id="login-form">
            <h2>Portal Institucional</h2>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="email" required placeholder="tu@climas.ucn.cl">
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" id="password" required>
            </div>
            <button type="submit">Entrar</button>
            <p id="error-msg" style="color:red; display:none; margin-top:10px;">Credenciales incorrectas</p>
        </form>

        <!-- Modal de selección de rol (oculto por defecto) -->
        <div id="role-modal" class="modal-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; justify-content:center; align-items:center;">
            <div class="modal-content" style="background:#fff; padding:30px; border-radius:10px; text-align:center; box-shadow:0 4px 15px rgba(0,0,0,0.2);">
                <h3 style="margin-bottom:20px; color:#2c3e50;">Selecciona el panel a ingresar</h3>
                <div id="roles-container" style="display:flex; flex-direction:column; gap:10px;"></div>
            </div>
        </div>

    </div>`;
}

export function initLoginEvents() {
    const form = document.getElementById('login-form');
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const pass = document.getElementById('password').value;

        try {
            const data = await apiFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email: email, password: pass })
            });

            // El backend devuelve { access_token, user: { ... } }
            // Vamos a guardar esta data en localStorage
            const sessionData = {
                access_token: data.access_token,
                ...data.user
            };
            
            localStorage.setItem('user_session', JSON.stringify(sessionData));
            
            const roles = data.user.roles || [];
            if (roles.length > 1) {
                const modal = document.getElementById('role-modal');
                const container = document.getElementById('roles-container');
                container.innerHTML = roles.map(role => {
                    let text = "Panel de Paciente";
                    let href = "user_dashboard.html";
                    if (role === 'DOCTOR') { text = "Panel Médico"; href = "doctor_dashboard.html"; }
                    if (role === 'ADMIN') { text = "Panel de Administración"; href = "admin_dashboard.html"; }
                    return `<button type="button" class="submit-btn" style="width:100%;" onclick="window.location.href='${href}'">${text}</button>`;
                }).join('');
                modal.style.display = 'flex';
            } else {
                const role = roles[0];
                if (role === 'DOCTOR') window.location.href = 'doctor_dashboard.html';
                else if (role === 'ADMIN') window.location.href = 'admin_dashboard.html';
                else window.location.href = 'user_dashboard.html';
            }
            
        } catch (error) {
            const errorMsg = document.getElementById('error-msg');
            if (errorMsg) {
                errorMsg.style.display = 'block';
                errorMsg.innerText = error.message || 'Error al iniciar sesión';
            }
        }
    });
}
