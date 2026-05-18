document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contacto-form');
  const success = document.getElementById('form-success');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    success.style.display = 'flex';
    form.reset();
    setTimeout(() => {
      success.style.display = 'none';
    }, 5000);
  });
});
