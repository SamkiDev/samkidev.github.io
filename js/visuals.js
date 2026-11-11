/*
 * Hero background: a quiet set of drifting waves (a nod to Fourier series).
 * Pure SVG, no libraries. Static when the visitor prefers reduced motion,
 * and paused while the hero is off screen or the tab is hidden.
 */
(function () {
  "use strict";

  var host = document.getElementById("hero-visual");
  if (!host) return;

  var NS = "http://www.w3.org/2000/svg";
  var W = 1200, H = 700, POINTS = 90;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  var svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  svg.setAttribute("preserveAspectRatio", "xMaxYMid slice");
  svg.setAttribute("focusable", "false");

  // Faint coordinate grid
  var grid = document.createElementNS(NS, "g");
  grid.setAttribute("stroke", "currentColor");
  grid.setAttribute("stroke-opacity", "0.06");
  grid.setAttribute("stroke-width", "1");
  for (var gx = 600; gx <= W; gx += 60) grid.appendChild(line(gx, 0, gx, H));
  for (var gy = 50; gy <= H; gy += 60) grid.appendChild(line(560, gy, W, gy));
  svg.appendChild(grid);

  // Waves: each is a sum of a few sines with its own amplitude, frequency and speed
  var waves = [
    { y: 300, terms: [[52, 1.0, 0.00], [18, 2.7, 1.30], [7, 5.1, 0.40]], speed: 0.00022, opacity: 0.55, width: 1.6 },
    { y: 330, terms: [[40, 1.3, 2.10], [22, 2.1, 0.20], [9, 4.3, 2.60]], speed: -0.00018, opacity: 0.35, width: 1.2 },
    { y: 360, terms: [[60, 0.8, 4.00], [14, 3.2, 1.00], [6, 6.0, 0.90]], speed: 0.00015, opacity: 0.25, width: 1.0 },
    { y: 390, terms: [[34, 1.6, 1.20], [20, 2.4, 3.10], [8, 4.8, 0.10]], speed: -0.00025, opacity: 0.18, width: 1.0 },
    { y: 420, terms: [[46, 1.1, 5.20], [12, 3.6, 2.20], [5, 7.0, 1.70]], speed: 0.0002, opacity: 0.12, width: 1.0 }
  ];

  var g = document.createElementNS(NS, "g");
  g.setAttribute("fill", "none");
  g.setAttribute("stroke-linecap", "round");
  waves.forEach(function (w) {
    var p = document.createElementNS(NS, "path");
    p.setAttribute("stroke", "var(--accent)");
    p.setAttribute("stroke-opacity", String(w.opacity));
    p.setAttribute("stroke-width", String(w.width));
    p.setAttribute("vector-effect", "non-scaling-stroke");
    w.el = p;
    g.appendChild(p);
  });
  svg.appendChild(g);

  // A single marker that rides the first wave
  var dot = document.createElementNS(NS, "circle");
  dot.setAttribute("r", "4");
  dot.setAttribute("fill", "var(--accent)");
  svg.appendChild(dot);

  host.appendChild(svg);

  function line(x1, y1, x2, y2) {
    var l = document.createElementNS(NS, "line");
    l.setAttribute("x1", x1); l.setAttribute("y1", y1);
    l.setAttribute("x2", x2); l.setAttribute("y2", y2);
    return l;
  }

  function waveY(w, x, t) {
    var u = (x / W) * Math.PI * 2, y = w.y;
    for (var i = 0; i < w.terms.length; i++) {
      var a = w.terms[i];
      y += a[0] * Math.sin(u * a[1] + a[2] + t * w.speed * (i + 1));
    }
    return y;
  }

  function draw(t) {
    for (var k = 0; k < waves.length; k++) {
      var w = waves[k], d = "";
      for (var i = 0; i <= POINTS; i++) {
        var x = (i / POINTS) * W;
        d += (i ? "L" : "M") + x.toFixed(1) + " " + waveY(w, x, t).toFixed(1);
      }
      w.el.setAttribute("d", d);
    }
    var dx = W * 0.78;
    dot.setAttribute("cx", dx.toFixed(1));
    dot.setAttribute("cy", waveY(waves[0], dx, t).toFixed(1));
  }

  var visible = true, raf = 0, start = performance.now();

  function frame(now) {
    raf = 0;
    draw(now - start);
    schedule();
  }
  function schedule() {
    if (!raf && visible && !document.hidden && !reduceMotion.matches) raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  draw(0);

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      visible ? schedule() : stop();
    }).observe(host);
  }
  document.addEventListener("visibilitychange", function () { document.hidden ? stop() : schedule(); });
  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener("change", function () { reduceMotion.matches ? stop() : schedule(); });
  }
  schedule();
})();
