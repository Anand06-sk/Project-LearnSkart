function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    const btn = document.querySelector('.dark-btn');
    btn.textContent = body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
}