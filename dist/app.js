(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const old = { '#products': '/products', '#custom': '/work/er-command', '#apps': '/products#apps', '#team': '/about', '#contact': '/contact', '#process': '/services' };
  if (location.pathname === '/' && old[location.hash]) { location.replace(old[location.hash]); return; }
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* header: solid after scroll, mobile menu */
  const head = $('.site-head');
  const onScroll = () => head && head.classList.toggle('scrolled', scrollY > 8);
  onScroll(); addEventListener('scroll', onScroll, { passive: true });
  const burger = $('.burger');
  if (burger) {
    burger.addEventListener('click', () => {
      const open = head.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
    });
    addEventListener('keydown', e => { if (e.key === 'Escape' && head.classList.contains('open')) { head.classList.remove('open'); burger.setAttribute('aria-expanded', false); burger.focus(); } });
  }

  /* headline words rise in */
  const h1 = $('.hero h1');
  if (h1 && !reduce) {
    let i = 0;
    const wrap = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const f = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(p => {
          if (!p) return;
          if (/^\s+$/.test(p)) return f.append(p);
          const s = document.createElement('span'); s.className = 'w'; s.textContent = p;
          s.style.animationDelay = (i++ * 60) + 'ms'; f.append(s);
        });
        n.replaceWith(f);
      } else if (n.nodeType === 1) wrap(n);
    });
    wrap(h1);
  }

  /* reveal on scroll: only things below the fold, so the first screen is complete at once */
  if (!reduce && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('motion');
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px' });
    $$('[data-reveal], .head, .svc, .work, .step, .path, .who-card, .value, .founder, .app, details, .band, .story, .svc-row, .frame, .product > *').forEach((el, k) => {
      if (el.getBoundingClientRect().top < innerHeight * 0.92) return;
      el.classList.add('rise');
      const sibs = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
      el.style.transitionDelay = Math.min(sibs, 4) * 70 + 'ms';
      io.observe(el);
    });
  }

  /* chat mockups play like a real conversation */
  const play = box => {
    const items = $$('.msg, .pm, .sysline, .typing', box);
    if (reduce || !items.length) return;
    box.classList.add('seq-ready');
    let t = 300;
    items.forEach(el => {
      if (el.matches('.typing')) { setTimeout(() => el.classList.add('show'), t); t += 1100; setTimeout(() => el.classList.remove('show'), t); return; }
      setTimeout(() => el.classList.add('on'), t);
      t += el.matches('.out') ? 900 : 650;
    });
  };
  if ('IntersectionObserver' in window) {
    const so = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { play(e.target); so.unobserve(e.target); } }), { threshold: .35 });
    $$('[data-seq]').forEach(s => so.observe(s));
  }

  /* work filters */
  const chips = $$('.chip[data-filter]');
  chips.forEach(c => c.addEventListener('click', () => {
    chips.forEach(x => x.setAttribute('aria-pressed', x === c));
    const f = c.dataset.filter;
    $$('.works .work').forEach(w => { w.hidden = !(f === 'all' || (w.dataset.cat || '').split(' ').includes(f)); });
  }));

  /* live demo: scale the 1400px app to its frame */
  const stage = $('#demoStage');
  if (stage) {
    const f = $('iframe', stage);
    const fit = () => { const s = Math.min(1, stage.clientWidth / 1400); f.style.transform = `scale(${s})`; stage.style.height = Math.round(880 * s) + 'px'; };
    fit(); addEventListener('resize', fit);
  }

  /* copy email */
  $$('[data-copy]').forEach(b => b.addEventListener('click', () => {
    const t = $(b.dataset.copy).textContent.trim();
    const sel = () => { const r = document.createRange(); r.selectNodeContents($(b.dataset.copy)); const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = 'Selected'; };
    try { navigator.clipboard.writeText(t).then(() => { b.textContent = 'Copied'; setTimeout(() => b.textContent = 'Copy', 1800); }, sel); } catch (_) { sel(); }
  }));

  /* local times on the contact page */
  const clocks = $$('[data-tz]');
  if (clocks.length) {
    const tick = () => clocks.forEach(c => { c.textContent = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: c.dataset.tz }).format(new Date()); });
    tick(); setInterval(tick, 30000);
  }

  /* contact form: Web3Forms when a key is set, otherwise the visitor's email app */
  const form = $('#contactForm');
  if (form) {
    const status = $('#formStatus');
    const params = new URLSearchParams(location.search);
    if (params.get('type')) { const r = form.querySelector(`input[name="project_type"][value="${params.get('type')}"]`); if (r) r.checked = true; }
    const show = (cls, msg) => { status.hidden = false; status.className = 'form-status ' + cls; status.textContent = msg; status.focus(); };
    const check = () => {
      let ok = true;
      $$('[data-required]', form).forEach(f => {
        const inp = $('input, select, textarea', f);
        const bad = inp.type === 'email' ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim()) : !inp.value.trim();
        f.classList.toggle('invalid', bad); if (bad && ok) { inp.focus(); ok = false; }
      });
      return ok;
    };
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (form.botcheck && form.botcheck.checked) return;
      if (!check()) return;
      const data = Object.fromEntries(new FormData(form));
      const key = form.dataset.key;
      const btn = $('button[type=submit]', form);
      btn.setAttribute('aria-busy', 'true'); btn.textContent = 'Sending...';
      try {
        if (key) {
          const res = await fetch('https://formsubmit.co/ajax/thehaiderimran19@gmail.com', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ _template: 'table', _captcha: 'false', _subject: `New enquiry: ${data.project_type || 'project'} from ${data.name}`, ...data }) });
          const j = await res.json();
          if (String(j.success) !== 'true') throw new Error(j.message || 'failed');
          form.reset(); show('ok', 'Thanks. Your message reached us, and we will reply within one working day.');
        } else {
          const body = `Name: ${data.name}\nEmail: ${data.email}\nOrganisation: ${data.organisation || '-'}\nProject type: ${data.project_type || '-'}\nBudget: ${data.budget || '-'}\n\n${data.message}`;
          location.href = `mailto:thehaiderimran19@gmail.com?subject=${encodeURIComponent('Project enquiry from ' + data.name)}&body=${encodeURIComponent(body)}`;
          show('ok', 'Your email app should open with your message ready to send. If nothing opens, email us at thehaiderimran19@gmail.com.');
        }
      } catch (err) {
        show('bad', 'Your message did not send. Please try again, or email thehaiderimran19@gmail.com directly.');
      } finally { btn.removeAttribute('aria-busy'); btn.textContent = 'Send message'; }
    });
    $$('input, select, textarea', form).forEach(i => i.addEventListener('input', () => i.closest('.field')?.classList.remove('invalid')));
  }

  /* The homepage has its own interactive GradientASCII focal effect. */
  if ($('[data-gradient-ascii]')) return;

  /* fluid trail behind the cursor: desktop pointers only */
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduce || !fine || innerWidth < 900) return;
  const canvas = document.createElement('canvas'); canvas.id = 'fluid'; canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
  if (!gl) return canvas.remove();
  const hf = gl.getExtension('OES_texture_half_float'); gl.getExtension('OES_texture_half_float_linear');
  const fl = gl.getExtension('OES_texture_float'); gl.getExtension('OES_texture_float_linear');
  const TYPE = hf ? hf.HALF_FLOAT_OES : (fl ? gl.FLOAT : null);
  if (!TYPE) return canvas.remove();
  const SIM = 128, DYE = 560, ITER = 14;
  const vs = `attribute vec2 p;varying vec2 uv,L,R,T,B;uniform vec2 tx;void main(){uv=p*.5+.5;L=uv-vec2(tx.x,0.);R=uv+vec2(tx.x,0.);T=uv+vec2(0.,tx.y);B=uv-vec2(0.,tx.y);gl_Position=vec4(p,0.,1.);}`;
  const fs = {
    splat: `precision highp float;varying vec2 uv;uniform sampler2D u;uniform float ar,r;uniform vec2 pt;uniform vec3 c;void main(){vec2 d=uv-pt;d.x*=ar;vec3 s=exp(-dot(d,d)/r)*c;gl_FragColor=vec4(texture2D(u,uv).xyz+s,1.);}`,
    adv: `precision highp float;varying vec2 uv;uniform sampler2D v,s;uniform vec2 tx;uniform float dt,k;void main(){vec2 c=uv-dt*texture2D(v,uv).xy*tx;gl_FragColor=vec4(k*texture2D(s,c).xyz,1.);}`,
    div: `precision mediump float;varying vec2 uv,L,R,T,B;uniform sampler2D v;void main(){float l=texture2D(v,L).x,r=texture2D(v,R).x,t=texture2D(v,T).y,b=texture2D(v,B).y;gl_FragColor=vec4(.5*(r-l+t-b),0.,0.,1.);}`,
    curl: `precision mediump float;varying vec2 uv,L,R,T,B;uniform sampler2D v;void main(){gl_FragColor=vec4(.5*(texture2D(v,R).y-texture2D(v,L).y-texture2D(v,T).x+texture2D(v,B).x),0.,0.,1.);}`,
    vort: `precision highp float;varying vec2 uv,L,R,T,B;uniform sampler2D v,w;uniform float cs,dt;void main(){float l=texture2D(w,L).x,r=texture2D(w,R).x,t=texture2D(w,T).x,b=texture2D(w,B).x,c=texture2D(w,uv).x;vec2 f=.5*vec2(abs(t)-abs(b),abs(r)-abs(l));f/=length(f)+1e-4;f*=cs*c;f.y*=-1.;gl_FragColor=vec4(texture2D(v,uv).xy+f*dt,0.,1.);}`,
    pres: `precision mediump float;varying vec2 uv,L,R,T,B;uniform sampler2D pr,d;void main(){gl_FragColor=vec4((texture2D(pr,L).x+texture2D(pr,R).x+texture2D(pr,B).x+texture2D(pr,T).x-texture2D(d,uv).x)*.25,0.,0.,1.);}`,
    grad: `precision mediump float;varying vec2 uv,L,R,T,B;uniform sampler2D pr,v;void main(){vec2 g=vec2(texture2D(pr,R).x-texture2D(pr,L).x,texture2D(pr,T).x-texture2D(pr,B).x);gl_FragColor=vec4(texture2D(v,uv).xy-g,0.,1.);}`,
    fade: `precision mediump float;varying vec2 uv;uniform sampler2D u;uniform float k;void main(){gl_FragColor=k*texture2D(u,uv);}`,
    show: `precision highp float;varying vec2 uv;uniform sampler2D u;void main(){vec3 c=texture2D(u,uv).rgb;float m=max(c.r,max(c.g,c.b));float a=clamp(m*1.15,0.,.8);vec3 col=c/max(m,1e-4);gl_FragColor=vec4(col*a,a);}`
  };
  const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); return x; };
  const vsh = sh(gl.VERTEX_SHADER, vs), P = {};
  for (const k in fs) {
    const p = gl.createProgram(); gl.attachShader(p, vsh); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs[k])); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return canvas.remove();
    const u = {}; for (let i = 0; i < gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i++) { const n = gl.getActiveUniform(p, i).name; u[n] = gl.getUniformLocation(p, n); }
    P[k] = { p, u };
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); gl.enableVertexAttribArray(0);
  const fbo = (w, h) => {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(x => gl.texParameteri(gl.TEXTURE_2D, x, gl.LINEAR));
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(x => gl.texParameteri(gl.TEXTURE_2D, x, gl.CLAMP_TO_EDGE));
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, TYPE, null);
    const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
    return { t, f, w, h };
  };
  const dbl = (w, h) => { let a = fbo(w, h), b = fbo(w, h); return { get r() { return a; }, get w() { return b; }, swap() { [a, b] = [b, a]; } }; };
  let vel, dye, dv, curl, pres, sw, shh;
  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(innerWidth * dpr); canvas.height = Math.round(innerHeight * dpr);
    const ar = canvas.width / canvas.height, dim = r => ar > 1 ? [Math.round(r * ar), r] : [r, Math.round(r / ar)];
    [sw, shh] = dim(SIM); const [dw, dh] = dim(DYE);
    vel = dbl(sw, shh); dye = dbl(dw, dh); dv = fbo(sw, shh); curl = fbo(sw, shh); pres = dbl(sw, shh);
  };
  size(); let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(size, 200); });
  const tex = (u, t) => { gl.activeTexture(gl.TEXTURE0 + u); gl.bindTexture(gl.TEXTURE_2D, t.t); return u; };
  const run = (pg, tg) => { gl.useProgram(pg.p); if (pg.u.tx) gl.uniform2f(pg.u.tx, 1 / tg.w, 1 / tg.h); gl.viewport(0, 0, tg.w, tg.h); gl.bindFramebuffer(gl.FRAMEBUFFER, tg.f); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); };
  const pal = [[0.04, 0.48, 0.36], [0.05, 0.40, 0.42], [0.10, 0.56, 0.44]];
  const splat = (x, y, dx, dy, c, r) => {
    const S = P.splat; gl.useProgram(S.p);
    gl.uniform1i(S.u.u, tex(0, vel.r)); gl.uniform1f(S.u.ar, canvas.width / canvas.height); gl.uniform2f(S.u.pt, x, y); gl.uniform3f(S.u.c, dx, dy, 0); gl.uniform1f(S.u.r, r); run(S, vel.w); vel.swap();
    gl.useProgram(S.p); gl.uniform1i(S.u.u, tex(0, dye.r)); gl.uniform3f(S.u.c, c[0], c[1], c[2]); run(S, dye.w); dye.swap();
  };
  const ptr = { x: 0, y: 0, px: 0, py: 0, moved: false, ok: false };
  addEventListener('pointermove', e => { const x = e.clientX / innerWidth, y = 1 - e.clientY / innerHeight; if (!ptr.ok) { ptr.px = x; ptr.py = y; ptr.ok = true; } ptr.x = x; ptr.y = y; ptr.moved = true; }, { passive: true });
  let last = performance.now(), running = true;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) { last = performance.now(); requestAnimationFrame(step); } });
  function step(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 1 / 30); last = now;
    if (ptr.moved) {
      const dx = (ptr.x - ptr.px) * 5200, dy = (ptr.y - ptr.py) * 5200, sp = Math.min(Math.hypot(dx, dy) / 900, 1);
      splat(ptr.x, ptr.y, dx, dy, pal[Math.floor(now / 2500) % 3].map(v => v * (.12 + .3 * sp)), .00028);
      ptr.px = ptr.x; ptr.py = ptr.y; ptr.moved = false;
    }
    gl.useProgram(P.curl.p); gl.uniform1i(P.curl.u.v, tex(0, vel.r)); run(P.curl, curl);
    gl.useProgram(P.vort.p); gl.uniform1i(P.vort.u.v, tex(0, vel.r)); gl.uniform1i(P.vort.u.w, tex(1, curl)); gl.uniform1f(P.vort.u.cs, 22); gl.uniform1f(P.vort.u.dt, dt); run(P.vort, vel.w); vel.swap();
    gl.useProgram(P.div.p); gl.uniform1i(P.div.u.v, tex(0, vel.r)); run(P.div, dv);
    gl.useProgram(P.fade.p); gl.uniform1i(P.fade.u.u, tex(0, pres.r)); gl.uniform1f(P.fade.u.k, .8); run(P.fade, pres.w); pres.swap();
    for (let i = 0; i < ITER; i++) { gl.useProgram(P.pres.p); gl.uniform1i(P.pres.u.pr, tex(0, pres.r)); gl.uniform1i(P.pres.u.d, tex(1, dv)); run(P.pres, pres.w); pres.swap(); }
    gl.useProgram(P.grad.p); gl.uniform1i(P.grad.u.pr, tex(0, pres.r)); gl.uniform1i(P.grad.u.v, tex(1, vel.r)); run(P.grad, vel.w); vel.swap();
    gl.useProgram(P.adv.p); gl.uniform2f(P.adv.u.tx, 1 / sw, 1 / shh); gl.uniform1i(P.adv.u.v, tex(0, vel.r)); gl.uniform1i(P.adv.u.s, tex(0, vel.r)); gl.uniform1f(P.adv.u.dt, dt); gl.uniform1f(P.adv.u.k, .985);
    gl.viewport(0, 0, vel.w.w, vel.w.h); gl.bindFramebuffer(gl.FRAMEBUFFER, vel.w.f); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); vel.swap();
    gl.useProgram(P.adv.p); gl.uniform2f(P.adv.u.tx, 1 / sw, 1 / shh); gl.uniform1i(P.adv.u.v, tex(0, vel.r)); gl.uniform1i(P.adv.u.s, tex(1, dye.r)); gl.uniform1f(P.adv.u.k, .975);
    gl.viewport(0, 0, dye.w.w, dye.w.h); gl.bindFramebuffer(gl.FRAMEBUFFER, dye.w.f); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); dye.swap();
    gl.useProgram(P.show.p); gl.uniform1i(P.show.u.u, tex(0, dye.r));
    gl.viewport(0, 0, canvas.width, canvas.height); gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
})();
