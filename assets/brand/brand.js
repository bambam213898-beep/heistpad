/* Heistpad brand kit — shared SVG builders for the site and exported artwork.
   Needs the Anton + Inter fonts loaded on the page for the type to render. */
(function (g) {
  let uid = 0;
  const id = (p) => `${p}${++uid}`;

  // palm silhouette: trunk curve + fronds, anchored at (x, y) base
  function palm(x, y, h, flip, fill) {
    const s = flip ? -1 : 1, tx = x + s * h * 0.18, ty = y - h;
    const fr = [[-2.9, 0.62, 0.32], [-2.35, 0.55, 0.18], [-1.75, 0.45, 0.05], [-1.05, 0.55, 0.16], [-0.4, 0.66, 0.34], [0.15, 0.58, 0.46]]
      .map(([a, l, d]) => {
        const ax = Math.cos(a) * s, ex = tx + ax * h * l, ey = ty + Math.sin(a) * h * l * 0.45 + d * h * 0.55;
        const mx = tx + ax * h * l * 0.5, my = ty + Math.sin(a) * h * l * 0.35 - h * 0.06;
        return `M${tx} ${ty}Q${mx} ${my - h * 0.05} ${ex} ${ey}Q${mx} ${my + h * 0.04} ${tx} ${ty + h * 0.02}Z`;
      }).join('');
    return `<path d="M${x} ${y}C${x + s * h * 0.02} ${y - h * 0.4} ${x + s * h * 0.08} ${y - h * 0.75} ${tx} ${ty}" stroke="${fill}" stroke-width="${h * 0.045}" fill="none" stroke-linecap="round"/><path d="${fr}" fill="${fill}"/>`;
  }
  // city skyline silhouette across [x0,x1] with ground at y
  function skyline(x0, x1, y, hMin, hMax, fill, seed = 3, lights) {
    let r = seed; const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
    let x = x0, d = '', win = '';
    while (x < x1) {
      const w = 14 + rnd() * 26, h = hMin + rnd() * (hMax - hMin);
      d += `M${x} ${y}V${y - h}h${w}V${y}Z`;
      if (rnd() > 0.6) d += `M${x + w * 0.4} ${y - h}v${-h * 0.12}h${w * 0.2}v${h * 0.12}Z`;
      if (lights) for (let k = 0; k < 3; k++) if (rnd() > 0.45) win += `<rect x="${x + 3 + rnd() * (w - 8)}" y="${y - h + 6 + rnd() * (h - 14)}" width="2.6" height="3.4" fill="${lights}"/>`;
      x += w + 1.5;
    }
    return `<path d="${d}" fill="${fill}"/>${win}`;
  }
  function star(cx, cy, r, fill, stroke, sw) {
    const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; p.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`); }
    return `<polygon points="${p.join(' ')}" fill="${fill}" stroke="${stroke || 'none'}" stroke-width="${sw || 0}" stroke-linejoin="round"/>`;
  }
  // six-spoke vault wheel
  function wheel(cx, cy, r, ink, gold) {
    let spokes = '';
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3, x2 = cx + Math.cos(a) * r * 1.05, y2 = cy + Math.sin(a) * r * 1.05;
      spokes += `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="${ink}" stroke-width="${r * 0.2}" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="${r * 0.15}" fill="${gold}" stroke="${ink}" stroke-width="${r * 0.08}"/>`;
    }
    return `<circle cx="${cx}" cy="${cy}" r="${r * 0.78}" fill="none" stroke="${ink}" stroke-width="${r * 0.16}"/>${spokes}<circle cx="${cx}" cy="${cy}" r="${r * 0.3}" fill="${gold}" stroke="${ink}" stroke-width="${r * 0.1}"/><circle cx="${cx}" cy="${cy}" r="${r * 0.09}" fill="${ink}"/>`;
  }

  /* The badge: gold ring with lettering, sunset + skyline inside, vault wheel, wanted stars, ribbon. */
  function emblem(o = {}) {
    const ring = o.ring || 'EVERY LAUNCH IS A HEIST', k = id('e');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" ${o.attrs || ''}>
<defs>
  <linearGradient id="${k}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c0838"/><stop offset=".35" stop-color="#6b1466"/><stop offset=".62" stop-color="#ff3d8b"/><stop offset=".82" stop-color="#ff8a3d"/><stop offset="1" stop-color="#ffd23f"/></linearGradient>
  <linearGradient id="${k}sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3a3"/><stop offset="1" stop-color="#ff6a3d"/></linearGradient>
  <linearGradient id="${k}gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1b0"/><stop offset=".45" stop-color="#ffc83d"/><stop offset=".7" stop-color="#d99a1c"/><stop offset="1" stop-color="#ffe27a"/></linearGradient>
  <clipPath id="${k}clip"><circle cx="256" cy="256" r="186"/></clipPath>
  <mask id="${k}stripes"><rect width="512" height="512" fill="#fff"/><g fill="#000"><rect y="262" width="512" height="5"/><rect y="280" width="512" height="7"/><rect y="301" width="512" height="9"/><rect y="325" width="512" height="11"/></g></mask>
  <path id="${k}top" d="M49 256A207 207 0 0 1 463 256"/>
  <path id="${k}bot" d="M23 256A233 233 0 0 0 489 256"/>
</defs>
<circle cx="256" cy="256" r="252" fill="#0c0913"/>
<circle cx="256" cy="256" r="244" fill="url(#${k}gold)"/>
<circle cx="256" cy="256" r="244" fill="none" stroke="#0c0913" stroke-width="5"/>
<text font-family="Anton, Impact, sans-serif" font-size="34" letter-spacing="4" fill="#120d1c" text-anchor="middle"><textPath href="#${k}top" startOffset="50%">${ring}</textPath></text>
<text font-family="Anton, Impact, sans-serif" font-size="30" letter-spacing="5" fill="#120d1c" text-anchor="middle"><textPath href="#${k}bot" startOffset="50%">THE $TTWO VAULT</textPath></text>
${star(46, 256, 13, '#120d1c')}${star(466, 256, 13, '#120d1c')}
<circle cx="256" cy="256" r="194" fill="#0c0913"/>
<g clip-path="url(#${k}clip)">
  <rect x="60" y="60" width="392" height="392" fill="url(#${k}sky)"/>
  <g opacity=".16">${Array.from({ length: 18 }, (_, i) => `<path d="M256 330L${256 + Math.cos(Math.PI + i * Math.PI / 17) * 400} ${330 + Math.sin(Math.PI + i * Math.PI / 17) * 400}L${256 + Math.cos(Math.PI + (i + .45) * Math.PI / 17) * 400} ${330 + Math.sin(Math.PI + (i + .45) * Math.PI / 17) * 400}Z" fill="#fff"/>`).join('')}</g>
  <circle cx="256" cy="244" r="116" fill="url(#${k}sun)" mask="url(#${k}stripes)"/>
  ${skyline(60, 452, 372, 30, 110, '#2a0f3d', 7, '#ffcf6a')}
  ${skyline(60, 452, 392, 14, 60, '#160a24', 19)}
  <rect x="60" y="388" width="392" height="80" fill="#0d0816"/>
  <path d="M60 404h392" stroke="#ff3d8b" stroke-width="2" opacity=".7"/>
  ${palm(118, 420, 190, false, '#0c0613')}${palm(396, 420, 170, true, '#0c0613')}
</g>
<circle cx="256" cy="256" r="186" fill="none" stroke="#0c0913" stroke-width="6"/>
<g clip-path="url(#${k}clip)">
  <circle cx="256" cy="244" r="104" fill="none" stroke="#0c0913" stroke-width="7" opacity=".85"/>
  ${Array.from({ length: 16 }, (_, i) => { const a = i * Math.PI / 8; return `<circle cx="${(256 + Math.cos(a) * 104).toFixed(1)}" cy="${(244 + Math.sin(a) * 104).toFixed(1)}" r="6" fill="#ffe27a" stroke="#0c0913" stroke-width="3"/>`; }).join('')}
</g>
<circle cx="256" cy="248" r="66" fill="#0c0913" opacity=".3"/>
${wheel(256, 244, 60, '#0c0913', 'url(#' + k + 'gold)')}
${[0, 1, 2, 3, 4].map((i) => star(184 + i * 36, 106 + Math.abs(i - 2) * 6, 12, '#fff', '#0c0913', 4)).join('')}
<g transform="translate(256 362) skewX(-8)">
  <path d="M-236 -40h472l-22 40 22 40h-472l22-40z" fill="#0c0913" transform="translate(6 7)"/>
  <path d="M-236 -40h472l-22 40 22 40h-472l22-40z" fill="#ff3d8b" stroke="#0c0913" stroke-width="6" stroke-linejoin="round"/>
  <path d="M-206 -30h412" stroke="#ff8fbd" stroke-width="3" opacity=".8"/>
  <text x="0" y="22" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="66" letter-spacing="3" fill="#fff" stroke="#0c0913" stroke-width="9" paint-order="stroke fill" stroke-linejoin="round">HEIST<tspan fill="#ffc83d">PAD</tspan></text>
</g>
</svg>`;
  }

  /* Small mark for favicons / nav: gold rounded tile + vault wheel + one star */
  function mark(o = {}) {
    const k = id('m');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" ${o.attrs || ''}>
<defs><linearGradient id="${k}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe680"/><stop offset=".5" stop-color="#ffc83d"/><stop offset="1" stop-color="#e09a1a"/></linearGradient>
<linearGradient id="${k}p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5c9d"/><stop offset="1" stop-color="#ff8a3d"/></linearGradient></defs>
<rect x="2" y="2" width="60" height="60" rx="15" fill="#0c0913"/>
<rect x="5" y="5" width="54" height="54" rx="12" fill="url(#${k}g)"/>
<path d="M5 44h54v3a12 12 0 0 1-12 12H17A12 12 0 0 1 5 47z" fill="url(#${k}p)"/>
${wheel(32, 30, 17, '#0c0913', '#ffe680')}
</svg>`;
  }

  /* Horizontal lockup: emblem + slanted outlined wordmark + tagline */
  function wordmark(o = {}) {
    const k = id('w'), tag = o.tag === false ? '' : (o.tag || 'EVERY LAUNCH IS A HEIST');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1240 300" ${o.attrs || ''}>
<g transform="translate(0 4) scale(.565)">${emblem().replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>
<g transform="translate(318 0) skewX(-9)">
  <text x="14" y="${tag ? 196 : 226}" font-family="Anton, Impact, sans-serif" font-size="${tag ? 190 : 214}" letter-spacing="4" fill="#ff3d8b" stroke="#ff3d8b" stroke-width="20" stroke-linejoin="round" transform="translate(9 10)">HEISTPAD</text>
  <text x="14" y="${tag ? 196 : 226}" font-family="Anton, Impact, sans-serif" font-size="${tag ? 190 : 214}" letter-spacing="4" fill="#fff" stroke="#0c0913" stroke-width="20" stroke-linejoin="round" paint-order="stroke fill">HEIST<tspan fill="#ffc83d">PAD</tspan></text>
  ${tag ? `<rect x="22" y="222" width="${tag.length * 27.6 + 34}" height="50" rx="8" fill="#0c0913"/><text x="${37}" y="258" font-family="Inter, Arial, sans-serif" font-weight="800" font-size="28" letter-spacing="7" fill="#ffc83d">${tag}</text>` : ''}
</g>
</svg>`;
  }

  g.HeistBrand = { emblem, mark, wordmark, palm, skyline, star, wheel };
})(typeof window !== 'undefined' ? window : globalThis);
