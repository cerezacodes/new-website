const revealItems = document.querySelectorAll(".reveal-on-scroll");
const sections = document.querySelectorAll(".page-section[id]");
const navLinks = document.querySelectorAll(".navbar nav a");
const scrollTopButton = document.querySelector(".scroll-top-btn");
const navbar = document.querySelector(".navbar");
const navToggle = document.querySelector(".nav-toggle");

/* =========================
   Reveal animations
========================= */
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

/* =========================
   Active navigation links
========================= */
if (sections.length > 0 && navLinks.length > 0) {
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            navLinks.forEach((link) => {
                link.classList.toggle(
                    "active",
                    link.getAttribute("href") === `#${entry.target.id}`
                );
            });
        });
    }, {
        threshold: 0.45
    });

    sections.forEach((section) => sectionObserver.observe(section));
}

/* =========================
   Scroll-to-top button
========================= */
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

/* =========================
   Mobile navigation
========================= */
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

/* =========================
   "Time Since Posted"
========================= */

function formatTimeSince(dateString) {
    const now = new Date();
    const posted = new Date(dateString);

    const seconds = Math.floor((now - posted) / 1000);

    if (seconds < 60) {
        return "Just now";
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 30) {
        return `${days} day${days !== 1 ? "s" : ""} ago`;
    }

    const months = Math.floor(days / 30);

    if (months < 12) {
        return `${months} month${months !== 1 ? "s" : ""} ago`;
    }

    const years = Math.floor(months / 12);

    return `${years} year${years !== 1 ? "s" : ""} ago`;
}

function updateArticleTimes() {
    document.querySelectorAll(".card-time").forEach((element) => {
        const timestamp = element.dataset.timestamp;

        if (timestamp) {
            element.textContent = formatTimeSince(timestamp);
        }
    });
}

updateArticleTimes();

// Refresh every minute
setInterval(updateArticleTimes, 60000);