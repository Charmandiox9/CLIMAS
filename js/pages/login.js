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
    </div>`;
}

export function initLoginEvents() {
    const form = document.getElementById('login-form');
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const pass = document.getElementById('password').value;

        const res = await fetch('./equipomedico.json');
        const data = await res.json();

        const allUsers = [...data.doctors, ...data.users];
        const user = allUsers.find(u => u.email === email && u.password === pass);

        if (user) {
            localStorage.setItem('user_session', JSON.stringify(user));
            
            if (user.role === 'doctor') window.location.href = 'doctor_dashboard.html';
            else if (user.role === 'admin') window.location.href = 'admin_dashboard.html';
            else window.location.href = 'user_dashboard.html';
        } else {
            document.getElementById('error-msg').style.display = 'block';
        }
    });
}