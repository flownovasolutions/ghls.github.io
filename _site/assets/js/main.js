/* ============================================================
   GHLS Inc. — main.js
   ============================================================
   1.  Header scroll shadow
   2.  Mobile nav toggle
   3.  Products dropdown (click + keyboard)
   4.  FAQ accordion
   5.  Smooth scroll
   6.  Diagnostics anchor spy (desktop)
============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     UTILS
  ---------------------------------------------------------- */
  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


  /* ----------------------------------------------------------
     1. HEADER SCROLL SHADOW
     Adds .is-scrolled to the header once the user scrolls
     past 10px — triggers a stronger box-shadow via CSS.
  ---------------------------------------------------------- */
  (function initHeaderScroll() {
    const header = qs('.site-header');
    if (!header) return;

    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 10);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load in case page is pre-scrolled
  })();


  /* ----------------------------------------------------------
     2. MOBILE NAV TOGGLE
     Toggles the mobile drawer open/closed.
     - Sets aria-expanded on the hamburger button
     - Toggles hidden + aria-hidden on the drawer
     - Locks body scroll while menu is open
     - Closes on Escape key
     - Closes when a nav link inside the drawer is clicked
  ---------------------------------------------------------- */
  (function initMobileNav() {
    const toggle = qs('.site-header__menu-toggle');
    const menu   = qs('#mobile-menu');
    if (!toggle || !menu) return;

    let isOpen = false;

    function openMenu() {
      isOpen = true;
      toggle.setAttribute('aria-expanded', 'true');
      menu.removeAttribute('hidden');
      menu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      isOpen = false;
      toggle.setAttribute('aria-expanded', 'false');
      menu.setAttribute('hidden', '');
      menu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', () => {
      isOpen ? closeMenu() : openMenu();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) closeMenu();
    });

    // Close when a link inside the menu is clicked
    qsa('a', menu).forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close when clicking the overlay (outside the menu panel)
    document.addEventListener('click', (e) => {
      if (isOpen && !menu.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });
  })();


  /* ----------------------------------------------------------
     3. PRODUCTS DROPDOWN (click + keyboard)
     CSS handles hover; this adds click-to-toggle and full
     keyboard support (Enter, Space, Escape, Tab-away close).
  ---------------------------------------------------------- */
  (function initDropdowns() {
    const dropdownItems = qsa('.site-nav__item--dropdown');

    dropdownItems.forEach(item => {
      const trigger  = qs('.site-nav__link--trigger', item);
      const dropdown = qs('.site-nav__dropdown', item);
      if (!trigger || !dropdown) return;

      function openDropdown() {
        trigger.setAttribute('aria-expanded', 'true');
        dropdown.classList.add('is-open');
      }

      function closeDropdown() {
        trigger.setAttribute('aria-expanded', 'false');
        dropdown.classList.remove('is-open');
      }

      function isOpen() {
        return trigger.getAttribute('aria-expanded') === 'true';
      }

      // Click toggle
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        // Close all other dropdowns first
        dropdownItems.forEach(other => {
          if (other !== item) {
            const t = qs('.site-nav__link--trigger', other);
            const d = qs('.site-nav__dropdown', other);
            if (t) t.setAttribute('aria-expanded', 'false');
            if (d) d.classList.remove('is-open');
          }
        });
        isOpen() ? closeDropdown() : openDropdown();
      });

      // Keyboard: Enter / Space open; Escape closes
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          isOpen() ? closeDropdown() : openDropdown();
        }
        if (e.key === 'Escape') closeDropdown();
      });

      // Close if focus moves outside the dropdown item
      item.addEventListener('focusout', (e) => {
        if (!item.contains(e.relatedTarget)) closeDropdown();
      });
    });

    // Close all dropdowns on outside click
    document.addEventListener('click', () => {
      dropdownItems.forEach(item => {
        const t = qs('.site-nav__link--trigger', item);
        const d = qs('.site-nav__dropdown', item);
        if (t) t.setAttribute('aria-expanded', 'false');
        if (d) d.classList.remove('is-open');
      });
    });
  })();


  /* ----------------------------------------------------------
     4. FAQ ACCORDION
     Toggles .is-open on .faq__item and the answer panel.
     Only one item open at a time within the same .faq-group.
     Fully keyboard accessible via the button element.
  ---------------------------------------------------------- */
  (function initFaq() {
    const items = qsa('.faq__item');
    if (!items.length) return;

    items.forEach(item => {
      const question = qs('.faq__question', item);
      const answer   = qs('.faq__answer',   item);
      if (!question || !answer) return;

      // Give the answer panel an ID and link it for a11y
      const id = 'faq-answer-' + Math.random().toString(36).slice(2, 7);
      answer.id = id;
      question.setAttribute('aria-controls', id);
      question.setAttribute('aria-expanded', 'false');

      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        // Close all siblings in the same group
        const group = item.closest('.faq-group');
        if (group) {
          qsa('.faq__item', group).forEach(sibling => {
            if (sibling !== item) {
              sibling.classList.remove('is-open');
              qs('.faq__answer',   sibling)?.classList.remove('is-open');
              qs('.faq__question', sibling)?.setAttribute('aria-expanded', 'false');
            }
          });
        }

        // Toggle this item
        item.classList.toggle('is-open', !isOpen);
        answer.classList.toggle('is-open', !isOpen);
        question.setAttribute('aria-expanded', String(!isOpen));
      });
    });
  })();


  /* ----------------------------------------------------------
     5. SMOOTH SCROLL
     Intercepts clicks on any same-page anchor link (href="#...")
     and smoothly scrolls to the target, accounting for the
     fixed header height.
  ---------------------------------------------------------- */
  (function initSmoothScroll() {
    const header = qs('.site-header');

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const targetId = link.getAttribute('href').slice(1);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();

      const headerHeight = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;

      window.scrollTo({ top, behavior: 'smooth' });

      // Update URL hash without jumping
      history.pushState(null, '', `#${targetId}`);
    });
  })();


  /* ----------------------------------------------------------
     6. DIAGNOSTICS ANCHOR SPY (desktop only)
     Watches the four diagnostic sections as the user scrolls
     and highlights the matching link in .diag-anchor-nav.
     Only active when the anchor nav exists on the page.
  ---------------------------------------------------------- */
  (function initAnchorSpy() {
    const nav = qs('.diag-anchor-nav');
    if (!nav) return;

    // Skip on small screens (nav is hidden via CSS anyway)
    if (window.matchMedia('(max-width: 768px)').matches) return;

    const links    = qsa('.diag-anchor-nav__link', nav);
    const header   = qs('.site-header');
    const sections = links
      .map(link => {
        const id = link.getAttribute('href').replace('#', '');
        return { link, section: document.getElementById(id) };
      })
      .filter(({ section }) => section !== null);

    if (!sections.length) return;

    function getActiveSection() {
      const offset = (header ? header.offsetHeight : 0) + 32;
      // Walk bottom-up — first section whose top is above the offset wins
      for (let i = sections.length - 1; i >= 0; i--) {
        const top = sections[i].section.getBoundingClientRect().top;
        if (top <= offset) return sections[i];
      }
      return sections[0];
    }

    function updateSpy() {
      const active = getActiveSection();
      links.forEach(link => link.classList.remove('is-active'));
      if (active) active.link.classList.add('is-active');
    }

    window.addEventListener('scroll', updateSpy, { passive: true });
    updateSpy(); // run once on load
  })();

})();
