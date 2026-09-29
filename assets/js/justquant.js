(() => {
  'use strict';
  const page = document.querySelector('.jq-page');
  if (!page) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const galleryUpdates = [];

  page.querySelectorAll('[data-gallery]').forEach((gallery) => {
    const track = gallery.querySelector('[data-track]');
    const previous = gallery.querySelector('[data-direction="-1"]');
    const next = gallery.querySelector('[data-direction="1"]');
    const update = () => {
      if (!track.clientWidth) return;
      previous.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    };
    const move = (direction) => {
      const item = track.querySelector('figure');
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const distance = Math.min(item.getBoundingClientRect().width + gap, track.clientWidth * 0.9);
      track.scrollBy({left: direction * distance, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
    };
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    track.addEventListener('scroll', update, {passive: true});
    track.addEventListener('keydown', (event) => {
      if (event.target !== track || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Home' || event.key === 'End') {
        track.scrollTo({left: event.key === 'Home' ? 0 : track.scrollWidth, behavior: 'instant'});
      } else move(event.key === 'ArrowLeft' ? -1 : 1);
    });
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(track);
    galleryUpdates.push(update);
  });

  page.querySelectorAll('[data-scene-gallery]').forEach((gallery) => {
    const buttons = [...gallery.querySelectorAll('[data-scene-id]')];
    const images = [...gallery.querySelectorAll('[data-track] img')];
    const thumbnails = gallery.querySelector('.jq-scene-thumbnails');
    const previous = gallery.querySelector('[data-scene-direction="-1"]');
    const next = gallery.querySelector('[data-scene-direction="1"]');
    const status = gallery.querySelector('[data-scene-status]');
    let activeIndex = 0;
    let pendingIndex = 0;
    let requestId = 0;
    const selectScene = async (index) => {
      index = Math.max(0, Math.min(buttons.length - 1, index));
      const request = ++requestId;
      pendingIndex = index;
      status.classList.remove('is-error');
      if (index === activeIndex) {
        gallery.setAttribute('aria-busy', 'false');
        status.textContent = '';
        return;
      }
      const button = buttons[index];
      const label = button.dataset.sceneLabel;
      const directory = gallery.dataset.sourceRoot + encodeURIComponent(button.dataset.sceneId) + '/';
      const sources = images.map(img => directory + img.dataset.methodFile);
      gallery.setAttribute('aria-busy', 'true');
      status.textContent = 'Loading ' + label + '.';
      try {
        // Commit all four methods together so two different scenes are never compared.
        await Promise.all(sources.map(src => {
          const image = new Image();
          image.src = src;
          return image.decode();
        }));
        if (request !== requestId) return;
        images.forEach((img, i) => {
          img.src = sources[i];
          img.alt = label + ': FLUX image generated with ' + img.dataset.methodName + '.';
          const link = img.closest('[data-original-link]');
          link.href = sources[i];
          link.setAttribute('aria-label', 'Open original: ' + label + ', ' + img.dataset.methodName);
        });
        activeIndex = index;
        gallery.dataset.activeScene = button.dataset.sceneId;
        gallery.querySelector('[data-scene-name]').textContent = label;
        gallery.querySelector('[data-scene-counter]').textContent = String(index + 1).padStart(2, '0') + ' / ' + buttons.length;
        buttons.forEach((item, i) => {
          item.setAttribute('aria-pressed', String(i === index));
          item.tabIndex = i === index ? 0 : -1;
        });
        previous.disabled = index === 0;
        next.disabled = index === buttons.length - 1;
        thumbnails.scrollTo({left: button.offsetLeft - (thumbnails.clientWidth - button.offsetWidth) / 2, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
        status.textContent = label + ', comparison ' + (index + 1) + ' of ' + buttons.length + ', loaded.';
      } catch {
        if (request !== requestId) return;
        pendingIndex = activeIndex;
        status.textContent = 'This comparison could not be loaded. Please try again or choose another scene.';
        status.classList.add('is-error');
      } finally {
        if (request === requestId) gallery.setAttribute('aria-busy', 'false');
      }
    };
    previous.addEventListener('click', () => selectScene(pendingIndex - 1));
    next.addEventListener('click', () => selectScene(pendingIndex + 1));
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => selectScene(index));
      button.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const target = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : Math.max(0, Math.min(buttons.length - 1, index + (event.key === 'ArrowRight' ? 1 : -1)));
        buttons[target].focus({preventScroll: true});
        selectScene(target);
      });
    });
  });

  page.querySelectorAll('[data-tabs]').forEach((group) => {
    const tablist = group.querySelector('.jq-tabs');
    const tabs = [...tablist.querySelectorAll('[data-panel]')];
    tablist.setAttribute('role', 'tablist');
    const activate = (index, focus = false) => {
      tabs.forEach((tab, i) => {
        const panel = document.getElementById(tab.dataset.panel);
        tab.setAttribute('aria-selected', String(i === index));
        tab.tabIndex = i === index ? 0 : -1;
        panel.hidden = i !== index;
      });
      if (focus) tabs[index].focus();
      requestAnimationFrame(() => galleryUpdates.forEach((update) => update()));
    };
    tabs.forEach((tab, index) => {
      const panel = document.getElementById(tab.dataset.panel);
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      tab.addEventListener('click', () => activate(index));
      tab.addEventListener('keydown', (event) => {
        const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
        if (!keys.includes(event.key)) return;
        event.preventDefault();
        const target = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        activate(target, true);
      });
    });
    activate(0);
  });
  page.dataset.enhanced = 'true';
  window.addEventListener('resize', () => galleryUpdates.forEach((update) => update()), {passive: true});
  galleryUpdates.forEach((update) => update());
})();
