/* Sagetree: hero zoom-out.
   The hero media starts full-bleed and, as the page is scrolled, eases into a
   rounded panel inset from the page edges. Progressive enhancement: without
   this file the hero is simply full-bleed and static.
   Linked by index.html only (it is the only page with a hero video). */
(function () {
  var wrap = document.querySelector('.hero-video-wrap');
  var overlay = document.querySelector('.hero-overlay');
  if (!wrap) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var INSET_X = 68;   // px the panel pulls in from each side when fully zoomed out
  var INSET_B = 52;   // px it lifts from the bottom
  var RADIUS  = 26;   // px corner radius at full zoom-out

  // The gutter revealed around the docked hero resolves to the same surface the
  // stat cards sit on, so the hero reads as resting on that band rather than
  // floating on an unrelated colour. This is what carries the eye downward.
  var FROM = [8, 40, 40];      // --teal-deep #082828, the hero's own ground
  var TO   = [10, 47, 44];     // the stats band surface, rgba(14,61,58,.5) over #05201e
  var hero = document.querySelector('.hero');
  var content = document.querySelector('.hero-content');
  var pillars = document.querySelector('.hero-pillars');
  // The hero's own horizontal padding at desktop, which the copy sits against.
  var BASE_PAD = 64;
  var hdr = parseInt(getComputedStyle(document.documentElement)
              .getPropertyValue('--hdr'), 10) || 90;

  wrap.style.overflow = 'hidden';
  if (overlay) overlay.style.overflow = 'hidden';

  function apply(p) {
    // p: 0 at the top of the page, 1 once the hero is fully "docked"
    var x = (INSET_X * p).toFixed(1) + 'px';
    var b = (INSET_B * p).toFixed(1) + 'px';
    var t = (hdr + INSET_B * p).toFixed(1) + 'px';
    var r = (RADIUS * p).toFixed(1) + 'px';
    [wrap, overlay].forEach(function (el) {
      if (!el) return;
      el.style.left = x;
      el.style.right = x;
      el.style.bottom = b;
      el.style.top = t;
      el.style.borderRadius = r;
    });
    // Pull the copy inward with the panel so it stays framed by the video
    // rather than drifting off its left edge as the panel narrows.
    var pad = (BASE_PAD + INSET_X * p).toFixed(1) + 'px';
    [content, pillars].forEach(function (el) {
      if (!el) return;
      el.style.paddingLeft = INSET_X * p ? (INSET_X * p).toFixed(1) + 'px' : '';
      el.style.paddingRight = INSET_X * p ? (INSET_X * p).toFixed(1) + 'px' : '';
      el.style.paddingBottom = (INSET_B * p).toFixed(1) + 'px';
    });
    if (hero) {
      hero.style.backgroundColor = 'rgb(' +
        Math.round(FROM[0] + (TO[0] - FROM[0]) * p) + ',' +
        Math.round(FROM[1] + (TO[1] - FROM[1]) * p) + ',' +
        Math.round(FROM[2] + (TO[2] - FROM[2]) * p) + ')';
    }
  }

  var ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight || 1;
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    // ease over the first 70% of a viewport, then hold
    var p = Math.min(1, Math.max(0, y / (vh * 0.7)));
    p = p * p * (3 - 2 * p);            // smoothstep, so it settles rather than stops
    apply(p);
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();
