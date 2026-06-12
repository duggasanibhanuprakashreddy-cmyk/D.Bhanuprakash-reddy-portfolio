document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. MOBILE NAVIGATION TOGGLE
    // ----------------------------------------------------
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileNavToggle && navMenu) {
        mobileNavToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            const icon = mobileNavToggle.querySelector('i');
            if (navMenu.classList.contains('open')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        });

        // Close menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                mobileNavToggle.querySelector('i').className = 'fas fa-bars';
            });
        });
    }

    // ----------------------------------------------------
    // 2. LIGHT/DARK THEME TOGGLER
    // ----------------------------------------------------
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check local storage or system preferences
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        body.classList.add('light-theme');
        updateThemeIcon(true);
    } else {
        body.classList.remove('light-theme');
        updateThemeIcon(false);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            body.classList.toggle('light-theme');
            const isLight = body.classList.contains('light-theme');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            updateThemeIcon(isLight);
            
            // Trigger particle recoloring
            initParticleColors(isLight);
        });
    }

    function updateThemeIcon(isLight) {
        const icon = themeToggleBtn.querySelector('i');
        if (isLight) {
            icon.className = 'fas fa-moon';
        } else {
            icon.className = 'fas fa-sun';
        }
    }

    // ----------------------------------------------------
    // 3. INTERACTIVE NEURAL-NET CANVAS
    // ----------------------------------------------------
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    
    let particlesArray = [];
    const maxParticles = 80;
    let connectionDistance = 120;
    
    // Configurable color objects
    let particleColor = 'rgba(0, 242, 254, 0.45)';
    let lineColor = 'rgba(79, 172, 254, 0.08)';
    
    function initParticleColors(isLight) {
        if (isLight) {
            particleColor = 'rgba(79, 172, 254, 0.35)';
            lineColor = 'rgba(79, 172, 254, 0.06)';
        } else {
            particleColor = 'rgba(0, 242, 254, 0.45)';
            lineColor = 'rgba(0, 242, 254, 0.08)';
        }
    }
    
    // Initialize starting colors
    initParticleColors(body.classList.contains('light-theme'));

    // Track mouse coordinates
    const mouse = {
        x: null,
        y: null,
        radius: 150
    };

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Particle Object Blueprint
    class Particle {
        constructor(x, y, directionX, directionY, size) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
        }
        
        // Draw particle
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = particleColor;
            ctx.fill();
        }
        
        // Update position and boundary collisions
        update() {
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }
            
            // Hover effect (repulsion/attraction)
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    // Slight repulsion force away from cursor
                    const force = (mouse.radius - distance) / mouse.radius;
                    this.x -= (dx / distance) * force * 1.5;
                    this.y -= (dy / distance) * force * 1.5;
                }
            }
            
            this.x += this.directionX;
            this.y += this.directionY;
            
            this.draw();
        }
    }

    // Populate particles arrays
    function initParticles() {
        particlesArray = [];
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Adjust density based on screen size
        let numParticles = maxParticles;
        if (canvas.width < 768) {
            numParticles = 35;
            connectionDistance = 90;
        } else {
            connectionDistance = 120;
        }

        for (let i = 0; i < numParticles; i++) {
            let size = Math.random() * 2 + 1; // small particles
            let x = Math.random() * (canvas.width - size * 2) + size;
            let y = Math.random() * (canvas.height - size * 2) + size;
            let directionX = (Math.random() * 0.4) - 0.2;
            let directionY = (Math.random() * 0.4) - 0.2;
            
            particlesArray.push(new Particle(x, y, directionX, directionY, size));
        }
    }

    // Draw connecting lines between close particles
    function connectParticles() {
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let dx = particlesArray[a].x - particlesArray[b].x;
                let dy = particlesArray[a].y - particlesArray[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < connectionDistance) {
                    // Connect points
                    ctx.strokeStyle = lineColor;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Animation Loop
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connectParticles();
        requestAnimationFrame(animateParticles);
    }

    // Handle Window Resizing
    window.addEventListener('resize', () => {
        initParticles();
    });

    initParticles();
    animateParticles();

    // ----------------------------------------------------
    // 4. INTERSECTION OBSERVER FOR ACTIVE NAV LINKS & ANIMATIONS
    // ----------------------------------------------------
    const sections = document.querySelectorAll('section');
    
    // Observer options for active menu indicator
    const navObserverOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px', // focused center of viewport
        threshold: 0
    };

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, navObserverOptions);

    sections.forEach(section => navObserver.observe(section));

    // Observer for fade-in animations on scrolling
    const revealObserverOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // If it is timeline, reveal child items with cascade
                if (entry.target.classList.contains('timeline')) {
                    const items = entry.target.querySelectorAll('.timeline-item');
                    items.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('revealed');
                        }, index * 200);
                    });
                }
                
                // Trigger skill progress bars when skill section enters
                if (entry.target.classList.contains('skills-section')) {
                    const progressFills = entry.target.querySelectorAll('.progress-bar-fill');
                    progressFills.forEach(bar => {
                        const targetWidth = bar.style.width;
                        // Set width to trigger animation
                        bar.style.width = '0%';
                        setTimeout(() => {
                            bar.style.width = targetWidth;
                        }, 50);
                    });
                }
            }
        });
    }, revealObserverOptions);

    // Observe elements to reveal on scroll
    document.querySelectorAll('.timeline').forEach(el => revealObserver.observe(el));
    document.querySelectorAll('.skills-section').forEach(el => revealObserver.observe(el));
    
    // Add reveal class to other sections or grids
    document.querySelectorAll('.about-content, .skills-grid, .projects-grid, .contact-wrapper').forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });

    // ----------------------------------------------------
    // 5. PROJECTS GRID FILTERING
    // ----------------------------------------------------
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Set active class
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const filterValue = button.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                // Add slide-out fade animation before hiding
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // ----------------------------------------------------
    // 6. CONTACT FORM SUBMISSION
    // ----------------------------------------------------
    const contactForm = document.getElementById('portfolio-contact-form');
    const formFeedback = document.getElementById('form-feedback');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form fields
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn.innerHTML;
            
            // Visual feedback - Loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';
            formFeedback.className = 'form-feedback-message';
            formFeedback.style.display = 'none';

            // Simulate form submission to backend (API simulation)
            setTimeout(() => {
                // Mock success message
                formFeedback.innerHTML = `<strong>Thank you, ${name}!</strong> Your message has been sent successfully. I will get back to you shortly.`;
                formFeedback.classList.add('success');
                
                // Reset form
                contactForm.reset();
                
                // Restore button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
                
                // Clear success toast after 6 seconds
                setTimeout(() => {
                    formFeedback.style.display = 'none';
                    formFeedback.classList.remove('success');
                }, 6000);
            }, 1800);
        });
    }
});
