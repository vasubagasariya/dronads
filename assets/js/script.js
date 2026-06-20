/* ============================================================
DRON ADS Pvt. Ltd. — Main JavaScript
Multi-page website — Vanilla JS
============================================================ */

(function () {
    'use strict';

    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);

    const header = $('#header');
    const hamburger = $('#hamburger');
    const mainNav = $('#mainNav');
    const themeToggle = $('#themeToggle');
    const themeIcon = $('#themeIcon');
    const scrollTopBtn = $('#scrollTop');
    const contactForm = $('#contactForm');

    /* ========== ACTIVE NAV ========== */
    function initActiveNav() {
        const navLinks = $$('.nav__link');
        if (!navLinks.length) return;

        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const blogPages = new Set(['blog.html', 'blog-detail.html']);

        navLinks.forEach(link => link.classList.remove('active'));

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath) {
                link.classList.add('active');
            }
        });

        const megaLinks = $$('.mega-menu a');
        let isServiceSubPage = false;
        megaLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === currentPath) {
                link.classList.add('active');
                isServiceSubPage = true;
            }
        });

        if (isServiceSubPage || currentPath === 'services.html') {
            const servicesLink = Array.from(navLinks).find(link => link.getAttribute('href') === 'services.html');
            servicesLink?.classList.add('active');
        }

        if (blogPages.has(currentPath)) {
            const blogLink = Array.from(navLinks).find(link => link.getAttribute('href') === 'blog.html');
            blogLink?.classList.add('active');
        }
    }

    /* ========== HERO SLIDER (Homepage only) ========== */
    const heroSlider = {
        slides: $$('.hero__slide'),
        scrollbarDrag: $('.hero__scrollbar-drag'),
        current: 0,
        total: 0,
        interval: null,
        delay: 5000,

        firstTransition: true,

        init() {
            this.total = this.slides.length;
            if (this.total === 0) return;

            this.dots = $$('.hero__dot');

            this.updateScrollbar();
            this.startAutoplay();

            const heroEl = $('.hero');
            heroEl?.addEventListener('mouseenter', () => this.stopAutoplay());
            heroEl?.addEventListener('mouseleave', () => this.startAutoplay());

            // Arrow click navigation
            const prevBtn = $('.hero__arrow--prev');
            const nextBtn = $('.hero__arrow--next');
            prevBtn?.addEventListener('click', () => this.prev());
            nextBtn?.addEventListener('click', () => this.next());

            // Dot click navigation
            this.dots.forEach(dot => {
                dot.addEventListener('click', () => {
                    const idx = parseInt(dot.dataset.slide, 10);
                    this.goTo(idx);
                });
            });
        },

        goTo(index) {
            if (index === this.current) return;
            this.slides[this.current].classList.remove('active');
            this.current = (index + this.total) % this.total;
            this.slides[this.current].classList.add('active');
            this.updateScrollbar();
            this.triggerContentAnimation(this.slides[this.current]);
            this.resetAutoplay();

            // Sync dot indicators
            if (this.dots && this.dots.length) {
                this.dots.forEach(d => d.classList.remove('active'));
                this.dots[this.current]?.classList.add('active');
            }
        },

        updateScrollbar() {
            if (!this.scrollbarDrag || this.total === 0) return;
            const pct = (this.current / this.total) * 100;
            this.scrollbarDrag.style.left = pct + '%';
        },

        next() { this.goTo(this.current + 1); },
        prev() { this.goTo(this.current - 1); },

        triggerContentAnimation(slide) {
            // After first transition, remove animation delays for snappy slides
            if (this.firstTransition) {
                this.firstTransition = false;
                $$('.hero__heading').forEach(el => el.style.animationDelay = '0s');
                $$('.hero__bottom').forEach(el => el.style.animationDelay = '0s');
            }

            const els = slide.querySelectorAll('.hero__heading, .hero__bottom');
            els.forEach(el => {
                el.style.animation = 'none';
                void el.offsetHeight;
                el.style.animation = '';
            });
        },

        startAutoplay() {
            this.stopAutoplay();
            this.interval = setInterval(() => this.next(), this.delay);
        },

        stopAutoplay() {
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
        },

        resetAutoplay() {
            this.stopAutoplay();
            this.startAutoplay();
        }
    };

    /* ========== STICKY HEADER ========== */
    function handleScroll() {
        const scrollY = window.scrollY;

        if (scrollY > 0) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }

        if (scrollY > 400) {
            scrollTopBtn?.classList.add('visible');
        } else {
            scrollTopBtn?.classList.remove('visible');
        }
        updateScrollProgress();
    }

    /* ========== MOBILE NAV ========== */
    function initMobileNav() {
        hamburger?.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mainNav?.classList.toggle('open');
            const isOpen = mainNav?.classList.contains('open');
            document.body.style.overflow = isOpen ? 'hidden' : '';
            document.documentElement.style.overflow = isOpen ? 'hidden' : '';
        });

        function closeNav() {
            hamburger?.classList.remove('active');
            mainNav?.classList.remove('open');
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }

        // Close nav on non-dropdown link click
        $$('.nav__link', mainNav).forEach(link => {
            if (link.closest('.nav__mega') && link.querySelector('.fa-chevron-down')) return;
            link.addEventListener('click', closeNav);
        });

        // Mega-menu toggle on click (all screen sizes)
        $$('.nav__mega > .nav__link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                link.parentElement.classList.toggle('open');
            });
        });

        // Close nav on mega-menu sub-link click
        $$('.mega-menu__col a').forEach(link => {
            link.addEventListener('click', () => {
                link.closest('.nav__mega')?.classList.remove('open');
                closeNav();
            });
        });

        // Close mega-menu on click outside
        document.addEventListener('click', (e) => {
            $$('.nav__mega').forEach(mega => {
                if (!mega.contains(e.target)) {
                    mega.classList.remove('open');
                }
            });
        });

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                $$('.nav__mega').forEach(m => m.classList.remove('open'));
                closeNav();
            }
        });
    }

    /* ========== DARK/LIGHT MODE ========== */
    function initTheme() {
        const savedTheme = localStorage.getItem('dronads-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        // Always set a theme explicitly
        let theme = 'light'; // Default to light
        if (savedTheme) {
            theme = savedTheme; // Use saved preference
        } else if (prefersDark) {
            theme = 'dark'; // Use system preference
        }

        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('dronads-theme', theme);
        updateThemeIcon();
        themeToggle?.addEventListener('click', toggleTheme);
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('dronads-theme', next);
        updateThemeIcon();
    }

    function updateThemeIcon() {
        const isDark = (document.documentElement.getAttribute('data-theme') || 'light') === 'dark';
        if (themeIcon) {
            themeIcon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        }
    }

    /* ========== SCROLL REVEAL ========== */
    function initScrollReveal() {
        const reveals = $$('.reveal');
        if (reveals.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
        );
        reveals.forEach(el => observer.observe(el));
    }

    /* ========== COUNTER ANIMATION ========== */
    function initCounters() {
        const counters = $$('.stats__number');
        if (counters.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );
        counters.forEach(counter => observer.observe(counter));
    }

    function animateCounter(el) {
        const target = parseInt(el.dataset.target, 10);
        const duration = 2000;
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target).toLocaleString();
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target.toLocaleString();
            }
        }
        requestAnimationFrame(update);
    }

    /* ========== SMOOTH SCROLL ========== */
    function initSmoothScroll() {
        $$('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const id = this.getAttribute('href');
                if (id === '#' || id.length <= 1) return;
                const target = $(id);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        scrollTopBtn?.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ========== ACTIVE NAV (Homepage sections) ========== */
    function initSectionActiveNav() {
        const sections = $$('section[id]');
        if (sections.length === 0) return;

        // Only run on homepage (has hero section)
        if (!$('.hero')) return;

        const navLinks = $$('.nav__link');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('id');
                        navLinks.forEach(link => {
                            const href = link.getAttribute('href');
                            link.classList.toggle('active', href === `#${id}`);
                        });
                    }
                });
            },
            { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' }
        );
        sections.forEach(s => observer.observe(s));
    }

    /* ========== CONTACT FORM ========== */
    function initContactForm() {
        if (!contactForm) return;

        // Replace with your EmailJS Public Key
        if (typeof emailjs !== 'undefined') emailjs.init("YOUR_PUBLIC_KEY");

        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            $$('.form__group', contactForm)
                .forEach(g => g.classList.remove('error'));

            let valid = true;

            const fields = {
                name: { el: $('#name'), test: v => v.trim().length >= 2 },
                phone: { el: $('#phone'), test: v => /^[\+]?[0-9\s\-]{7,15}$/.test(v.trim()) },
                email: { el: $('#email'), test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
                service: { el: $('#service'), test: v => v !== '' },
                message: { el: $('#message'), test: v => v.trim().length >= 5 }
            };

            Object.values(fields).forEach(f => {
                if (f.el && !f.test(f.el.value)) {
                    f.el.closest('.form__group').classList.add('error');
                    valid = false;
                }
            });

            if (!valid) return;

            const btn = $('.form__submit', contactForm);
            btn.classList.add('loading');
            btn.disabled = true;

            // EmailJS Send
            emailjs.sendForm(
                "YOUR_SERVICE_ID",     // Replace
                "YOUR_TEMPLATE_ID",    // Replace
                contactForm
            ).then(function () {

                btn.classList.remove('loading');
                btn.disabled = false;

                contactForm.style.display = 'none';

                contactForm.insertAdjacentHTML('afterend', `
                    <div class="form__success show">
                        <div class="form__success-icon">
                            <i class="fa-solid fa-check"></i>
                        </div>
                        <h3>Thank You!</h3>
                        <p>Your message has been sent successfully. Our team will contact you shortly.</p>
                    </div>
                `);

                contactForm.reset();

            }, function () {

                btn.classList.remove('loading');
                btn.disabled = false;

                alert("Failed to send message. Please try again.");

            });

        });

        // Remove error on typing
        $$('.form__input', contactForm).forEach(input => {
            input.addEventListener('input', () => {
                input.closest('.form__group')?.classList.remove('error');
            });
        });
    }


    /* ========== FOOTER YEAR ========== */
    function setFooterYear() {
        const el = $('#currentYear');
        if (el) el.textContent = new Date().getFullYear();
    }

    /* ========== PARALLAX ========== */
    function initParallax() {
        const banner = $('.cta-banner');
        if (!banner || window.innerWidth < 768) return;

        window.addEventListener('scroll', () => {
            const rect = banner.getBoundingClientRect();
            const wh = window.innerHeight;
            if (rect.top < wh && rect.bottom > 0) {
                const pct = (wh - rect.top) / (wh + rect.height);
                banner.style.backgroundPositionY = `${(pct - 0.5) * 60}px`;
            }
        }, { passive: true });
    }

    /* ========== SCROLL PROGRESS BAR ========== */
    function initScrollProgress() {
        const bar = document.createElement('div');
        bar.className = 'scroll-progress';
        bar.id = 'scrollProgress';
        document.body.prepend(bar);
    }

    function updateScrollProgress() {
        const bar = $('#scrollProgress');
        if (!bar) return;
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight > 0) {
            bar.style.width = ((scrollTop / docHeight) * 100) + '%';
        }
    }

    /* ========== CUSTOM PREMIUM LIGHTBOX GALLERY ========== */
    function initGalleryLightbox() {
        const galleryItems = $$('.gallery__item');
        if (galleryItems.length === 0) return;

        // Compile all slides from DOM
        const slides = Array.from(galleryItems).map((item, index) => {
            // Find image src
            let src = item.getAttribute('data-src');
            if (!src) {
                const img = item.querySelector('img');
                if (img) src = img.getAttribute('src');
            }
            
            // Find caption
            let caption = '';
            const captionAttr = item.getAttribute('data-caption') || item.getAttribute('data-sub-html');
            if (captionAttr) {
                // Extract clean text if caption contains HTML wrapping tags
                caption = captionAttr.replace(/<\/?[^>]+(>|$)/g, "").trim();
            } else {
                const captionEl = item.querySelector('.gallery__caption, .gallery__overlay + p');
                if (captionEl) {
                    caption = captionEl.textContent.trim();
                } else {
                    const img = item.querySelector('img');
                    if (img) caption = img.getAttribute('alt') || '';
                }
            }

            // Bind click to open
            item.addEventListener('click', (e) => {
                e.preventDefault();
                openLightbox(index);
            });

            return { src, caption };
        });

        let currentIndex = 0;
        let lightboxEl = null;
        let imgEl = null;
        let bgBlurEl = null;
        let captionEl = null;
        let counterEl = null;
        let dotsContainer = null;
        
        // Touch events state
        let touchStartX = 0;
        let touchEndX = 0;

        function createLightboxDOM() {
            if ($('#customLightbox')) return;

            const html = `
                <div class="gallery__lightbox" id="customLightbox" aria-hidden="true">
                    <div class="lightbox__bg-blur" id="lightboxBgBlur"></div>
                    <div class="lightbox__overlay"></div>
                    
                    <button class="lightbox__close" id="lightboxCloseBtn" aria-label="Close Lightbox">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                    
                    <div class="lightbox__slider-container">
                        <button class="lightbox__nav lightbox__prev" id="lightboxPrevBtn" aria-label="Previous Slide">
                            <i class="fa-solid fa-chevron-left"></i>
                        </button>
                        
                        <div class="lightbox__img-wrap">
                            <img src="" id="lightboxActiveImg" alt="Gallery slide image">
                        </div>
                        
                        <button class="lightbox__nav lightbox__next" id="lightboxNextBtn" aria-label="Next Slide">
                            <i class="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                    
                    <div class="lightbox__info-panel">
                        <span class="lightbox__counter" id="lightboxCounter"></span>
                        <p class="lightbox__caption" id="lightboxCaption"></p>
                        <div class="lightbox__dots" id="lightboxDots"></div>
                        <span class="lightbox__swipe-hint">Swipe left/right to navigate</span>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', html);

            lightboxEl = $('#customLightbox');
            imgEl = $('#lightboxActiveImg');
            bgBlurEl = $('#lightboxBgBlur');
            captionEl = $('#lightboxCaption');
            counterEl = $('#lightboxCounter');
            dotsContainer = $('#lightboxDots');

            // Bind event listeners for controls
            $('#lightboxCloseBtn').addEventListener('click', closeLightbox);
            $('#lightboxPrevBtn').addEventListener('click', (e) => { e.stopPropagation(); prevSlide(); });
            $('#lightboxNextBtn').addEventListener('click', (e) => { e.stopPropagation(); nextSlide(); });
            
            // Background click closes lightbox
            lightboxEl.addEventListener('click', (e) => {
                if (e.target === lightboxEl || e.target.classList.contains('lightbox__img-wrap') || e.target.classList.contains('lightbox__slider-container')) {
                    closeLightbox();
                }
            });

            // Swipe Gestures for Mobile
            lightboxEl.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            lightboxEl.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }, { passive: true });
        }

        function handleSwipe() {
            const threshold = 50; // min swipe distance in px
            if (touchEndX < touchStartX - threshold) {
                nextSlide(); // Swiped left
            } else if (touchEndX > touchStartX + threshold) {
                prevSlide(); // Swiped right
            }
        }

        function openLightbox(index) {
            createLightboxDOM();
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            
            lightboxEl.classList.add('active');
            lightboxEl.setAttribute('aria-hidden', 'false');
            
            // Setup dots
            dotsContainer.innerHTML = '';
            slides.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = `lightbox__dot ${i === index ? 'active' : ''}`;
                dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
                dot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    goToSlide(i);
                });
                dotsContainer.appendChild(dot);
            });

            goToSlide(index, true);

            // Bind hardware keys
            document.addEventListener('keydown', handleKeyDown);
        }

        function closeLightbox() {
            if (!lightboxEl) return;
            lightboxEl.classList.remove('active');
            lightboxEl.setAttribute('aria-hidden', 'true');
            
            // Restore body scroll
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            
            // Cleanup image source to release memory & avoid visual flash on reopen
            if (imgEl) {
                imgEl.src = '';
                imgEl.classList.remove('loaded');
                imgEl.classList.remove('animate-zoom');
            }
            
            document.removeEventListener('keydown', handleKeyDown);
        }

        function goToSlide(index, firstOpen = false) {
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;
            
            currentIndex = index;
            const slide = slides[currentIndex];
            
            // Transition image: first trigger scale-out/fade-out
            imgEl.classList.remove('loaded');
            imgEl.classList.remove('animate-zoom'); // Reset Ken Burns
            
            // Wait for brief fade out, then swap source
            setTimeout(() => {
                imgEl.src = slide.src;
                bgBlurEl.style.backgroundImage = `url('${slide.src}')`;
                captionEl.textContent = slide.caption;
                counterEl.textContent = `${currentIndex + 1} / ${slides.length}`;
                
                // Update dots
                const dots = dotsContainer.querySelectorAll('.lightbox__dot');
                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === currentIndex);
                });

                // Once image is loaded, trigger scale-in/fade-in
                imgEl.onload = () => {
                    imgEl.classList.add('loaded');
                    imgEl.classList.add('animate-zoom'); // Apply premium slow Ken Burns zoom
                };
                
                // Fallback in case of cached image or load failure
                if (imgEl.complete) {
                    imgEl.classList.add('loaded');
                    imgEl.classList.add('animate-zoom');
                }
            }, firstOpen ? 0 : 250);
        }

        function nextSlide() { goToSlide(currentIndex + 1); }
        
        function prevSlide() { goToSlide(currentIndex - 1); }

        function handleKeyDown(e) {
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'Escape') closeLightbox();
        }
    }

    /* ========== INIT ========== */
    function init() {
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        
        initScrollProgress();
        heroSlider.init();
        initTheme();
        initMobileNav();
        initSmoothScroll();
        initScrollReveal();
        initCounters();
        initActiveNav();
        initSectionActiveNav();
        initContactForm();
        initParallax();
        setFooterYear();
        initGalleryLightbox();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
