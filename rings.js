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

  function drawLink(i) {
    if (!linkSvg || !stage || !trunk || !rings[i]) return;
    var sb = stage.getBoundingClientRect();
    var db = decks[i].getBoundingClientRect();
    var tb = trunk.getBoundingClientRect();

    // radius of this ring, measured from the rendered path so it always matches
    var bb;
    try { bb = rings[i].getBBox(); } catch (e) { return; }
    var overlay = band.querySelector('.trunk-overlay');
    var scale = tb.width / (overlay ? overlay.viewBox.baseVal.width || 460 : 460);
    var rPx = (bb.width / 2) * scale;

    var cx = tb.left + tb.width / 2 - sb.left;
    var cy = tb.top + tb.height / 2 - sb.top;
    // the point on the ring nearest the copy column
    var ex = cx - rPx;
    var ey = cy;

    var sx = db.right - sb.left + 10;
    var sy = db.top - sb.top + 22;          // beside the title line, not the block centre

    // horizontal run, then an eased bend down to the ring
    var midX = sx + Math.max(40, (ex - sx) * 0.42);
    var d = 'M' + sx.toFixed(1) + ' ' + sy.toFixed(1) +
            'H' + midX.toFixed(1) +
            'C' + (midX + (ex - midX) * 0.45).toFixed(1) + ' ' + sy.toFixed(1) + ',' +
                  (midX + (ex - midX) * 0.55).toFixed(1) + ' ' + ey.toFixed(1) + ',' +
                  ex.toFixed(1) + ' ' + ey.toFixed(1);

    linkSvg.setAttribute('viewBox', '0 0 ' + Math.round(sb.width) + ' ' + Math.round(sb.height));
    linkPath.setAttribute('d', d);
    linkTip.setAttribute('cx', ex.toFixed(1));
    linkTip.setAttribute('cy', ey.toFixed(1));

    var len = linkPath.getTotalLength ? linkPath.getTotalLength() : 400;
    linkPath.style.strokeDasharray = len;
    linkPath.style.strokeDashoffset = len;
    void linkPath.getBoundingClientRect();   // force the reset to take
    linkPath.style.strokeDashoffset = 0;
    linkSvg.classList.add('on');
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
    drawLink(i);
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
        if (en.isIntersecting && !held) { start(); } else { stop(); }
      });
    }, { threshold: 0.25 }).observe(band);
  } else {
    start();
  }

  window.addEventListener('resize', function () { if (cur >= 0) drawLink(cur); }, { passive: true });
  window.addEventListener('scroll', function () { if (cur >= 0) drawLink(cur); }, { passive: true });

  setLive(0);
})();
