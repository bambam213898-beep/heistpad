/* Heistpad — GTA VI launchpad: heist coins, business coins, live tokenized $TTWO Vault. */
(() => {
  const TTWO_MINT = 'TTWofwAge91oFhZs7kpQdyrVRkmevgM88xijGvQFbKo';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- Leonida regions (the six Rockstar has named) ---------- */
  const REGIONS = [
    { id: 'vice', name: 'Vice City' }, { id: 'keys', name: 'Leonida Keys' }, { id: 'grass', name: 'Grassrivers' },
    { id: 'gellhorn', name: 'Port Gellhorn' }, { id: 'ambrosia', name: 'Ambrosia' }, { id: 'kalaga', name: 'Mount Kalaga' }, { id: 'other', name: 'Elsewhere in Leonida' },
  ];
  // Every live coin is a slot: a heist or a business that a player found in the game, verified, then launched.
  const BIZ = [];

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
  const regionName = (rid) => (REGIONS.find((r) => r.id === rid) || { name: 'Leonida' }).name;
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

  /* ---------- stats / lists ---------- */
  let sortBy = 'new';
  // what a coin is: look it up on the heist/business board by its mint
  const meta = (b) => { const h = HEISTS.board.find((x) => x.mint === b.coin.ca); return h ? { kind: h.kind, label: h.kind === 'business' ? `Business · ${h.regionName || 'Leonida'}` : `Heist · by ${h.gamertag}`, name: h.heist } : { kind: 'legacy', label: 'Early Heistpad coin', name: b.coin.name }; };
  const bizList = () => HEISTS.board.filter((h) => h.kind === 'business');
  function renderAll() {
    const cs = coins();
    $('#bizCount').textContent = bizList().length;
    $('#stCoins').textContent = cs.length;
    $('#stOpen').textContent = bizList().length;

    const sorted = [...cs].sort((a, b) => sortBy === 'new' ? b.coin.born - a.coin.born : sortBy === 'heat' ? b.coin.vol - a.coin.vol : b.coin.cap - a.coin.cap);
    $('#cards').innerHTML = !cs.length ? `<div class="empty"><b>No coins yet.</b><span>Prove a heist or add a business you found in Leonida. Once it's verified, you launch its coin.</span><button type="button" class="btn primary" data-heist-submit>Submit proof →</button></div>` : sorted.slice(0, 12).map((b) => { const m = meta(b); return `
      <article class="card" data-biz="${b.id}">
        <div class="c-top">${avatar(b.coin)}<div><h4>${esc(m.name)}${b.coin.mine ? ' <span class="yours">YOURS</span>' : ''}</h4><small>$${esc(b.coin.tick)}</small></div><span class="c-age">${ago(b.coin.born)}</span></div>
        <div class="c-biz">${esc(m.label)}</div>
        <div class="c-mid"><span class="c-cap">${fmt$(b.coin.cap)}</span>${stars(b.coin.vol)}</div>
        <div class="bar" title="Bonding curve progress"><i style="width:${Math.max(3, (b.coin.progress || 0) * 100)}%"></i></div>
        <div class="prog">${b.coin.complete ? 'Graduated <span class="grad">LIVE ON DEX</span>' : `${((b.coin.progress || 0) * 100).toFixed(1)}% to graduation`}</div>
        <div class="c-bot"><a class="btn primary" href="${pumpUrl(b.coin.ca)}" target="_blank" rel="noopener">Buy on pump.fun</a><button class="cp" data-copy="${b.coin.ca}">${shortCa(b.coin.ca)}</button></div>
      </article>`; }).join('');

    const emptyLi = '<li class="empty-li"><span>Nobody yet. Could be you.<small>Launch a coin to take the top spot</small></span><b>—</b></li>';
    $('#bizBoard').innerHTML = !cs.length ? emptyLi : [...cs].sort((a, b) => b.coin.cap - a.coin.cap).slice(0, 6).map((b) => { const m = meta(b); return `<li><span>${esc(m.name)}<small>$${esc(b.coin.tick)} · ${esc(m.label)}</small></span><b>${fmt$(b.coin.cap)}</b></li>`; }).join('');
    $('#crewBoard').innerHTML = !cs.length ? emptyLi : [...cs].sort((a, b) => b.coin.vol - a.coin.vol).slice(0, 6).map((b) => `<li><span>$${esc(b.coin.tick)}<small>${stars(b.coin.vol)}</small></span><b>${fmt$(b.coin.vol * 310)} vol</b></li>`).join('');
    renderDir();
  }
  $('#sortTabs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-sort]'); if (!b) return;
    sortBy = b.dataset.sort; $$('#sortTabs button').forEach((x) => x.classList.toggle('on', x === b)); renderAll();
  });

  /* ---------- businesses: added by players from the real game, by Leonida region ---------- */
  let dirRegion = 'all', dirQuery = '';
  function renderFilters() {
    const n = (rid) => bizList().filter((b) => rid === 'all' || b.region === rid).length;
    $('#regionFilters').innerHTML = [{ id: 'all', name: 'All' }, ...REGIONS].map((r) => `<button type="button" data-r="${r.id}" class="${r.id === dirRegion ? 'on' : ''}">${r.name}<small>${n(r.id)}</small></button>`).join('');
  }
  function renderDir() {
    renderFilters();
    const q = dirQuery.trim().toLowerCase(), all = bizList();
    const list = all.filter((b) => (dirRegion === 'all' || b.region === dirRegion) && (!q || `${b.heist} ${b.regionName} ${b.ticker} ${b.gamertag}`.toLowerCase().includes(q)))
      .sort((a, b) => (!!b.mint - !!a.mint) || (b.mcapUsd || 0) - (a.mcapUsd || 0) || a.heist.localeCompare(b.heist));
    const me = wallet ? wallet.toBase58() : '';
    $('#bizGrid').innerHTML = !all.length
      ? `<div class="hs-empty"><b>No businesses added yet.</b><span>Found a business in Leonida? Add it with a screenshot. Once it's verified, you launch its coin.</span><button type="button" class="btn primary" data-heist-submit="business">Add a business →</button></div>`
      : !list.length ? '<p class="bz-none">No businesses match that.</p>' : list.map((b) => {
        const mine = HEISTS.mine.find((x) => x.id === b.id);
        return `
      <div class="bz">
        <div class="bz-top"><div><h4>${esc(b.heist)}</h4><small>${esc(b.regionName || 'Leonida')} · added by ${esc(b.gamertag)}</small></div>${b.mint ? '<span class="st-taken">COIN LIVE</span>' : '<span class="st-open">VERIFIED</span>'}</div>
        ${b.mint
          ? `<div class="bz-coin">${b.image ? `<div class="av" style="background-image:url(${gw(b.image)})"></div>` : ''}<b>$${esc(b.ticker)}</b><span style="color:var(--mut)">${fmt$(b.mcapUsd || 0)}</span></div><div class="bz-bot"><a class="btn ghost" href="${pumpUrl(b.mint)}" target="_blank" rel="noopener">Buy $${esc(b.ticker)}</a></div>`
          : mine && mine.status === 'approved' ? `<div class="bz-bot"><button type="button" class="btn primary" data-heist-launch="${b.id}">Launch $${esc(b.ticker)} →</button></div>`
          : `<div class="bz-coin"><b>$${esc(b.ticker)}</b><span style="color:var(--mut)">launching soon</span></div>`}
      </div>`; }).join('');
  }
  $('#regionFilters').addEventListener('click', (e) => { const b = e.target.closest('[data-r]'); if (!b) return; dirRegion = b.dataset.r; renderDir(); });
  $('#bizSearch').addEventListener('input', (e) => { dirQuery = e.target.value; renderDir(); });

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
    const biz = !!h && h.kind === 'business';
    $('#lfKick').textContent = h ? (biz ? 'BUSINESS VERIFIED' : 'HEIST VERIFIED') : 'PULL A JOB';
    $('#lfTitle').textContent = h ? (biz ? 'Launch your business coin' : 'Launch your heist coin') : 'Launch a coin';
    const n = $('#lfHeistNote'); n.hidden = !h;
    if (h) n.innerHTML = `${biz ? `${esc(h.regionName || 'Leonida')} · found` : 'Completed'} by <b>${esc(h.gamertag)}</b> on ${esc(h.platformLabel)}. The ${biz ? 'business' : 'heist'} name is the coin name and <b>$${esc(h.ticker)}</b> is the ticker.`;
  }
  window.hpLaunchHeist = (h) => {
    $('#launchForm').reset(); imgData = null; imgFile = null; setErr(''); setSteps(null); setMode(h); syncGo();
    $('#lfName').value = h.heist.slice(0, 32); $('#lfTick').value = h.ticker;
    $('#lfImgTxt').textContent = 'Coin image (optional: uses your screenshot if empty)';
    modal.hidden = false;
  };
  function openLaunch() { window.hpOpenSubmit?.('business'); }
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
    if (coins().some((x) => x.coin.tick.toUpperCase() === tick)) return setErr(`$${tick} is already taken. Try another ticker.`);
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
    $('#psTxt').textContent = p.heist ? `${p.name || 'Your coin'} · $${p.symbol} is live on pump.fun · creator fees are yours` : `${b ? b.name : 'Your business'} is yours · $${p.symbol} is live on pump.fun · + RESPECT`;
    $('#passed').hidden = false; sfx.passed(); flashStars(); hud();
    window.dispatchEvent(new Event('hp:launched'));
    setTimeout(() => document.getElementById(p.heist ? 'heists' : 'coins')?.scrollIntoView({ behavior: 'smooth' }), 400);
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

  $('[data-close-passed]').onclick = () => { $('#passed').hidden = true; };

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
  ['heists', 'coins', 'jobs', 'fees', 'vault', 'drop'].forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });

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

  // live activity: each poll compares a coin's SOL in its bonding curve with the last poll
  const events = [];
  function pushEvent(b, buy, sol) {
    events.push(Date.now());
    const ev = document.createElement('div'); ev.className = 'ev';
    ev.innerHTML = `${avatar(b.coin)}<div><span>someone</span> <b class="${buy ? 'buy' : 'sell'}">${buy ? 'bought' : 'sold'} ${sol.toFixed(sol < 1 ? 3 : 2)} SOL</b><br><b>$${esc(b.coin.tick)}</b> <span>· ${esc(b.name)}</span></div>`;
    const f = $('#feed'); f.querySelector('.feed-empty')?.remove(); f.prepend(ev);
    while (f.children.length > 5) f.removeChild(f.lastElementChild);
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
        let b = BIZ.find((x) => x.id === c.bizId); if (!b) { b = { id: c.bizId, name: c.name || c.symbol, coin: null }; BIZ.push(b); } seen.add(b.id);
        const prev = b.coin, delta = lastVSol.has(c.mint) && c.vSol != null ? c.vSol - lastVSol.get(c.mint) : 0;
        b.coin = { name: c.name || c.symbol, tick: c.symbol, cap: c.mcapUsd || 0, vol: (prev?.vol || 0) + Math.abs(delta) * 10 + (prev ? 0 : Math.min(40, (c.realSol || 0) * 4)), ca: c.mint, color: hashColor(c.mint), born: c.createdAt, img: c.image ? ipfsImg(c.image) : null, progress: c.progress, complete: c.complete, creator: c.creator, mine: wallet && c.creator === wallet.toBase58() };
        if (c.vSol != null) lastVSol.set(c.mint, c.vSol);
        if (!firstLoad && Math.abs(delta) > 0.001) pushEvent(b, delta > 0, Math.abs(delta));
      }
      for (let i = BIZ.length - 1; i >= 0; i--) if (!seen.has(BIZ[i].id)) BIZ.splice(i, 1);
      firstLoad = false; renderAll(); hud(true);
    } catch (_) { /* API unreachable: keep what we have */ }
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
  // Ticker choices, same rules as the API: the name, its key word, or an abbreviation (letters in order from the name)
  const STOPW = new Set(['THE', 'A', 'AN', 'OF', 'AND']);
  const words = (n) => String(n).toUpperCase().replace(/[^A-Z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
  const tickerOptions = (n) => {
    const w = words(n), sig = w.filter((x) => !STOPW.has(x)), out = [];
    const add = (t, why) => { if (t && t.length >= 2 && t.length <= 10 && !out.some((o) => o.t === t)) out.push({ t, why }); };
    add(sig.join(''), 'Full name'); add(w.join(''), 'Full name'); add(sig[0], 'Key word');
    if (sig.length > 1) add(sig[0] + sig.slice(1).map((x) => x[0]).join(''), 'Word + initials');
    add(sig.map((x) => x[0]).join(''), 'Initials'); add(w.map((x) => x[0]).join(''), 'Initials'); add(sig[sig.length - 1], 'Last word');
    if (!out.length && sig[0]) out.push({ t: sig[0].slice(0, 10), why: 'Short' });
    return out;
  };
  const fitsName = (t, n) => { const src = words(n).join(''); let i = 0; for (const ch of t) { i = src.indexOf(ch, i); if (i < 0) return false; i++; } return true; };
  let pickedTick = '';
  const tickerOf = () => pickedTick;
  function renderTickPick() {
    const name = $('#hfHeist').value, opts = tickerOptions(name), own = $('#hfTickOwn').value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    $('#hfTickWrap').hidden = !opts.length;
    if (!own && !opts.some((o) => o.t === pickedTick)) pickedTick = opts[0]?.t || '';
    $('#hfTickOpts').innerHTML = opts.map((o) => `<button type="button" data-tick="${o.t}" class="${o.t === pickedTick ? 'on' : ''}">$${o.t}<small>${o.why}</small></button>`).join('');
    $('#hfTick').textContent = pickedTick ? `$${pickedTick}` : '$—';
  }
  $('#hfTickOpts').addEventListener('click', (e) => { const b = e.target.closest('[data-tick]'); if (!b) return; pickedTick = b.dataset.tick; $('#hfTickOwn').value = ''; renderTickPick(); });
  $('#hfTickOwn').addEventListener('input', (e) => {
    const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10); e.target.value = v;
    if (v.length >= 2 && fitsName(v, $('#hfHeist').value)) { pickedTick = v; hErr(''); } else if (v) { pickedTick = ''; }
    renderTickPick(); if (v.length >= 2 && !pickedTick) $('#hfTick').textContent = 'use letters from the name, in order';
  });
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
  $('#hfHeist').addEventListener('input', () => { $('#hfTickOwn').value = ''; renderTickPick(); });
  function renderHeists() {
    const { board, mine } = HEISTS;
    const heists = board.filter((h) => h.kind !== 'business');
    $('#stHeists').textContent = heists.length;
    renderAll(); hud();
    const box = $('#hsMine'); box.hidden = !wallet || !mine.length;
    if (!box.hidden) box.innerHTML = `<h3>Your submissions</h3>` + mine.map((h) => `<div class="hm-row"><img src="${esc(gw(h.image || h.proof))}" alt="" loading="lazy"><div class="hm-t"><b>${esc(h.heist)} <span class="tk" style="color:var(--gold);font-family:JetBrains Mono">$${esc(h.ticker)}</span></b><small>${h.kind === 'business' ? `Business · ${esc(h.regionName || 'Leonida')}` : 'Heist'} · ${esc(h.gamertag)} · ${esc(h.platformLabel)}</small></div><span class="chip ${h.status}">${STATUS[h.status] || h.status}</span>${
      h.status === 'approved' && h.taken ? `<span class="hm-why" style="width:auto;color:var(--mut)">Another crew launched $${esc(h.ticker)} first</span>` :
      h.status === 'approved' ? `<button type="button" class="btn pink sm" data-heist-launch="${h.id}">Launch $${esc(h.ticker)} →</button>` :
      h.status === 'launched' && h.mint ? `<a class="btn ghost sm" href="${pumpUrl(h.mint)}" target="_blank" rel="noopener">View on pump.fun</a>` :
      h.status === 'rejected' ? `<button type="button" class="btn ghost sm" data-heist-submit="${h.kind}">Send new proof</button>` : ''}${h.status === 'rejected' && h.reason ? `<div class="hm-why">Why: ${esc(h.reason)}</div>` : ''}${h.status === 'pending' ? '<div class="hm-why" style="color:var(--mut)">The crew is checking your proof. This page updates by itself.</div>' : ''}</div>`).join('');
    $('#hsBoard').innerHTML = !heists.length ? `<div class="hs-empty"><b>No verified heists yet.</b><span>GTA VI is out. Be the first crew to prove a heist and launch its ticker.</span><button type="button" class="btn pink" data-heist-submit>Submit heist proof →</button></div>` : heists.map((h) => `
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
  let subKind = 'heist';
  function setKind(k) {
    subKind = k === 'business' ? 'business' : 'heist'; const biz = subKind === 'business';
    $$('#hfKind button').forEach((b) => b.classList.toggle('on', b.dataset.kind === subKind));
    $('#hfTitle').textContent = biz ? 'Add a business' : 'Submit proof';
    $('#hfNameL').firstChild.textContent = biz ? 'Business name ' : 'Heist name ';
    $('#hfHeist').placeholder = biz ? 'e.g. the sign on the storefront' : 'e.g. The Jewelry Store Job';
    $('#hfRegL').hidden = !biz;
    if (!proofFile) $('#hfProofTxt').textContent = biz ? 'Screenshot of the business in the game, name readable (required)' : 'Completion screen or trophy/achievement unlock (required)';
    $('#hfFine').textContent = biz ? 'Your screenshot, the business and your gamertag are shown publicly once verified. Only real places from GTA VI get approved. Submitting is free.' : 'Your screenshot, heist and gamertag are shown publicly on the Heist Board once verified. Fake or edited proof gets rejected. Submitting is free.';
  }
  function openHeist(kind) {
    $('#heistForm').reset(); proofFile = null; pickedTick = ''; renderTickPick(); hErr(''); renderPlats();
    $('#hfReg').innerHTML = '<option value="">Pick a region</option>' + REGIONS.map((r) => `<option value="${r.id}">${r.name}</option>`).join('');
    setKind(kind); syncHGo(); hModal.hidden = false; setTimeout(() => $('#hfHeist').focus(), 50);
  }
  window.hpOpenSubmit = openHeist;
  $('#hfKind').addEventListener('click', (e) => { const b = e.target.closest('[data-kind]'); if (b) setKind(b.dataset.kind); });
  document.addEventListener('click', (e) => {
    const sub = e.target.closest('[data-heist-submit]'); if (sub) { e.preventDefault(); openHeist(sub.dataset.heistSubmit || 'heist'); return; }
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
    const biz = subKind === 'business', what = biz ? 'business' : 'heist', region = $('#hfReg').value;
    if (heist.length < 3) return hErr(`Type the ${what} name exactly as it shows in the game.`);
    if (biz && !region) return hErr('Pick the region the business is in.');
    if (!pickedTick) return hErr($('#hfTickOwn').value ? `Your ticker has to use letters from the ${what} name, in order.` : `The ${what} name needs at least 2 letters or numbers.`);
    if (!p || p.soon) return hErr('Pick the platform you played on.');
    if (!gt) return hErr(`Add your ${p.idName}.`);
    if (!proofFile) return hErr(biz ? 'Add a screenshot of the business in the game.' : 'Add a screenshot of the heist completion screen or the trophy/achievement.');
    if (clip && !/^https:\/\//.test(clip)) return hErr('Clip links must start with https://');
    const fd = new FormData();
    Object.entries({ wallet: wallet.toBase58(), kind: subKind, region: biz ? region : '', heist, ticker: pickedTick, platform: plat, gamertag: gt, rockstarId: $('#hfRid').value.trim(), clip, note: $('#hfNote').value.trim() }).forEach(([k, v]) => fd.append(k, v));
    fd.append('proof', proofFile, proofFile.name);
    syncHGo(true); hErr('');
    try {
      const r = await fetch(`${API}/api/heist/submit`, { method: 'POST', body: fd }); const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Could not send your proof');
      hModal.hidden = true; await loadHeists();
      toast(j.heist.status === 'approved' ? `Verified! You can launch $${j.heist.ticker} now.` : `Sent. The crew is checking ${j.heist.heist}. You'll see the Launch button here once it's verified.`, 7000);
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
      const me = wallet.toBase58(), mineBiz = coins().filter((b) => b.coin.creator === me).length, mineH = 0;
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
