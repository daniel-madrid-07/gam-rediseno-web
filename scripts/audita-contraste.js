/* Auditor de contraste. Se inyecta en la pagina con Playwright: recorre cada
   nodo de texto visible, resuelve el fondo real subiendo por los ancestros y
   devuelve los que no llegan a AA (4,5:1 normal, 3:1 texto grande). */
window.__auditaContraste = function () {
  const lum = (c) => {
    const m = c.match(/[\d.]+/g);
    if (!m) return null;
    const v = m.slice(0, 3).map(Number).map((x) => {
      x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  };
  /* color-mix() se serializa como color(srgb 0..1 / a): hay que escalarlo */
  const esSrgb = (c) => /^color\(\s*srgb/i.test(c);
  const nums = (c) => { const m = c.match(/[\d.]+(?:e-?\d+)?/g); return m ? m.map(Number) : []; };
  const alpha = (c) => {
    if (c === "transparent") return 0;
    const n = nums(c);
    if (esSrgb(c)) return n.length > 3 ? n[3] : 1;
    return n.length > 3 ? n[3] : 1;
  };
  const mezcla = (frente, fondo, a) => frente.map((x, i) => x * a + fondo[i] * (1 - a));
  const rgb = (c) => {
    if (c === "transparent") return [255, 255, 255];
    const n = nums(c);
    if (!n.length) return [255, 255, 255];
    return esSrgb(c) ? n.slice(0, 3).map((x) => x * 255) : n.slice(0, 3);
  };

  function fondoReal(el) {
    const capas = [];
    let n = el;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      const bg = cs.backgroundColor;
      if (cs.backgroundImage && cs.backgroundImage !== "none") return { sobreImagen: true };
      const a = alpha(bg);
      if (a > 0) { capas.push([rgb(bg), a]); if (a >= 0.999) break; }
      n = n.parentElement;
    }
    let base = [255, 255, 255];
    const raiz = getComputedStyle(document.documentElement).backgroundColor;
    if (alpha(raiz) > 0) base = rgb(raiz);
    for (let i = capas.length - 1; i >= 0; i--) base = mezcla(capas[i][0], base, capas[i][1]);
    return { color: base };
  }

  const ratio = (a, b) => {
    const l1 = 0.2126 * lin(a[0]) + 0.7152 * lin(a[1]) + 0.0722 * lin(a[2]);
    const l2 = 0.2126 * lin(b[0]) + 0.7152 * lin(b[1]) + 0.0722 * lin(b[2]);
    const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
    return +((hi + 0.05) / (lo + 0.05)).toFixed(2);
  };
  function lin(x) { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }

  const fallos = [];
  const vistos = new Set();
  const it = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let nodo;
  while ((nodo = it.nextNode())) {
    const t = nodo.textContent.trim();
    if (!t || t.length < 2) continue;
    const el = nodo.parentElement;
    if (!el || el.closest(".sprite, script, style, .vh, .skiplinks")) continue;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) < 0.15) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;

    const fondo = fondoReal(el);
    if (fondo.sobreImagen) continue;

    const cFrente = rgb(cs.color);
    const aFrente = alpha(cs.color);
    const frente = aFrente < 1 ? mezcla(cFrente, fondo.color, aFrente) : cFrente;
    const rr = ratio(frente, fondo.color);

    // Umbral AA: 3:1 para texto grande (>=24px, o >=18.66px en negrita)
    const px = parseFloat(cs.fontSize);
    const peso = parseInt(cs.fontWeight, 10) || 400;
    const grande = px >= 24 || (px >= 18.66 && peso >= 700);
    const min = grande ? 3 : 4.5;

    if (rr < min) {
      const clave = el.className + "|" + t.slice(0, 24);
      if (vistos.has(clave)) continue;
      vistos.add(clave);
      fallos.push({
        texto: t.slice(0, 40),
        sel: el.tagName.toLowerCase() + (el.className ? "." + String(el.className).split(" ").slice(0, 2).join(".") : ""),
        contraste: rr, minimo: min, px: Math.round(px),
        color: cs.color, fondo: "rgb(" + fondo.color.map(Math.round).join(",") + ")"
      });
    }
  }
  return fallos.sort((a, b) => a.contraste - b.contraste);
};
