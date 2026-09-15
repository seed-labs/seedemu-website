(() => {
  'use strict';
  document.documentElement.classList.add('js-enabled');

  const toggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.main-navigation');
  const narrowViewport = window.matchMedia('(max-width: 960px)');
  const setMenu = (open, restoreFocus = false) => {
    navigation.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    if (open && narrowViewport.matches) navigation.querySelector('a')?.focus();
    if (restoreFocus) toggle.focus();
  };
  if (toggle && navigation) {
    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    navigation.addEventListener('click', event => {
      if (event.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setMenu(false, true);
    });
    document.addEventListener('click', event => {
      if (!event.target.closest('.site-header')) setMenu(false);
    });
    narrowViewport.addEventListener('change', () => setMenu(false));
    window.addEventListener('seed:theme-picker-open', () => setMenu(false));
  }

  if (document.body.classList.contains('is-home') && 'IntersectionObserver' in window) {
    const links = [...document.querySelectorAll('[data-section]')];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(link => {
          const active = link.dataset.section === entry.target.id;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
    links.forEach(link => {
      const section = document.getElementById(link.dataset.section);
      if (section) observer.observe(section);
    });
  }

  document.querySelectorAll('.video-panel video').forEach(video => {
    const errorMessage = video.closest('.video-panel').querySelector('.video-error');
    video.addEventListener('error', () => { errorMessage.hidden = false; });
    video.addEventListener('loadeddata', () => { errorMessage.hidden = true; });
  });

  const copyText = async text => {
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(text); return; } catch (_) { /* Try the selection fallback. */ }
    }
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.cssText = 'position:fixed;left:-9999px;top:0;';
    document.body.appendChild(field);
    field.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } finally { field.remove(); }
    if (!copied) throw new Error('Clipboard unavailable');
  };
  document.querySelectorAll('[data-copy]').forEach(button => {
    let resetTimer;
    button.addEventListener('click', async () => {
      const code = button.closest('.code-block').querySelector('code');
      const label = button.querySelector('span');
      clearTimeout(resetTimer);
      try {
        await copyText(code.textContent.trimEnd());
        label.textContent = 'Copied';
        button.classList.add('is-copied');
      } catch (_) {
        label.textContent = 'Select code';
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(code);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      button.focus({ preventScroll: true });
      resetTimer = setTimeout(() => { label.textContent = 'Copy'; button.classList.remove('is-copied'); }, 2500);
    });
  });
})();
