// Prestige Worldwide Dustless Eco-Blast - Main Script

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        particleCount: 15,
        particleLifetime: 1000,
        grimeOpacityMin: 0,
        grimeOpacityMax: 0.15,
        scrollFactor: 0.0005,
        particleSize: { min: 3, max: 8 },
        particleSpeed: { min: 2, max: 5 },
        colors: ['rgba(74, 124, 89, 0.8)', 'rgba(90, 140, 105, 0.7)', 'rgba(200, 230, 255, 0.6)', 'rgba(255, 255, 255, 0.8)']
    };

    // State
    let particles = [];
    let scrollProgress = 0;
    let grimeOverlay = null;
    let canvas = null;
    let ctx = null;
    let isInitialized = false;
    let lastScrollY = 0;
    let rafId = null;

    // Particle Class
    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = CONFIG.particleSize.min + Math.random() * (CONFIG.particleSize.max - CONFIG.particleSize.min);
            this.speedX = (Math.random() - 0.5) * CONFIG.particleSpeed.max;
            this.speedY = (Math.random() - 0.5) * CONFIG.particleSpeed.max;
            this.life = CONFIG.particleLifetime;
            this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
            this.angle = Math.random() * Math.PI * 2;
            this.rotation = (Math.random() - 0.5) * 0.2;
        }

        update(deltaTime) {
            this.x += this.speedX;
            this.y += this.speedY;
            this.life -= deltaTime;
            this.angle += this.rotation;
            this.speedX *= 0.98;
            this.speedY *= 0.98;
        }

        draw(ctx) {
            const alpha = Math.max(0, this.life / CONFIG.particleLifetime);
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.globalAlpha = alpha;
            
            // Draw particle as a glass bead/water droplet
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }

        isDead() {
            return this.life <= 0;
        }
    }

    // Initialize
    function init() {
        if (isInitialized) return;

        grimeOverlay = document.getElementById('grime-overlay');
        canvas = document.getElementById('particle-canvas');
        
        if (!canvas || !grimeOverlay) {
            console.error('Required elements not found');
            return;
        }

        ctx = canvas.getContext('2d', { alpha: true });
        resizeCanvas();
        
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Initialize Surface Selector
        initSurfaceSelector();
        
        // Initialize CTA Button
        initCTAButton();
        
        isInitialized = true;
        animate();
    }

    // Resize Canvas
    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // Handle Scroll Event
    function handleScroll() {
        const currentScrollY = window.scrollY;
        const scrollDelta = Math.abs(currentScrollY - lastScrollY);
        
        if (scrollDelta > 5) {
            createParticleBlast(scrollDelta);
        }
        
        lastScrollY = currentScrollY;
        updateGrimeOpacity();
    }

    // Create Particle Blast
    function createParticleBlast(intensity) {
        const numParticles = Math.min(CONFIG.particleCount, Math.ceil(intensity / 10));
        const mouseX = window.innerWidth / 2;
        const mouseY = window.innerHeight / 2;
        
        for (let i = 0; i < numParticles; i++) {
            const spreadX = (Math.random() - 0.5) * 200;
            const spreadY = (Math.random() - 0.5) * 200;
            particles.push(new Particle(mouseX + spreadX, mouseY + spreadY));
        }
    }

    // Update Grime Opacity
    function updateGrimeOpacity() {
        if (!grimeOverlay) return;
        
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress = Math.min(window.scrollY / documentHeight, 1);
        
        const opacity = CONFIG.grimeOpacityMax - (scrollProgress * CONFIG.grimeOpacityMax);
        grimeOverlay.style.opacity = Math.max(CONFIG.grimeOpacityMin, opacity);
    }

    // Animation Loop
    let lastTime = Date.now();
    
    function animate() {
        const currentTime = Date.now();
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        if (!ctx || !canvas) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            particle.update(deltaTime);
            
            if (particle.isDead()) {
                particles.splice(i, 1);
            } else {
                particle.draw(ctx);
            }
        }

        rafId = requestAnimationFrame(animate);
    }

    // Surface Selector Functionality
    function initSurfaceSelector() {
        const buttons = document.querySelectorAll('.surface-btn');
        const infoContents = document.querySelectorAll('.info-content');

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const surface = button.getAttribute('data-surface');
                
                // Update active button
                buttons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update info content with fade animation
                infoContents.forEach(content => {
                    content.classList.remove('active');
                });
                
                const activeContent = document.querySelector(`[data-info="${surface}"]`);
                if (activeContent) {
                    setTimeout(() => {
                        activeContent.classList.add('active');
                    }, 50);
                }
                
                // Create blast effect on selection
                createParticleBlast(50);
            });
        });
    }

    // CTA Button Functionality
    function initCTAButton() {
        const ctaButton = document.getElementById('cta-button');
        
        if (ctaButton) {
            ctaButton.addEventListener('click', () => {
                // Create blast effect
                createParticleBlast(100);
                
                // Scroll to contact or show modal (for demo, scroll to footer)
                const footer = document.querySelector('footer');
                if (footer) {
                    footer.scrollIntoView({ behavior: 'smooth' });
                }
                
                // Add pulse animation
                ctaButton.style.animation = 'none';
                setTimeout(() => {
                    ctaButton.style.animation = '';
                }, 10);
            });
        }
    }

    // Mouse movement creates subtle particles
    let lastMouseMove = 0;
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastMouseMove < 100) return;
        lastMouseMove = now;
        
        if (Math.random() < 0.3) {
            particles.push(new Particle(e.clientX, e.clientY));
        }
    }, { passive: true });

    // Touch support for mobile
    let lastTouchMove = 0;
    document.addEventListener('touchmove', (e) => {
        const now = Date.now();
        if (now - lastTouchMove < 100) return;
        lastTouchMove = now;
        
        if (e.touches.length > 0 && Math.random() < 0.3) {
            const touch = e.touches[0];
            particles.push(new Particle(touch.clientX, touch.clientY));
        }
    }, { passive: true });

    // Performance monitoring
    function checkPerformance() {
        if (particles.length > 200) {
            // Reduce particles if too many
            particles = particles.slice(-100);
        }
    }

    setInterval(checkPerformance, 1000);

    // Page visibility handling
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        } else {
            if (!rafId && isInitialized) {
                lastTime = Date.now();
                animate();
            }
        }
    });

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
        window.removeEventListener('resize', resizeCanvas);
        window.removeEventListener('scroll', handleScroll);
    });
})();
