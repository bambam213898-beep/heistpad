/* Heistpad — concept launchpad. Demo coin data, live tokenized $TTWO price. */
(() => {
  const TTWO_MINT = 'TTWofwAge91oFhZs7kpQdyrVRkmevgM88xijGvQFbKo';
  const VI_DATE = Date.parse('2026-11-19T00:00:00-05:00');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- regions & businesses ---------- */
  const REGIONS = [
    { id: 'miami', name: 'Miami', blurb: 'Nightclubs, car lots, marinas and the bank towers downtown.', c: [-80.2, 25.79], z: 10.2 },
    { id: 'keys', name: 'The Keys', blurb: 'Bait shops, dive bars and charter boats down the Overseas Highway.', c: [-81.2, 24.72], z: 8.4 },
    { id: 'glades', name: 'Everglades', blurb: 'Airboats, gator farms and the last gas for miles.', c: [-80.85, 25.95], z: 8.8 },
    { id: 'gulf', name: 'Gulf Coast', blurb: 'Tampa docks, cigar rollers, strip malls and the bay bridges.', c: [-82.5, 27.92], z: 9.4 },
    { id: 'space', name: 'Space Coast', blurb: 'Launch pads, surf shops and motels on A1A.', c: [-80.65, 28.35], z: 9 },
    { id: 'pan', name: 'Panhandle', blurb: 'Beach motels, shipyards and seafood shacks on the Gulf.', c: [-86.2, 30.38], z: 8.6 },
  ];
  const RAW = {
    miami: [['Neon Palms Nightclub', 'Nightclub', -80.1340, 25.7826], ['Coral Coast Motors', 'Car dealership', -80.2210, 25.8010], ['Bayfront Slip Marina', 'Yacht marina', -80.1860, 25.7780], ['Bull & Bear Trading Floor', 'Trading floor', -80.1918, 25.7680], ['Lucky Seven Casino', 'Casino', -80.2120, 25.8460], ['Flamingo Deco Hotel', 'Hotel', -80.1300, 25.7900], ['Gold Coast Jewelers', 'Jeweler', -80.1950, 25.7740], ['Ink & Palm Tattoo', 'Tattoo parlor', -80.1990, 25.8020], ['Little Havana Café', 'Café', -80.2190, 25.7660], ['Overtown Studio B', 'Recording studio', -80.2010, 25.7880], ['Biscayne Chop Shop', 'Body shop', -80.2420, 25.8200], ['Hialeah Speedway Diner', 'Diner', -80.2780, 25.8580], ['Port Cargo Terminal', 'Shipping yard', -80.1640, 25.7740], ['Wynwood Sneaker Vault', 'Sneaker store', -80.1990, 25.8010], ['Key Biscayne Yacht Club', 'Yacht club', -80.1620, 25.6930], ['Coconut Grove Pawn', 'Pawn shop', -80.2400, 25.7300]],
    keys: [['Mile Marker 7 Bait', 'Bait shop', -81.66, 24.66], ['Duval Dive Bar', 'Dive bar', -81.80, 24.556], ['Islamorada Charters', 'Charter boats', -80.62, 24.92], ['Marathon Seafood Co.', 'Seafood market', -81.08, 24.72], ['Seven Mile Fuel', 'Gas station', -81.25, 24.70], ['Key Largo Reef Divers', 'Dive shop', -80.44, 25.09]],
    glades: [['Gator Gus Airboats', 'Airboat tour', -80.75, 25.76], ['Last Gas Shell', 'Gas station', -81.00, 26.13], ['Swamp King Gator Farm', 'Gator farm', -80.50, 25.95], ['Shark Valley Outpost', 'Trading post', -80.77, 25.75], ['Everglades City Shack', 'Seafood shack', -81.38, 25.86]],
    gulf: [['Ybor Cigar Rollers', 'Cigar factory', -82.437, 27.960], ['Channelside Docks', 'Port docks', -82.450, 27.943], ['Bay Bridge Motel', 'Motel', -82.62, 27.80], ['Clearwater Pier Arcade', 'Arcade', -82.83, 27.98], ['St. Pete Strip Mall', 'Strip mall', -82.68, 27.77], ['Sarasota Speedboats', 'Boat dealer', -82.55, 27.33]],
    space: [['Pad 39 Diner', 'Diner', -80.62, 28.55], ['Cocoa Beach Surf Shack', 'Surf shop', -80.61, 28.32], ['A1A Rocket Motel', 'Motel', -80.60, 28.40], ['Orbit Bowl & Bar', 'Bowling alley', -80.72, 28.08], ['Titusville Tackle', 'Bait shop', -80.81, 28.61]],
    pan: [['Gulf Breeze Shipyard', 'Shipyard', -87.17, 30.35], ['Destin Oyster Shack', 'Seafood shack', -86.49, 30.39], ['PCB Beach Motel', 'Motel', -85.80, 30.18], ['Pensacola Pawn & Gun', 'Pawn shop', -87.22, 30.42], ['Apalachicola Smokehouse', 'Smokehouse', -84.98, 29.73]],
  };
  const BIZ = [];
  for (const [rid, list] of Object.entries(RAW)) list.forEach(([name, type, lng, lat], i) => BIZ.push({ id: `${rid}-${i}`, rid, name, type, lng, lat, coin: null }));

  /* ---------- demo coins ---------- */
  const PALETTE = ['#ff3d8b', '#ffc83d', '#2de2c8', '#9b7bff', '#ff8a3d', '#3ee08f', '#ff6a5c'];
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  // No premade coins: every business starts open. Real coins arrive from user launches.
  // Real launches: coins are created on pump.fun from the user's wallet; the Heistpad API tracks which business each coin runs.
  const API = window.HEIST_API, W3 = window.solanaWeb3;
  let CFG = { live: false, vault: null, feeLamports: 20_000_000 };
  const hashColor = (s) => PALETTE[[...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) % PALETTE.length];
  const pumpUrl = (mint) => `https://pump.fun/coin/${mint}`;
  const now = Date.now();

  /* ---------- helpers ---------- */
  const fmt$ = (n) => n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(1)}k` : `$${n.toFixed(0)}`;
  const shortCa = (c) => `${c.slice(0, 6)}…${c.slice(-6)}`;
  const ago = (t) => { const m = Math.max(1, Math.round((Date.now() - t) / 60000)); return m < 60 ? `${m}m` : `${Math.round(m / 60)}h`; };
  const stars = (vol) => { const n = Math.min(6, Math.max(1, Math.ceil(vol / 7.5))); return `<span class="stars" title="Wanted level ${n}/6">${[1, 2, 3, 4, 5, 6].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`; };
  const regionName = (rid) => REGIONS.find((r) => r.id === rid).name;
  const coins = () => BIZ.filter((b) => b.coin);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const toast = (msg) => { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 1600); };
  const avatar = (c) => c.img ? `<div class="av" style="background-image:url(${c.img})"></div>` : `<div class="av" style="background:${c.color}">${esc(c.tick[0])}</div>`;

  document.addEventListener('click', (e) => {
    const cp = e.target.closest('[data-copy]'); if (!cp) return;
    const v = cp.dataset.copy;
    if (v === 'CA_PLACEHOLDER') return toast('Heistpad CA drops at launch');
    navigator.clipboard?.writeText(v).then(() => toast('CA copied'), () => toast(v));
  });

  /* ---------- countdown ---------- */
  function tick() {
    let s = Math.max(0, Math.floor((VI_DATE - Date.now()) / 1000));
    const d = Math.floor(s / 86400); s %= 86400; const h = Math.floor(s / 3600); s %= 3600; const m = Math.floor(s / 60); s %= 60;
    const set = (u, v) => { $(`[data-u="${u}"]`).textContent = v; };
    set('d', d); set('h', String(h).padStart(2, '0')); set('m', String(m).padStart(2, '0')); set('s', String(s).padStart(2, '0'));
  }
  tick(); setInterval(tick, 1000);

  /* ---------- stats / lists ---------- */
  let sortBy = 'new';
  function renderAll() {
    const cs = coins();
    const total = cs.reduce((a, b) => a + b.coin.cap, 0);
    $('#bizCount').textContent = BIZ.length;
    $('#stCoins').textContent = cs.length;
    $('#stCap').textContent = fmt$(total);
    $('#stOpen').textContent = BIZ.length - cs.length;

    const sorted = [...cs].sort((a, b) => sortBy === 'new' ? b.coin.born - a.coin.born : sortBy === 'heat' ? b.coin.vol - a.coin.vol : b.coin.cap - a.coin.cap);
    const max = Math.max(1, ...cs.map((b) => b.coin.cap));
    $('#cards').innerHTML = !cs.length ? `<div class="empty"><b>No coins yet.</b><span>All ${BIZ.length} businesses on the map are open. The first crew to launch a coin runs the business.</span><button type="button" class="btn pink" data-launch>Be the first crew →</button></div>` : sorted.slice(0, 12).map((b) => `
      <article class="card" data-biz="${b.id}">
        <div class="c-top">${avatar(b.coin)}<div><h4>${esc(b.coin.name)}${b.coin.mine ? ' <span class="yours">YOURS</span>' : ''}</h4><small>$${esc(b.coin.tick)}</small></div><span class="c-age">${ago(b.coin.born)}</span></div>
        <div class="c-biz"><b>${esc(b.name)}</b> · ${regionName(b.rid)}</div>
        <div class="c-mid"><span class="c-cap">${fmt$(b.coin.cap)}</span>${stars(b.coin.vol)}</div>
        <div class="bar" title="Bonding curve progress"><i style="width:${Math.max(3, (b.coin.progress || 0) * 100)}%"></i></div>
        <div class="prog">${b.coin.complete ? 'Graduated <span class="grad">LIVE ON DEX</span>' : `${((b.coin.progress || 0) * 100).toFixed(1)}% to graduation`}</div>
        <div class="c-bot"><a class="btn pink" href="${pumpUrl(b.coin.ca)}" target="_blank" rel="noopener">Buy on pump.fun</a><button class="cp" data-copy="${b.coin.ca}">${shortCa(b.coin.ca)}</button></div>
      </article>`).join('');

    const emptyLi = '<li class="empty-li"><span>Nobody yet. Could be you.<small>Launch a coin to take the top spot</small></span><b>—</b></li>';
    $('#bizBoard').innerHTML = !cs.length ? emptyLi : [...cs].sort((a, b) => b.coin.cap - a.coin.cap).slice(0, 6).map((b) => `<li><span>${esc(b.name)}<small>${esc(b.type)} · ${regionName(b.rid)}</small></span><b>${fmt$(b.coin.cap)}</b></li>`).join('');
    $('#crewBoard').innerHTML = !cs.length ? emptyLi : [...cs].sort((a, b) => b.coin.vol - a.coin.vol).slice(0, 6).map((b) => `<li><span>$${esc(b.coin.tick)}<small>${stars(b.coin.vol)}</small></span><b>${fmt$(b.coin.vol * 310)} vol</b></li>`).join('');

    $('#regGrid').innerHTML = REGIONS.map((r) => {
      const rc = cs.filter((b) => b.rid === r.id);
      return `<div class="reg" data-region="${r.id}"><h4>${r.name}</h4><p>${r.blurb}</p><div class="meta"><span>${rc.length} coins · ${BIZ.filter((b) => b.rid === r.id).length} spots</span><span>${fmt$(rc.reduce((a, b) => a + b.coin.cap, 0))}</span></div></div>`;
    }).join('');
    if (map && !mkEls.size) renderMarkers(); else sizeMarkers();
  }
  $('#sortTabs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-sort]'); if (!b) return;
    sortBy = b.dataset.sort; $$('#sortTabs button').forEach((x) => x.classList.toggle('on', x === b)); renderAll();
  });
  document.addEventListener('click', (e) => {
    const reg = e.target.closest('[data-region]');
    if (reg) { $('#map').scrollIntoView({ behavior: 'smooth', block: 'center' }); flyRegion(reg.dataset.region); return; }
    const card = e.target.closest('.card[data-biz]');
    if (card && !e.target.closest('button,a')) { $('#map').scrollIntoView({ behavior: 'smooth', block: 'center' }); focusBiz(card.dataset.biz); }
  });

  /* ---------- map ---------- */
  let map = null; const markers = [];
  const NARROW = () => document.getElementById("mapEl").clientWidth < 600;
  const flBounds = () => NARROW() ? [[-83.0, 24.45], [-79.95, 30.7]] : [[-87.7, 24.45], [-79.9, 31.05]];
  const FL_PAD = { top: 70, bottom: NARROW() ? 70 : 30, left: 20, right: 20 };
  try {
    map = new maplibregl.Map({
      container: 'mapEl', style: 'https://tiles.openfreemap.org/styles/dark', bounds: flBounds(), fitBoundsOptions: { padding: FL_PAD },
      attributionControl: { compact: true }, dragRotate: false, pitchWithRotate: false, cooperativeGestures: matchMedia('(pointer: coarse)').matches,
    });
    if (!NARROW()) map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.on('load', () => {
      // warm neon tint on the dark basemap
      for (const l of map.getStyle().layers) {
        if (l.type === 'background') map.setPaintProperty(l.id, 'background-color', '#120d1c');
        if (l.id.includes('water') && l.type === 'fill') map.setPaintProperty(l.id, 'fill-color', '#0a1a2a');
        if (l.id.includes('road') && l.type === 'line') { try { map.setPaintProperty(l.id, 'line-color', '#3a2a4f'); } catch (_) {} }
      }
    });
  } catch (err) { $('#mapEl').innerHTML = '<p style="padding:20px;color:#a89bbd">Map failed to load.</p>'; }

  const VAULT_SPOT = { lng: -80.1903, lat: 25.7700 };
  function renderMarkers() {
    if (!map) return;
    markers.forEach((m) => m.remove()); markers.length = 0;
    const v = document.createElement('div'); v.className = 'mk vault'; v.title = 'The Vault';
    v.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="#120d1c" stroke-width="2.6"/><circle cx="12" cy="12" r="2.4" fill="#120d1c"/></svg><span class="tk">THE VAULT</span>';
    v.onclick = () => { $('#vault').scrollIntoView({ behavior: 'smooth' }); };
    markers.push(new maplibregl.Marker({ element: v }).setLngLat([VAULT_SPOT.lng, VAULT_SPOT.lat]).addTo(map));
    for (const b of BIZ) {
      const el = document.createElement('div');
      el.title = b.name;
      el.addEventListener('click', (e) => { e.stopPropagation(); showCard(b); });
      mkEls.set(b.id, el);
      markers.push(new maplibregl.Marker({ element: el }).setLngLat([b.lng, b.lat]).addTo(map));
    }
    sizeMarkers();
  }
  // update marker look in place (no re-creation, so the map stays smooth while trades tick)
  const mkEls = new Map();
  function sizeMarkers() {
    const max = Math.max(1, ...coins().map((b) => b.coin.cap));
    for (const b of BIZ) {
      const el = mkEls.get(b.id); if (!el) continue;
      if (b.coin) {
        if (!el.classList.contains('own')) { el.className = 'mk own'; el.innerHTML = `<span class="tk">$${esc(b.coin.tick)}</span>`; }
        el.style.width = el.style.height = (14 + Math.round((b.coin.cap / max) * 22)) + 'px';
      } else if (el.className !== 'mk open') { el.className = 'mk open'; el.innerHTML = ''; }
    }
  }
  function showCard(b) {
    const card = $('#mapCard'); card.hidden = false;
    card.innerHTML = `<button class="x" aria-label="Close">×</button><div class="mc-type">${esc(b.type)}</div><h4>${esc(b.name)}</h4><div class="mc-reg">${regionName(b.rid)}</div>` + (b.coin
      ? `<div class="mc-row">${avatar(b.coin)}<div style="flex:1"><div style="font-weight:800">${esc(b.coin.name)}${b.coin.mine ? ' <span class="yours">YOURS</span>' : ''}</div><small style="color:var(--mut);font-family:JetBrains Mono">$${esc(b.coin.tick)}</small></div>${stars(b.coin.vol)}</div>
         <div class="mc-row"><span style="color:var(--mut)">Market cap</span><b>${fmt$(b.coin.cap)}</b></div>
         <div class="c-bot"><a class="btn pink" href="${pumpUrl(b.coin.ca)}" target="_blank" rel="noopener">Buy $${esc(b.coin.tick)}</a><button class="cp" data-copy="${b.coin.ca}">${shortCa(b.coin.ca)}</button></div>`
      : `<p style="color:var(--mut);margin:6px 0 12px;font-size:14px">This job is still open. First crew to launch its coin runs it.</p><button class="btn pink wide" data-launch="${b.id}">Pull this job →</button>`);
    card.querySelector('.x').onclick = () => { card.hidden = true; };
  }
  function focusBiz(id) { const b = BIZ.find((x) => x.id === id); if (!b) return; map?.flyTo({ center: [b.lng, b.lat], zoom: 12.5, speed: 1.4 }); showCard(b); }
  function flyRegion(rid) {
    $$('#regionFilters button').forEach((x) => x.classList.toggle('on', x.dataset.r === rid));
    $('#mapCard').hidden = true;
    if (rid === 'all') { showArea('Florida', `${BIZ.length} businesses · 6 regions`); return map?.fitBounds(flBounds(), { padding: FL_PAD, speed: 1.2 }); }
    const r = REGIONS.find((x) => x.id === rid); map?.flyTo({ center: r.c, zoom: r.z, speed: 1.2 });
    showArea(r.name, `${coins().filter((b) => b.rid === rid).length} coins · ${BIZ.filter((b) => b.rid === rid && !b.coin).length} open jobs`);
  }
  $('#regionFilters').innerHTML = `<button class="on" data-r="all">All Florida</button>` + REGIONS.map((r) => `<button data-r="${r.id}">${r.name}</button>`).join('');
  $('#regionFilters').addEventListener('click', (e) => { const b = e.target.closest('[data-r]'); if (b) flyRegion(b.dataset.r); });

  /* ---------- wallet ---------- */
  let wallet = null, provider = null, busy = false;
  const getProvider = () => window.phantom?.solana || window.solflare || window.backpack?.solana || window.solana || null;
  function syncGo() {
    const g = $('#lfGo'); if (!g) return; g.disabled = busy;
    g.innerHTML = busy ? 'Working… <span>⏳</span>' : !wallet ? 'Connect wallet to launch <span>→</span>' : !CFG.live ? 'Launches open soon <span>⏳</span>' : `Launch it · ${CFG.feeLamports / 1e9} SOL fee <span>→</span>`;
  }
  function syncWallet() {
    $('#walletBtn').classList.toggle('on', !!wallet); $('#walletTxt').textContent = wallet ? shortCa(wallet.toBase58()) : 'Connect wallet';
    BIZ.forEach((b) => { if (b.coin) b.coin.mine = !!wallet && b.coin.creator === wallet.toBase58(); });
    syncGo(); renderAll();
  }
  async function connectWallet() {
    provider = getProvider();
    if (!provider) {
      if (/Android|iPhone|iPad/i.test(navigator.userAgent)) { location.href = `https://phantom.app/ul/browse/${encodeURIComponent(location.href)}?ref=${encodeURIComponent(location.origin)}`; return; }
      $('#noWallet').hidden = false; return;
    }
    try { const r = await provider.connect(); wallet = new W3.PublicKey((r?.publicKey || provider.publicKey).toString()); syncWallet(); toast('Wallet connected'); }
    catch (_) { toast('Wallet connection cancelled'); }
  }
  $('#walletBtn').addEventListener('click', async () => {
    if (!wallet) return connectWallet();
    try { await provider?.disconnect?.(); } catch (_) {}
    wallet = null; syncWallet(); toast('Wallet disconnected');
  });
  setTimeout(async () => { // quietly reconnect a wallet that already trusts this site
    const p = getProvider(); if (!p) return;
    try { const r = await p.connect({ onlyIfTrusted: true }); provider = p; wallet = new W3.PublicKey((r?.publicKey || p.publicKey).toString()); syncWallet(); } catch (_) {}
  }, 500);
  const CREW = (() => { try { const c = new URLSearchParams(location.search).get('crew'); if (c) sessionStorage.setItem('hp.crew', c); return c || sessionStorage.getItem('hp.crew') || ''; } catch (_) { return ''; } })();
  fetch(`${API}/api/config?code=${encodeURIComponent(CREW)}`).then((r) => r.json()).then((c) => { CFG = { ...CFG, ...c }; $('#lfFee').textContent = `${CFG.feeLamports / 1e9} SOL`; syncGo(); loadVault(); }).catch(() => {});

  /* ---------- launch flow ---------- */
  const modal = $('#launchModal');
  let imgData = null, imgFile = null;
  const setErr = (msg) => { const e = $('#lfErr'); e.textContent = msg || ''; e.hidden = !msg; };
  function openLaunch(bizId) {
    const open = BIZ.filter((b) => !b.coin);
    $('#launchForm').reset(); imgData = null; imgFile = null; $('#lfImgTxt').textContent = "Pick your coin's image (required)"; setErr(''); setSteps(null); syncGo();
    if (!open.length) { toast('Every business on the map is taken'); return; }
    $('#lfBiz').innerHTML = REGIONS.map((r) => {
      const list = open.filter((b) => b.rid === r.id);
      return list.length ? `<optgroup label="${r.name}">${list.map((b) => `<option value="${b.id}">${esc(b.name)} — ${esc(b.type)}</option>`).join('')}</optgroup>` : '';
    }).join('');
    if (bizId && open.some((b) => b.id === bizId)) $('#lfBiz').value = bizId;
    else if (bizId) toast('That business was already taken — pick another');
    $('#mapCard').hidden = true;
    modal.hidden = false; setTimeout(() => $('#lfName').focus(), 50);
  }
  /* launches you make are saved in this browser so they survive a refresh */
  const STORE = 'heistpad.launches.v1';
  try { localStorage.removeItem(STORE); } catch (_) {} // clear old demo launches
  // shrink uploads to a small square so they render fast and fit in storage
  function shrink(file) {
    return new Promise((res, rej) => {
      if (!file.type.startsWith('image/')) return rej(new Error('That file is not an image'));
      if (file.size > 8 * 1024 * 1024) return rej(new Error('Image is over 8 MB'));
      const url = URL.createObjectURL(file), im = new Image();
      im.onload = () => {
        const S = 128, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d');
        const s = Math.min(im.width, im.height); g.drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, S, S);
        URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', 0.85));
      };
      im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('Could not read that image')); };
      im.src = url;
    });
  }
  document.addEventListener('click', (e) => {
    const l = e.target.closest('[data-launch]'); if (l) { e.preventDefault(); openLaunch(l.dataset.launch || null); }
  });
  modal.addEventListener('click', (e) => { if (e.target === modal || e.target.closest('[data-close]')) modal.hidden = true; });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { modal.hidden = true; $('#passed').hidden = true; } });
  $('#lfTick').addEventListener('input', (e) => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); });
  $('#lfImg').addEventListener('change', async (e) => {
    const f = e.target.files[0]; imgData = null; imgFile = null; if (!f) return;
    if (f.size > 4 * 1024 * 1024) { e.target.value = ''; return setErr('Image must be under 4 MB'); }
    try { imgData = await shrink(f); imgFile = f; $('#lfImgTxt').innerHTML = `<img src="${imgData}" alt="" class="lf-prev"> ${esc(f.name)}`; setErr(''); }
    catch (err) { e.target.value = ''; $('#lfImgTxt').textContent = "Pick your coin's image (required)"; setErr(err.message); }
  });
  const steps = ['upload', 'build', 'sign', 'confirm'];
  function setSteps(cur) {
    const ol = $('#lfSteps'); ol.hidden = !cur; if (!cur) return;
    const i = steps.indexOf(cur); $$('#lfSteps li').forEach((li, k) => { li.className = k < i ? 'ok' : k === i ? 'now' : ''; });
  }
  async function rpcCall(method, params) {
    const r = await fetch(`${API}/api/rpc`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ method, params }) });
    const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Network error'); return j;
  }
  $('#launchForm').addEventListener('submit', async (e) => {
    e.preventDefault(); if (busy) return;
    if (!wallet) { connectWallet(); return; }
    if (!CFG.live) return setErr('Launches are not switched on yet. Check back soon.');
    const b = BIZ.find((x) => x.id === $('#lfBiz').value);
    const name = $('#lfName').value.trim().replace(/\s+/g, ' '), tick = $('#lfTick').value.trim();
    const devBuy = Math.max(0, Math.min(10, parseFloat($('#lfBuy').value) || 0));
    if (!b) return setErr('Pick a business to launch.');
    if (b.coin) return setErr(`${b.name} already has a coin ($${b.coin.tick}). Pick another business.`);
    if (name.length < 2) return setErr('Coin name needs at least 2 characters.');
    if (tick.length < 2) return setErr('Ticker needs 2–10 letters or numbers.');
    if (coins().some((x) => x.coin.tick.toUpperCase() === tick)) return setErr(`$${tick} is already on the map. Try another ticker.`);
    if (!imgFile) return setErr('Add an image for your coin.');
    const links = [$('#lfX').value.trim(), $('#lfTg').value.trim()];
    if (links.some((u) => u && !/^https:\/\//.test(u))) return setErr('Links must start with https://');
    setErr(''); busy = true; syncGo();
    const fee = CFG.feeLamports / 1e9;
    try {
      // 0. enough SOL? fee + first buy + ~0.025 for rent/network
      const need = fee + devBuy + 0.025, bal = (await rpcCall('getBalance', [wallet.toBase58()])).value / 1e9;
      if (bal < need) throw new Error(`You need about ${need.toFixed(3)} SOL in your wallet (you have ${bal.toFixed(3)}).`);
      // 1. upload art + hold the business
      setSteps('upload');
      const fd = new FormData();
      Object.entries({ code: CREW, bizId: b.id, creator: wallet.toBase58(), name, symbol: tick, description: $('#lfDesc').value.trim(), twitter: links[0], telegram: links[1] }).forEach(([k, v]) => fd.append(k, v));
      fd.append('image', imgFile, imgFile.name);
      const rsv = await (async () => { const r = await fetch(`${API}/api/reserve`, { method: 'POST', body: fd }); const j = await r.json(); if (!r.ok) throw new Error(j.error); return j; })();
      // 2. pump.fun create tx from PumpPortal, then add the Vault fee to the same transaction
      setSteps('build');
      const mintKp = W3.Keypair.generate();
      const pr = await fetch('https://pumpportal.fun/api/trade-local', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ publicKey: wallet.toBase58(), action: 'create', tokenMetadata: { name: rsv.name, symbol: rsv.symbol, uri: rsv.uri }, mint: mintKp.publicKey.toBase58(), denominatedInSol: 'true', amount: devBuy, slippage: 10, priorityFee: 0.0005, pool: 'pump' }) });
      if (pr.status !== 200) throw new Error(`pump.fun didn't accept the launch (${pr.status} ${pr.statusText}). Try again.`);
      const tx0 = W3.VersionedTransaction.deserialize(new Uint8Array(await pr.arrayBuffer()));
      const luts = await Promise.all(tx0.message.addressTableLookups.map(async (l) => {
        const info = await rpcCall('getAddressLookupTable', [l.accountKey.toBase58()]);
        const data = Uint8Array.from(atob(info.value.data[0]), (c) => c.charCodeAt(0));
        return new W3.AddressLookupTableAccount({ key: l.accountKey, state: W3.AddressLookupTableAccount.deserialize(data) });
      }));
      const msg = W3.TransactionMessage.decompile(tx0.message, { addressLookupTableAccounts: luts });
      if (msg.payerKey.toBase58() !== wallet.toBase58()) throw new Error('Unexpected transaction from pump.fun. Nothing was sent.');
      msg.instructions.push(W3.SystemProgram.transfer({ fromPubkey: wallet, toPubkey: new W3.PublicKey(CFG.vault), lamports: CFG.feeLamports }));
      const tx = new W3.VersionedTransaction(msg.compileToV0Message(luts));
      tx.sign([mintKp]);
      // 3. user approves in their own wallet
      setSteps('sign');
      let signature;
      if (provider.signAndSendTransaction) { const r = await provider.signAndSendTransaction(tx); signature = typeof r === 'string' ? r : r.signature; }
      else { const signed = await provider.signTransaction(tx); const raw = btoa(String.fromCharCode(...signed.serialize())); signature = await rpcCall('sendTransaction', [raw, { encoding: 'base64', skipPreflight: false }]); }
      if (typeof signature !== 'string') throw new Error('Your wallet did not return a transaction signature.');
      // 4. wait for the chain, then record the claim
      setSteps('confirm');
      let ok = null;
      for (let i = 0; i < 40 && !ok; i++) {
        await new Promise((r) => setTimeout(r, i ? 3000 : 2000));
        const r = await fetch(`${API}/api/confirm`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ bizId: b.id, signature, mint: mintKp.publicKey.toBase58(), creator: wallet.toBase58(), token: rsv.token }) });
        const j = await r.json(); if (r.status === 202) continue; if (!r.ok) throw new Error(j.error); ok = j;
      }
      if (!ok) throw new Error(`Still confirming. Your transaction: ${signature.slice(0, 8)}… Refresh in a minute.`);
      $$('#lfSteps li').forEach((li) => (li.className = 'ok'));
      await loadCoins();
      modal.hidden = true; setSteps(null);
      $('#psTxt').textContent = `${b.name} is yours · $${rsv.symbol} is live on pump.fun · + RESPECT`;
      $('#passed').hidden = false; sfx.passed(); flashStars(); hud();
      map?.flyTo({ center: [b.lng, b.lat], zoom: 12.5 });
    } catch (err) {
      const m = String(err?.message || err);
      setSteps(null); setErr(/reject|cancel|denied|declined/i.test(m) ? 'You cancelled in your wallet. Nothing was sent.' : m);
    } finally { busy = false; syncGo(); }
  });
  $('[data-close-passed]').onclick = () => { $('#passed').hidden = true; $('#map').scrollIntoView({ behavior: 'smooth', block: 'center' }); };

  /* ---------- live tokenized $TTWO ---------- */
  async function loadTTWO() {
    try {
      const r = await fetch(`https://lite-api.jup.ag/price/v3?ids=${TTWO_MINT}`);
      const j = (await r.json())[TTWO_MINT]; if (!j) throw 0;
      const px = j.usdPrice, ch = j.priceChange24h;
      $('#ttwoPx').textContent = `$${px.toFixed(2)}`;
      const c = $('#ttwoChg'); c.textContent = `${ch >= 0 ? '+' : ''}${ch.toFixed(2)}% 24h`; c.className = `chg ${ch >= 0 ? 'up' : 'dn'}`;
      await loadVault();
      $('#vLiq').textContent = fmt$(j.liquidity || 0);
      $('#vMcap').textContent = j.stockData?.mcap ? fmt$(j.stockData.mcap) : '—';
    } catch (_) {
      $('#ttwoPx').textContent = 'price offline'; await loadVault();
    }
  }
  let solUsd = 0;
  async function loadVault() {
    if (!CFG.vault) { $('#vHold').textContent = 'opens at launch'; $('#vVal').textContent = '$0'; $('#stVault').textContent = '$0'; return; }
    try {
      const sol = (await rpcCall('getBalance', [CFG.vault])).value / 1e9;
      $('#vHold').textContent = `${sol.toFixed(3)} SOL`; $('#vVal').textContent = fmt$(sol * solUsd); $('#stVault').textContent = fmt$(sol * solUsd);
    } catch (_) { $('#vHold').textContent = '—'; }
  }
  loadTTWO(); setInterval(loadTTWO, 30000);

  /* nav highlight */
  const navLinks = $$('.links a');
  const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) navLinks.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
  ['home', 'vault', 'drop', 'jobs'].forEach((id) => io.observe(document.getElementById(id)));

  /* ---------- Update Drop: eligibility checker + location picker ---------- */
  const DROP_MIN = 1, DROP_CAP = 10, MAX_PICKS = 10;
  const LOCS = [
    ['Heist', 'Bank vault', 'Downtown'], ['Business', 'Nightclub', 'Beachfront'], ['Heist', 'Armored truck', 'Highway'],
    ['Business', 'Car dealership', 'Port side'], ['Heist', 'Jewelry store', 'Mall strip'], ['Business', 'Marina', 'Keys'],
    ['Heist', 'Casino job', 'Strip'], ['Business', 'Strip club', 'Downtown'], ['Heist', 'Cargo ship', 'Port'],
    ['Business', 'Gas station', 'Swamp road'], ['Heist', 'Airfield', 'Glades'], ['Business', 'Recording studio', 'Uptown'],
  ];
  const picked = new Set();
  function renderDrop() {
    const pct = parseFloat($('#calcPct').value), ok = pct >= DROP_MIN;
    const picks = ok ? Math.min(MAX_PICKS, Math.floor(pct)) : 0, per = Math.min(DROP_CAP, pct);
    while (picked.size > picks) picked.delete([...picked].pop());
    $('#calcVal').textContent = pct.toFixed(1) + '%';
    $('#calcOut').innerHTML = ok
      ? `<span class="st ok">You're in the drop</span>You get <b>${picks} pick${picks > 1 ? 's' : ''}</b>. Each location you pick airdrops you <b>${per.toFixed(1)}% of its supply</b>${pct > DROP_CAP ? ` (capped at ${DROP_CAP}%)` : ''}. You also get a <b>Vault Pass</b>.`
      : `<span class="st no">Not eligible yet</span>You need a combined <b>${DROP_MIN}%</b>. That's <b>${(DROP_MIN - pct).toFixed(1)}% more</b> across any Heistpad coins.`;
    $('#pickCount').textContent = `${picked.size} / ${picks}`;
    $('#locGrid').innerHTML = LOCS.map(([kind, type, area], i) => {
      const on = picked.has(i), dis = !on && picked.size >= picks;
      return `<button type="button" class="loc ${kind === 'Heist' ? 'heist' : ''} ${on ? 'on' : ''}" data-loc="${i}" aria-pressed="${on}" ${dis ? 'disabled' : ''}><small>${kind}</small><b>${on ? 'PICKED ✓' : '██████'}</b><span>${type} · ${area}</span></button>`;
    }).join('');
  }
  $('#calcPct').addEventListener('input', renderDrop);
  $('#locGrid').addEventListener('click', (e) => {
    const b = e.target.closest('[data-loc]'); if (!b || b.disabled) return;
    const i = +b.dataset.loc; picked.has(i) ? picked.delete(i) : picked.add(i); renderDrop();
  });
  renderDrop();

  /* ---------- game layer: HUD, area names, live feed, vehicles, sound ---------- */
  const AC = window.AudioContext || window.webkitAudioContext; let ac = null, soundOn = false;
  function tone(freq, t0, dur, type = 'square', vol = 0.06) {
    if (!soundOn || !ac) return; const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(vol, ac.currentTime + t0); g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + t0 + dur);
    o.connect(g).connect(ac.destination); o.start(ac.currentTime + t0); o.stop(ac.currentTime + t0 + dur + 0.02);
  }
  const sfx = {
    buy: () => { tone(880, 0, 0.08, 'triangle', 0.05); tone(1320, 0.07, 0.1, 'triangle', 0.04); },
    sell: () => { tone(520, 0, 0.09, 'triangle', 0.04); tone(390, 0.08, 0.12, 'triangle', 0.035); },
    passed: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.13, 0.3, 'sawtooth', 0.05)); tone(1047, 0.55, 0.7, 'square', 0.04); },
    star: () => { tone(1200, 0, 0.06, 'square', 0.03); tone(900, 0.08, 0.06, 'square', 0.03); },
  };
  $('#snd').addEventListener('click', () => {
    soundOn = !soundOn; if (soundOn && !ac && AC) ac = new AC(); ac?.resume?.();
    const b = $('#snd'); b.classList.toggle('on', soundOn); b.setAttribute('aria-pressed', soundOn); b.setAttribute('aria-label', soundOn ? 'Turn sound off' : 'Turn sound on');
    if (soundOn) sfx.buy();
  });

  let lastStars = 0;
  const heat = () => { const cs = coins().length; if (!cs) return 0; const recent = events.filter((t) => Date.now() - t < 10 * 60 * 1000).length; return Math.min(6, 1 + Math.floor(recent / 4) + (cs >= 10 ? 1 : 0)); };
  function hud(bump) {
    const total = coins().reduce((a, b) => a + b.coin.cap, 0);
    const cash = $('#hudCash'); cash.textContent = '$' + Math.round(total).toLocaleString('en-US');
    if (bump) { cash.classList.add('bump'); setTimeout(() => cash.classList.remove('bump'), 200); }
    const n = heat(); $('#hudStars').innerHTML = [1, 2, 3, 4, 5, 6].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('');
    if (lastStars && n > lastStars) { flashStars(); sfx.star(); }
    lastStars = n;
    $('#stCap').textContent = fmt$(total);
  }
  function flashStars() { const s = $('#hudStars'); s.classList.remove('flash'); void s.offsetWidth; s.classList.add('flash'); }

  let areaT;
  function showArea(name, sub) {
    const a = $('#area'); a.innerHTML = `<b>${esc(name)}</b><small>${esc(sub)}</small>`; a.classList.add('show');
    clearTimeout(areaT); areaT = setTimeout(() => a.classList.remove('show'), 3200);
  }

  // live activity: each poll compares a coin's SOL in its bonding curve with the last poll
  const events = [];
  function pushEvent(b, buy, sol) {
    events.push(Date.now());
    const ev = document.createElement('div'); ev.className = 'ev';
    ev.innerHTML = `${avatar(b.coin)}<div><span>someone</span> <b class="${buy ? 'buy' : 'sell'}">${buy ? 'bought' : 'sold'} ${sol.toFixed(sol < 1 ? 3 : 2)} SOL</b><br><b>$${esc(b.coin.tick)}</b> <span>· ${esc(b.name)}</span></div>`;
    const f = $('#feed'); f.prepend(ev);
    while (f.children.length > 3) f.removeChild(f.lastElementChild);
    setTimeout(() => ev.isConnected && f.removeChild(ev), 6000);
    const el = mkEls.get(b.id); if (el) { el.classList.remove('ping'); void el.offsetWidth; el.classList.add('ping'); }
    const card = document.querySelector(`.card[data-biz="${b.id}"]`);
    if (card) { card.classList.remove('hit'); void card.offsetWidth; card.classList.add('hit'); }
    (buy ? sfx.buy : sfx.sell)();
  }
  const lastVSol = new Map(); let firstLoad = true;
  async function loadCoins() {
    try {
      const r = await fetch(`${API}/api/coins`); if (!r.ok) throw 0; const d = await r.json();
      solUsd = d.solUsd || solUsd;
      const seen = new Set();
      for (const c of d.coins) {
        const b = BIZ.find((x) => x.id === c.bizId); if (!b) continue; seen.add(b.id);
        const prev = b.coin, delta = lastVSol.has(c.mint) && c.vSol != null ? c.vSol - lastVSol.get(c.mint) : 0;
        b.coin = { name: c.name || c.symbol, tick: c.symbol, cap: c.mcapUsd || 0, vol: (prev?.vol || 0) + Math.abs(delta) * 10 + (prev ? 0 : Math.min(40, (c.realSol || 0) * 4)), ca: c.mint, color: hashColor(c.mint), born: c.createdAt, img: c.image ? c.image.replace('https://ipfs.io/ipfs/', 'https://gateway.pinata.cloud/ipfs/') : null, progress: c.progress, complete: c.complete, creator: c.creator, mine: wallet && c.creator === wallet.toBase58() };
        if (c.vSol != null) lastVSol.set(c.mint, c.vSol);
        if (!firstLoad && Math.abs(delta) > 0.001) pushEvent(b, delta > 0, Math.abs(delta));
      }
      BIZ.forEach((b) => { if (b.coin && !seen.has(b.id)) b.coin = null; });
      firstLoad = false; renderAll(); hud(true);
    } catch (_) { /* API unreachable: keep what we have */ }
  }
  // traffic: cars on the causeways + Overseas Hwy, boats in the bays, a news chopper over downtown
  const ROUTES = [
    ['car', 9, [[-80.205, 25.745], [-80.206, 25.80], [-80.201, 25.87], [-80.186, 25.95]]],
    ['car', 7, [[-80.19, 25.786], [-80.165, 25.781], [-80.14, 25.776]]],
    ['car', 8, [[-80.214, 25.766], [-80.19, 25.766], [-80.162, 25.745], [-80.158, 25.72]]],
    ['car', 60, [[-80.44, 25.09], [-80.62, 24.92], [-80.9, 24.78], [-81.08, 24.72], [-81.25, 24.70], [-81.55, 24.66], [-81.78, 24.56]]],
    ['car', 22, [[-82.62, 27.89], [-82.53, 27.93], [-82.46, 27.95]]],
    ['car', 30, [[-80.61, 28.10], [-80.6, 28.32], [-80.61, 28.55]]],
    ['boat', 26, [[-80.17, 25.70], [-80.145, 25.76], [-80.165, 25.83], [-80.18, 25.77], [-80.17, 25.70]]],
    ['boat', 34, [[-80.12, 25.76], [-80.08, 25.79], [-80.05, 25.86], [-80.09, 25.80], [-80.12, 25.76]]],
    ['boat', 40, [[-82.6, 27.7], [-82.55, 27.82], [-82.48, 27.88], [-82.58, 27.76], [-82.6, 27.7]]],
    ['heli', 20, [[-80.19, 25.765], [-80.135, 25.79], [-80.19, 25.83], [-80.23, 25.79], [-80.19, 25.765]]],
  ];
  if (map && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const vehicles = ROUTES.map(([kind, secs, pts]) => {
      const el = document.createElement('div'); el.className = `veh ${kind}`;
      const m = new maplibregl.Marker({ element: el }).setLngLat(pts[0]).addTo(map);
      const segs = []; let L = 0;
      for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(d); L += d; }
      return { m, pts, segs, L, secs, off: Math.random() * 2, pingpong: kind === 'car' };
    });
    const t0 = performance.now();
    (function anim(now) {
      for (const v of vehicles) {
        let u = ((now - t0) / 1000 / v.secs + v.off) % (v.pingpong ? 2 : 1); if (u > 1) u = 2 - u;
        let d = u * v.L, i = 0; while (i < v.segs.length - 1 && d > v.segs[i]) { d -= v.segs[i]; i++; }
        const k = v.segs[i] ? Math.min(1, d / v.segs[i]) : 0, a = v.pts[i], b = v.pts[i + 1];
        v.m.setLngLat([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]);
      }
      requestAnimationFrame(anim);
    })(t0);
  }

  renderAll(); hud();
  loadCoins(); setInterval(() => { if (!document.hidden) loadCoins(); }, 15000);
  // refresh ages
  setInterval(() => { if (sortBy) renderAll(); }, 60000);
})();
// "no wallet" help panel
(() => {
  const nw = document.getElementById('noWallet'); if (!nw) return;
  nw.addEventListener('click', (e) => {
    if (e.target === nw || e.target.closest('[data-close-nw]')) nw.hidden = true;
    if (e.target.closest('[data-copy-link]')) navigator.clipboard?.writeText(location.href).then(() => { e.target.textContent = 'Link copied ✓'; });
  });
})();
