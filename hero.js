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

  // Scaled to the viewport: a fixed 68px inset is a sixth of a phone screen.
  function insetX() { return Math.min(68, Math.round(window.innerWidth * 0.045)); }
  function insetB() { return Math.min(52, Math.round(window.innerWidth * 0.035)); }
  function radius()  { return Math.min(26, Math.round(window.innerWidth * 0.018)); }
  var INSET_X = insetX();
  var INSET_B = insetB();
  var RADIUS  = radius();

  // The gutter revealed around the docked hero resolves to the same surface the
  // stat cards sit on, so the hero reads as resting on that band rather than
  // floating on an unrelated colour. This is what carries the eye downward.
  // Resolve to the stat band's EXACT declared value, alpha included, not just a
  // matching flat colour. The band is translucent, so the fixed breathing orbs
  // show through it; a solid hero would still read as a different surface even
  // at the same average colour. Matching the alpha lets the same orbs show
  // through both, so there is nothing left to divide them.
  // The hero fades its own ground away entirely rather than trying to match the
  // section below. Two translucent surfaces over a fixed, spatially varying orb
  // layer never composite identically; one shared surface always does. At full
  // dock the gutter is the page ground plus orbs, which is exactly what the
  // stats section is, so there is nothing to match.
  var FROM = [8, 40, 40, 1];        // --teal-deep, solid, at the top of the page
  var TO   = [8, 40, 40, 0];        // fully transparent: the page ground shows
  var hero = document.querySelector('.hero');
  var content = document.querySelector('.hero-content');
  var pillars = document.querySelector('.hero-pillars');
  // The stat cards take over as the hero yields: they rise and grow into place
  // on exactly the ground the hero is resolving to, so the two motions read as
  // one handover rather than two unrelated effects.
  // The grid is scaled, not the cards, because the cards carry their own
  // pointer-tilt transform and the two would fight.
  var statsGrid = document.querySelector('.stats-grid');
  var CARD_FROM = 0.90;   // scale at the top of the page
  var CARD_RISE = 26;     // px the cards travel upward into place
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
    if (statsGrid) {
      var sc = CARD_FROM + (1 - CARD_FROM) * p;
      statsGrid.style.transformOrigin = '50% 0%';
      statsGrid.style.transform = 'translateY(' + ((1 - p) * CARD_RISE).toFixed(1) + 'px) scale(' + sc.toFixed(4) + ')';
      statsGrid.style.opacity = (0.55 + 0.45 * p).toFixed(3);
    }
    if (hero) {
      hero.style.backgroundColor = 'rgba(' +
        Math.round(FROM[0] + (TO[0] - FROM[0]) * p) + ',' +
        Math.round(FROM[1] + (TO[1] - FROM[1]) * p) + ',' +
        Math.round(FROM[2] + (TO[2] - FROM[2]) * p) + ',' +
        (FROM[3] + (TO[3] - FROM[3]) * p).toFixed(3) + ')';
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
  window.addEventListener('resize', function () {
    INSET_X = insetX(); INSET_B = insetB(); RADIUS = radius();
    update();
  }, { passive: true });
  update();
})();
