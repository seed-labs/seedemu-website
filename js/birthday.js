(() => {
  'use strict';

  const section = document.querySelector('[data-birthday]');
  if (!section) return;
  const canvas = section.querySelector('[data-birthday-canvas]');
  const context = canvas.getContext('2d');
  if (!context) return;

  const toggle = section.querySelector('[data-birthday-toggle]');
  const status = section.querySelector('[data-birthday-status]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let palette = [];
  let width = 0;
  let height = 0;
  let frame = null;
  let previousTime = 0;
  let nextLaunch = 0;
  let playing = !reducedMotion.matches;
  let rockets = [];
  let particles = [];

  const random = (min, max) => Math.random() * (max - min) + min;

  function updatePalette() {
    const theme = window.getComputedStyle(section);
    palette = ['--accent', '--birthday-secondary', '--birthday-tertiary', '--accent-hover']
      .map(property => theme.getPropertyValue(property).trim() || theme.color);
    rockets = [];
    particles = [];
    nextLaunch = 0;
    context.clearRect(0, 0, width, height);
  }

  function resize() {
    width = section.clientWidth;
    height = section.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    rockets = [];
    particles = [];
  }

  function launch() {
    rockets.push({
      x: random(width * .08, width * .92),
      y: height,
      target: random(height * .1, height * .42),
      speed: random(260, 410),
      color: palette[Math.floor(random(0, palette.length))]
    });
  }

  function burst(rocket) {
    for (let index = 0; index < 65; index += 1) {
      const angle = random(0, Math.PI * 2);
      const speed = random(40, 220);
      particles.push({
        x: rocket.x,
        y: rocket.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        decay: random(.5, .85),
        radius: random(1, 2.3),
        color: index % 5 === 0 ? palette[1] : rocket.color
      });
    }
  }

  function animate(time) {
    const delta = previousTime ? Math.min((time - previousTime) / 1000, .05) : 0;
    previousTime = time;
    context.clearRect(0, 0, width, height);

    if (time >= nextLaunch) {
      launch();
      nextLaunch = time + random(1000, 1900);
    }

    rockets = rockets.filter(rocket => {
      rocket.y -= rocket.speed * delta;
      if (rocket.y <= rocket.target) {
        burst(rocket);
        return false;
      }
      const trail = context.createLinearGradient(rocket.x, rocket.y, rocket.x, rocket.y + 34);
      trail.addColorStop(0, rocket.color);
      trail.addColorStop(1, 'transparent');
      context.fillStyle = trail;
      context.fillRect(rocket.x - 1, rocket.y, 2, 34);
      return true;
    });

    particles = particles.filter(particle => {
      particle.vy += 34 * delta;
      particle.vx *= Math.pow(.985, delta * 60);
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.alpha -= particle.decay * delta;
      if (particle.alpha <= 0) return false;
      context.globalAlpha = particle.alpha;
      context.fillStyle = particle.color;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();
      return true;
    });

    context.globalAlpha = 1;
    frame = window.requestAnimationFrame(animate);
  }

  function stop() {
    if (frame !== null) window.cancelAnimationFrame(frame);
    frame = null;
    previousTime = 0;
    section.dataset.motion = 'paused';
  }

  function sync() {
    stop();
    toggle.textContent = playing ? 'Pause fireworks' : 'Start fireworks';
    toggle.setAttribute('aria-pressed', String(playing));
    if (playing && !document.hidden) {
      section.dataset.motion = 'playing';
      nextLaunch = 0;
      frame = window.requestAnimationFrame(animate);
    }
  }

  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    playing = !playing;
    sync();
    status.textContent = playing ? 'Fireworks started.' : 'Fireworks paused.';
  });

  reducedMotion.addEventListener('change', () => {
    playing = !reducedMotion.matches;
    if (!playing) {
      rockets = [];
      particles = [];
      context.clearRect(0, 0, width, height);
    }
    sync();
  });

  const observer = new ResizeObserver(resize);
  observer.observe(section);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('seed:themechange', updatePalette);
  window.addEventListener('pagehide', () => {
    stop();
    observer.disconnect();
  });
  window.addEventListener('pageshow', () => {
    observer.observe(section);
    updatePalette();
    sync();
  });

  updatePalette();
  resize();
  sync();
})();
