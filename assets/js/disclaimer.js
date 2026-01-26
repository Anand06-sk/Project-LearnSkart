
(function(){
    var paths = ['Home/theme.js','./theme.js','../theme.js','../../theme.js'];
    paths.forEach(function(p){ var s=document.createElement('script'); s.src=p; s.defer=true; s.onerror=function(){}; document.head.appendChild(s); });
})();

        // Disclaimer acceptance
        const checkbox = document.getElementById('agreeCheck');
        const button = document.getElementById('agreeBtn');
        const status = document.getElementById('acceptanceStatus');
        const yearSpan = document.getElementById('year');

        yearSpan.textContent = new Date().getFullYear();

        // Check if already accepted
        const isAccepted = localStorage.getItem('disclaimerAccepted');
        if (isAccepted) {
            checkbox.checked = true;
            button.disabled = false;
            status.classList.add('show');
        }

        checkbox.addEventListener('change', () => {
            button.disabled = !checkbox.checked;
        });

        button.addEventListener('click', () => {
            localStorage.setItem('disclaimerAccepted', 'true');
            status.classList.add('show');
            button.disabled = true;
            setTimeout(() => {
                checkbox.disabled = true;
            }, 500);
        });

        // Smooth anchor navigation for TOC
        document.querySelectorAll('.toc a').forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    history.pushState(null, null, targetId);
                    targetElement.focus();
                }
            });
        });
    