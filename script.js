// Modern Ventaro Sales Website JavaScript
// Enhanced with performance optimizations, accessibility, and modern features

// Initialize AOS (Animate On Scroll) library
AOS.init({
    duration: 800,
    easing: 'ease-out-cubic',
    once: true,
    offset: 100,
    disable: 'mobile'
});

// Performance optimization: Use requestAnimationFrame for smooth animations
const raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

// Utility functions
const utils = {
    // Debounce function for performance
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function for scroll events
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    },

    // Check if element is in viewport
    isInViewport: (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    // Format numbers with animation
    animateNumber: (element, start, end, duration = 2000) => {
        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + (end - start) * easeOutQuart);
            element.textContent = current.toLocaleString();
            if (progress < 1) {
                raf(animate);
            }
        };
        raf(animate);
    }
};

// Loading spinner management
class LoadingManager {
    constructor() {
        this.spinner = document.getElementById('loading-spinner');
        this.init();
    }

    init() {
        // Hide spinner when page is fully loaded
        window.addEventListener('load', () => {
            setTimeout(() => this.hide(), 500);
        });

        // Fallback: hide spinner after 3 seconds
        setTimeout(() => this.hide(), 3000);
    }

    hide() {
        if (this.spinner) {
            this.spinner.style.opacity = '0';
            setTimeout(() => {
                this.spinner.style.display = 'none';
            }, 300);
        }
    }
}

// Navigation management
class NavigationManager {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.hamburger = document.querySelector('.hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupScrollEffect();
        this.setupSmoothScrolling();
        this.setupActiveLink();
    }

    setupMobileMenu() {
        if (this.hamburger && this.navMenu) {
            this.hamburger.addEventListener('click', () => {
                this.toggleMobileMenu();
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.navbar.contains(e.target) && this.navMenu.classList.contains('active')) {
                    this.closeMobileMenu();
                }
            });

            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.navMenu.classList.contains('active')) {
                    this.closeMobileMenu();
                }
            });
        }
    }

    toggleMobileMenu() {
        this.hamburger.classList.toggle('active');
        this.navMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
        
        // Update ARIA attributes
        const isOpen = this.navMenu.classList.contains('active');
        this.hamburger.setAttribute('aria-expanded', isOpen);
    }

    closeMobileMenu() {
        this.hamburger.classList.remove('active');
        this.navMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
        this.hamburger.setAttribute('aria-expanded', 'false');
    }

    setupScrollEffect() {
        const scrollHandler = utils.throttle(() => {
            if (window.scrollY > 100) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
        }, 16);

        window.addEventListener('scroll', scrollHandler);
    }

    setupSmoothScrolling() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        const offsetTop = target.offsetTop - 80;
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                        this.closeMobileMenu();
                    }
                }
            });
        });
    }

    setupActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollHandler = utils.throttle(() => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                if (window.scrollY >= sectionTop) {
                    current = section.getAttribute('id');
                }
            });

            this.navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        }, 16);

        window.addEventListener('scroll', scrollHandler);
    }
}

// Statistics animation
class StatsAnimator {
    constructor() {
        this.stats = document.querySelectorAll('[data-count]');
        this.animated = new Set();
        this.init();
    }

    init() {
        if (this.stats.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animated.has(entry.target)) {
                    this.animateCounter(entry.target);
                    this.animated.add(entry.target);
                }
            });
        }, { threshold: 0.5 });

        this.stats.forEach(stat => observer.observe(stat));
    }

    animateCounter(element) {
        const target = parseInt(element.dataset.count);
        const suffix = element.dataset.suffix || '';
        const prefix = element.dataset.prefix || '';
        
        utils.animateNumber({
            textContent: (value) => {
                element.textContent = prefix + value.toLocaleString() + suffix;
            }
        }, 0, target, 2000);
    }
}

// Pricing toggle functionality
class PricingManager {
    constructor() {
        this.toggle = document.querySelector('.pricing-toggle');
        this.monthlyPrices = document.querySelectorAll('[data-monthly]');
        this.annualPrices = document.querySelectorAll('[data-annual]');
        this.init();
    }

    init() {
        if (!this.toggle) return;

        this.toggle.addEventListener('change', () => {
            this.updatePrices();
        });
    }

    updatePrices() {
        const isAnnual = this.toggle.checked;
        
        this.monthlyPrices.forEach(price => {
            price.style.display = isAnnual ? 'none' : 'block';
        });
        
        this.annualPrices.forEach(price => {
            price.style.display = isAnnual ? 'block' : 'none';
        });
    }
}

// Countdown timer for CTA section
class CountdownTimer {
    constructor() {
        this.timerElement = document.querySelector('.urgency-timer');
        this.init();
    }

    init() {
        if (!this.timerElement) return;

        // Set countdown to 24 hours from now
        const endTime = new Date().getTime() + (24 * 60 * 60 * 1000);
        
        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = endTime - now;

            if (distance > 0) {
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                this.timerElement.innerHTML = `
                    <div class="timer-unit">
                        <span class="timer-number">${hours.toString().padStart(2, '0')}</span>
                        <span class="timer-label">Hours</span>
                    </div>
                    <div class="timer-separator">:</div>
                    <div class="timer-unit">
                        <span class="timer-number">${minutes.toString().padStart(2, '0')}</span>
                        <span class="timer-label">Minutes</span>
                    </div>
                    <div class="timer-separator">:</div>
                    <div class="timer-unit">
                        <span class="timer-number">${seconds.toString().padStart(2, '0')}</span>
                        <span class="timer-label">Seconds</span>
                    </div>
                `;
            } else {
                this.timerElement.innerHTML = '<span class="timer-expired">Offer Expired</span>';
            }
        };

        updateTimer();
        setInterval(updateTimer, 1000);
    }
}

// Form handling
class FormManager {
    constructor() {
        this.forms = document.querySelectorAll('form');
        this.init();
    }

    init() {
        this.forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit(form);
            });
        });
    }

    async handleSubmit(form) {
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        // Show loading state
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Show success message
            this.showMessage('Thank you! We\'ll be in touch soon.', 'success');
            form.reset();
        } catch (error) {
            this.showMessage('Something went wrong. Please try again.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    showMessage(message, type) {
        const messageEl = document.createElement('div');
        messageEl.className = `form-message form-message--${type}`;
        messageEl.textContent = message;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            messageEl.classList.remove('show');
            setTimeout(() => messageEl.remove(), 300);
        }, 3000);
    }
}

// Particle animation for hero section
class ParticleAnimation {
    constructor() {
        this.particles = document.querySelectorAll('.particle');
        this.init();
    }

    init() {
        if (this.particles.length === 0) return;

        this.particles.forEach((particle, index) => {
            this.animateParticle(particle, index);
        });
    }

    animateParticle(particle, index) {
        const duration = 3000 + (index * 500);
        const delay = index * 200;
        
        particle.style.animationDuration = `${duration}ms`;
        particle.style.animationDelay = `${delay}ms`;
    }
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.init();
    }

    init() {
        // Monitor Core Web Vitals
        if ('web-vital' in window) {
            import('https://unpkg.com/web-vitals@3/dist/web-vitals.js').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
                getCLS(console.log);
                getFID(console.log);
                getFCP(console.log);
                getLCP(console.log);
                getTTFB(console.log);
            });
        }

        // Log performance metrics
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Page Load Time:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
            }, 0);
        });
    }
}

// Accessibility enhancements
class AccessibilityManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupReducedMotion();
    }

    setupKeyboardNavigation() {
        // Skip to main content
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const main = document.querySelector('main');
                if (main) {
                    main.focus();
                    main.scrollIntoView();
                }
            });
        }

        // Escape key handling
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close any open modals or menus
                const activeElements = document.querySelectorAll('.active');
                activeElements.forEach(el => el.classList.remove('active'));
            }
        });
    }

    setupFocusManagement() {
        // Add focus indicators for keyboard users
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-user');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-user');
        });
    }

    setupReducedMotion() {
        // Respect user's motion preferences
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            document.body.classList.add('reduced-motion');
            // Disable AOS animations
            AOS.init({ disable: true });
        }
    }
}

// Initialize all components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all managers
    new LoadingManager();
    new NavigationManager();
    new StatsAnimator();
    new PricingManager();
    new CountdownTimer();
    new FormManager();
    new ParticleAnimation();
    new PerformanceMonitor();
    new AccessibilityManager();

    // Add smooth reveal animation to sections
    const sections = document.querySelectorAll('section');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        section.classList.add('section-hidden');
        sectionObserver.observe(section);
    });

    // Add loading complete class to body
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
    });

    console.log('🚀 Ventaro Sales website loaded successfully!');
});

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        utils,
        NavigationManager,
        StatsAnimator,
        PricingManager,
        FormManager
    };
}