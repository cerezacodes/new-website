const revealItems = document.querySelectorAll(".reveal-on-scroll");
const sections = document.querySelectorAll(".page-section[id]");
const navLinks = document.querySelectorAll(".navbar nav a");
const scrollTopButton = document.querySelector(".scroll-top-btn");
const navbar = document.querySelector(".navbar");
const navToggle = document.querySelector(".nav-toggle");

if (revealItems.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.18,
        rootMargin: "0px 0px -70px 0px"
    });

    revealItems.forEach((item, index) => {
        item.style.setProperty("--reveal-delay", `${index * 120}ms`);
        revealObserver.observe(item);
    });
}

if (sections.length > 0 && navLinks.length > 0) {
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            navLinks.forEach((link) => {
                link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
            });
        });
    }, {
        threshold: 0.45
    });

    sections.forEach((section) => sectionObserver.observe(section));
}

if (scrollTopButton) {
    const toggleScrollTopButton = () => {
        scrollTopButton.classList.toggle("is-visible", window.scrollY > 500);
    };

    scrollTopButton.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    toggleScrollTopButton();
    window.addEventListener("scroll", toggleScrollTopButton, { passive: true });
}

if (navbar && navToggle) {
    const closeMenu = () => {
        navToggle.checked = false;
    };

    navLinks.forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
        if (!navbar.contains(event.target)) {
            closeMenu();
        }
    });
}
