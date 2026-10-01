
        // Table of contents - smooth scroll behavior
        document.querySelectorAll('.toc a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                    history.pushState(null, null, targetId);
                }
            });
        });
    