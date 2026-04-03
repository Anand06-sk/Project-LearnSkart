
(function(){
    var paths = ['Home/theme.js','./theme.js','../theme.js','../../theme.js'];
    paths.forEach(function(p){ var s=document.createElement('script'); s.src=p; s.defer=true; s.onerror=function(){}; document.head.appendChild(s); });
})();

document.addEventListener('DOMContentLoaded', function () {
    var checkbox = document.getElementById('agreeCheck');
    var button = document.getElementById('agreeBtn');
    var status = document.getElementById('acceptanceStatus');
    var yearSpan = document.getElementById('year');

    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    if (checkbox && button && status) {
        var isAccepted = localStorage.getItem('disclaimerAccepted');
        if (isAccepted) {
            checkbox.checked = true;
            button.disabled = false;
            status.classList.add('show');
        }

        checkbox.addEventListener('change', function () {
            button.disabled = !checkbox.checked;
        });

        button.addEventListener('click', function () {
            localStorage.setItem('disclaimerAccepted', 'true');
            status.classList.add('show');
            button.disabled = true;
            setTimeout(function () {
                checkbox.disabled = true;
            }, 500);
        });
    }

    document.querySelectorAll('.toc a').forEach(function (link) {
        link.addEventListener('click', function () {
            var targetId = link.getAttribute('href');
            var targetElement = document.querySelector(targetId);
            if (targetElement) {
                history.pushState(null, null, targetId);
                targetElement.focus();
            }
        });
    });
});
    