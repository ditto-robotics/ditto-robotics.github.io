/* User study results (paper §IV, Table II; n = 8) — see static/css/userstudy.css.
 * CONDITIONS and METRICS are the only place the numbers live. The page
 * places each piece where it wants it:
 *
 *   <div data-us="key"></div>                          conditions key
 *   <div data-us="chart" data-metric="force"></div>    one metric's bar chart
 *
 * Charts are a mean bar + ±1 std whisker per condition, coloured as in the
 * manuscript. Every bar is labelled, so identity never rests on colour.
 */
(function () {
  var N = 8;   // participants; every value below is an average across them
  var CONDITIONS = [
    { key: 'ditto', name: 'DITTO', desc: 'Exoskeleton teleoperation with force feedback', ours: true },
    { key: 'nf', name: 'DITTO-NF', desc: 'Same exoskeleton, force feedback off' },
    { key: 'fingertip', name: 'Fingertip', desc: 'Fingertip trackers retargeted by IK, no exoskeleton' }
  ];

  var METRICS = {
    // Each participant's total over three 60 s trials (paper Table II), so not a per-trial rate
    flips: { metric: 'Total flips over 3 × 60 s trials', unit: '', better: 'higher', max: 50, trials: 3,
      values: { ditto: [36.6, 11.0], nf: [27.2, 18.0], fingertip: [16.8, 7.3] } },
    time: { metric: 'Time for 3 revolutions', unit: ' s', better: 'lower', max: 50,
      values: { ditto: [24.1, 6.6], nf: [22.4, 9.1], fingertip: [34.2, 8.1] } },
    force: { metric: 'Mean contact force', unit: ' N', better: 'lower', max: 20,
      values: { ditto: [6.9, 2.0], nf: [13.0, 3.0], fingertip: [14.8, 2.5] } },
    pct: { metric: 'Force samples ≤ 14.8 N', unit: '%', better: 'higher', max: 100,
      values: { ditto: [92.8, 8.7], nf: [64.8, 11.5], fingertip: [56.7, 10.7] } }
  };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  var tip = null;
  function showTip(lines, x, y) {
    if (!tip) {
      tip = el('div', 'us-tip');
      tip.setAttribute('role', 'tooltip');
      document.body.appendChild(tip);
    }
    tip.textContent = '';
    tip.appendChild(el('strong', null, lines[0]));
    for (var i = 1; i < lines.length; i++) tip.appendChild(el('span', null, lines[i]));
    tip.style.display = 'block';
    var w = tip.offsetWidth, h = tip.offsetHeight;
    tip.style.left = Math.min(window.innerWidth - w - 8, Math.max(8, x + 14)) + 'px';
    tip.style.top = (y - h - 12 < 8 ? y + 16 : y - h - 12) + 'px';
  }
  function hideTip() { if (tip) tip.style.display = 'none'; }

  function fmt(v, unit) { return v.toFixed(1) + unit; }

  function renderKey(box) {
    var conds = el('dl', 'us-conds');
    CONDITIONS.forEach(function (c) {
      var item = el('div', 'us-cond-item us-' + c.key);
      var dt = el('dt');
      dt.appendChild(el('i', 'us-key'));
      dt.appendChild(document.createTextNode(c.name));
      item.appendChild(dt);
      var dd = el('dd');
      if (c.ours) dd.appendChild(el('span', 'us-ours', '(Ours) '));
      dd.appendChild(document.createTextNode(c.desc));
      item.appendChild(dd);
      conds.appendChild(item);
    });
    box.appendChild(conds);
  }

  function renderChart(box) {
    var m = METRICS[box.getAttribute('data-metric')];
    if (!m) return;
    var fig = el('figure', 'us-panel');
    var head = el('figcaption', 'us-head');
    head.appendChild(el('span', 'us-metric', m.metric));
    head.appendChild(el('span', 'us-better', (m.better === 'higher' ? '↑ higher' : '↓ lower') + ' is better'));
    head.appendChild(el('span', 'us-sub', 'Mean ± std across ' + N + ' participants'));
    fig.appendChild(head);

    var list = el('div', 'us-rows');
    list.setAttribute('role', 'list');
    CONDITIONS.forEach(function (c) {
      var mn = m.values[c.key][0], sd = m.values[c.key][1];
      var text = fmt(mn, m.unit) + ' ± ' + fmt(sd, m.unit);

      var row = el('div', 'us-row us-' + c.key);
      row.tabIndex = 0;
      row.setAttribute('role', 'listitem');
      row.setAttribute('aria-label', c.name + ': ' + text);
      row.appendChild(el('span', 'us-cond', c.name));

      var plot = el('span', 'us-plot');
      plot.setAttribute('aria-hidden', 'true');
      var bar = el('span', 'us-bar');
      bar.style.width = (100 * mn / m.max) + '%';
      plot.appendChild(bar);
      var lo = Math.max(0, mn - sd), hi = Math.min(m.max, mn + sd);
      var wh = el('span', 'us-whisker');
      wh.style.left = (100 * lo / m.max) + '%';
      wh.style.width = (100 * (hi - lo) / m.max) + '%';
      plot.appendChild(wh);
      row.appendChild(plot);

      var val = el('span', 'us-val');
      val.appendChild(el('strong', null, fmt(mn, m.unit)));
      val.appendChild(document.createTextNode(' ± ' + fmt(sd, m.unit)));
      row.appendChild(val);

      var lines = [text + ' (mean ± std across ' + N + ' participants)'];
      if (m.trials) lines.push('≈ ' + (mn / m.trials).toFixed(1) + ' flips per 60 s trial, on average');
      lines.push(c.name + ' · ' + c.desc);
      row.addEventListener('pointermove', function (e) { showTip(lines, e.clientX, e.clientY); });
      row.addEventListener('pointerleave', hideTip);
      row.addEventListener('focus', function () {
        var r = row.getBoundingClientRect();
        showTip(lines, r.left + r.width / 2, r.top);
      });
      row.addEventListener('blur', hideTip);
      list.appendChild(row);
    });
    fig.appendChild(list);
    box.appendChild(fig);
  }

  function init() {
    document.querySelectorAll('[data-us="key"]').forEach(renderKey);
    document.querySelectorAll('[data-us="chart"]').forEach(renderChart);
    window.addEventListener('scroll', hideTip, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
