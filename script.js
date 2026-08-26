document.addEventListener('DOMContentLoaded', () => {
    // Utilities
    const debounce = (func, delay = 10) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    };

    // 1. Theme Toggle
    const initTheme = () => {
        const toggleBtn = document.querySelector('.theme-toggle');
        if (!toggleBtn) return;

        const currentTheme = localStorage.getItem('chitthi-theme') || 'dark';
        document.body.setAttribute('data-theme', currentTheme);
        toggleBtn.innerHTML = currentTheme === 'dark' ? '✦Dark Theme' : '✦Light Theme';

        toggleBtn.addEventListener('click', () => {
            const isDark = document.body.getAttribute('data-theme') === 'dark';
            const newTheme = isDark ? 'light' : 'dark';
            
            document.body.classList.add('theme-transitioning');
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('chitthi-theme', newTheme);
            toggleBtn.innerHTML = newTheme === 'dark' ? '✦Dark Theme' : '✦Light Theme';

            setTimeout(() => {
                document.body.classList.remove('theme-transitioning');
            }, 300); // Matches CSS transition time
        });
    };
    initTheme();

    // scroll handling state
    const navbar = document.querySelector('.navbar');
    const announcementBar = document.querySelector('.announcement-bar');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const heroBg = document.querySelector('.hero-bg');

    const handleScroll = debounce(() => {
        const scrollY = window.scrollY;
        
        // 2. Announcement Bar
        if (announcementBar) {
            if (scrollY > 80) {
                announcementBar.classList.add('hidden');
            } else {
                announcementBar.classList.remove('hidden');
            }
        }

        // 14. Navbar Background
        if (navbar) {
            if (scrollY > 10) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        // 15. Parallax Effect
        if (heroBg && window.innerWidth > 768) {
            heroBg.style.transform = `translateY(${scrollY * 0.3}px)`;
        }

        // 3. Active Link Highlighting
        let currentSectionId = '';
        const offset = (navbar ? navbar.offsetHeight : 0) + (announcementBar && !announcementBar.classList.contains('hidden') ? announcementBar.offsetHeight : 0) + 10;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - offset - 100; // Extra buffer
            const sectionHeight = section.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (currentSectionId && link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }, 10);

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Trigger once on load

    // 4. Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;

            e.preventDefault();

            const navHeight = navbar ? navbar.offsetHeight : 0;
            // When scrolling down, announcement bar likely hides
            const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            closeMobileMenu();
        });
    });

    // 5. Mobile Hamburger Menu
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');

    const toggleMobileMenu = () => {
        if (!hamburger || !mobileMenu) return;
        const isActive = hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.classList.toggle('no-scroll', isActive);
    };

    const closeMobileMenu = () => {
        if (!hamburger || !mobileMenu) return;
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.classList.remove('no-scroll');
    };

    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }

    document.addEventListener('click', (e) => {
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
                closeMobileMenu();
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMobileMenu();
            closeModals();
        }
    });

    // 6. Testimonial Carousel
    const initCarousel = () => {
        const track = document.querySelector('.carousel-track');
        const cards = Array.from(document.querySelectorAll('.testimonial-card'));
        const dotsContainer = document.querySelector('.carousel-dots');
        if (!track || cards.length === 0 || !dotsContainer) return;

        let currentIndex = 0;
        let autoAdvanceInterval;

        cards.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.setAttribute('aria-label', `Slide ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });

        const dots = Array.from(dotsContainer.querySelectorAll('.dot'));

        const updateCarousel = () => {
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });
        };

        const goToSlide = (index) => {
            currentIndex = index;
            updateCarousel();
            resetInterval();
        };

        const nextSlide = () => {
            currentIndex = (currentIndex + 1) % cards.length;
            updateCarousel();
        };

        const startInterval = () => {
            autoAdvanceInterval = setInterval(nextSlide, 5000);
        };

        const resetInterval = () => {
            clearInterval(autoAdvanceInterval);
            startInterval();
        };

        startInterval();

        const carouselContainer = document.querySelector('.testimonial-carousel');
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', () => clearInterval(autoAdvanceInterval));
            carouselContainer.addEventListener('mouseleave', startInterval);

            // Touch support
            let startX = 0;
            let isDragging = false;

            carouselContainer.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                isDragging = true;
                clearInterval(autoAdvanceInterval);
            }, { passive: true });

            carouselContainer.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
            }, { passive: true });

            carouselContainer.addEventListener('touchend', (e) => {
                if (!isDragging) return;
                isDragging = false;
                const endX = e.changedTouches[0].clientX;
                const diff = startX - endX;

                if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                        nextSlide();
                    } else {
                        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
                        updateCarousel();
                    }
                }
                startInterval();
            }, { passive: true });
        }
    };
    initCarousel();

    // 7. FAQ Accordion
    const faqButtons = document.querySelectorAll('.faq-question');
    faqButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const parent = btn.closest('.faq-item');
            const isActive = parent.classList.contains('active');
            const answer = parent.querySelector('.faq-answer');

            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
                const ans = item.querySelector('.faq-answer');
                if (ans) ans.style.maxHeight = null;
            });

            if (!isActive && answer) {
                parent.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    // 8. Scroll Animations (extended for all variants)
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.animate-on-scroll, .animate-fade-left, .animate-fade-right, .animate-fade-scale, .ink-reveal').forEach(el => observer.observe(el));

    // 8b. 3D Tilt Effect on Pricing Cards
    const initTilt = () => {
        const tiltCards = document.querySelectorAll('.tilt-card');
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;
                card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    };
    initTilt();

    // 8c. Typewriter Effect
    const initTypewriter = () => {
        const el = document.getElementById('hero-tagline');
        if (!el) return;

        const fullText = el.textContent;
        el.textContent = '';

        const cursor = document.createElement('span');
        cursor.classList.add('typewriter-cursor');
        el.appendChild(cursor);

        let i = 0;
        const speed = 60;

        const type = () => {
            if (i < fullText.length) {
                el.insertBefore(document.createTextNode(fullText.charAt(i)), cursor);
                i++;
                setTimeout(type, speed);
            } else {
                // Remove cursor after 3 seconds
                setTimeout(() => {
                    cursor.style.animation = 'none';
                    cursor.style.opacity = '0';
                    cursor.style.transition = 'opacity 0.5s';
                }, 3000);
            }
        };

        // Start after hero fades in
        setTimeout(type, 800);
    };
    initTypewriter();

    // 9. Flip Countdown Timer (Airport Board)
    const initFlipCountdown = () => {
        const countdownContainer = document.querySelector('.countdown');
        if (!countdownContainer) return;

        // Replace old countdown with flip cards
        countdownContainer.classList.add('flip-countdown');
        countdownContainer.classList.remove('countdown');
        countdownContainer.innerHTML = `
            <div class="flip-unit">
                <div class="flip-card" data-unit="days">
                    <div class="flip-card-inner">
                        <div class="flip-top"><span>00</span></div>
                        <div class="flip-bottom"><span>00</span></div>
                    </div>
                </div>
                <span class="flip-label">Days</span>
            </div>
            <div class="flip-unit">
                <div class="flip-card" data-unit="hours">
                    <div class="flip-card-inner">
                        <div class="flip-top"><span>00</span></div>
                        <div class="flip-bottom"><span>00</span></div>
                    </div>
                </div>
                <span class="flip-label">Hours</span>
            </div>
            <div class="flip-unit">
                <div class="flip-card" data-unit="mins">
                    <div class="flip-card-inner">
                        <div class="flip-top"><span>00</span></div>
                        <div class="flip-bottom"><span>00</span></div>
                    </div>
                </div>
                <span class="flip-label">Minutes</span>
            </div>
            <div class="flip-unit">
                <div class="flip-card" data-unit="secs">
                    <div class="flip-card-inner">
                        <div class="flip-top"><span>00</span></div>
                        <div class="flip-bottom"><span>00</span></div>
                    </div>
                </div>
                <span class="flip-label">Seconds</span>
            </div>
        `;

        const targetDate = new Date('2026-08-23T00:00:00+05:45').getTime();
        const prevValues = { days: '', hours: '', mins: '', secs: '' };

        const flipCard = (card, newValue) => {
            const topSpan = card.querySelector('.flip-top span');
            const bottomSpan = card.querySelector('.flip-bottom span');

            // Remove old flaps
            card.querySelectorAll('.flip-flap').forEach(f => f.remove());

            const oldValue = topSpan.textContent;

            // Create flipping flap (top half with OLD value, flips down)
            const flapTop = document.createElement('div');
            flapTop.classList.add('flip-flap', 'flip-flap-top');
            flapTop.innerHTML = `<span>${oldValue}</span>`;
            card.querySelector('.flip-card-inner').appendChild(flapTop);

            // Create flipping flap (bottom half with NEW value, flips up)
            const flapBottom = document.createElement('div');
            flapBottom.classList.add('flip-flap', 'flip-flap-bottom');
            flapBottom.innerHTML = `<span>${newValue}</span>`;
            card.querySelector('.flip-card-inner').appendChild(flapBottom);

            // Update the static halves
            topSpan.textContent = newValue;

            // Trigger animations
            requestAnimationFrame(() => {
                flapTop.classList.add('animate');
                flapBottom.classList.add('animate');
            });

            // Clean up flaps after animation
            setTimeout(() => {
                bottomSpan.textContent = newValue;
                flapTop.remove();
                flapBottom.remove();
            }, 700);
        };

        const updateFlipTimer = () => {
            const now = new Date().getTime();
            const diff = targetDate - now;

            if (diff <= 0) {
                countdownContainer.innerHTML = '<h3 style="font-family: var(--font-display); color: var(--gold);">Event has begun!</h3>';
                return;
            }

            const values = {
                days: String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0'),
                hours: String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0'),
                mins: String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0'),
                secs: String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0')
            };

            Object.keys(values).forEach(unit => {
                if (values[unit] !== prevValues[unit]) {
                    const card = countdownContainer.querySelector(`[data-unit="${unit}"]`);
                    if (card) flipCard(card, values[unit]);
                    prevValues[unit] = values[unit];
                }
            });
        };

        updateFlipTimer();
        setInterval(updateFlipTimer, 1000);
    };
    initFlipCountdown();

    // 10. Floating Particles
    const initParticles = () => {
        const particlesContainer = document.querySelector('.particles');
        if (!particlesContainer) return;

        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            const size = Math.random() * 4 + 2;
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            const duration = Math.random() * 5 + 3;
            const delay = Math.random() * 5;

            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${left}%`;
            particle.style.top = `${top}%`;
            particle.style.position = 'absolute';
            particle.style.backgroundColor = 'gold';
            particle.style.borderRadius = '50%';
            particle.style.opacity = (Math.random() * 0.5 + 0.2).toString();
            particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite alternate`;

            particlesContainer.appendChild(particle);
        }
    };
    initParticles();

    // 11 & 12. Forms
    const initForms = () => {
        const handleFormSubmit = async (formElement, url, successMsg) => {
            if (!formElement) return;

            formElement.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = formElement.querySelector('button[type="submit"]');
                const originalText = btn ? btn.textContent : 'Submit';
                if (btn) {
                    btn.textContent = 'Sending...';
                    btn.disabled = true;
                }
                
                let msgDiv = formElement.querySelector('.form-msg');
                if (!msgDiv) {
                    msgDiv = document.createElement('div');
                    msgDiv.classList.add('form-msg');
                    formElement.appendChild(msgDiv);
                }
                msgDiv.textContent = '';
                msgDiv.className = 'form-msg';

                try {
                    const formData = new FormData(formElement);
                    const response = await fetch(url, {
                        method: 'POST',
                        body: formData,
                        headers: { 'Accept': 'application/json' }
                    });

                    if (response.ok) {
                        formElement.reset();
                        msgDiv.textContent = successMsg;
                        msgDiv.classList.add('success');
                    } else {
                        const data = await response.json();
                        if (Object.hasOwn(data, 'errors')) {
                            msgDiv.textContent = data.errors.map(err => err.message).join(', ');
                        } else {
                            msgDiv.textContent = 'Oops! There was a problem submitting your form.';
                        }
                        msgDiv.classList.add('error');
                    }
                } catch (error) {
                    msgDiv.textContent = 'Oops! There was a network error.';
                    msgDiv.classList.add('error');
                } finally {
                    if (btn) {
                        btn.textContent = originalText;
                        btn.disabled = false;
                    }
                }
            });
        };

        handleFormSubmit(document.getElementById('contact-form'), 'https://formspree.io/f/YOUR_ID', 'Your message has been sent successfully! ✦');

        // Notify form — simple local handling
        const notifyForm = document.getElementById('notify-form');
        if (notifyForm) {
            notifyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                notifyForm.style.display = 'none';
                const successEl = document.getElementById('notify-success');
                if (successEl) successEl.style.display = 'block';
            });
        }
    };
    initForms();

    // 13. Modals & Product Detail Overlays
    const modals = document.querySelectorAll('.modal');
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const closeBtns = document.querySelectorAll('.modal-close');

    const closeModals = () => {
        modals.forEach(m => m.classList.remove('active'));
        document.body.classList.remove('no-scroll');
    };

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal');
            const targetModal = document.getElementById(`modal-${modalId}`);
            if (targetModal) {
                targetModal.classList.add('active');
                document.body.classList.add('no-scroll');
            }
        });
    });

    // --- Product Detail Modal Logic (Exclusive to Future Letter) ---
    const productDetailsData = {
        future: {
            title: "Letter to Future Details",
            image: "images/letterfuture.png",
            currentPrice: "NRS 150",
            originalPrice: "NRS 200",
            orderUrl: "order-future.html",
            features: [
                "Customizable delivery date up to 5 years into the future",
                "Stored securely in acid-free archival envelopes",
                "Digital backup stored in encrypted vault",
                "Real handcrafted wax seal on envelope",
                "Doorstep physical dispatch on your chosen date"
            ]
        }
    };

    const openProductDetailModal = (productKey) => {
        const data = productDetailsData[productKey];
        if (!data) return;

        const modal = document.getElementById('modal-product-detail');
        const titleEl = document.getElementById('detail-title');
        const imgEl = document.getElementById('detail-img');
        const curPriceEl = document.getElementById('detail-current-price');
        const origPriceEl = document.getElementById('detail-original-price');
        const featuresEl = document.getElementById('detail-features-list');
        const orderBtn = document.getElementById('detail-order-btn');

        if (titleEl) titleEl.textContent = data.title;
        if (imgEl) {
            imgEl.src = data.image;
            imgEl.alt = data.title;
        }
        if (curPriceEl) curPriceEl.textContent = data.currentPrice;
        if (origPriceEl) origPriceEl.textContent = data.originalPrice;
        if (orderBtn) orderBtn.href = data.orderUrl;

        if (featuresEl) {
            featuresEl.innerHTML = data.features.map(f => `<li>${f}</li>`).join('');
        }

        if (modal) {
            modal.classList.add('active');
            document.body.classList.add('no-scroll');
        }
    };

    // Trigger details modal on view-details-btn click
    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productKey = btn.getAttribute('data-product');
            openProductDetailModal(productKey);
        });
    });

    // Trigger details modal exclusively for Future Letter card click (except order link)
    document.querySelectorAll('.pricing-card[data-product="future"]').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            if (e.target.closest('a.btn-primary')) return; // Allow direct order click
            openProductDetailModal('future');
        });
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    // Close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', closeModals);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModals();
        }
    });
});
