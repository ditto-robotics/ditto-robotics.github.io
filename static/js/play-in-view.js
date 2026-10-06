/* Play a video[data-play-in-view] only while it is on screen.
 *
 * For longer explainer clips: with plain `autoplay` they start on page load
 * and are mid-way through by the time a reader scrolls down to them. These
 * start when first seen and pause when scrolled away. If the viewer pauses
 * one themselves, it stays paused.
 */
(function () {
  function init() {
    var videos = document.querySelectorAll('video[data-play-in-view]');
    if (!videos.length) return;

    videos.forEach(function (v) {
      v.muted = true;
      v.playsInline = true;
      v._userPaused = false;
      v.addEventListener('pause', function () {
        if (!v._autoPausing) v._userPaused = true;
        v._autoPausing = false;
      });
      v.addEventListener('play', function () { v._userPaused = false; });
    });

    if (!('IntersectionObserver' in window)) {
      videos.forEach(function (v) { v.autoplay = true; v.play(); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          if (v._userPaused) return;
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        } else if (!v.paused) {
          v._autoPausing = true;
          v.pause();
        }
      });
    }, { threshold: 0.5 });

    videos.forEach(function (v) { io.observe(v); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
