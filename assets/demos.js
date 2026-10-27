/* Interactive demos for read.html.
   Each <div class="demo" data-demo="name"></div> is mounted by the matching function below.
   Motion only happens when the reader presses Play or Step. */
(function () {
  'use strict';
  const S = window.Study;
  const esc = S.esc;
  const T = ['var(--t0)', 'var(--t1)', 'var(--t2)', 'var(--t3)'];
  const tc = k => T[k % 4];
  let uid = 0;

  /* ---------- shared building blocks ---------- */
  function shell(root, title, sub) {
    root.innerHTML =
      '<div class="demo-head"><span class="demo-title">' + esc(title) + '</span>' +
      (sub ? '<span class="demo-sub">' + sub + '</span>' : '') + '</div>' +
      '<div class="demo-modes"></div><div class="demo-stage"></div>' +
      '<div class="demo-controls"></div><p class="demo-readout" aria-live="polite"></p>';
    return {
      modes: root.querySelector('.demo-modes'),
      stage: root.querySelector('.demo-stage'),
      controls: root.querySelector('.demo-controls'),
      readout: root.querySelector('.demo-readout')
    };
  }

  function btn(label, onClick, cls) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'demo-btn' + (cls ? ' ' + cls : ''); b.textContent = label;
    b.addEventListener('click', onClick);
    return b;
  }

  /* Segmented choice: [[value, label], ...]. Appends to host (several groups can share a host). */
  function modes(host, options, current, onChange) {
    const group = document.createElement('div');
    group.className = 'demo-seg';
    group.setAttribute('role', 'group');
    options.forEach(o => {
      const b = btn(o[1], () => {
        group.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        onChange(o[0]);
      }, 'seg');
      b.setAttribute('aria-pressed', String(o[0] === current));
      group.appendChild(b);
    });
    host.appendChild(group);
    return group;
  }

  /* Play/Pause + Step + Reset. step() returns false when there is nothing more to do. */
  function transport(host, step, reset, ms) {
    let timer = null;
    const play = btn('Play', () => (timer ? stop() : start()), 'primary');
    const stepB = btn('Step', () => { stop(); step(); });
    const resetB = btn('Reset', () => { stop(); reset(); });
    function start() {
      if (step() === false) { reset(); step(); }
      timer = setInterval(() => { if (step() === false) stop(); }, ms);
      play.textContent = 'Pause';
    }
    function stop() { if (timer) clearInterval(timer); timer = null; play.textContent = 'Play'; }
    host.append(play, stepB, resetB);
    return { stop: stop };
  }

  function slider(host, label, min, max, value, onInput, fmt) {
    const id = 'sl' + (++uid);
    const wrap = document.createElement('label');
    wrap.className = 'demo-slider'; wrap.htmlFor = id;
    wrap.innerHTML = '<span>' + esc(label) + ' <strong></strong></span><input type="range" id="' + id + '" min="' + min + '" max="' + max + '" value="' + value + '">';
    const out = wrap.querySelector('strong'), input = wrap.querySelector('input');
    const show = () => { out.textContent = fmt ? fmt(Number(input.value)) : input.value; };
    input.addEventListener('input', () => { show(); onInput(Number(input.value)); });
    show(); host.appendChild(wrap);
    return input;
  }

  function check(host, label, value, onChange) {
    const lbl = document.createElement('label'); lbl.className = 'demo-check';
    lbl.innerHTML = '<input type="checkbox"' + (value ? ' checked' : '') + '> ' + esc(label);
    lbl.querySelector('input').addEventListener('change', e => onChange(e.target.checked));
    host.appendChild(lbl);
  }

  function svg(w, h, body, label) {
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(label || '') + '" font-family="var(--font)" font-size="13">' + body + '</svg>';
  }
  const txt = (x, y, s, attrs) => '<text x="' + x + '" y="' + y + '" ' + (attrs || '') + '>' + esc(s) + '</text>';
  const rect = (x, y, w, h, fill, extra) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="5" fill="' + fill + '" ' + (extra || '') + '/>';
  function arrowDefs(id, color) {
    return '<defs><marker id="' + id + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="' + color + '"/></marker></defs>';
  }

  /* =====================================================================
     7. rdt3.0 (alternating-bit protocol) scenarios
     ===================================================================== */
  function rdt3(root) {
    const ui = shell(root, 'rdt3.0 in operation', 'The four textbook cases. Time runs downward; each step adds one packet.');
    /* [label, from 's'|'r', t0, t1, lost, senderNote, receiverNote] */
    const SC = {
      none: { msgs: [
        ['pkt0', 's', 0, 1, false, 'send pkt0', 'rcv pkt0, send ack0'],
        ['ack0', 'r', 1, 2, false, 'rcv ack0, send pkt1', ''],
        ['pkt1', 's', 2, 3, false, '', 'rcv pkt1, send ack1'],
        ['ack1', 'r', 3, 4, false, 'rcv ack1, send pkt0', ''],
        ['pkt0', 's', 4, 5, false, '', 'rcv pkt0, send ack0'],
        ['ack0', 'r', 5, 6, false, 'rcv ack0', '']],
        timers: [], end: 'No loss: each packet is ACKed and the sender alternates 0, 1, 0.' },
      pkt: { msgs: [
        ['pkt0', 's', 0, 1, false, 'send pkt0', 'rcv pkt0, send ack0'],
        ['ack0', 'r', 1, 2, false, 'rcv ack0, send pkt1', ''],
        ['pkt1', 's', 2, 2.7, true, '', ''],
        ['pkt1', 's', 4.4, 5.4, false, 'timeout, resend pkt1', 'rcv pkt1, send ack1'],
        ['ack1', 'r', 5.4, 6.4, false, 'rcv ack1, send pkt0', ''],
        ['pkt0', 's', 6.4, 7.4, false, '', 'rcv pkt0, send ack0']],
        timers: [[2, 4.4]], end: 'pkt1 was lost; the timer expired and the sender retransmitted the same pkt1.' },
      ack: { msgs: [
        ['pkt0', 's', 0, 1, false, 'send pkt0', 'rcv pkt0, send ack0'],
        ['ack0', 'r', 1, 2, false, 'rcv ack0, send pkt1', ''],
        ['pkt1', 's', 2, 3, false, '', 'rcv pkt1, send ack1'],
        ['ack1', 'r', 3, 3.7, true, '', ''],
        ['pkt1', 's', 4.4, 5.4, false, 'timeout, resend pkt1', 'rcv pkt1 (duplicate), send ack1'],
        ['ack1', 'r', 5.4, 6.4, false, 'rcv ack1, send pkt0', ''],
        ['pkt0', 's', 6.4, 7.4, false, '', 'rcv pkt0, send ack0']],
        timers: [[2, 4.4]], end: 'The ACK was lost. The receiver gets pkt1 twice, recognizes the repeated sequence number, and re-ACKs without delivering it again.' },
      early: { msgs: [
        ['pkt0', 's', 0, 1, false, 'send pkt0', 'rcv pkt0, send ack0'],
        ['ack0', 'r', 1, 2, false, 'rcv ack0, send pkt1', ''],
        ['pkt1', 's', 2, 3, false, '', 'rcv pkt1, send ack1'],
        ['ack1', 'r', 3, 4.9, false, '', ''],
        ['pkt1', 's', 4.3, 5.3, false, 'timeout, resend pkt1', 'rcv pkt1 (duplicate), send ack1'],
        ['pkt0', 's', 4.9, 5.9, false, 'rcv ack1, send pkt0', 'rcv pkt0, send ack0'],
        ['ack1', 'r', 5.3, 6.4, false, 'rcv ack1 (ignore)', ''],
        ['ack0', 'r', 5.9, 7.0, false, 'rcv ack0', '']],
        timers: [[2, 4.3]], end: 'Premature timeout: the ACK was only slow. The duplicate pkt1 is discarded by the receiver and the extra ack1 is ignored by the sender. Correct, just wasteful.' }
    };
    let mode = 'pkt', s = 0;
    const id = 'rdt' + (++uid);
    function render() {
      const sc = SC[mode], W = 680, XS = 250, XR = 430, Y0 = 40, U = 44;
      const tmax = Math.max.apply(null, sc.msgs.map(m => m[3])) + 0.6;
      const yAt = t => Y0 + t * U;
      let b = arrowDefs(id, 'var(--accent)') + arrowDefs(id + 'k', 'var(--ok)');
      b += txt(XS, 22, 'sender', 'text-anchor="middle" font-weight="700" fill="var(--ink)"') + txt(XR, 22, 'receiver', 'text-anchor="middle" font-weight="700" fill="var(--ink)"');
      b += '<line x1="' + XS + '" x2="' + XS + '" y1="' + Y0 + '" y2="' + yAt(tmax) + '" stroke="var(--ink-2)" stroke-width="2"/>';
      b += '<line x1="' + XR + '" x2="' + XR + '" y1="' + Y0 + '" y2="' + yAt(tmax) + '" stroke="var(--ink-2)" stroke-width="2"/>';
      const shown = sc.msgs.slice(0, s);
      sc.timers.forEach(tm => {
        const vis = shown.some(m => m[2] >= tm[1] - 0.01);
        if (!vis) return;
        b += '<line x1="' + (XS - 12) + '" x2="' + (XS - 12) + '" y1="' + yAt(tm[0]) + '" y2="' + yAt(tm[1]) + '" stroke="var(--t3)" stroke-width="3"/>';
        b += txt(XS - 18, yAt((tm[0] + tm[1]) / 2) + 4, 'timer', 'text-anchor="end" font-size="11" fill="var(--t3)" font-weight="700"');
      });
      shown.forEach((m, k) => {
        const fromS = m[1] === 's', x1 = fromS ? XS : XR, x2full = fromS ? XR : XS;
        const frac = m[4] ? 0.55 : 1, x2 = x1 + (x2full - x1) * frac, y1 = yAt(m[2]), y2 = y1 + (yAt(m[3]) - y1) * (m[4] ? 1 : 1);
        const col = fromS ? 'var(--accent)' : 'var(--ok)', cur = k === s - 1;
        b += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + col + '" stroke-width="' + (cur ? 2.8 : 1.6) + '"' + (m[4] ? '' : ' marker-end="url(#' + id + (fromS ? '' : 'k') + ')"') + '/>';
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        b += txt(mx, my - 5, m[0], 'text-anchor="middle" font-size="12" font-weight="700" font-family="var(--mono)" fill="' + col + '"');
        if (m[4]) b += txt(x2 + 4, y2 + 5, '✕ loss', 'font-size="12" font-weight="700" fill="var(--bad)"');
        if (m[5]) b += txt(XS - 20, (fromS ? y1 : y2) + 4, m[5], 'text-anchor="end" font-size="11.5" fill="var(--ink)"');
        if (m[6]) b += txt(XR + 10, (fromS ? y2 : y1) + 4, m[6], 'font-size="11.5" fill="var(--ink)"');
      });
      ui.stage.innerHTML = svg(W, yAt(tmax) + 10, b, 'Sender-receiver timeline for rdt3.0');
      ui.readout.textContent = s === 0 ? 'Press Play or Step.' : s < sc.msgs.length ? 'Packet ' + s + ' of ' + sc.msgs.length + '.' : sc.end;
    }
    modes(ui.modes, [['none', 'No loss'], ['pkt', 'Packet lost'], ['ack', 'ACK lost'], ['early', 'Premature timeout']], mode, v => { mode = v; s = 0; ctl.stop(); render(); });
    const ctl = transport(ui.controls, () => { const n = SC[mode].msgs.length; if (s >= n) return false; s++; render(); return s < n; }, () => { s = 0; render(); }, 1100);
    render();
  }

  /* =====================================================================
     8. Sender utilization: stop-and-wait vs pipelining
     ===================================================================== */
  function util(root) {
    const ui = shell(root, 'Sender utilization', '<code>U = N·(L/R) / (RTT + L/R)</code>, capped at 1. N = 1 is stop-and-wait.');
    let Lbytes = 1000, R = 1e9, rtt = 30, nPos = 0;
    const nOf = p => Math.max(1, Math.round(Math.pow(10, p / 25)));
    const fmtRate = r => r >= 1e9 ? (r / 1e9) + ' Gbps' : r >= 1e6 ? (r / 1e6) + ' Mbps' : (r / 1e3) + ' kbps';
    function fmtBits(bps) {
      if (bps >= 1e9) return (bps / 1e9).toFixed(2) + ' Gbps';
      if (bps >= 1e6) return (bps / 1e6).toFixed(2) + ' Mbps';
      return (bps / 1e3).toFixed(1) + ' kbps';
    }
    function render() {
      const L = Lbytes * 8, trans = L / R * 1000, N = nOf(nPos);
      const U = Math.min(1, N * trans / (rtt + trans));
      const full = Math.ceil((rtt + trans) / trans);
      const W = 680;
      let b = '';
      b += txt(14, 22, 'Fraction of time the sender is transmitting', 'font-size="12" fill="var(--ink-2)"');
      b += '<rect x="14" y="32" width="652" height="26" rx="6" fill="var(--rule)"/>';
      b += '<rect x="14" y="32" width="' + Math.max(2, 652 * U) + '" height="26" rx="6" fill="var(--accent)"/>';
      b += txt(14, 82, 'U = ' + (U < 0.001 ? U.toExponential(2) : U.toFixed(U < 0.1 ? 4 : 3)) + '  ·  throughput ≈ ' + fmtBits(U * R) + ' of ' + fmtRate(R), 'font-size="14" font-weight="700" fill="var(--ink)"');
      ui.stage.innerHTML = svg(W, 96, b, 'Utilization bar');
      ui.readout.textContent = 'L/R = ' + (trans < 0.01 ? (trans * 1000).toFixed(2) + ' μs' : trans.toFixed(3) + ' ms') + ', RTT = ' + rtt + ' ms, N = ' + N +
        '. U = ' + N + ' × ' + trans.toFixed(4) + ' / (' + rtt + ' + ' + trans.toFixed(4) + '). To keep the sender busy you need about ' + full.toLocaleString() + ' packets in flight.';
    }
    modes(ui.modes, [[1e7, '10 Mbps'], [1e8, '100 Mbps'], [1e9, '1 Gbps'], [1e10, '10 Gbps']], R, v => { R = v; render(); });
    slider(ui.controls, 'Packet L =', 1, 12, 1, v => { Lbytes = v * 1000; render(); }, v => (v * 1000).toLocaleString() + ' bytes');
    slider(ui.controls, 'RTT =', 1, 100, rtt, v => { rtt = v; render(); }, v => v + ' ms');
    slider(ui.controls, 'Window N =', 0, 100, 0, v => { nPos = v; render(); }, v => nOf(v).toLocaleString() + (nOf(v) === 1 ? ' packet' : ' packets'));
    render();
  }

  /* =====================================================================
     9. Go-Back-N vs Selective Repeat with one lost packet
     ===================================================================== */
  function gbnsr(root) {
    const ui = shell(root, 'Go-Back-N vs Selective Repeat', 'Window N = 4. Packet 2 is lost; everything else arrives.');
    /* snapshot: base, sent (highest sent+1), acked (SR individual), delivered (rcv), buffered, retx, text */
    const G = [
      { base: 0, next: 0, acked: [], del: [], buf: [], retx: 0, t: 'Start. The window covers 0–3; nothing is sent yet.' },
      { base: 0, next: 4, acked: [], del: [], buf: [], retx: 0, t: 'Send pkt0, pkt1, pkt2 (lost on the way) and pkt3. The window is full.' },
      { base: 0, next: 4, acked: [], del: [0], buf: [], retx: 0, t: 'Receiver gets pkt0: in order, so it delivers it and sends ack0.' },
      { base: 1, next: 5, acked: [], del: [0], buf: [], retx: 0, t: 'Sender gets ack0: the window slides to 1–4, so it sends pkt4.' },
      { base: 1, next: 5, acked: [], del: [0, 1], buf: [], retx: 0, t: 'Receiver gets pkt1: delivers it and sends ack1.' },
      { base: 2, next: 6, acked: [], del: [0, 1], buf: [], retx: 0, t: 'Sender gets ack1: the window slides to 2–5, so it sends pkt5.' },
      { base: 2, next: 6, acked: [], del: [0, 1], buf: [], retx: 0, t: 'Receiver gets pkt3, pkt4, pkt5: out of order (it expects 2). It discards each one and re-sends ack1.' },
      { base: 2, next: 6, acked: [], del: [0, 1], buf: [], retx: 0, t: 'Sender gets three duplicate ack1s and ignores them. Its single timer (for pkt2, the oldest unACKed) keeps running.' },
      { base: 2, next: 6, acked: [], del: [0, 1], buf: [], retx: 4, t: 'Timeout: go back and resend pkt2, pkt3, pkt4 and pkt5 (4 retransmissions, 3 of them already received once).' },
      { base: 6, next: 6, acked: [], del: [0, 1, 2, 3, 4, 5], buf: [], retx: 4, t: 'Receiver delivers 2, 3, 4, 5 in order; cumulative ack5 slides the sender window to 6–9.' }
    ];
    const SR = [
      { base: 0, next: 0, acked: [], del: [], buf: [], retx: 0, t: 'Start. The window covers 0–3; nothing is sent yet.' },
      { base: 0, next: 4, acked: [], del: [], buf: [], retx: 0, t: 'Send pkt0, pkt1, pkt2 (lost on the way) and pkt3. Each has its own timer.' },
      { base: 0, next: 4, acked: [], del: [0], buf: [], retx: 0, t: 'Receiver gets pkt0: delivers it and sends ack0.' },
      { base: 1, next: 5, acked: [0], del: [0], buf: [], retx: 0, t: 'Sender gets ack0: base was ACKed, so the window slides to 1–4 and it sends pkt4.' },
      { base: 1, next: 5, acked: [0], del: [0, 1], buf: [], retx: 0, t: 'Receiver gets pkt1: delivers it and sends ack1.' },
      { base: 2, next: 6, acked: [0, 1], del: [0, 1], buf: [], retx: 0, t: 'Sender gets ack1: the window slides to 2–5 and it sends pkt5.' },
      { base: 2, next: 6, acked: [0, 1], del: [0, 1], buf: [3, 4, 5], retx: 0, t: 'Receiver gets pkt3, pkt4, pkt5: inside its window, so it buffers each one and sends ack3, ack4, ack5.' },
      { base: 2, next: 6, acked: [0, 1, 3, 4, 5], del: [0, 1], buf: [3, 4, 5], retx: 0, t: 'Sender marks 3, 4, 5 as ACKed. pkt2 is still unACKed, so the window stays at 2–5.' },
      { base: 2, next: 6, acked: [0, 1, 3, 4, 5], del: [0, 1], buf: [3, 4, 5], retx: 1, t: 'pkt2\'s own timer expires: resend only pkt2 (1 retransmission).' },
      { base: 6, next: 6, acked: [0, 1, 2, 3, 4, 5], del: [0, 1, 2, 3, 4, 5], buf: [], retx: 1, t: 'Receiver gets pkt2, delivers 2 plus buffered 3–5, sends ack2. When ack2 arrives the sender window jumps to 6–9.' }
    ];
    let mode = 'gbn', s = 0;
    const steps = () => (mode === 'gbn' ? G : SR);
    function render() {
      const st = steps()[s], W = 680, X0 = 96, cw = 54, n = 10;
      let b = '';
      const row = (y, label) => txt(10, y + 22, label, 'font-weight="700" fill="var(--ink)"');
      b += row(30, 'sender');
      for (let i = 0; i < n; i++) {
        const x = X0 + i * cw;
        const ackedSR = st.acked.indexOf(i) >= 0;
        const acked = mode === 'gbn' ? i < st.base : ackedSR;
        const sent = i < st.next;
        const inWin = i >= st.base && i < st.base + 4;
        const fill = acked ? 'var(--ok)' : sent ? 'var(--t3)' : inWin ? 'var(--accent-soft)' : 'var(--paper)';
        b += '<rect x="' + (x + 2) + '" y="30" width="' + (cw - 4) + '" height="34" rx="5" fill="' + fill + '" stroke="' + (inWin ? 'var(--accent)' : 'var(--rule)') + '"/>';
        b += txt(x + cw / 2, 52, String(i), 'text-anchor="middle" font-weight="700" fill="' + (acked || sent ? 'var(--paper)' : 'var(--ink-2)') + '"');
        if (i === 2 && s >= 1 && s < 8) b += txt(x + cw / 2, 80, 'lost', 'text-anchor="middle" font-size="11" fill="var(--bad)" font-weight="700"');
      }
      b += '<path d="M' + (X0 + st.base * cw + 2) + ' 24 h' + (4 * cw - 4) + '" stroke="var(--accent)" stroke-width="3"/>';
      b += txt(X0 + st.base * cw + 2, 18, 'window', 'font-size="11" fill="var(--accent)"');
      b += row(100, 'receiver');
      for (let i = 0; i < n; i++) {
        const x = X0 + i * cw, d = st.del.indexOf(i) >= 0, bf = st.buf.indexOf(i) >= 0;
        b += '<rect x="' + (x + 2) + '" y="100" width="' + (cw - 4) + '" height="34" rx="5" fill="' + (d ? 'var(--ok)' : bf ? 'var(--t2)' : 'var(--paper)') + '" stroke="var(--rule)"/>';
        b += txt(x + cw / 2, 122, String(i), 'text-anchor="middle" font-weight="700" fill="' + (d || bf ? 'var(--paper)' : 'var(--ink-2)') + '"');
      }
      const ly = 158;
      [['var(--ok)', 'ACKed / delivered'], ['var(--t3)', 'sent, not ACKed'], ['var(--t2)', 'buffered (SR)'], ['var(--accent-soft)', 'usable, not sent']].forEach((lg, i) => {
        b += rect(X0 + i * 140, ly, 14, 12, lg[0]) + txt(X0 + i * 140 + 20, ly + 11, lg[1], 'font-size="11.5" fill="var(--ink-2)"');
      });
      b += txt(10, ly + 40, 'Retransmissions so far: ' + st.retx, 'font-size="13" font-weight="700" fill="var(--ink)"');
      ui.stage.innerHTML = svg(W, ly + 50, b, 'Sender and receiver sequence numbers');
      ui.readout.textContent = 'Step ' + (s + 1) + ' of ' + steps().length + '. ' + st.t;
    }
    modes(ui.modes, [['gbn', 'Go-Back-N'], ['sr', 'Selective Repeat']], mode, v => { mode = v; s = 0; ctl.stop(); render(); });
    const ctl = transport(ui.controls, () => { const n = steps().length; if (s >= n - 1) return false; s++; render(); return s < n - 1; }, () => { s = 0; render(); }, 1500);
    render();
  }


  /* =====================================================================
     SR window size vs sequence-number space
     ===================================================================== */
  function srwin(root) {
    const ui = shell(root, 'Selective Repeat: window vs sequence numbers', 'The sender sends packets 0 to N − 1 and the receiver gets them all. Then every ACK is either delivered or lost.');
    let k = 2, N = 3, lost = true;
    function render() {
      const M = Math.pow(2, k);
      if (N > M) N = M;
      const sendWin = [], rcvWin = [];
      for (let i = 0; i < N; i++) { sendWin.push(i % M); rcvWin.push((N + i) % M); }
      const clash = sendWin.filter(x => rcvWin.indexOf(x) >= 0);
      const W = 680, X0 = 150, cw = Math.min(54, Math.floor(500 / M));
      let b = '';
      const row = (y, label, wins, col, note) => {
        let h = txt(10, y + 22, label, 'font-weight="700" fill="var(--ink)"');
        for (let i = 0; i < M; i++) {
          const on = wins.indexOf(i) >= 0, bad = on && clash.indexOf(i) >= 0 && lost;
          h += '<rect x="' + (X0 + i * cw + 2) + '" y="' + y + '" width="' + (cw - 4) + '" height="34" rx="5" fill="' + (on ? (bad ? 'var(--bad)' : col) : 'var(--paper)') + '" stroke="var(--rule)"/>';
          h += txt(X0 + i * cw + cw / 2, y + 22, String(i), 'text-anchor="middle" font-weight="700" fill="' + (on ? 'var(--paper)' : 'var(--ink-2)') + '"');
        }
        if (note) h += txt(10, y + 52, note, 'font-size="12" fill="var(--ink-2)"');
        return h;
      };
      b += row(10, 'sender sends', lost ? sendWin : sendWin.map(x => (x + N) % M), 'var(--accent)',
        lost ? 'All ACKs lost: timeouts resend the OLD packets ' + sendWin.join(', ') : 'All ACKs arrived: the sender moves on to NEW packets ' + sendWin.map(x => (x + N) % M).join(', '));
      b += row(90, 'receiver expects', rcvWin, 'var(--ok)', 'The receiver already delivered 0 to ' + (N - 1) + ', so its window is ' + rcvWin.join(', '));
      ui.stage.innerHTML = svg(W, 160, b, 'Sender and receiver windows on the sequence-number ring');
      const safe = N <= M / 2;
      ui.readout.textContent = k + ' bits → ' + M + ' sequence numbers (0–' + (M - 1) + '), window N = ' + N + '. ' +
        (safe ? 'Safe: N ≤ ' + (M / 2) + ', so the old numbers never overlap the receiver\'s window. Either way, the receiver can tell old from new.'
          : 'Unsafe: N > ' + (M / 2) + '. Numbers ' + clash.join(', ') + ' are in both windows' + (lost ? ', so the receiver accepts an old retransmission as new data (shown in red).' : '. Here the ACKs got through, but the receiver sees exactly the same labels as in the "ACKs lost" case and can\'t tell them apart.'));
    }
    modes(ui.modes, [[true, 'All ACKs lost'], [false, 'All ACKs arrive']], lost, v => { lost = v; render(); });
    const nIn = slider(ui.controls, 'Window N =', 1, 8, N, v => { N = v; render(); }, v => String(Math.min(v, Math.pow(2, k))));
    slider(ui.controls, 'Sequence bits k =', 2, 3, k, v => { k = v; nIn.max = String(Math.pow(2, k)); if (N > Math.pow(2, k)) { N = Math.pow(2, k); nIn.value = String(N); } nIn.dispatchEvent(new Event('input')); render(); }, v => v + ' (' + Math.pow(2, v) + ' numbers)');
    nIn.max = String(Math.pow(2, k));
    render();
  }

  /* =====================================================================
     TCP retransmission scenarios (time runs downward)
     ===================================================================== */
  function tcpRetx(root) {
    const ui = shell(root, 'TCP retransmission scenarios', 'Byte sequence numbers; ACK = next byte expected. Time runs downward; each step adds one segment.');
    /* [label, from 'a'|'b', t0, t1, lost, hostA note, hostB note] */
    const SC = {
      lostack: { msgs: [
        ['Seq=92, 8 bytes', 'a', 0, 1, false, 'send Seq=92, start timer', 'rcv bytes 92–99, send ACK=100'],
        ['ACK=100', 'b', 1, 1.7, true, '', ''],
        ['Seq=92, 8 bytes', 'a', 3, 4, false, 'timeout: resend Seq=92', 'duplicate: discard data, ACK=100 again'],
        ['ACK=100', 'b', 4, 5, false, 'rcv ACK=100 → SendBase=100, stop timer', '']],
        timers: [[0, 3]], end: 'Lost ACK. The timer expires, A resends the oldest unACKed segment, B recognizes the duplicate bytes, throws them away and re-ACKs.' },
      premature: { msgs: [
        ['Seq=92, 8 bytes', 'a', 0, 1, false, 'send Seq=92 (SendBase=92), start timer', 'rcv 92–99, send ACK=100'],
        ['Seq=100, 20 bytes', 'a', 0.5, 1.5, false, 'send Seq=100', 'rcv 100–119, send ACK=120'],
        ['ACK=100', 'b', 1, 3.1, false, '', ''],
        ['ACK=120', 'b', 1.5, 3.6, false, '', ''],
        ['Seq=92, 8 bytes', 'a', 2.6, 3.6, false, 'timeout: resend ONLY Seq=92, restart timer', 'duplicate: discard, send cumulative ACK=120'],
        ['ACK=120', 'b', 3.6, 4.6, false, 'rcv ACK=120 again: nothing new', '']],
        notes: [[3.1, 'rcv ACK=100 → SendBase=100'], [3.6, 'rcv ACK=120 → SendBase=120']],
        timers: [[0, 2.6]], end: 'Premature timeout. The ACKs were slow, not lost. A resends only the oldest segment (Seq=92). Both ACKs arrive before the restarted timer expires, so Seq=100 is never resent.' },
      cumulative: { msgs: [
        ['Seq=92, 8 bytes', 'a', 0, 1, false, 'send Seq=92, start timer', 'rcv 92–99, send ACK=100'],
        ['Seq=100, 20 bytes', 'a', 0.5, 1.5, false, 'send Seq=100', 'rcv 100–119, send ACK=120'],
        ['ACK=100', 'b', 1, 1.6, true, '', ''],
        ['ACK=120', 'b', 1.5, 2.5, false, 'rcv ACK=120 → SendBase=120, no retransmission', ''],
        ['Seq=120, 15 bytes', 'a', 2.5, 3.5, false, 'send new data Seq=120', 'rcv 120–134, send ACK=135']],
        timers: [], end: 'Cumulative ACK covers a lost ACK. ACK=120 means "I have every byte up to 119", which includes bytes 92–99. A never retransmits.' },
      fast: { msgs: [
        ['Seq=92, 8 bytes', 'a', 0, 1, false, 'send 5 segments back to back', 'rcv 92–99, send ACK=100'],
        ['Seq=100, 20 bytes', 'a', 0.45, 1.1, true, '', ''],
        ['Seq=120, 15 bytes', 'a', 0.9, 1.9, false, '', 'gap! buffer 120–134, dup ACK=100'],
        ['Seq=135, 6 bytes', 'a', 1.35, 2.35, false, '', 'buffer 135–140, dup ACK=100'],
        ['Seq=141, 16 bytes', 'a', 1.8, 2.8, false, '', 'buffer 141–156, dup ACK=100'],
        ['ACK=100', 'b', 1, 2.05, false, '', ''],
        ['ACK=100', 'b', 1.9, 2.95, false, '', ''],
        ['ACK=100', 'b', 2.35, 3.4, false, '', ''],
        ['ACK=100', 'b', 2.8, 3.85, false, '3rd duplicate ACK → resend Seq=100 now', ''],
        ['Seq=100, 20 bytes', 'a', 3.85, 4.85, false, '', 'gap filled: deliver 100–156, ACK=157'],
        ['ACK=157', 'b', 4.85, 5.85, false, 'rcv ACK=157 → SendBase=157', '']],
        notes: [[2.05, 'ACK=100 (new data: SendBase=100)'], [2.95, 'duplicate ACK #1'], [3.4, 'duplicate ACK #2']],
        timers: [], end: 'Fast retransmit. Three duplicate ACKs (four ACKs for the same byte) mean later segments are getting through while one is missing, so A resends Seq=100 without waiting for the timeout.' }
    };
    let mode = 'lostack', s = 0;
    const id = 'tcp' + (++uid);
    function render() {
      const sc = SC[mode], W = 680, XS = 250, XR = 430, Y0 = 40, U = 50;
      const tmax = Math.max.apply(null, sc.msgs.map(m => m[3])) + 0.6;
      const yAt = t => Y0 + t * U;
      let b = arrowDefs(id, 'var(--accent)') + arrowDefs(id + 'k', 'var(--ok)');
      b += txt(XS, 22, 'Host A (sender)', 'text-anchor="middle" font-weight="700" fill="var(--ink)"') + txt(XR, 22, 'Host B (receiver)', 'text-anchor="middle" font-weight="700" fill="var(--ink)"');
      b += '<line x1="' + XS + '" x2="' + XS + '" y1="' + Y0 + '" y2="' + yAt(tmax) + '" stroke="var(--ink-2)" stroke-width="2"/>';
      b += '<line x1="' + XR + '" x2="' + XR + '" y1="' + Y0 + '" y2="' + yAt(tmax) + '" stroke="var(--ink-2)" stroke-width="2"/>';
      const shown = sc.msgs.slice(0, s);
      const now = shown.length ? Math.max.apply(null, shown.map(m => m[2])) : -1;
      sc.timers.forEach(tm => {
        if (now < tm[1] - 0.01) return;
        b += '<line x1="' + (XS - 12) + '" x2="' + (XS - 12) + '" y1="' + yAt(tm[0]) + '" y2="' + yAt(tm[1]) + '" stroke="var(--t3)" stroke-width="3"/>';
        b += txt(XS - 18, yAt((tm[0] + tm[1]) / 2) + 4, 'timer', 'text-anchor="end" font-size="11" fill="var(--t3)" font-weight="700"');
      });
      shown.forEach((m, k) => {
        const fromA = m[1] === 'a', x1 = fromA ? XS : XR, x2full = fromA ? XR : XS;
        const frac = m[4] ? 0.55 : 1, x2 = x1 + (x2full - x1) * frac, y1 = yAt(m[2]), y2 = yAt(m[3]);
        const col = fromA ? 'var(--accent)' : 'var(--ok)', cur = k === s - 1;
        b += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + col + '" stroke-width="' + (cur ? 2.8 : 1.6) + '"' + (m[4] ? '' : ' marker-end="url(#' + id + (fromA ? '' : 'k') + ')"') + '/>';
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        b += txt(mx, my - 5, m[0], 'text-anchor="middle" font-size="11.5" font-weight="700" font-family="var(--mono)" fill="' + col + '"');
        if (m[4]) b += txt(x2 + (fromA ? 4 : -4), y2 + 5, '✕ loss', (fromA ? '' : 'text-anchor="end" ') + 'font-size="12" font-weight="700" fill="var(--bad)"');
        if (m[5]) b += txt(XS - 20, (fromA ? y1 : y2) + 4, m[5], 'text-anchor="end" font-size="11" fill="var(--ink)"');
        if (m[6]) b += txt(XR + 10, (fromA ? y2 : y1) + 4, m[6], 'font-size="11" fill="var(--ink)"');
      });
      (sc.notes || []).forEach(n => {
        if (shown.some(m => m[1] === 'b' && Math.abs(m[3] - n[0]) < 0.01)) b += txt(XS - 20, yAt(n[0]) + 4, n[1], 'text-anchor="end" font-size="11" fill="var(--ink)"');
      });
      ui.stage.innerHTML = svg(W, yAt(tmax) + 10, b, 'Host A to Host B timeline');
      ui.readout.textContent = s === 0 ? 'Press Play or Step.' : s < sc.msgs.length ? 'Segment ' + s + ' of ' + sc.msgs.length + '.' : sc.end;
    }
    modes(ui.modes, [['lostack', 'Lost ACK'], ['premature', 'Premature timeout'], ['cumulative', 'Cumulative ACK'], ['fast', 'Fast retransmit']], mode, v => { mode = v; s = 0; ctl.stop(); render(); });
    const ctl = transport(ui.controls, () => { const n = SC[mode].msgs.length; if (s >= n) return false; s++; render(); return s < n; }, () => { s = 0; render(); }, 1100);
    render();
  }

  /* =====================================================================
     RTT estimation: EWMA of SampleRTT, DevRTT, TimeoutInterval
     ===================================================================== */
  function ewma(root) {
    const ui = shell(root, 'Estimating RTT and setting the timeout', '<code>EstimatedRTT = (1 − α)·EstimatedRTT + α·SampleRTT</code> · <code>DevRTT = (1 − β)·DevRTT + β·|SampleRTT − EstimatedRTT|</code> · <code>Timeout = EstimatedRTT + 4·DevRTT</code>');
    const SAMPLES = [110, 130, 95, 150, 105, 100, 180, 110, 105, 115];
    let a = 0.125, bta = 0.25, n = 0;
    function rows() {
      let est = 100, dev = 5;
      const out = [{ s: null, est: est, dev: dev, to: est + 4 * dev }];
      for (let i = 0; i < n; i++) {
        const smp = SAMPLES[i];
        est = (1 - a) * est + a * smp;
        dev = (1 - bta) * dev + bta * Math.abs(smp - est);
        out.push({ s: smp, est: est, dev: dev, to: est + 4 * dev });
      }
      return out;
    }
    function render() {
      const R = rows(), W = 680, H = 210, X0 = 50, X1 = 660, Y0 = 20, Y1 = 180;
      const yOf = v => Y1 - (v - 60) / (240 - 60) * (Y1 - Y0);
      const xOf = i => X0 + i * (X1 - X0) / SAMPLES.length;
      let b = '';
      [80, 120, 160, 200, 240].forEach(v => { b += '<line x1="' + X0 + '" x2="' + X1 + '" y1="' + yOf(v) + '" y2="' + yOf(v) + '" stroke="var(--rule)"/>' + txt(X0 - 6, yOf(v) + 4, v + '', 'text-anchor="end" font-size="11" fill="var(--ink-2)"'); });
      b += txt(X0, 12, 'ms', 'font-size="11" fill="var(--ink-2)"');
      const path = key => R.map((r, i) => (i ? 'L' : 'M') + xOf(i) + ' ' + yOf(r[key])).join(' ');
      b += '<path d="' + path('to') + '" fill="none" stroke="var(--t3)" stroke-width="2" stroke-dasharray="5 4"/>';
      b += '<path d="' + path('est') + '" fill="none" stroke="var(--accent)" stroke-width="2.5"/>';
      R.forEach((r, i) => { if (r.s !== null) b += '<circle cx="' + xOf(i) + '" cy="' + yOf(r.s) + '" r="4.5" fill="var(--t1)"/>'; });
      const ly = 200;
      [['var(--t1)', 'SampleRTT'], ['var(--accent)', 'EstimatedRTT'], ['var(--t3)', 'TimeoutInterval']].forEach((lg, i) => { b += rect(X0 + i * 170, ly - 10, 14, 10, lg[0]) + txt(X0 + i * 170 + 20, ly, lg[1], 'font-size="11.5" fill="var(--ink-2)"'); });
      ui.stage.innerHTML = svg(W, H, b, 'SampleRTT points, EstimatedRTT line and timeout line');
      const last = R[R.length - 1];
      ui.readout.textContent = n === 0
        ? 'Start: EstimatedRTT = 100 ms, DevRTT = 5 ms, so the timeout is 100 + 4·5 = 120 ms. Step to feed in samples.'
        : 'Sample ' + n + ': SampleRTT = ' + last.s + ' ms → EstimatedRTT = ' + last.est.toFixed(2) + ' ms, DevRTT = ' + last.dev.toFixed(2) + ' ms, TimeoutInterval = ' + last.to.toFixed(2) + ' ms.' +
          (n >= 7 ? ' Sample 7 was a 180 ms spike: EstimatedRTT moved only a little, but DevRTT jumped, so the timeout widened.' : '');
    }
    slider(ui.controls, 'α =', 1, 8, 1, v => { a = v / 8; render(); }, v => (v / 8).toFixed(3));
    slider(ui.controls, 'β =', 1, 8, 2, v => { bta = v / 8; render(); }, v => (v / 8).toFixed(3));
    transport(ui.controls, () => { if (n >= SAMPLES.length) return false; n++; render(); return n < SAMPLES.length; }, () => { n = 0; render(); }, 1000);
    render();
  }

  /* =====================================================================
     TCP flow control: the receive window
     ===================================================================== */
  function rwnd(root) {
    const ui = shell(root, 'Flow control: rwnd', '<code>rwnd = RcvBuffer − (LastByteRcvd − LastByteRead)</code>. The sender keeps <code>LastByteSent − LastByteAcked ≤ rwnd</code>. Each step is one round trip.');
    const BUF = 4096;
    let want = 2000, read = 500, st;
    function reset() { st = { rcvd: 0, readB: 0, adv: BUF, step: 0, log: 'RcvBuffer = 4,096 bytes and empty, so rwnd = 4,096.' }; }
    function step() {
      if (st.step >= 12) return false;
      const sendable = st.adv === 0 ? 1 : Math.min(want, st.adv);
      const room = BUF - (st.rcvd - st.readB);
      const accepted = Math.min(sendable, room);
      st.rcvd += accepted;
      const buffered = st.rcvd - st.readB;
      const r = Math.min(read, buffered);
      st.readB += r;
      st.adv = BUF - (st.rcvd - st.readB);
      st.step++;
      st.log = (sendable === 1 ? 'rwnd was 0, so the sender sent a 1-byte probe. ' : 'Sender sent ' + sendable.toLocaleString() + ' bytes (limited by ' + (sendable < want ? 'rwnd' : 'what it has') + '). ') +
        'The app read ' + r.toLocaleString() + ' bytes. New rwnd = ' + BUF + ' − (' + st.rcvd.toLocaleString() + ' − ' + st.readB.toLocaleString() + ') = ' + st.adv.toLocaleString() + '.';
      render();
      return st.step < 12;
    }
    function render() {
      const W = 680, X0 = 20, BW = 640, used = st.rcvd - st.readB;
      let b = txt(X0, 18, 'Receive buffer (RcvBuffer = 4,096 bytes)', 'font-size="12" fill="var(--ink-2)"');
      b += rect(X0, 26, BW, 40, 'var(--paper-2)', 'stroke="var(--rule)"');
      if (used > 0) b += rect(X0, 26, BW * used / BUF, 40, 'var(--t3)');
      b += txt(X0 + 8, 51, 'buffered ' + used.toLocaleString(), 'font-size="12.5" font-weight="700" fill="' + (used > 600 ? 'var(--paper)' : 'var(--ink)') + '"');
      b += txt(X0 + BW - 8, 51, 'rwnd (free) ' + st.adv.toLocaleString(), 'text-anchor="end" font-size="12.5" font-weight="700" fill="var(--ink)"');
      b += txt(X0, 92, 'LastByteRcvd = ' + st.rcvd.toLocaleString() + '   LastByteRead = ' + st.readB.toLocaleString() + '   round trip ' + st.step + ' of 12', 'font-size="12.5" font-family="var(--mono)" fill="var(--ink)"');
      ui.stage.innerHTML = svg(W, 104, b, 'Receive buffer fill level');
      ui.readout.textContent = st.log;
    }
    slider(ui.modes, 'Sender has per RTT:', 1, 8, 4, v => { want = v * 500; reset(); render(); }, v => (v * 500).toLocaleString() + ' bytes');
    slider(ui.modes, 'App reads per RTT:', 0, 8, 1, v => { read = v * 500; reset(); render(); }, v => (v * 500).toLocaleString() + ' bytes');
    transport(ui.controls, step, () => { reset(); render(); }, 1100);
    reset(); render();
  }

  const DEMOS = { rdt3, util, gbnsr, srwin, tcpRetx, ewma, rwnd };
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.demo[data-demo]').forEach(el => {
      const f = DEMOS[el.getAttribute('data-demo')];
      if (f) f(el);
    });
  });
})();
