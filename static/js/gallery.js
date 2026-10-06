/* Video slide gallery — see static/css/gallery.css.
 *
 * Markup: a .gallery holding .gallery-tabs (filled from each slide's
 * data-title), a .gallery-track of figure.gallery-slide, and a
 * .gallery-footer with .gallery-prev / .gallery-counter / .gallery-next.
 *
 * Only the active slide plays, and only while the gallery is on screen;
 * a slide restarts from the beginning when it becomes active.
 */
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function initGallery(root) {
    var track = root.querySelector('.gallery-track');
    var tabsEl = root.querySelector('.gallery-tabs');
    var prevBtn = root.querySelector('.gallery-prev');
    var nextBtn = root.querySelector('.gallery-next');
    var counter = root.querySelector('.gallery-counter');
    var slides = Array.prototype.slice.call(track.querySelectorAll('.gallery-slide'));
    if (!slides.length) return;

    var active = -1;
    var inView = false;
    var playTimer = null;

    var tabs = slides.map(function (slide, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'gallery-tab';
      b.textContent = slide.dataset.title || 'Video ' + (i + 1);
      b.addEventListener('click', function () { goTo(i); });
      tabsEl.appendChild(b);
      return b;
    });

    function videoOf(i) { return slides[i] && slides[i].querySelector('video'); }

    // scrollLeft that centres slide i in the track
    function offsetOf(i) {
      var s = slides[i];
      return s.offsetLeft + s.offsetWidth / 2 - track.clientWidth / 2;
    }

    function goTo(i, instant) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({
        left: offsetOf(i),
        behavior: instant || reduceMotion.matches ? 'auto' : 'smooth'
      });
    }

    function nearest() {
      var best = 0, bestD = Infinity;
      for (var i = 0; i < slides.length; i++) {
        var d = Math.abs(offsetOf(i) - track.scrollLeft);
        if (d < bestD) { bestD = d; best = i; }
      }
      return best;
    }

    function setActive(i) {
      if (i === active) return;
      active = i;
      slides.forEach(function (s, j) {
        var on = j === i;
        s.classList.toggle('is-active', on);
        tabs[j].classList.toggle('is-active', on);
        tabs[j].setAttribute('aria-current', on ? 'true' : 'false');
        var v = videoOf(j);
        if (v) {
          v.controls = on;
          if (!on) v.pause();
        }
      });
      if (prevBtn) prevBtn.disabled = i === 0;
      if (nextBtn) nextBtn.disabled = i === slides.length - 1;
      if (counter) counter.textContent = (i + 1) + ' / ' + slides.length;
      // let other widgets (e.g. the results table) follow the selected slide
      root.dispatchEvent(new CustomEvent('gallery:change', {
        bubbles: true, detail: { index: i, title: slides[i].dataset.title }
      }));

      // Wait for the scroll to settle so slides passed on the way
      // (e.g. jumping from the first title to the last) don't start.
      clearTimeout(playTimer);
      playTimer = setTimeout(function () {
        var v = videoOf(active);
        if (v) { try { v.currentTime = 0; } catch (e) {} }
        syncPlayback();
      }, 150);
    }

    function syncPlayback() {
      var v = videoOf(active);
      if (!v) return;
      if (inView) {
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        v.pause();
      }
    }

    var ticking = false;
    track.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        setActive(nearest());
      });
    }, { passive: true });

    // Clicking the peeking slide brings it in.
    slides.forEach(function (s, i) {
      s.addEventListener('click', function (e) {
        if (i !== active) { e.preventDefault(); goTo(i); }
      });
    });

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(active - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(active + 1); });

    track.addEventListener('keydown', function (e) {
      if (e.target !== track) return; // leave arrow keys to a focused video
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(active + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(active - 1); }
    });

    // Keep the active slide aligned when the layout width changes.
    if ('ResizeObserver' in window) {
      new ResizeObserver(function () { goTo(active, true); }).observe(track);
    }

    slides.forEach(function (s, i) {
      var v = videoOf(i);
      if (v) { v.muted = true; v.playsInline = true; }
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        syncPlayback();
      }, { threshold: 0.35 }).observe(track);
    } else {
      inView = true;
    }

    setActive(0);
  }

  function initAll() {
    document.querySelectorAll('.gallery').forEach(initGallery);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
