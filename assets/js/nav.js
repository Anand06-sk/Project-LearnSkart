(function () {
    var nav = document.querySelector('nav');
    if (!nav) {
        return;
    }

    var toggle = nav.querySelector('.nav-toggle');
    var mobileMenu = nav.querySelector('.nav-mobile');
    var dropdown = nav.querySelector('.nav-dropdown');
    var dropdownToggle = nav.querySelector('.dropdown-toggle');

    function setNavOpen(open) {
        nav.classList.toggle('nav-open', open);
        if (toggle) {
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
        if (mobileMenu) {
            mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
        }
    }

    if (toggle) {
        toggle.addEventListener('click', function () {
            setNavOpen(!nav.classList.contains('nav-open'));
        });
    }

    if (dropdown && dropdownToggle) {
        dropdownToggle.addEventListener('click', function (event) {
            event.preventDefault();
            var isOpen = dropdown.classList.toggle('open');
            dropdownToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    document.addEventListener('click', function (event) {
        if (!nav.contains(event.target)) {
            setNavOpen(false);
            if (dropdown) {
                dropdown.classList.remove('open');
            }
            if (dropdownToggle) {
                dropdownToggle.setAttribute('aria-expanded', 'false');
            }
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            setNavOpen(false);
            if (dropdown) {
                dropdown.classList.remove('open');
            }
            if (dropdownToggle) {
                dropdownToggle.setAttribute('aria-expanded', 'false');
            }
        }
    });

    var mobileLinks = nav.querySelectorAll('.nav-mobile a');
    mobileLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            setNavOpen(false);
        });
    });
})();
