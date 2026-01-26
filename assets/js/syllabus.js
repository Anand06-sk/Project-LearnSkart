function toggleDarkMode() {
    const isDark = !document.body.classList.contains('dark-mode');
    document.body.classList.toggle('dark-mode');
    try { localStorage.setItem('darkMode', String(isDark)); } catch (e) {}
    const icon = document.querySelector('.theme-btn i');
    if (icon) {
        if (isDark) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
        else { icon.classList.remove('fa-sun'); icon.classList.add('fa-moon'); }
    }
}

// Apply saved preference on load
(function(){
    try {
        if (localStorage.getItem('darkMode') === 'true') {
            document.addEventListener('DOMContentLoaded', function(){
                document.body.classList.add('dark-mode');
                const icon = document.querySelector('.theme-btn i');
                if (icon) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
            });
        }
    } catch(e) {}
})();



document.addEventListener('DOMContentLoaded', () => {
    const counters = document.querySelectorAll('.stat-item h4[data-target]');
    const duration = 1200; // ms total duration per counter

    counters.forEach(el => {
        const target = parseInt(el.getAttribute('data-target'), 10) || 0;
        const suffix = el.getAttribute('data-suffix') || '';
        const start = 0;
        let startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percent = Math.min(progress / duration, 1);
            const eased = easeOutQuad(percent);
            const value = Math.floor(start + (target - start) * eased);
            el.textContent = value + (percent === 1 ? suffix : '');
            // add pop animation
            el.classList.add('pop');
            setTimeout(() => el.classList.remove('pop'), 120);
            if (progress < duration) {
                window.requestAnimationFrame(step);
            } else {
                // ensure exact final value
                el.textContent = target + suffix;
            }
        }

        window.requestAnimationFrame(step);
    });

    function easeOutQuad(t) {return t * (2 - t); }
});