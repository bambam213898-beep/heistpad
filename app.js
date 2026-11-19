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
  // IPFS images go through the API's cached proxy (public gateways rate-limit visitors)
  const ipfsImg = (u) => String(u || '').replace(/^https:\/\/[^/]+\/ipfs\//, `${API}/ipfs/`);
  const now = Date.now();

  /* ---------- helpers ---------- */
  const fmt$ = (n) => n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(1)}k` : `$${n.toFixed(0)}`;
  const shortCa = (c) => `${c.slice(0, 6)}…${c.slice(-6)}`;
  const ago = (t) => { const m = Math.max(1, Math.round((Date.now() - t) / 60000)); return m < 60 ? `${m}m` : `${Math.round(m / 60)}h`; };
  const stars = (vol) => { const n = Math.min(6, Math.max(1, Math.ceil(vol / 7.5))); return `<span class="stars" title="Wanted level ${n}/6">${[1, 2, 3, 4, 5, 6].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`; };
  const regionName = (rid) => REGIONS.find((r) => r.id === rid).name;
  const coins = () => BIZ.filter((b) => b.coin);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const toast = (msg, ms = 2200) => { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), ms); };
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
    window.dispatchEvent(new Event('hp:wallet'));
  }
  const IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
  const IN_WALLET_APP = /Phantom|Solflare|Backpack/i.test(navigator.userAgent);
  let connecting = null; // one connection request at a time (phone wallets reject overlapping requests)
  // phone wallets inject their provider a moment after the page loads
  /* Wallet Standard: the modern way Solana wallets expose themselves (more reliable in phone wallet apps) */
  const STD = [];
  try {
    const api = { register: (...ws) => { ws.forEach((w) => { if (!STD.includes(w)) STD.push(w); }); return () => {}; } };
    window.addEventListener('wallet-standard:register-wallet', (e) => { try { e.detail(api); } catch (_) {} });
    window.dispatchEvent(new CustomEvent('wallet-standard:app-ready', { detail: api }));
  } catch (_) {}
  const stdWallet = () => {
    const ok = (w) => w?.features?.['standard:connect'] && w.features['solana:signAndSendTransaction'] && (w.chains || []).some((c) => c.startsWith('solana:'));
    return STD.find((w) => ok(w) && /phantom/i.test(w.name)) || STD.find((w) => ok(w) && /solflare|backpack/i.test(w.name)) || STD.find(ok) || null;
  };
  const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const b58 = (bytes) => { let n = 0n; for (const x of bytes) n = n * 256n + BigInt(x); let out = ''; while (n > 0n) { out = B58[Number(n % 58n)] + out; n /= 58n; } for (const x of bytes) { if (x === 0) out = '1' + out; else break; } return out; };
  let stdW = null, stdAcct = null; // set when connected through Wallet Standard
  const b58d = (str) => { let n = 0n; for (const ch of str) { const v = B58.indexOf(ch); if (v < 0) throw new Error('bad base58'); n = n * 58n + BigInt(v); } const bytes = []; while (n > 0n) { bytes.unshift(Number(n % 256n)); n /= 256n; } for (const ch of str) { if (ch === '1') bytes.unshift(0); else break; } return new Uint8Array(bytes); };

  /* Phantom phone app via deep links: works from Safari/Chrome on a phone, no in-app browser needed.
     The page hands off to the Phantom app, which sends the user back here with an encrypted answer. */
  const DL = {
    get: () => { try { return JSON.parse(localStorage.getItem('hp.phantom') || 'null'); } catch (_) { return null; } },
    set: (v) => { try { v ? localStorage.setItem('hp.phantom', JSON.stringify(v)) : localStorage.removeItem('hp.phantom'); } catch (_) {} },
    pending: (v) => { try { if (v === undefined) return JSON.parse(localStorage.getItem('hp.pending') || 'null'); v ? localStorage.setItem('hp.pending', JSON.stringify(v)) : localStorage.removeItem('hp.pending'); } catch (_) { return null; } },
  };
  let dlSession = null; // { wallet, session, phantomPub } when connected via the Phantom app
  const dlKeys = () => { let d = DL.get() || {}; if (!d.sec) { const kp = nacl.box.keyPair(); d = { pub: b58(kp.publicKey), sec: Array.from(kp.secretKey) }; DL.set(d); } return d; };
  const dlShared = (d) => nacl.box.before(b58d(d.phantomPub), Uint8Array.from(d.sec));
  const dlBack = (step) => `${location.origin}${location.pathname}?pd=${step}`;
  function dlConnect() {
    const d = dlKeys();
    const q = new URLSearchParams({ app_url: location.origin, dapp_encryption_public_key: d.pub, redirect_link: dlBack('connect'), cluster: 'mainnet-beta' });
    location.href = `https://phantom.app/ul/v1/connect?${q}`;
  }
  function dlSign(tx, pendingLaunch) {
    const d = DL.get(); const nonce = nacl.randomBytes(24);
    const payload = new TextEncoder().encode(JSON.stringify({ transaction: b58(tx.serialize()), session: d.session }));
    const enc = nacl.box.after(payload, nonce, dlShared(d));
    DL.pending(pendingLaunch);
    const q = new URLSearchParams({ dapp_encryption_public_key: d.pub, nonce: b58(nonce), redirect_link: dlBack('sign'), payload: b58(enc) });
    location.href = `https://phantom.app/ul/v1/signAndSendTransaction?${q}`;
    return new Promise(() => {}); // the page is leaving for the Phantom app
  }
  function dlOpen(q, d) { const out = nacl.box.open.after(b58d(q.get('data')), b58d(q.get('nonce')), dlShared(d)); if (!out) throw new Error('Could not read the answer from Phantom'); return JSON.parse(new TextDecoder().decode(out)); }
  // restore a Phantom-app session from an earlier visit
  (() => { const d = DL.get(); if (d?.session && d.wallet) { dlSession = d; } })();

  async function waitProvider(ms = 2500) { const t0 = Date.now(); let p; while (!(p = getProvider()) && !stdWallet() && Date.now() - t0 < ms) await new Promise((r) => setTimeout(r, 150)); return p; }
  function report(kind, extra) {
    try {
      const sw = STD.map((w) => ({ name: w.name, chains: w.chains, features: Object.keys(w.features || {}) }));
      const p = getProvider();
      const r = { kind, at: new Date().toISOString(), ua: navigator.userAgent, url: location.pathname + location.search.replace(/crew=[^&]+/, 'crew=x'),
        mobile: IS_MOBILE, inWalletApp: IN_WALLET_APP, injected: p ? { isPhantom: !!p.isPhantom, isSolflare: !!p.isSolflare, isBackpack: !!p.isBackpack, isConnected: !!p.isConnected, hasRequest: !!p.request, hasSignAndSend: !!p.signAndSendTransaction } : null,
        phantomObj: !!window.phantom, solanaObj: !!window.solana, standardWallets: sw, ...extra };
      fetch(`${API}/api/diag`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(r), keepalive: true }).catch(() => {});
    } catch (_) {}
  }
  const NOSOL = 'Your selected Phantom account has no Solana address. In Phantom, tap the account name at the top-left and pick an account with Solana (or go to Settings → Active Networks and turn Solana on), then try again.';
  const errText = (err) => { const m = String(err?.message || err || 'unknown error'); return err?.code != null ? `${m} [code ${err.code}]` : m; };
  const isNo = (err) => /reject|cancel|denied|declined|closed/i.test(String(err?.message || err)) || err?.code === 4001;
  async function connectWallet() {
    if (connecting) return connecting;
    connecting = (async () => {
      provider = getProvider() || (IS_MOBILE || IN_WALLET_APP ? await waitProvider() : null);
      const sw = stdWallet();
      if (!provider && !sw) { if (IS_MOBILE) { toast('Opening the Phantom app… approve, then you\'ll come back here'); dlConnect(); return; } $('#noWallet').hidden = false; return; }
      const name = provider ? (provider.isPhantom ? 'Phantom' : provider.isSolflare ? 'Solflare' : provider.isBackpack ? 'Backpack' : 'your wallet') : sw.name;
      toast(`Opening ${name}… approve the request`);
      const hint = IS_MOBILE ? `${name} hasn't answered. Check for the ${name} prompt, or close and reopen heistpad.live in ${name}'s browser.` : `${name} hasn't answered. Click the ${name} icon in Chrome's toolbar: unlock it or find the request (the pop-up can open behind this window).`;
      const slow = setTimeout(() => toast(hint, 9000), 6000);
      // connection methods, tried in order until one works
      const viaStd = async () => { if (!sw) throw new Error('no standard wallet'); const r = await sw.features['standard:connect'].connect(); const acct = (r?.accounts || sw.accounts || [])[0]; if (!acct) throw new Error(`${name} didn't share an account`); stdW = sw; stdAcct = acct; return acct.address; };
      const viaLegacy = async () => { if (!provider) throw new Error('no injected wallet'); const r = await provider.connect(); const pk = r?.publicKey || provider.publicKey; if (!pk) throw new Error(`${name} didn't share an address`); stdW = null; stdAcct = null; return pk.toString(); };
      const viaRequest = async () => { if (!provider?.request) throw new Error('no request()'); const r = await provider.request({ method: 'connect' }); const pk = r?.publicKey || provider.publicKey; if (!pk) throw new Error(`${name} didn't share an address`); stdW = null; stdAcct = null; return pk.toString(); };
      const order = IS_MOBILE || IN_WALLET_APP ? [viaStd, viaLegacy, viaRequest] : [viaLegacy, viaStd, viaRequest];
      const errors = [], attempts = [];
      try {
        let addr = null;
        for (const fn of order) {
          try { addr = await fn(); break; }
          catch (err) { if (isNo(err)) throw err; attempts.push({ method: fn.name, message: String(err?.message || err), code: err?.code ?? null, data: (() => { try { return JSON.stringify(err?.data ?? null).slice(0, 300); } catch (_) { return null; } })(), stack: String(err?.stack || '').slice(0, 300) }); if (!/^no (standard wallet|injected wallet|request)/.test(String(err?.message))) errors.push(errText(err)); console.warn('[heistpad] connect method failed:', fn.name, err); await new Promise((r) => setTimeout(r, 400)); }
        }
        if (!addr) throw new Error(errors[0] || 'no connection method worked');
        wallet = new W3.PublicKey(addr); syncWallet(); toast(`${name} connected`);
      } catch (err) {
        if (!isNo(err)) report('connect-failed', { wallet: name, attempts, final: errText(err) });
        toast(isNo(err) ? 'Connection cancelled in your wallet' : IS_MOBILE ? (/no valid solana address/i.test(errText(err)) || err?.code === -32603 ? NOSOL : `${name} refused to connect on this phone (${errText(err).slice(0, 60)}).`) : `Couldn't connect (${name}): ${errText(err).slice(0, 140)}`, 12000);
      } finally { clearTimeout(slow); }
    })();
    try { await connecting; } finally { connecting = null; }
  }
  // sign + send through whichever connection worked; returns the base58 signature
  async function signAndSend(tx, pendingLaunch) {
    if (dlSession && !provider && !stdW) return dlSign(tx, pendingLaunch);
    if (stdW) {
      const [out] = await stdW.features['solana:signAndSendTransaction'].signAndSendTransaction({ account: stdAcct, transaction: tx.serialize(), chain: 'solana:mainnet' });
      return typeof out.signature === 'string' ? out.signature : b58(out.signature);
    }
    if (provider.signAndSendTransaction) { const r = await provider.signAndSendTransaction(tx); return typeof r === 'string' ? r : r.signature; }
    const signed = await provider.signTransaction(tx); const raw = btoa(String.fromCharCode(...signed.serialize()));
    return rpcCall('sendTransaction', [raw, { encoding: 'base64', skipPreflight: false }]);
  }
  $('#walletBtn').addEventListener('click', async () => {
    if (!wallet) return connectWallet();
    try { if (stdW) await stdW.features['standard:disconnect']?.disconnect(); else await provider?.disconnect?.(); } catch (_) {}
    if (dlSession) { DL.set({ ...DL.get(), session: null, wallet: null, phantomPub: null }); dlSession = null; }
    wallet = null; stdW = null; stdAcct = null; syncWallet(); toast('Wallet disconnected');
  });
  if (!IS_MOBILE && !IN_WALLET_APP) setTimeout(async () => { // quietly reconnect a trusted wallet (desktop only: phone wallets reject overlapping requests)
    const p = getProvider(); if (!p || connecting || wallet) return;
    try { const r = await p.connect({ onlyIfTrusted: true }); provider = p; wallet = new W3.PublicKey((r?.publicKey || p.publicKey).toString()); syncWallet(); } catch (_) {}
  }, 500);
  const CREW = (() => { try { const c = new URLSearchParams(location.search).get('crew'); if (c) sessionStorage.setItem('hp.crew', c); return c || sessionStorage.getItem('hp.crew') || ''; } catch (_) { return ''; } })();
  fetch(`${API}/api/config?code=${encodeURIComponent(CREW)}`).then((r) => r.json()).then((c) => { CFG = { ...CFG, ...c }; $('#lfFee').textContent = `${CFG.feeLamports / 1e9} SOL`; syncGo(); loadVault(); }).catch(() => {});

  /* ---------- launch flow ---------- */
  const modal = $('#launchModal');
  let imgData = null, imgFile = null;
  const setErr = (msg) => { const e = $('#lfErr'); e.textContent = msg || ''; e.hidden = !msg; };
  // heist mode: launching the coin for a verified heist (name + ticker are fixed to the heist)
  let heistMode = null;
  function setMode(h) {
    heistMode = h;
    $('#lfBizL').hidden = !!h; $('#lfBiz').required = !h;
    $('#lfName').readOnly = $('#lfTick').readOnly = !!h;
    $('#lfKick').textContent = h ? 'HEIST VERIFIED' : 'PULL A JOB';
    $('#lfTitle').textContent = h ? 'Launch your heist coin' : 'Launch a coin';
    const n = $('#lfHeistNote'); n.hidden = !h;
    if (h) n.innerHTML = `Completed by <b>${esc(h.gamertag)}</b> on ${esc(h.platformLabel)}. The heist name is the coin name and <b>$${esc(h.ticker)}</b> is the ticker.`;
  }
  window.hpLaunchHeist = (h) => {
    $('#launchForm').reset(); imgData = null; imgFile = null; setErr(''); setSteps(null); setMode(h); syncGo();
    $('#lfName').value = h.heist.slice(0, 32); $('#lfTick').value = h.ticker;
    $('#lfImgTxt').textContent = 'Coin image (optional: uses your proof screenshot if empty)';
    modal.hidden = false;
  };
  function openLaunch(bizId) {
    const open = BIZ.filter((b) => !b.coin);
    $('#launchForm').reset(); setMode(null); imgData = null; imgFile = null; $('#lfImgTxt').textContent = "Pick your coin's image (required)"; setErr(''); setSteps(null); syncGo();
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
    const H = heistMode;
    const b = H ? { id: `heist-${H.id}`, name: H.heist, heist: true } : BIZ.find((x) => x.id === $('#lfBiz').value);
    const name = $('#lfName').value.trim().replace(/\s+/g, ' '), tick = $('#lfTick').value.trim();
    const devBuy = Math.max(0, Math.min(10, parseFloat($('#lfBuy').value) || 0));
    if (!b) return setErr('Pick a business to launch.');
    if (b.coin) return setErr(`${b.name} already has a coin ($${b.coin.tick}). Pick another business.`);
    if (name.length < 2) return setErr('Coin name needs at least 2 characters.');
    if (tick.length < 2) return setErr('Ticker needs 2–10 letters or numbers.');
    if (coins().some((x) => x.coin.tick.toUpperCase() === tick)) return setErr(`$${tick} is already on the map. Try another ticker.`);
    if (!imgFile && !H) return setErr('Add an image for your coin.');
    const links = [$('#lfX').value.trim(), $('#lfTg').value.trim()];
    if (links.some((u) => u && !/^https:\/\//.test(u))) return setErr('Links must start with https://');
    setErr(''); busy = true; syncGo(); let held = null, signed = false;
    const fee = CFG.feeLamports / 1e9;
    try {
      // 0. enough SOL? fee + first buy + ~0.025 for rent/network
      const need = fee + devBuy + 0.025, bal = (await rpcCall('getBalance', [wallet.toBase58()])).value / 1e9;
      if (bal < need) throw new Error(`You need about ${need.toFixed(3)} SOL in your wallet (you have ${bal.toFixed(3)}).`);
      // 1. upload art + hold the business
      setSteps('upload');
      const fd = new FormData();
      Object.entries({ code: CREW, bizId: b.id, creator: wallet.toBase58(), name, symbol: tick, description: $('#lfDesc').value.trim(), twitter: links[0], telegram: links[1] }).forEach(([k, v]) => fd.append(k, v));
      if (imgFile) fd.append('image', imgFile, imgFile.name);
      const rsv = held = await (async () => { const r = await fetch(`${API}/api/reserve`, { method: 'POST', body: fd }); const j = await r.json(); if (!r.ok) throw new Error(j.error); return j; })();
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
      signed = true; signature = await signAndSend(tx, { bizId: b.id, mint: mintKp.publicKey.toBase58(), creator: wallet.toBase58(), token: rsv.token, symbol: rsv.symbol, name: b.name, heist: !!H });
      if (typeof signature !== 'string') throw new Error('Your wallet did not return a transaction signature.');
      // 4. wait for the chain, then record the claim
      setSteps('confirm');
      await finishLaunch({ bizId: b.id, signature, mint: mintKp.publicKey.toBase58(), creator: wallet.toBase58(), token: rsv.token, symbol: rsv.symbol, name: b.name, heist: !!H });
    } catch (err) {
      const m = String(err?.message || err);
      if (held && !signed) fetch(`${API}/api/release`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ bizId: b.id, token: held.token }) }).catch(() => {});
      if (held && signed && /reject|cancel|denied|declined/i.test(m)) fetch(`${API}/api/release`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ bizId: b.id, token: held.token }) }).catch(() => {});
      setSteps(null); setErr(/reject|cancel|denied|declined/i.test(m) ? 'You cancelled in your wallet. Nothing was sent.' : m);
      if (!/reject|cancel|denied|declined/i.test(m)) report('launch-failed', { message: m, code: err?.code ?? null, via: dlSession && !provider ? 'phantom-app' : stdW ? 'standard' : 'injected' });
    } finally { busy = false; syncGo(); }
  });
  async function finishLaunch(p) {
    const b = BIZ.find((x) => x.id === p.bizId);
    let ok = null;
    for (let i = 0; i < 40 && !ok; i++) {
      await new Promise((r) => setTimeout(r, i ? 3000 : 2000));
      const r = await fetch(`${API}/api/confirm`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ bizId: p.bizId, signature: p.signature, mint: p.mint, creator: p.creator, token: p.token }) });
      const j = await r.json(); if (r.status === 202) continue; if (!r.ok) throw new Error(j.error); ok = j;
    }
    if (!ok) throw new Error(`Still confirming. Your transaction: ${p.signature.slice(0, 8)}… Refresh in a minute.`);
    $$('#lfSteps li').forEach((li) => (li.className = 'ok'));
    await loadCoins();
    modal.hidden = true; setSteps(null);
    $('#psTxt').textContent = p.heist ? `${p.name || 'Your heist'} · $${p.symbol} is live on pump.fun · creator fees are yours` : `${b ? b.name : 'Your business'} is yours · $${p.symbol} is live on pump.fun · + RESPECT`;
    $('#passed').hidden = false; sfx.passed(); flashStars(); hud();
    window.dispatchEvent(new Event('hp:launched'));
    if (b) map?.flyTo({ center: [b.lng, b.lat], zoom: 12.5 });
  }

  // back from the Phantom app: finish connecting, or finish the launch it just signed
  (async () => {
    const q = new URLSearchParams(location.search), step = q.get('pd'); if (!step) return;
    await new Promise((r) => setTimeout(r, 0)); // let the rest of the page finish setting up first
    history.replaceState(null, '', location.pathname + location.hash);
    if (q.get('errorCode')) { report('deeplink-error', { step, errorCode: q.get('errorCode'), errorMessage: q.get('errorMessage') }); DL.pending(null); const em = q.get('errorMessage') || ''; toast(/4001|reject/i.test(q.get('errorCode') + em) ? 'Cancelled in Phantom. Nothing was sent.' : /no valid solana address/i.test(em) ? NOSOL : `Phantom: ${em || q.get('errorCode')}`, 14000); return; }
    try {
      if (step === 'connect') {
        const d = DL.get(); d.phantomPub = q.get('phantom_encryption_public_key');
        const ans = dlOpen(q, d); d.session = ans.session; d.wallet = ans.public_key; DL.set(d); dlSession = d;
        wallet = new W3.PublicKey(ans.public_key); syncWallet(); toast('Phantom connected');
      } else if (step === 'sign') {
        const d = DL.get(), pending = DL.pending(); DL.pending(null);
        const ans = dlOpen(q, d);
        if (pending?.kind === 'claim') { toast('Fee claim sent. It lands in a few seconds.', 6000); setTimeout(() => window.dispatchEvent(new Event('hp:launched')), 6000); return; }
        if (!pending) throw new Error('Launch details were lost. Your transaction: ' + ans.signature);
        modal.hidden = false; setErr(''); setSteps('confirm');
        await finishLaunch({ ...pending, signature: ans.signature });
      }
    } catch (err) { setSteps(null); toast(String(err?.message || err), 10000); }
  })();
  // a Phantom-app session from an earlier visit counts as connected
  if (dlSession && !wallet) { try { wallet = new W3.PublicKey(dlSession.wallet); setTimeout(syncWallet, 0); } catch (_) {} }

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
        b.coin = { name: c.name || c.symbol, tick: c.symbol, cap: c.mcapUsd || 0, vol: (prev?.vol || 0) + Math.abs(delta) * 10 + (prev ? 0 : Math.min(40, (c.realSol || 0) * 4)), ca: c.mint, color: hashColor(c.mint), born: c.createdAt, img: c.image ? ipfsImg(c.image) : null, progress: c.progress, complete: c.complete, creator: c.creator, mine: wallet && c.creator === wallet.toBase58() };
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

  /* ---------- heist proofs: finish a heist in GTA VI, prove it, launch $HEISTNAME ---------- */
  // Matches the API: GTA VI launched Nov 19 2026 on PS5 and Xbox Series X|S; no PC version announced yet.
  let PLATS = [
    { id: 'ps5', label: 'PlayStation 5', net: 'psn', idName: 'PSN Online ID' }, { id: 'ps5pro', label: 'PlayStation 5 Pro', net: 'psn', idName: 'PSN Online ID' },
    { id: 'psportal', label: 'PlayStation Portal (Remote Play)', net: 'psn', idName: 'PSN Online ID' },
    { id: 'xsx', label: 'Xbox Series X', net: 'xbox', idName: 'Xbox gamertag' }, { id: 'xss', label: 'Xbox Series S', net: 'xbox', idName: 'Xbox gamertag' },
    { id: 'xcloud', label: 'Xbox Cloud Gaming', net: 'xbox', idName: 'Xbox gamertag' },
    { id: 'steam', label: 'PC · Steam', net: 'steam', idName: 'Steam profile', soon: true }, { id: 'rgl', label: 'PC · Rockstar Games Launcher', net: 'rockstar', idName: 'Rockstar Games ID', soon: true },
    { id: 'epic', label: 'PC · Epic Games Store', net: 'epic', idName: 'Epic display name', soon: true },
  ];
  const ID_PH = { psn: 'Your PSN Online ID', xbox: 'Your Xbox gamertag (e.g. MurdaMan#1234)', steam: 'steamcommunity.com link, SteamID64 or name', rockstar: 'Your Rockstar Games ID', epic: 'Your Epic display name' };
  const tickerOf = (n) => { let t = String(n).toUpperCase().replace(/[^A-Z0-9 ]/g, '').trim(); if (t.replace(/ /g, '').length > 10) t = t.replace(/^THE\s+/, ''); return t.replace(/ /g, '').slice(0, 10); };
  const gw = ipfsImg;
  const STATUS = { pending: 'IN REVIEW', approved: 'VERIFIED', rejected: 'REJECTED', launched: 'COIN LIVE' };
  let HEISTS = { board: [], mine: [] };
  function renderPlats() {
    $('#hsPlat').innerHTML = PLATS.map((p) => `<span class="${p.soon ? 'soon' : 'on'}">${esc(p.label)}</span>`).join('');
    const grp = (net) => PLATS.filter((p) => (net === 'pc' ? ['steam', 'rockstar', 'epic'].includes(p.net) : p.net === net));
    const opt = (p) => `<option value="${p.id}" ${p.soon ? 'disabled' : ''}>${esc(p.label)}${p.soon ? ' (not out yet)' : ''}</option>`;
    const sel = $('#hfPlat'), cur = sel.value;
    sel.innerHTML = `<optgroup label="PlayStation">${grp('psn').map(opt).join('')}</optgroup><optgroup label="Xbox">${grp('xbox').map(opt).join('')}</optgroup><optgroup label="PC">${grp('pc').map(opt).join('')}</optgroup>`;
    if (cur && PLATS.some((p) => p.id === cur && !p.soon)) sel.value = cur;
    syncIdField();
  }
  function syncIdField() { const p = PLATS.find((x) => x.id === $('#hfPlat').value) || PLATS[0]; $('#hfIdLbl').textContent = p.idName; $('#hfId').placeholder = ID_PH[p.net] || ''; }
  $('#hfPlat').addEventListener('change', syncIdField);
  $('#hfHeist').addEventListener('input', (e) => { const t = tickerOf(e.target.value); $('#hfTick').textContent = t.length >= 2 ? `$${t}` : '$—'; });
  function renderHeists() {
    const { board, mine } = HEISTS;
    const box = $('#hsMine'); box.hidden = !wallet || !mine.length;
    if (!box.hidden) box.innerHTML = `<h3>Your heists</h3>` + mine.map((h) => `<div class="hm-row"><img src="${esc(gw(h.image || h.proof))}" alt="" loading="lazy"><div class="hm-t"><b>${esc(h.heist)} <span class="tk" style="color:var(--gold);font-family:JetBrains Mono">$${esc(h.ticker)}</span></b><small>${esc(h.gamertag)} · ${esc(h.platformLabel)}</small></div><span class="chip ${h.status}">${STATUS[h.status] || h.status}</span>${
      h.status === 'approved' && h.taken ? `<span class="hm-why" style="width:auto;color:var(--mut)">Another crew launched $${esc(h.ticker)} first</span>` :
      h.status === 'approved' ? `<button type="button" class="btn pink sm" data-heist-launch="${h.id}">Launch $${esc(h.ticker)} →</button>` :
      h.status === 'launched' && h.mint ? `<a class="btn ghost sm" href="${pumpUrl(h.mint)}" target="_blank" rel="noopener">View on pump.fun</a>` :
      h.status === 'rejected' ? `<button type="button" class="btn ghost sm" data-heist-submit>Send new proof</button>` : ''}${h.status === 'rejected' && h.reason ? `<div class="hm-why">Why: ${esc(h.reason)}</div>` : ''}${h.status === 'pending' ? '<div class="hm-why" style="color:var(--mut)">The crew is checking your proof. This page updates by itself.</div>' : ''}</div>`).join('');
    $('#hsBoard').innerHTML = !board.length ? `<div class="hs-empty"><b>No verified heists yet.</b><span>GTA VI is out. Be the first crew to prove a heist and launch its ticker.</span><button type="button" class="btn pink" data-heist-submit>Submit heist proof →</button></div>` : board.map((h) => `
      <article class="hb"><div class="hb-shot" style="background-image:url('${esc(gw(h.image || h.proof))}')"><span class="chip ${h.status}">${STATUS[h.status]}</span></div>
        <div class="hb-bd"><h4>${esc(h.heist)}</h4><span class="tk">$${esc(h.ticker)}</span>
          <div class="hb-who">by <b>${esc(h.gamertag)}</b> · ${esc(h.platformLabel)}</div>
          ${h.mint ? `<div class="c-mid"><span class="c-cap">${fmt$(h.mcapUsd || 0)}</span><span class="prog">${h.complete ? 'Graduated' : `${((h.progress || 0) * 100).toFixed(1)}% to graduation`}</span></div><div class="c-bot"><a class="btn pink" href="${pumpUrl(h.mint)}" target="_blank" rel="noopener">Buy $${esc(h.ticker)}</a><button class="cp" data-copy="${h.mint}">${shortCa(h.mint)}</button></div>` : '<div class="hb-who">Verified. Coin not launched yet.</div>'}
          ${h.clip ? `<a class="hb-who" href="${esc(h.clip)}" target="_blank" rel="noopener" style="color:var(--pink2)">Watch the clip ↗</a>` : ''}
        </div></article>`).join('');
  }
  async function loadHeists() {
    try {
      const r = await fetch(`${API}/api/heists${wallet ? `?wallet=${wallet.toBase58()}` : ''}`); if (!r.ok) throw 0;
      const d = await r.json(); HEISTS = d; if (d.platforms?.length) PLATS = d.platforms; renderPlats(); renderHeists();
    } catch (_) {}
  }
  const hModal = $('#heistModal');
  const hErr = (m) => { const e = $('#hfErr'); e.textContent = m || ''; e.hidden = !m; };
  let proofFile = null;
  const syncHGo = (busyH) => { $('#hfGo').disabled = !!busyH; $('#hfGo').innerHTML = busyH ? 'Uploading proof… <span>⏳</span>' : wallet ? 'Submit for review <span>→</span>' : 'Connect wallet to submit <span>→</span>'; };
  function openHeist() { $('#heistForm').reset(); proofFile = null; $('#hfProofTxt').textContent = 'Completion screen or trophy/achievement unlock (required)'; $('#hfTick').textContent = '$—'; hErr(''); renderPlats(); syncHGo(); hModal.hidden = false; setTimeout(() => $('#hfHeist').focus(), 50); }
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-heist-submit]')) { e.preventDefault(); openHeist(); return; }
    const l = e.target.closest('[data-heist-launch]');
    if (l) { const h = HEISTS.mine.find((x) => x.id === l.dataset.heistLaunch); if (h) window.hpLaunchHeist(h); }
  });
  hModal.addEventListener('click', (e) => { if (e.target === hModal || e.target.closest('[data-close-h]')) hModal.hidden = true; });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hModal.hidden = true; });
  $('#hfProof').addEventListener('change', (e) => {
    const f = e.target.files[0]; proofFile = null; if (!f) return;
    if (!f.type.startsWith('image/')) { e.target.value = ''; return hErr('Proof must be an image (PNG, JPG or WEBP).'); }
    if (f.size > 8 * 1024 * 1024) { e.target.value = ''; return hErr('Screenshot must be under 8 MB.'); }
    proofFile = f; const u = URL.createObjectURL(f); $('#hfProofTxt').innerHTML = `<img src="${u}" alt="" class="lf-prev"> ${esc(f.name)}`; hErr('');
  });
  $('#heistForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!wallet) { connectWallet(); return; }
    const heist = $('#hfHeist').value.trim().replace(/\s+/g, ' '), plat = $('#hfPlat').value, gt = $('#hfId').value.trim(), clip = $('#hfClip').value.trim();
    const p = PLATS.find((x) => x.id === plat);
    if (heist.length < 3) return hErr('Type the heist name exactly as it shows in the game.');
    if (tickerOf(heist).length < 2) return hErr('The heist name needs at least 2 letters or numbers.');
    if (!p || p.soon) return hErr('Pick the platform you played on.');
    if (!gt) return hErr(`Add your ${p.idName}.`);
    if (!proofFile) return hErr('Add a screenshot of the heist completion screen or the trophy/achievement.');
    if (clip && !/^https:\/\//.test(clip)) return hErr('Clip links must start with https://');
    const fd = new FormData();
    Object.entries({ wallet: wallet.toBase58(), heist, platform: plat, gamertag: gt, rockstarId: $('#hfRid').value.trim(), clip, note: $('#hfNote').value.trim() }).forEach(([k, v]) => fd.append(k, v));
    fd.append('proof', proofFile, proofFile.name);
    syncHGo(true); hErr('');
    try {
      const r = await fetch(`${API}/api/heist/submit`, { method: 'POST', body: fd }); const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Could not send your proof');
      hModal.hidden = true; await loadHeists();
      toast(j.heist.status === 'approved' ? `Verified! You can launch $${j.heist.ticker} now.` : `Proof sent. The crew is checking ${j.heist.heist}. You'll see the Launch button here once it's verified.`, 7000);
      $('#heists').scrollIntoView({ behavior: 'smooth' });
    } catch (err) { hErr(String(err.message || err)); } finally { syncHGo(false); }
  });

  /* ---------- creator fees: pump.fun pays the coin's creator on every trade; claim or forward them ---------- */
  const PUMP_ID = new W3.PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');
  let RENT0 = 0; // rent-exempt minimum of an empty account: always stays in the fee vault (read live)
  let feeLamports = 0, feeBusy = false;
  const creatorVault = (pk) => W3.PublicKey.findProgramAddressSync([new TextEncoder().encode('creator-vault'), pk.toBytes()], PUMP_ID)[0];
  function syncFee() {
    const g = $('#feeGo'); const to = $('#feeTo').value.trim();
    g.disabled = feeBusy || (!!wallet && feeLamports <= 0);
    g.textContent = feeBusy ? 'Working…' : !wallet ? 'Connect wallet' : feeLamports <= 0 ? 'Nothing to claim yet' : to ? `Claim & send ${(feeLamports / 1e9).toFixed(4)} SOL` : `Claim ${(feeLamports / 1e9).toFixed(4)} SOL`;
  }
  async function loadFees() {
    if (!wallet) { feeLamports = 0; $('#feeAmt').textContent = '—'; $('#feeUsd').textContent = ''; $('#feeMeta').textContent = 'Connect your wallet to see your fees.'; return syncFee(); }
    if ($('#feeAmt').textContent === '—') $('#feeMeta').textContent = 'Checking your fees…';
    try {
      if (!RENT0) RENT0 = await rpcCall('getMinimumBalanceForRentExemption', [0]) || 890880;
      const info = await rpcCall('getAccountInfo', [creatorVault(wallet).toBase58(), { encoding: 'base64', dataSlice: { offset: 0, length: 0 }, commitment: 'confirmed' }]);
      feeLamports = Math.max(0, (info?.value?.lamports || 0) - RENT0);
      $('#feeAmt').textContent = `${(feeLamports / 1e9).toFixed(4)} SOL`; $('#feeUsd').textContent = solUsd ? `≈ ${fmt$(feeLamports / 1e9 * solUsd)}` : '';
      const me = wallet.toBase58(), mineBiz = coins().filter((b) => b.coin.creator === me).length, mineH = HEISTS.mine.filter((h) => h.status === 'launched').length;
      $('#feeMeta').textContent = mineBiz + mineH ? `You created ${mineBiz + mineH} Heistpad coin${mineBiz + mineH > 1 ? 's' : ''}. Fees from all your pump.fun coins are claimed together.` : 'No coins launched from this wallet yet. Launch one and every trade pays you.';
    } catch (_) { $('#feeMeta').textContent = 'Could not read your fees right now. Try again in a moment.'; }
    syncFee();
  }
  $('#feeTo').addEventListener('input', syncFee);
  $('#feeGo').addEventListener('click', async () => {
    if (!wallet) return connectWallet();
    if (feeBusy || feeLamports <= 0) return;
    const toStr = $('#feeTo').value.trim(); let to = null;
    if (toStr) { try { to = new W3.PublicKey(toStr); } catch (_) { return toast('That wallet address is not valid'); } if (to.equals(wallet)) to = null; }
    feeBusy = true; syncFee();
    try {
      const r = await fetch('https://pumpportal.fun/api/trade-local', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ publicKey: wallet.toBase58(), action: 'collectCreatorFee', priorityFee: 0.0001, pool: 'pump' }) });
      if (r.status !== 200) throw new Error(`pump.fun didn't return a claim (${r.status}). Try again.`);
      let tx = W3.VersionedTransaction.deserialize(new Uint8Array(await r.arrayBuffer()));
      const luts = await Promise.all(tx.message.addressTableLookups.map(async (l) => {
        const info = await rpcCall('getAddressLookupTable', [l.accountKey.toBase58()]);
        return new W3.AddressLookupTableAccount({ key: l.accountKey, state: W3.AddressLookupTableAccount.deserialize(Uint8Array.from(atob(info.value.data[0]), (c) => c.charCodeAt(0))) });
      }));
      const msg = W3.TransactionMessage.decompile(tx.message, { addressLookupTableAccounts: luts });
      if (msg.payerKey.toBase58() !== wallet.toBase58()) throw new Error('Unexpected claim transaction. Nothing was sent.');
      if (to) { msg.instructions.push(W3.SystemProgram.transfer({ fromPubkey: wallet, toPubkey: to, lamports: feeLamports })); tx = new W3.VersionedTransaction(msg.compileToV0Message(luts)); }
      const sig = await signAndSend(tx, { kind: 'claim' });
      toast(to ? `Claimed and sent to ${shortCa(to.toBase58())}` : 'Fees claimed to your wallet', 6000);
      for (let i = 0; i < 10; i++) { await new Promise((res) => setTimeout(res, 2000)); const st = await rpcCall('getSignatureStatuses', [[sig]]); if (st?.value?.[0]?.confirmationStatus) break; }
    } catch (err) {
      const m = String(err?.message || err); toast(/reject|cancel|denied|declined/i.test(m) ? 'Cancelled in your wallet. Nothing was sent.' : m, 8000);
    } finally { feeBusy = false; await loadFees(); }
  });
  window.addEventListener('hp:wallet', () => { syncHGo(); loadHeists().then(loadFees); });
  window.addEventListener('hp:launched', () => { loadHeists().then(loadFees); });
  renderPlats(); renderHeists(); syncFee();
  loadHeists(); setInterval(() => { if (!document.hidden) loadHeists(); }, 30000);

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
    const op = e.target.closest('[data-open]');
    if (op) { e.preventDefault(); const u = encodeURIComponent(location.href), ref = encodeURIComponent(location.origin);
      location.href = op.dataset.open === 'solflare' ? `https://solflare.com/ul/v1/browse/${u}?ref=${ref}` : `https://phantom.app/ul/browse/${u}?ref=${ref}`; return; }
    if (e.target.closest('[data-copy-link]')) navigator.clipboard?.writeText(location.href).then(() => { e.target.textContent = 'Link copied ✓'; });
  });
})();
