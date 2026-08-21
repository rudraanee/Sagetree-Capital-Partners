/* Sagetree: mandate ring section.
   The four principles oscillate automatically; hovering one takes over, and the
   cycle resumes when the pointer leaves. Progressive enhancement: without this
   file all four principles are shown open and readable.
   Linked by index.html and who-we-are.html. */
(function () {
  var band = document.querySelector('.rings-band');
  var list = document.getElementById('ringsList');
  if (!band || !list) return;

  var decks = Array.prototype.slice.call(list.querySelectorAll('.deck'));
  var N = decks.length;
  if (!N) return;

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Ring paths are traced from the photograph and baked into the markup, so
  // nothing is generated here. This only moves state.
  var darks = Array.prototype.slice.call(band.querySelectorAll('.r-ring-dark'));
  var rings = Array.prototype.slice.call(band.querySelectorAll('.r-ring'));
  var glow  = band.querySelector('.rings-glow');

  // ---- connector: joins the live deck to the ring it names ------------
  var stage = band.querySelector('.rings-stage');
  var trunk = band.querySelector('.trunk');
  var linkSvg = document.getElementById('deckLink');
  var linkPath = document.getElementById('deckLinkPath');
  var linkTip = document.getElementById('deckLinkTip');

  function ringGeom(i) {
    // Measure the ring as rendered. getBoundingClientRect on the <use> element
    // reflects the live rotation, so the endpoint stays on the ring while the
    // trunk turns, rather than being computed from an assumed radius.
    var rr = rings[i].getBoundingClientRect();
    if (!rr.width) return null;
    return { cx: rr.left + rr.width / 2, cy: rr.top + rr.height / 2,
             rx: rr.width / 2, ry: rr.height / 2 };
  }

  function linkPathFor(i) {
    var sb = stage.getBoundingClientRect();
    var db = decks[i].getBoundingClientRect();
    var g = ringGeom(i);
    if (!g) return null;

    // Horizontal only. An earlier version chose the path by comparing the ring
    // centre against the deck bottom, but the trunk sits in the bottom-right
    // corner, so its centre is below the first deck and desktop wrongly took
    // the stacked path. The connector is desktop-only now, so there is one path.
    var ex = g.cx - g.rx * 0.94 - sb.left;
    var ey = g.cy - g.ry * 0.22 - sb.top;
    var sx = db.right - sb.left + 10;
    var sy = db.top - sb.top + 22;
    var midX = sx + Math.max(40, (ex - sx) * 0.40);
    return { d: 'M' + sx.toFixed(1) + ' ' + sy.toFixed(1) +
                'H' + midX.toFixed(1) +
                'C' + (midX + (ex - midX) * 0.5).toFixed(1) + ' ' + sy.toFixed(1) + ',' +
                      (midX + (ex - midX) * 0.6).toFixed(1) + ' ' + ey.toFixed(1) + ',' +
                      ex.toFixed(1) + ' ' + ey.toFixed(1),
             ex: ex, ey: ey, w: sb.width, h: sb.height };
  }

  function drawLink(i, animate) {
    if (!linkSvg || !stage || !trunk || !rings[i]) return;
    var g = linkPathFor(i);
    if (!g) return;
    linkSvg.setAttribute('viewBox', '0 0 ' + Math.round(g.w) + ' ' + Math.round(g.h));
    linkPath.setAttribute('d', g.d);
    linkTip.setAttribute('cx', g.ex.toFixed(1));
    linkTip.setAttribute('cy', g.ey.toFixed(1));
    if (animate) {
      var len = linkPath.getTotalLength ? linkPath.getTotalLength() : 400;
      linkPath.style.strokeDasharray = len;
      linkPath.style.strokeDashoffset = len;
      void linkPath.getBoundingClientRect();
      linkPath.style.strokeDashoffset = 0;
    }
    linkSvg.classList.add('on');
  }

  // Keep the endpoint on the ring while the trunk rotates. Only the path data
  // is touched here, so the draw-in animation is not restarted.
  var tracking = false;
  function track() {
    if (!tracking) return;
    if (cur >= 0) drawLink(cur, false);
    requestAnimationFrame(track);
  }

  band.classList.add('js-on');

  var cur = -1;
  function setLive(i) {
    if (i === cur) return;
    cur = i;
    [darks, rings, decks].forEach(function (group) {
      group.forEach(function (e, k) {
        e.classList.toggle('live', k === i);
        e.classList.toggle('seen', k < i);
      });
    });
    decks.forEach(function (d, k) { d.setAttribute('aria-current', String(k === i)); });
    drawLink(i, true);
    if (glow && !reduce) {
      glow.classList.remove('glint');
      void glow.offsetWidth;           // restart the flare
      glow.classList.add('glint');
    }
  }

  // ---- automatic oscillation ------------------------------------------
  var STEP = 4200;                     // ms each principle holds
  var timer = null;
  var held = false;                    // pointer is driving

  function advance() { setLive((cur + 1) % N); }
  function start() { if (!timer && !reduce) timer = setInterval(advance, STEP); }
  function stop()  { if (timer) { clearInterval(timer); timer = null; } }

  decks.forEach(function (deck, i) {
    deck.addEventListener('mouseenter', function () { held = true; stop(); setLive(i); });
    deck.addEventListener('focus',      function () { held = true; stop(); setLive(i); });
    deck.addEventListener('click',      function () { setLive(i); });
  });
  band.addEventListener('mouseleave', function () { held = false; start(); });

  // Only run while the section is actually on screen.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          if (!held) start();
          if (!tracking && !reduce) { tracking = true; requestAnimationFrame(track); }
        } else {
          stop();
          tracking = false;
        }
      });
    }, { threshold: 0.25 }).observe(band);
  } else {
    start();
  }

  window.addEventListener('resize', function () { if (cur >= 0) drawLink(cur, false); }, { passive: true });
  window.addEventListener('scroll', function () { if (cur >= 0) drawLink(cur, false); }, { passive: true });

  setLive(0);
})();
