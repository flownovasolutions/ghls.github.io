/* ============================================================
   STAGEHAUS — main.js
   Header scroll, dropdown, mobile menu, FAQ, reveal
   ============================================================ */

(function () {
  'use strict';

  /* ── Utility ── */
  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ============================================================
     1. HEADER — scroll state
     ============================================================ */
  const header = qs('#site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ============================================================
     2. SERVICES DROPDOWN
     ============================================================ */
  const dropdownTriggers = qsa('.header__dropdown-trigger');

  dropdownTriggers.forEach(trigger => {
    const navItem  = trigger.closest('.header__nav-item--dropdown');
    const dropdown = navItem ? qs('.header__dropdown', navItem) : null;
    if (!navItem || !dropdown) return;

    /* Toggle on click */
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      closeAllDropdowns();
      if (!isOpen) openDropdown(trigger, dropdown);
    });

    /* Keyboard support */
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllDropdowns();
    });

    dropdown.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllDropdowns();
        trigger.focus();
      }
    });
  });

  /* Close when clicking outside */
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.header__nav-item--dropdown')) {
      closeAllDropdowns();
    }
  });

  /* Close on Escape anywhere */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllDropdowns();
  });

  function openDropdown(trigger, dropdown) {
    trigger.setAttribute('aria-expanded', 'true');
    dropdown.removeAttribute('hidden');
  }

  function closeAllDropdowns() {
    dropdownTriggers.forEach(t => {
      t.setAttribute('aria-expanded', 'false');
    });
  }

  /* ============================================================
     3. MOBILE MENU
     ============================================================ */
  const hamburger = qs('.header__hamburger');
  const mobileMenu = qs('#mobile-menu');
  const mobileOverlay = qs('#mobile-overlay');
  const mobileClose = qs('.mobile-menu__close');

  function openMobileMenu() {
    mobileMenu?.classList.add('is-open');
    mobileOverlay?.classList.add('is-open');
    mobileMenu?.removeAttribute('aria-hidden');
    hamburger?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    mobileMenu?.classList.remove('is-open');
    mobileOverlay?.classList.remove('is-open');
    mobileMenu?.setAttribute('aria-hidden', 'true');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', openMobileMenu);
  mobileClose?.addEventListener('click', closeMobileMenu);
  mobileOverlay?.addEventListener('click', closeMobileMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });

  /* ============================================================
     4. SCROLL REVEAL
     ============================================================ */
  const revealEls = qsa('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ============================================================
     5. FAQ — smooth open/close
     ============================================================ */
  qsa('.faq-item').forEach(item => {
    item.addEventListener('toggle', () => {
      /* Close other open FAQs in the same container */
      const siblings = qsa('.faq-item', item.parentElement);
      if (item.open) {
        siblings.forEach(s => { if (s !== item) s.open = false; });
      }
    });
  });

/* ============================================================
   6. CONTACT FORM — Formspree submission
   ============================================================ */
const contactForm = qs('[data-form="contact"]');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const required = qsa('[required]', contactForm);
    let valid = true;
    required.forEach(field => {
      field.classList.remove('is-error');
      if (!field.value.trim()) {
        field.classList.add('is-error');
        valid = false;
      }
    });

    if (!valid) return;

    const btn = qs('[type="submit"]', contactForm);
    if (btn) {
      btn.textContent = 'Sending…';
      btn.disabled = true;
    }

    const data = new FormData(contactForm);

    try {
      const res = await fetch('https://formspree.io/f/xnjkworn', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        contactForm.reset();
        if (btn) {
          btn.textContent = 'Message Sent ✓';
          btn.style.background = 'var(--electric)';
          btn.style.borderColor = 'var(--electric)';
          btn.style.color = '#fff';
        }
      } else {
        throw new Error('Server error');
      }
    } catch {
      if (btn) {
        btn.textContent = 'Send Message';
        btn.disabled = false;
      }
      alert('Something went wrong — please email us directly at hello@stagehausproductions.com');
    }
  });
}


  /* ============================================================
     7. ACTIVE NAV — mark current page link
     ============================================================ */
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  qsa('.header__nav-link, .header__dropdown-item').forEach(link => {
    const href = (link.getAttribute('href') || '').replace(/\/$/, '');
    if (href && href === currentPath) {
      link.classList.add('is-active');
      if (link.classList.contains('header__dropdown-item')&& !link.hasAttribute('data-skip-active')) {
        /* Mark the Services trigger as active too */
        const trigger = qs('.header__dropdown-trigger');
        if (trigger) trigger.classList.add('is-active');
      }
    }
  });

})();
