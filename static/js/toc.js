/* Table of contents, built from every section[id] and its h2.
 *
 * Two presentations share one set of entries and one active-section tracker:
 *   #dynamic-toc  side panel (wide screens, see index.css)
 *   .toc-bar      a horizontal bar inserted just above the Overview section; it
 *                 sticks to the top while scrolling and is shown only when the
 *                 side panel is hidden (narrower screens)
 */
(function () {
  var LABELS = { top: 'DITTO', video: 'Overview' };
  var BAR_SKIP = ['video', 'abstract'];   // the top bar sits right above these, so it leaves them out

  function buildToc() {
    var nav = document.getElementById('dynamic-toc');
    var sections = document.querySelectorAll('section[id]');
    if (!nav || !sections.length) return;

    var entries = Array.prototype.map.call(sections, function (sec) {
      var label = LABELS[sec.id];
      if (!label) {
        var heading = sec.querySelector('h2, h1');
        label = heading ? heading.textContent.trim() : sec.id;
      }
      return { id: sec.id, label: label };
    });

    function list(skip) {
      var ul = document.createElement('ul');
      entries.forEach(function (e) {
        if (skip && skip.indexOf(e.id) !== -1) return;
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = '#' + e.id;
        a.textContent = e.label;
        a.dataset.id = e.id;
        li.appendChild(a);
        ul.appendChild(li);
      });
      return ul;
    }

    // side panel
    var title = document.createElement('span');
    title.className = 'toc-title';
    title.textContent = 'Contents';
    nav.appendChild(title);
    nav.appendChild(list());

    // horizontal bar, right above the first section (Overview)
    var bar = document.createElement('nav');
    bar.className = 'toc-bar';
    bar.setAttribute('aria-label', 'Sections');
    bar.appendChild(list(BAR_SKIP));
    sections[0].parentNode.insertBefore(bar, sections[0]);

    var links = document.querySelectorAll('#dynamic-toc a, .toc-bar a');
    var barScroller = bar.querySelector('ul');
    var current = null;

    function onScroll() {
      var y = window.scrollY + window.innerHeight * 0.25;
      var active = sections[0].id;
      sections.forEach(function (sec) {
        if (sec.offsetTop <= y) active = sec.id;
      });
      if (active === current) return;
      current = active;
      links.forEach(function (a) {
        a.classList.toggle('active', a.dataset.id === active);
      });
      // keep the active item visible in the (horizontally scrollable) bar
      var item = bar.querySelector('a[data-id="' + active + '"]');
      if (item && bar.offsetParent !== null) {
        var left = item.offsetLeft - (barScroller.clientWidth - item.offsetWidth) / 2;
        barScroller.scrollTo({ left: left, behavior: 'smooth' });
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { current = null; onScroll(); });
    onScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildToc);
  } else {
    buildToc();
  }
})();
