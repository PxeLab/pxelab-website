// Nav scroll state
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Mobile nav toggle
  const navHamburger = document.getElementById('navHamburger');
  const navMobile = document.getElementById('navMobile');
  if (navHamburger && navMobile) {
    navHamburger.addEventListener('click', () => {
      const isOpen = navMobile.classList.toggle('open');
      navHamburger.classList.toggle('active', isOpen);
      navHamburger.setAttribute('aria-expanded', isOpen);
    });
    document.querySelectorAll('.nav-mobile a').forEach(link => {
      link.addEventListener('click', () => {
        navMobile.classList.remove('open');
        navHamburger.classList.remove('active');
        navHamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Intersection observer for fade-in
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
