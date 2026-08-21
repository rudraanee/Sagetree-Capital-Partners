/* Sagetree: mandate ring section behaviour.
   Progressive enhancement: without this file the four principles are still a
   complete, readable, stacked list. Linked by index.html and who-we-are.html. */
(function () {
  var band   = document.querySelector('.rings-band');
  var scroll = document.getElementById('ringsScroll');
  var list   = document.getElementById('ringsList');
  var descs  = document.getElementById('ringsDesc');
  var rail   = document.getElementById('ringsRail');
  if (!band || !scroll || !list || !descs || !rail) return;

  // Respect a reduced-motion preference by leaving the plain stacked
  // version in place rather than pinning and rotating the section.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var labels = Array.prototype.slice.call(list.querySelectorAll('.rim-label'));
  var N = labels.length;
  if (!N) return;

  // Ring paths and needles are traced from the photograph and baked into the
  // markup, so nothing is generated here. This only moves state.
  var darks   = Array.prototype.slice.call(band.querySelectorAll('.r-ring-dark'));
  var rings   = Array.prototype.slice.call(band.querySelectorAll('.r-ring'));
  var needles = Array.prototype.slice.call(band.querySelectorAll('.r-needle'));
  var texts   = Array.prototype.slice.call(descs.querySelectorAll('.rims-desc'));

  var bars = labels.map(function (label, i) {
    var b = document.createElement('i');
    if (i === 0) b.className = 'on';
    rail.appendChild(b);
    label.addEventListener('click', function () { setLive(i); });
    // Pointer is the primary control. Hovering a principle lights its ring.
    label.addEventListener('mouseenter', function () { pointerHeld = true; setLive(i); });
    label.addEventListener('focus', function () { pointerHeld = true; setLive(i); });
    return b;
  });

  band.classList.add('js-on');

  // While the pointer is over the card the reader is driving, so scroll must not
  // fight them for control. Scroll takes over again once the pointer leaves.
  var pointerHeld = false;
  band.addEventListener('mouseleave', function () { pointerHeld = false; });

  // Halo offset per principle, matching the compass position of its label.
  var glow = band.querySelector('.rings-glow');
  var GLOW_POS = [['0%', '-13%', '0.94'], ['13%', '0%', '1'],
                  ['0%', '13%', '1.06'], ['-13%', '0%', '1']];

  var cur = -1;
  function setLive(i) {
    if (i === cur) return;
    cur = i;
    [darks, rings, needles, labels].forEach(function (group) {
      group.forEach(function (e, k) {
        e.classList.toggle('live', k === i);
        e.classList.toggle('seen', k < i);
      });
    });
    texts.forEach(function (t, k) { t.classList.toggle('on', k === i); });

    // Drift the halo toward the live principle and flare it once.
    if (glow) {
      var g = GLOW_POS[i] || GLOW_POS[0];
      glow.style.transform = 'translate(' + g[0] + ',' + g[1] + ') scale(' + g[2] + ')';
      glow.classList.remove('glint');
      void glow.offsetWidth;          // restart the flare
      glow.classList.add('glint');
    }
    labels.forEach(function (l, k) { l.setAttribute('aria-current', String(k === i)); });
    bars.forEach(function (b, k) { b.classList.toggle('on', k <= i); });
  }

  // The wood turns clockwise as the section scrolls. Kept modest so the
  // fixed needles stay close to the ring they point at.
  var rotor = band.querySelector('.trunk-rotor');
  var SWEEP = 16; // degrees across the whole section

  var ticking = false;
  function update() {
    ticking = false;
    // Scroll-triggered, not scroll-jacked. The section is a normal height block,
    // so progress is measured by how far it has crossed the viewport rather than
    // by a tall scroll container holding the reader in place.
    var r = band.getBoundingClientRect();
    var vh = window.innerHeight || 1;
    var span = r.height || 1;
    var p = Math.min(1, Math.max(0, (vh * 0.78 - r.top) / span));
    if (!pointerHeld) setLive(Math.min(N - 1, Math.floor(p * N * 0.999)));
    if (rotor) rotor.style.transform = 'rotate(' + (p * SWEEP).toFixed(2) + 'deg)';
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', update, { passive: true });

  setLive(0);
  update();
})();
