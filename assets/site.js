/* Ebtisam Zaki — no framework, no dependencies. */
(function () {
  'use strict';

  /* nav: transparent over the hero, solid once you scroll past it */
  var nav = document.querySelector('.nav');
  var hero = document.querySelector('.hero');
  function onScroll() {
    if (!nav) return;
    var past = hero ? window.scrollY > hero.offsetHeight - 90 : window.scrollY > 10;
    nav.classList.toggle('solid', past || !hero);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
      toggle.textContent = links.classList.contains('open') ? '✕' : '☰';
    });
  }

  /* reveal on scroll */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* gallery filters */
  var filterBar = document.querySelector('.filters');
  if (filterBar) {
    var tiles = Array.prototype.slice.call(document.querySelectorAll('.masonry figure'));
    var countEl = document.querySelector('.count');
    filterBar.addEventListener('click', function (ev) {
      var btn = ev.target.closest('button');
      if (!btn) return;
      var want = btn.dataset.filter;
      filterBar.querySelectorAll('button').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      var shown = 0;
      tiles.forEach(function (t) {
        var ok = want === 'all' || t.dataset.subject === want;
        t.hidden = !ok;
        if (ok) shown++;
      });
      if (countEl) countEl.textContent = shown + (shown === 1 ? ' work' : ' works');
    });
  }

  /* lightbox */
  var lb = document.querySelector('.lb');
  if (!lb) return;
  var stageImg = lb.querySelector('.lb-stage img');
  var titleEl = lb.querySelector('.lb-bar h3');
  var blurbEl = lb.querySelector('.lb-bar p');
  var metaEl = lb.querySelector('.lb-meta');
  var askEl = lb.querySelector('.lb-ask');
  var all = [];
  var idx = -1;
  var lastFocus = null;

  function collect() {
    all = Array.prototype.slice.call(document.querySelectorAll('figure.work'))
      .filter(function (f) { return !f.hidden; });
  }

  function preload(n) {
    var f = all[n];
    if (!f) return;
    var i = new Image();
    i.src = f.dataset.full;
  }

  function show(n) {
    if (!all.length) return;
    idx = (n + all.length) % all.length;
    var f = all[idx];
    stageImg.src = f.dataset.full;
    stageImg.alt = f.dataset.title || '';
    titleEl.textContent = f.dataset.title || '';
    blurbEl.textContent = f.dataset.blurb || '';
    var bits = [f.dataset.medium, f.dataset.dims,
      (idx + 1) + ' of ' + all.length].filter(Boolean);
    metaEl.textContent = bits.join('  ·  ');
    if (askEl && askEl.dataset.wa) {
      askEl.href = askEl.dataset.wa + encodeURIComponent(
        'Hello, I would like to ask about "' + (f.dataset.title || '') + '".');
    }
    preload(idx + 1);
    preload(idx - 1);
  }

  function open(fig) {
    collect();
    lastFocus = document.activeElement;
    lb.classList.add('on');
    document.body.style.overflow = 'hidden';
    show(all.indexOf(fig));
    lb.querySelector('.lb-close').focus();
  }

  function close() {
    lb.classList.remove('on');
    document.body.style.overflow = '';
    stageImg.removeAttribute('src');
    if (lastFocus) lastFocus.focus();
  }

  document.addEventListener('click', function (ev) {
    var fig = ev.target.closest('figure.work');
    if (fig) { ev.preventDefault(); open(fig); return; }
    if (ev.target.closest('.lb-close')) return close();
    if (ev.target.closest('.lb-prev')) return show(idx - 1);
    if (ev.target.closest('.lb-next')) return show(idx + 1);
    if (ev.target === lb || ev.target.closest('.lb-stage') === ev.target) close();
  });

  document.addEventListener('keydown', function (ev) {
    if (!lb.classList.contains('on')) return;
    if (ev.key === 'Escape') close();
    else if (ev.key === 'ArrowRight') show(idx + 1);
    else if (ev.key === 'ArrowLeft') show(idx - 1);
  });

  /* swipe */
  var x0 = null;
  lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; },
    { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 60) show(idx + (dx < 0 ? 1 : -1));
    x0 = null;
  }, { passive: true });
})();
