(() => {
  'use strict';
  const toggle = document.querySelector('[data-language-toggle]');
  if (!toggle) return;
  const translations = JSON.parse(document.getElementById('seed-language-config').textContent);
  const normalize = text => text.trim().replace(/\s+/g, ' ').toLowerCase();
  const dictionary = new Map(Object.entries(translations).map(([en, zh]) => [normalize(en), zh]));
  const originals = new WeakMap();
  const storageKey = 'seed-review-language';
  let language = 'en';
  let pending = false;
  try { if (sessionStorage.getItem(storageKey) === 'zh-CN') language = 'zh-CN'; } catch (_) { /* A page-only switch still works. */ }

  // Remember each original value so switching back restores English exactly.
  const translateValue = (owner, key, value) => {
    let records = originals.get(owner);
    if (!records) { records = new Map(); originals.set(owner, records); }
    let record = records.get(key);
    if (!record || (value !== record.en && value !== record.zh)) {
      const translated = dictionary.get(normalize(value));
      if (!translated) { records.delete(key); return value; }
      const leading = value.match(/^\s*/)[0];
      const trailing = value.match(/\s*$/)[0];
      record = { en: value, zh: leading + translated + trailing };
      records.set(key, record);
    }
    return language === 'zh-CN' ? record.zh : record.en;
  };
  const observer = new MutationObserver(() => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; render(); });
  });
  const render = () => {
    observer.disconnect();
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT, {
      acceptNode: node => node.parentElement?.closest('script, style, pre, code, [data-language-toggle]')
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const value = translateValue(node, 'text', node.nodeValue);
      if (value !== node.nodeValue) node.nodeValue = value;
    }
    document.querySelectorAll('[aria-label], [title], meta[name="description"], meta[property="og:title"], meta[property="og:description"]').forEach(element => {
      if (element === toggle) return;
      for (const attribute of ['aria-label', 'title', 'content']) {
        if (!element.hasAttribute(attribute)) continue;
        const current = element.getAttribute(attribute);
        const value = translateValue(element, attribute, current);
        if (value !== current) element.setAttribute(attribute, value);
      }
    });
    document.documentElement.lang = language;
    toggle.textContent = language === 'en' ? '中文' : 'English';
    toggle.lang = language === 'en' ? 'zh-CN' : 'en';
    toggle.setAttribute('aria-label', language === 'en' ? '切换为中文' : 'Switch to English');
    toggle.hidden = false;
    document.querySelectorAll('[data-theme-posters]').forEach(video => {
      const posters = JSON.parse(video.dataset.themePosters);
      const source = posters[document.documentElement.dataset.theme];
      if (!source) return;
      const poster = language === 'zh-CN' ? source.replace(/\.svg$/, '-zh.svg') : source;
      if (video.getAttribute('poster') !== poster) video.setAttribute('poster', poster);
    });
    observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['aria-label', 'title'] });
  };
  toggle.addEventListener('click', () => {
    language = language === 'en' ? 'zh-CN' : 'en';
    try { sessionStorage.setItem(storageKey, language); } catch (_) { /* Keep the current page usable without storage. */ }
    render();
    toggle.scrollIntoView({ block: 'nearest' });
  });
  window.addEventListener('seed:themechange', render);
  window.addEventListener('pageshow', () => {
    try { language = sessionStorage.getItem(storageKey) === 'zh-CN' ? 'zh-CN' : 'en'; } catch (_) { /* Preserve the in-memory choice. */ }
    render();
  });
  render();
})();
