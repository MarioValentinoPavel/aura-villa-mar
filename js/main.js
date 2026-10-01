/* Aura Villa Mar · puertas de ascensor, panel de plantas como navegación y sombras de palmera sobre la piedra */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined';
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  const MOTION = hasGsap && !REDUCE;
  const D = window.I18N;
  let LANG = 'fr';
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { } } };

  /* ---------- sombras de palmera: hojas generadas a lo largo de un tallo curvo ---------- */
  const O = [-60, -90]; // la palmera queda fuera del encuadre, arriba a la izquierda
  function frond(angle, len, bend) {
    const a = (angle * Math.PI) / 180;
    const ex = O[0] + Math.cos(a) * len, ey = O[1] + Math.sin(a) * len;
    const cx = O[0] + Math.cos(a - bend) * len * 0.55, cy = O[1] + Math.sin(a - bend) * len * 0.55 - 40;
    const q = (t) => [(1 - t) ** 2 * O[0] + 2 * (1 - t) * t * cx + t * t * ex, (1 - t) ** 2 * O[1] + 2 * (1 - t) * t * cy + t * t * ey];
    let d = `M${O[0]} ${O[1]}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
    let leaves = '';
    for (let i = 4; i < 34; i++) {
      const t = i / 34, [x, y] = q(t), [x2, y2] = q(Math.min(1, t + 0.01));
      const dir = Math.atan2(y2 - y, x2 - x);
      const L = (30 + Math.sin(t * Math.PI) * 120) * (0.8 + 0.4 * Math.abs(Math.sin(i * 12.9898 + angle)));
      [-1, 1].forEach((s) => {
        const la = dir + s * (0.9 + 0.3 * Math.abs(Math.sin(i * 7.31 + s))) + 0.35; // las hojas caen un poco, sin ser un peine
        const mx = x + Math.cos(la) * L * 0.5 + Math.cos(dir) * 14, my = y + Math.sin(la) * L * 0.5 + 10;
        const tx = x + Math.cos(la) * L + Math.cos(dir) * 26, ty = y + Math.sin(la) * L + 26;
        leaves += `M${x.toFixed(1)} ${y.toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}`;
      });
    }
    return `<g class="frond"><path d="${d}" stroke-width="9"/><path d="${leaves}" stroke-width="7"/></g>`;
  }
  $('#palms').innerHTML = [[14, 760, 0.25], [34, 820, 0.2], [55, 700, 0.18], [76, 620, 0.12], [-4, 560, 0.3]].map(([a, l, b]) => frond(a, l, b)).join('');

  /* ---------- panel de ascensor ---------- */
  const ORDER = { '0': 0, '1': 1, 'R': 2 };
  const num = $('#panelNum'), dir = $('#panelDir');
  let cur = '0', idleT = null;
  function setFloor(f) {
    if (f === cur) return;
    const up = ORDER[f] > ORDER[cur];
    cur = f;
    dir.classList.remove('is-idle');
    dir.classList.toggle('is-down', !up);
    $$('.panel__btn').forEach((b) => { const on = b.dataset.floor === f; b.classList.toggle('is-on', on); on ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current'); });
    if (MOTION) {
      gsap.timeline()
        .to(num, { yPercent: up ? -110 : 110, duration: 0.22, ease: 'power2.in' })
        .add(() => (num.textContent = f))
        .fromTo(num, { yPercent: up ? 110 : -110 }, { yPercent: 0, duration: 0.4, ease: 'expo.out' })
        .fromTo('.panel__screen', { boxShadow: '0 0 0 0 rgba(242,164,107,0)' }, { boxShadow: '0 0 16px 2px rgba(242,164,107,.7)', duration: 0.18, yoyo: true, repeat: 1 });
    } else num.textContent = f;
    clearTimeout(idleT);
    idleT = setTimeout(() => dir.classList.add('is-idle'), 1400);
  }
  dir.classList.add('is-idle');
  $$('.panel__btn').forEach((b) => b.addEventListener('click', (e) => {
    e.preventDefault();
    const t = $(b.getAttribute('href'));
    t.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block: 'start' });
    if (!MOTION) setFloor(b.dataset.floor);
  }));

  /* ---------- idioma ---------- */
  function applyLang(l) {
    LANG = l;
    document.documentElement.lang = l;
    $$('[data-i18n]').forEach((el) => {
      if (el.dataset.fr === undefined) el.dataset.fr = el.innerHTML;
      el.innerHTML = l === 'fr' ? el.dataset.fr : (D.dom[l] && D.dom[l][el.dataset.i18n]) || el.dataset.fr;
    });
    $$('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === l)));
    $('#panel').setAttribute('aria-label', l === 'es' ? 'Plantas' : 'Étages');
    store.set('av-lang', l);
    $('#reviews').innerHTML = D.reviews[l].map(([t, w]) => `<figure class="wq"><p>${l === 'fr' ? '«&nbsp;' + t + '&nbsp;»' : '«' + t + '»'}</p><cite>${w}</cite></figure>`).join('');
  }
  $$('.lang button').forEach((b) => b.addEventListener('click', () => applyLang(b.dataset.lang)));

  /* ---------- intro + héroe ---------- */
  function sway() {
    if (!MOTION) return;
    $$('#palms .frond').forEach((g, i) => gsap.to(g, { rotation: i % 2 ? 2.4 : -2, svgOrigin: `${O[0]} ${O[1]}`, duration: 4.5 + i * 0.7, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.3 }));
    gsap.to('#palms', { x: 18, y: 10, duration: 7, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }
  function heroIn() {
    if (!MOTION) { return; }
    gsap.timeline()
      .from('.hero__glass', { clipPath: 'inset(0 50% 0 50%)', duration: 1.4, ease: 'expo.inOut' })
      .from('.hero__glass img', { scale: 1.3, duration: 2, ease: 'expo.out' }, 0)
      .from('.hero__title', { y: 70, opacity: 0, duration: 1.3, ease: 'expo.out' }, 0.2)
      .from('.hero__sub, .hero__cta > *', { y: 24, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08 }, 0.45)
      .from('#palms', { opacity: 0, duration: 2.4, ease: 'power1.out' }, 0)
      .from('#panel', { opacity: 0, duration: 1, ease: 'power1.out', clearProps: 'opacity' }, 0.7)
      .from('#nav', { opacity: 0, duration: 0.8 }, 0.5);
    sway();
  }
  const lift = $('#lift');
  let seen = false;
  try { seen = sessionStorage.getItem('av-intro') === '1'; sessionStorage.setItem('av-intro', '1'); } catch (e) { }
  if (!MOTION || seen) { lift.remove(); heroIn(); }
  else {
    document.body.classList.add('is-locked');
    const ln = $('#liftNum');
    const tl = gsap.timeline({ onComplete: () => { lift.remove(); document.body.classList.remove('is-locked'); } });
    // el ascensor baja del rooftop a la planta 0, suena el «ding» y se abren las puertas
    tl.from('.lift__door span', { opacity: 0, y: 14, duration: 0.8, ease: 'expo.out', stagger: 0.08 });
    ['1', '0'].forEach((f) => {
      tl.to(ln, { yPercent: 100, opacity: 0, duration: 0.18, ease: 'power2.in' }, '+=0.35')
        .add(() => (ln.textContent = f))
        .fromTo(ln, { yPercent: -100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.3, ease: 'expo.out' });
    });
    tl.to('.lift__display', { boxShadow: '0 0 30px 6px rgba(242,164,107,.8)', duration: 0.15, yoyo: true, repeat: 1 }, '+=0.15')
      .to('.lift__arrow', { opacity: 0, duration: 0.2 }, '<')
      .to('.lift__door--l', { xPercent: -100, duration: 1.2, ease: 'expo.inOut' }, '+=0.1')
      .to('.lift__door--r', { xPercent: 100, duration: 1.2, ease: 'expo.inOut' }, '<')
      .to('.lift__display', { opacity: 0, y: -20, duration: 0.5 }, '<')
      .add(heroIn, '-=0.8');
    lift.addEventListener('click', () => tl.progress(1));
  }

  /* ---------- scroll ---------- */
  function scrollFx() {
    if (!MOTION) return;
    const nav = $('#nav'), panel = $('#panel');
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => { const y = s.scroll(); nav.classList.toggle('is-solid', y > 60); nav.classList.toggle('is-hidden', s.direction === 1 && y > 700); } });
    $$('[data-floor]').filter((el) => el.tagName === 'SECTION').forEach((sec) => {
      ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', onToggle: (s) => s.isActive && setFloor(sec.dataset.floor) });
    });
    // fuera de las plantas el panel se retira
    ScrollTrigger.create({ trigger: '.words', start: 'top 60%', end: 'max', onToggle: (s) => panel.classList.toggle('is-away', s.isActive) });
    // el cielo del rooftop pasa del albaricoque al azul mientras subes
    gsap.to('#sky', { backgroundPosition: '50% 100%', ease: 'none', scrollTrigger: { trigger: '#rooftop', start: 'top bottom', end: 'bottom top', scrub: true } });
    $$('.plaque').forEach((p) => gsap.from(p, { scale: 0.8, opacity: 0, duration: 0.9, ease: 'back.out(2)', scrollTrigger: { trigger: p, start: 'top 85%' } }));
    gsap.from('.cafe__txt > *', { y: 36, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '.cafe__grid', start: 'top 75%' } });
    $$('.shot').forEach((s, i) => {
      gsap.from(s, { clipPath: 'inset(100% 0 0 0)', duration: 1.4, ease: 'expo.inOut', delay: i * 0.1, scrollTrigger: { trigger: s, start: 'top 85%' } });
      gsap.fromTo($('img', s), { yPercent: -6, scale: 1.12 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: s, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    gsap.from('.table__head > *', { y: 36, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.table__head', start: 'top 80%' } });
    $$('.dish').forEach((d, i) => {
      gsap.from(d, { y: 120, opacity: 0, duration: 1.3, ease: 'expo.out', delay: i * 0.08, scrollTrigger: { trigger: '.dishes', start: 'top 85%' } });
      gsap.to(d, { y: [-30, 20, -10][i], ease: 'none', scrollTrigger: { trigger: '.dishes', start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    gsap.from('.roof__head > *', { y: 36, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.roof__head', start: 'top 80%' } });
    gsap.from('.view', { clipPath: 'inset(0 0 100% 0)', duration: 1.5, ease: 'expo.inOut', stagger: 0.15, scrollTrigger: { trigger: '.roof__views', start: 'top 80%' } });
    gsap.from('.sweet__fig', { scale: 0.85, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.sweet', start: 'top 80%' } });
    gsap.from('.sweet__txt li, .sweet__txt .h3', { x: 30, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: '.sweet', start: 'top 75%' } });
    ScrollTrigger.batch('.wq', { start: 'top 88%', once: true, onEnter: (els) => gsap.from(els, { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.12 }) });
    gsap.from('.visit__fig', { clipPath: 'inset(0 100% 0 0)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: '.visit', start: 'top 75%' } });
    gsap.from('.visit__txt > *', { y: 30, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '.visit', start: 'top 70%' } });
  }

  const initial = [new URLSearchParams(location.search).get('lang'), store.get('av-lang'), (navigator.language || '').slice(0, 2)].find((l) => l === 'fr' || l === 'es') || 'fr';
  applyLang(initial);
  scrollFx();
  addEventListener('load', () => hasGsap && ScrollTrigger.refresh());
})();
