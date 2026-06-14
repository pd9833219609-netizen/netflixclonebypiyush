/**
 * Netflix Clone - Main Application JavaScript
 * Handles all interactive features: navbar, carousels, search,
 * modal system, scroll animations, hamburger menu, skeleton loading,
 * and card action buttons.
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initCarousels();
    initSearch();
    initModal();
    initScrollAnimations();
    initHamburger();
    initSkeletonLoading();
    initCardActionButtons();
});

/* ============================================================
   1. NAVBAR SCROLL EFFECT
   ============================================================ */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });
}

/* ============================================================
   2. CAROUSEL HORIZONTAL SCROLL
   ============================================================ */
function initCarousels() {
    const wrappers = document.querySelectorAll('.content-row-wrapper');

    wrappers.forEach(wrapper => {
        const leftArrow = wrapper.querySelector('.arrow.left');
        const rightArrow = wrapper.querySelector('.arrow.right');
        const row = wrapper.querySelector('.content-row');

        if (!row) return;

        /** Calculate scroll distance — 75% of visible row width */
        const getScrollAmount = () => row.clientWidth * 0.75;

        /** Update arrow visibility based on current scroll position */
        const updateArrows = () => {
            if (leftArrow) {
                leftArrow.style.display = row.scrollLeft <= 0 ? 'none' : 'flex';
            }
            if (rightArrow) {
                // Hide right arrow when scrolled to the end (with 1px tolerance)
                const atEnd = row.scrollLeft + row.clientWidth >= row.scrollWidth - 1;
                rightArrow.style.display = atEnd ? 'none' : 'flex';
            }
        };

        // Left arrow click — scroll left
        if (leftArrow) {
            leftArrow.addEventListener('click', () => {
                row.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
            });
        }

        // Right arrow click — scroll right
        if (rightArrow) {
            rightArrow.addEventListener('click', () => {
                row.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
            });
        }

        // Re-evaluate arrows whenever the row is scrolled
        row.addEventListener('scroll', updateArrows, { passive: true });

        // Initial arrow state
        updateArrows();
    });
}

/* ============================================================
   3. SEARCH FUNCTIONALITY
   ============================================================ */
function initSearch() {
    const searchIcon = document.querySelector('.search-icon');
    const searchBox = document.querySelector('.search-box');
    const searchInput = document.querySelector('.search-input');

    if (!searchIcon || !searchBox || !searchInput) return;

    /** Toggle the search box open/closed */
    searchIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        searchBox.classList.toggle('active');

        if (searchBox.classList.contains('active')) {
            searchInput.focus();
        } else {
            resetSearch();
        }
    });

    /** Filter cards as the user types */
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        const cards = document.querySelectorAll('.card');

        cards.forEach(card => {
            const title = (card.dataset.title || '').toLowerCase();

            if (query === '' || title.includes(query)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });

    /** Close search box when clicking outside */
    document.addEventListener('click', (e) => {
        if (!searchBox.contains(e.target)) {
            searchBox.classList.remove('active');
            resetSearch();
        }
    });

    /** Reset search input and show all cards */
    function resetSearch() {
        searchInput.value = '';
        document.querySelectorAll('.card').forEach(card => {
            card.style.display = '';
        });
    }
}

/* ============================================================
   4. MODAL SYSTEM
   ============================================================ */
function initModal() {
    const modalOverlay = document.querySelector('.modal-overlay');
    if (!modalOverlay) return;

    const modal = modalOverlay.querySelector('.modal');
    const modalClose = modalOverlay.querySelector('.modal-close');

    // Cache modal content elements
    const modalHeroImg = modalOverlay.querySelector('.modal-hero img');
    const modalHeroTitle = modalOverlay.querySelector('.modal-hero-title');
    const modalMatch = modalOverlay.querySelector('.modal-meta .match');
    const modalYear = modalOverlay.querySelector('.modal-meta .year');
    const modalRating = modalOverlay.querySelector('.modal-meta .rating');
    const modalDuration = modalOverlay.querySelector('.modal-meta .duration');
    const modalDescription = modalOverlay.querySelector('.modal-description');
    const modalCast = modalOverlay.querySelector('.modal-cast');
    const modalGenres = modalOverlay.querySelector('.modal-genres');

    /**
     * Open the modal and populate it with card data.
     * @param {HTMLElement} card - The clicked card element
     */
    function openModal(card) {
        const {
            title = '',
            year = '',
            rating = '',
            description = '',
            image = '',
            match = '',
            duration = '',
            cast = '',
            genres = ''
        } = card.dataset;

        // Populate modal fields
        if (modalHeroImg) modalHeroImg.src = image;
        if (modalHeroTitle) modalHeroTitle.textContent = title;
        if (modalMatch) modalMatch.textContent = `${match}% Match`;
        if (modalYear) modalYear.textContent = year;
        if (modalRating) modalRating.textContent = rating;
        if (modalDuration) modalDuration.textContent = duration;
        if (modalDescription) modalDescription.textContent = description;
        if (modalCast) modalCast.textContent = `Cast: ${cast}`;

        // Build genre tags
        if (modalGenres) {
            modalGenres.innerHTML = '';
            genres.split(',').forEach(genre => {
                const trimmed = genre.trim();
                if (trimmed) {
                    const span = document.createElement('span');
                    span.classList.add('genre-tag');
                    span.textContent = trimmed;
                    modalGenres.appendChild(span);
                }
            });
        }

        // Show modal & lock body scroll
        modalOverlay.classList.add('active');
        document.body.classList.add('no-scroll');
    }

    /** Close the modal and restore body scroll */
    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }

    // --- Event Listeners ---

    // Delegate card clicks (open modal)
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        // Ignore if a card action button was clicked
        if (e.target.closest('.card-action-btn')) return;
        if (card) openModal(card);
    });

    // Close button
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    // Click on overlay background (outside modal content)
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });
}

/* ============================================================
   5. INTERSECTION OBSERVER – Scroll Animations
   ============================================================ */
function initScrollAnimations() {
    const sections = document.querySelectorAll('.content-section');
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    sections.forEach(section => observer.observe(section));
}

/* ============================================================
   6. HAMBURGER MENU (Mobile)
   ============================================================ */
function initHamburger() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (!hamburger || !navLinks) return;

    // Toggle menu on hamburger click
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when a nav link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });
}

/* ============================================================
   7. PROFILE DROPDOWN (Mobile click toggle)
   ============================================================ */
// The desktop dropdown is handled via CSS :hover.
// On mobile we add a click-based toggle for accessibility.
(function initProfileDropdown() {
    const profileTrigger = document.querySelector('.profile-trigger');
    const profileDropdown = document.querySelector('.profile-dropdown');

    if (!profileTrigger || !profileDropdown) return;

    profileTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!profileDropdown.contains(e.target)) {
            profileDropdown.classList.remove('active');
        }
    });
})();

/* ============================================================
   9. SKELETON LOADING
   ============================================================ */
function initSkeletonLoading() {
    setTimeout(() => {
        // Hide skeleton placeholders
        document.querySelectorAll('.skeleton-wrapper').forEach(skeleton => {
            skeleton.classList.add('hidden');
        });

        // Reveal the real content rows
        document.querySelectorAll('.content-row').forEach(row => {
            row.classList.remove('hidden');
        });
    }, 800);
}

/* ============================================================
   10. CARD ACTION BUTTONS
   ============================================================ */
function initCardActionButtons() {
    // Use event delegation on the document for .card-action-btn clicks
    document.addEventListener('click', (e) => {
        const actionBtn = e.target.closest('.card-action-btn');
        if (!actionBtn) return;

        // Prevent the click from bubbling up to the card (which would open modal)
        e.stopPropagation();

        // Toggle add/check icon for the "add to list" button
        const icon = actionBtn.querySelector('i, span, svg');
        if (icon) {
            const currentText = icon.textContent.trim();
            if (currentText === '+') {
                icon.textContent = '✓';
                actionBtn.classList.add('added');
            } else if (currentText === '✓') {
                icon.textContent = '+';
                actionBtn.classList.remove('added');
            }
        }

        // Fallback: if the button itself holds the text (no inner icon element)
        if (!icon) {
            const btnText = actionBtn.textContent.trim();
            if (btnText === '+') {
                actionBtn.textContent = '✓';
                actionBtn.classList.add('added');
            } else if (btnText === '✓') {
                actionBtn.textContent = '+';
                actionBtn.classList.remove('added');
            }
        }
    });
}
