/* Policy success rates (paper Table IV) as a table — see static/css/results.css.
 * TASKS is the only place the numbers live.
 *
 *   <div data-results="table"></div>
 *
 * Columns: Task | Demos | Stage | Success rate (bar + percentage).
 */
(function () {
  var TRIALS = 20;
  var TASKS = [
    { name: 'Key Rotation', demos: 60,
      stages: [['Rotate key until lock engages', 20]] },
    { name: 'Mahjong Flipping', demos: 56,
      // Table IV lists "Rotate twice" and "Pick and place" separately; both are 20/20
      stages: [['Rotate twice, then pick and place', 20]] },
    { name: 'USB Insertion', demos: 55,
      stages: [['Pick up USB', 20], ['Extend USB', 19], ['Insert into slot', 14]] },
    { name: "Rubik's Cube", demos: 59, bimanual: true,
      stages: [['Rotate right face', 18], ['Rotate top face', 17]] }
  ];

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function renderTable(box) {
    var table = el('table', 'res-table');
    var hr = el('tr');
    ['Task', 'Demos', 'Stage', 'Success rate'].forEach(function (h) {
      var th = el('th', h === 'Demos' ? 'res-num' : null, h);
      th.scope = 'col';
      hr.appendChild(th);
    });
    var thead = el('thead');
    thead.appendChild(hr);
    table.appendChild(thead);

    var tbody = el('tbody');
    TASKS.forEach(function (t) {
      t.stages.forEach(function (s, j) {
        var tr = el('tr', j === 0 ? 'res-first' : null);
        tr.dataset.task = t.name;
        if (j === 0) {
          var th = el('th');
          th.scope = 'rowgroup';
          th.rowSpan = t.stages.length;
          th.appendChild(el('span', 'res-task', t.name));
          if (t.bimanual) th.appendChild(el('span', 'res-meta', 'Bimanual Task'));
          tr.appendChild(th);
          var d = el('td', 'res-num res-demos', String(t.demos));
          d.rowSpan = t.stages.length;
          tr.appendChild(d);
        }
        tr.appendChild(el('td', 'res-stage', s[0]));

        var td = el('td');
        var bar = el('div', 'res-success'); // grid lives inside the cell, not on it
        var track = el('span', 'res-track');
        var fill = el('span', 'res-fill');
        fill.style.width = (100 * s[1] / TRIALS) + '%';
        track.appendChild(fill);
        track.setAttribute('aria-hidden', 'true');
        bar.appendChild(track);
        var c = el('span', 'res-count');
        c.appendChild(el('strong', null, Math.round(100 * s[1] / TRIALS) + '%'));
        bar.appendChild(c);
        td.appendChild(bar);
        tr.appendChild(td);
        tbody.appendChild(tr);
      });
    });
    table.appendChild(tbody);
    box.appendChild(table);

    // Grey out every task except the one whose video is selected in this section's gallery
    var section = box.closest('section');
    var gallery = section && section.querySelector('.gallery');
    if (gallery) {
      table.classList.add('res-follow');
      var apply = function (title) {
        table.querySelectorAll('tbody tr').forEach(function (tr) {
          tr.classList.toggle('is-current', tr.dataset.task === title);
        });
      };
      gallery.addEventListener('gallery:change', function (e) { apply(e.detail.title); });
      var active = gallery.querySelector('.gallery-slide.is-active');
      if (active) apply(active.dataset.title);
    }
  }

  function init() {
    document.querySelectorAll('[data-results="table"]').forEach(renderTable);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
