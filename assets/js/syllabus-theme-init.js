(function () {
    try {
        var mode = localStorage.getItem('site-theme');
        if (!mode && localStorage.getItem('darkMode') === 'true') {
            mode = 'dark';
        }
        if (mode === 'dark') {
            document.documentElement.classList.add('dark');
            document.addEventListener('DOMContentLoaded', function () {
                document.body.classList.add('dark-mode');
            });
        }
    } catch (e) {}
})();
