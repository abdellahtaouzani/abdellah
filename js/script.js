/* =================================================================
   sofku portfolio — script.js
   All interactivity lives here. Zero JavaScript in the HTML.
================================================================= */

// ── Wait for DOM to be ready ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    // ── Theme toggle ──────────────────────────────────────────────
    const themeToggle = document.querySelector('.theme-toggle');
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        themeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
    });

    // ── Smooth scroll for all anchor links ────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ── Modal ─────────────────────────────────────────────────────
    const modal        = document.getElementById('modal');
    const modalPlan    = document.getElementById('modal-plan-name');
    const modalForm    = document.querySelector('.modal-form');
    const modalSuccess = document.getElementById('modal-success');
    const modalClose   = document.querySelector('.modal-close');

    function openModal(planName) {
        modalPlan.textContent    = planName;
        document.getElementById('form-plan-input').value = planName;
        modalSuccess.style.display = 'none';
        modalForm.style.display    = 'flex';
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    // Close when clicking the backdrop
    modal.addEventListener('click', e => {
        if (e.target === modal) closeModal();
    });

    // Close button
    modalClose.addEventListener('click', closeModal);

    // Order buttons — read plan name from data-plan attribute
    document.querySelectorAll('[data-plan]').forEach(btn => {
        btn.addEventListener('click', () => openModal(btn.dataset.plan));
    });

    // Form submit — AJAX so user never leaves the page
    modalForm.addEventListener('submit', async e => {
        e.preventDefault();

        const submitBtn = modalForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending…';
        submitBtn.disabled = true;

        try {
            const response = await fetch(modalForm.action, {
                method: 'POST',
                body: new FormData(modalForm),
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                modalForm.style.display    = 'none';
                modalSuccess.style.display = 'flex';
                modalForm.reset();
                setTimeout(closeModal, 2800);
            } else {
                submitBtn.textContent = 'Something went wrong — try again';
                submitBtn.disabled = false;
            }
        } catch {
            submitBtn.textContent = 'Network error — try again';
            submitBtn.disabled = false;
        }
    });

    // ── Nav: add .scrolled class on scroll ────────────────────────
    const nav = document.getElementById('mainNav');
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    // ── FAQ accordion ─────────────────────────────────────────────
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item   = btn.parentElement;
            const isOpen = item.classList.contains('open');
            // Close all
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
            // Open clicked one if it wasn't already open
            if (!isOpen) item.classList.add('open');
        });
    });

    // ── Cursor glow (lagged lerp, desktop only) ───────────────────
    const glow = document.getElementById('cursorGlow');
    let mx = -600, my = -600, gx = -600, gy = -600;

    document.addEventListener('mousemove', e => {
        mx = e.clientX;
        my = e.clientY;
    });

    (function animateGlow() {
        gx += (mx - gx) * 0.06;
        gy += (my - gy) * 0.06;
        glow.style.transform = `translate(${gx - 250}px, ${gy - 250}px)`;
        requestAnimationFrame(animateGlow);
    })();

    // ── Magnetic buttons ──────────────────────────────────────────
    document.querySelectorAll('.hero-btn, nav .cta').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            const cx   = rect.left + rect.width  / 2;
            const cy   = rect.top  + rect.height / 2;
            const dx   = (e.clientX - cx) * 0.28;
            const dy   = (e.clientY - cy) * 0.28;
            btn.style.transform = `translate(${dx}px, ${dy}px) translateY(-3px) scale(1.025)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });

    // ── 3D card tilt on hover ─────────────────────────────────────
    document.querySelectorAll('.project-card, .testimonial-card, .pricing-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x    = (e.clientX - rect.left) / rect.width  - 0.5;
            const y    = (e.clientY - rect.top)  / rect.height - 0.5;
            card.style.transform = `translateY(-6px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) scale(1.01)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // ── Parallax: hero blob drifts slightly on scroll ─────────────
    const heroSection = document.getElementById('intro');
    window.addEventListener('scroll', () => {
        if (window.scrollY < window.innerHeight) {
            heroSection.style.setProperty('--parallax-y', `${window.scrollY * 0.18}px`);
        }
    }, { passive: true });

    // ── Scroll reveal (generic, single elements) ──────────────────
    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                revealObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -55px 0px' });

    document.querySelectorAll('.scroll-reveal').forEach(el => revealObs.observe(el));

    // ── Stagger groups (cards, grid items) ────────────────────────
    const staggerGroups = new Map();
    document.querySelectorAll('.stagger-item').forEach(el => {
        const parent = el.parentElement;
        if (!staggerGroups.has(parent)) staggerGroups.set(parent, []);
        staggerGroups.get(parent).push(el);
    });

    staggerGroups.forEach((items, parent) => {
        const groupObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    items.forEach((item, i) => {
                        setTimeout(() => item.classList.add('in'), i * 85);
                    });
                    groupObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
        groupObs.observe(parent);
    });

    // ── Animated counter (ease-out-expo) ──────────────────────────
    const counterObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el     = entry.target;
                const target = +el.dataset.target;
                const dur    = 1400;
                let start    = null;

                function step(timestamp) {
                    if (!start) start = timestamp;
                    const progress = Math.min((timestamp - start) / dur, 1);
                    const eased    = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                    el.textContent = Math.round(eased * target);
                    if (progress < 1) requestAnimationFrame(step);
                }

                requestAnimationFrame(step);
                counterObs.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.counter').forEach(el => counterObs.observe(el));

    // ── CTR bar animation ─────────────────────────────────────────
    const ctrCard = document.querySelector('.ctr-card');
    if (ctrCard) {
        const barObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.querySelectorAll('.ctr-bar-fill').forEach((bar, i) => {
                        setTimeout(() => {
                            bar.style.width = bar.dataset.width + '%';
                        }, i * 250 + 200);
                    });
                    barObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        barObs.observe(ctrCard);
    }

    // ── Pill stagger (skills + ctr features) ──────────────────────
    const pillObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('span').forEach((span, i) => {
                    setTimeout(() => span.classList.add('pill-in'), i * 48);
                });
                pillObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.stagger-pills').forEach(el => pillObs.observe(el));

    // ── Hero entrance sequence (runs once on page load) ───────────
    const heroLines = document.querySelectorAll('.hero-line');

    setTimeout(() => {
        document.querySelector('.intro-tag').classList.add('in');
        heroLines.forEach((line, i) => {
            setTimeout(() => line.classList.add('in'), 80 + i * 130);
        });
        setTimeout(() => document.querySelector('.hero-sub').classList.add('in'),     560);
        setTimeout(() => document.querySelector('.hero-actions').classList.add('in'), 720);
        setTimeout(() => document.querySelector('.hero-stats').classList.add('in'),   880);
        setTimeout(() => document.querySelector('.scroll-hint').classList.add('in'),  1040);
    }, 80);

    // ── Showcase belt lightbox ─────────────────────────────────────
    const lightbox        = document.getElementById('lightbox');
    const lightboxImg     = document.getElementById('lightbox-img');
    const lightboxClose   = document.getElementById('lightbox-close');
    const lightboxBackdrop= document.getElementById('lightbox-backdrop');
    const lightboxPrev    = document.getElementById('lightbox-prev');
    const lightboxNext    = document.getElementById('lightbox-next');

    // Collect unique image src/alt pairs (deduplicate the looped duplicates)
    const allBeltImgs = Array.from(document.querySelectorAll('.showcase-track img'));
    const seen = new Set();
    const uniqueImgs = allBeltImgs.filter(img => {
        if (seen.has(img.src)) return false;
        seen.add(img.src);
        return true;
    });
    let currentIndex = 0;

    function openLightbox(src, alt, index) {
        currentIndex = index;
        lightboxImg.src = src;
        lightboxImg.alt = alt;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + uniqueImgs.length) % uniqueImgs.length;
        lightboxImg.src = uniqueImgs[currentIndex].src;
        lightboxImg.alt = uniqueImgs[currentIndex].alt;
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % uniqueImgs.length;
        lightboxImg.src = uniqueImgs[currentIndex].src;
        lightboxImg.alt = uniqueImgs[currentIndex].alt;
    }

    allBeltImgs.forEach(img => {
        img.addEventListener('click', () => {
            const idx = uniqueImgs.findIndex(u => u.src === img.src);
            openLightbox(img.src, img.alt, idx >= 0 ? idx : 0);
        });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxBackdrop.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', showPrev);
    lightboxNext.addEventListener('click', showNext);

    document.addEventListener('keydown', e => {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape')      closeLightbox();
        if (e.key === 'ArrowLeft')   showPrev();
        if (e.key === 'ArrowRight')  showNext();
    });

}); // end DOMContentLoaded
