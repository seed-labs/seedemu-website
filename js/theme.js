(() => {
  'use strict';
  const themes = JSON.parse(document.getElementById('seed-theme-config').textContent);
  const picker = document.querySelector('[data-theme-picker]');
  if (!picker || !themes.length) return;

  const storageKey = 'seed-color-theme';
  const trigger = picker.querySelector('.theme-toggle');
  const panel = picker.querySelector('.theme-panel');
  const radios = [...picker.querySelectorAll('input[name="color-theme"]')];
  const status = picker.querySelector('[data-theme-status]');
  const hint = picker.querySelector('[data-theme-hint]');
  let unsavedTheme = null;
  const resolveTheme = id => themes.find(theme => theme.id === id) || themes[0];

  const applyTheme = (id, { persist = false, announce = false } = {}) => {
    const theme = resolveTheme(id);
    document.documentElement.dataset.theme = theme.id;
    document.querySelector('meta[name="theme-color"]').content = theme.background;
    trigger.setAttribute('aria-label', `Color theme: ${theme.name}`);
    radios.forEach(radio => { radio.checked = radio.value === theme.id; });
    document.querySelectorAll('[data-theme-posters]').forEach(video => {
      const posters = JSON.parse(video.dataset.themePosters);
      if (posters[theme.id]) video.poster = posters[theme.id];
    });
    if (persist) {
      try {
        localStorage.setItem(storageKey, theme.id);
        unsavedTheme = null;
        hint.textContent = 'Your choice is saved in this browser.';
      } catch (_) {
        unsavedTheme = theme.id;
        hint.textContent = 'Theme applied for this page only.';
      }
    }
    if (announce) status.textContent = `${theme.name} theme selected.`;
    window.dispatchEvent(new CustomEvent('seed:themechange', { detail: { id: theme.id } }));
  };

  const closePicker = (restoreFocus = false) => {
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) trigger.focus();
  };
  const openPicker = () => {
    window.dispatchEvent(new CustomEvent('seed:theme-picker-open'));
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    picker.querySelector('input:checked').focus();
  };
  trigger.addEventListener('click', () => panel.hidden ? openPicker() : closePicker());
  trigger.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openPicker();
    }
  });
  radios.forEach(radio => radio.addEventListener('change', () => {
    if (radio.checked) applyTheme(radio.value, { persist: true, announce: true });
  }));
  picker.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) {
      event.stopPropagation();
      closePicker(true);
    }
  });
  picker.addEventListener('focusout', event => {
    if (event.relatedTarget && !picker.contains(event.relatedTarget)) closePicker();
  });
  document.addEventListener('pointerdown', event => {
    if (!picker.contains(event.target)) closePicker();
  });
  document.querySelector('.menu-toggle')?.addEventListener('click', () => closePicker());
  window.addEventListener('storage', event => {
    if (event.key === storageKey || event.key === null) {
      unsavedTheme = null;
      hint.textContent = 'Your choice is saved in this browser.';
      applyTheme(event.newValue);
    }
  });
  window.addEventListener('pageshow', () => {
    if (unsavedTheme) { applyTheme(unsavedTheme); return; }
    try { applyTheme(localStorage.getItem(storageKey)); } catch (_) { /* Keep the current in-memory choice. */ }
  });
  applyTheme(document.documentElement.dataset.theme);
  picker.hidden = false;
})();
