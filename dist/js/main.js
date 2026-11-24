/* Northlight Residences — interactions
   The hero is a working stay calculator. Scroll then: the tour film widens to full bleed,
   apartment cards stack, the weekday timeline draws itself, locations scroll sideways. */
(() => {
  const WHATSAPP = '919800000000';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  $$('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));

  /* ---------- pricing model (edit per client) ---------- */
  const BASE = { studio: 4200, one: 5600, two: 7900 };          // nightly, Whitefield, before GST
  const AREA = { whitefield: 1, koramangala: 1.1, hebbal: 0.95 };
  const STEPS = [1, 2, 3, 5, 7, 10, 14, 21, 30, 45, 60, 90, 120, 180, 270, 365]; // slider stops, in nights
  const tier = n => (n >= 90 ? .45 : n >= 30 ? .35 : n >= 7 ? .15 : 0);
  const inr = v => '₹' + Math.round(v).toLocaleString('en-IN');
  const lenLabel = n => {
    if (n === 365) return '1 year';
    if (n >= 30 && n % 30 === 0) return n / 30 === 1 ? '1 month' : `${n / 30} months`;
    if (n === 45) return '6 weeks';
    if (n === 7) return '1 week';
    if (n === 14) return '2 weeks';
    if (n === 21) return '3 weeks';
    return `${n} night${n > 1 ? 's' : ''}`;
  };
  const included = n => {
    const list = ['Kitchen and washer', 'Fibre internet', 'Power backup'];
    list.push(n >= 30 ? 'Housekeeping twice a week' : 'Daily housekeeping');
    if (n >= 7) list.push('Utilities included');
    if (n >= 30) list.push('Monthly GST invoice', 'Leave with 7 days notice');
    if (n >= 90) list.push('Free airport pickup');
    return list;
  };

  const calc = $('[data-calc]');
  const range = $('[data-in="len"]', calc), areaSel = $('[data-in="area"]', calc);
  const out = k => $(`[data-out="${k}"]`, calc);
  let quote = null;
  const animateNum = (el, to) => {
    const from = parseInt(el.dataset.v || '0', 10);
    el.dataset.v = Math.round(to);
    if (!hasGsap || reduce) { el.textContent = inr(to); return; }
    const o = { v: from };
    gsap.to(o, { v: to, duration: .5, ease: 'power2.out', overwrite: true, onUpdate: () => (el.textContent = inr(o.v)) });
  };
  function update() {
    const n = STEPS[+range.value];
    const type = $('input[name="type"]:checked', calc).value;
    const area = areaSel.value;
    const off = tier(n);
    const night = BASE[type] * AREA[area] * (1 - off);
    range.style.setProperty('--fill', (range.value / range.max) * 100 + '%');
    out('len').textContent = lenLabel(n);
    animateNum(out('night'), night);
    if (n >= 30) { out('totalLabel').textContent = 'Per month'; animateNum(out('total'), night * 30); }
    else { out('totalLabel').textContent = `For ${n} night${n > 1 ? 's' : ''}`; animateNum(out('total'), night * n); }
    out('save').textContent = off ? `${Math.round(off * 100)}% off the nightly rate` : 'Stay 7 nights or more for 15% off';
    const names = { studio: 'Studio', one: 'One-bedroom', two: 'Two-bedroom' };
    const incl = out('incl');
    const items = included(n);
    if (incl.dataset.key !== String(items.length)) {
      incl.dataset.key = items.length;
      incl.innerHTML = items.map(t => `<li>${t}</li>`).join('');
      if (hasGsap && !reduce) gsap.from(incl.children, { y: 8, opacity: 0, stagger: .03, duration: .35, ease: 'power2.out' });
    }
    quote = { n, type: names[type], area: areaSel.options[areaSel.selectedIndex].text, night: Math.round(night) };
  }
  calc.addEventListener('input', update);
  update();

  $('[data-quote]').addEventListener('click', () => {
    const s = $('[data-quote-summary]');
    s.textContent = `Quote held: ${quote.type} in ${quote.area} for ${lenLabel(quote.n)}, about ${inr(quote.night)} a night before GST. Add your details and we'll confirm availability.`;
    $('input[name="len"]').value = lenLabel(quote.n);
  });
  $$('[data-pick]').forEach(a => a.addEventListener('click', () => {
    $(`input[name="type"][value="${a.dataset.pick}"]`).checked = true;
    range.value = 11; update();
  }));

  /* ---------- enquiry → WhatsApp ---------- */
  const form = $('[data-enquire]'), note = $('.enquire__note', form);
  $('input[name="in"]', form).min = new Date().toISOString().slice(0, 10);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form));
    if (!f.name.trim() || !f.phone.trim() || !f.in) { note.textContent = 'Add your name, a phone number and your arrival date.'; return; }
    note.textContent = '';
    const q = quote ? ` Looking at a ${quote.type} in ${quote.area}.` : '';
    const msg = `Hi Northlight, I'm ${f.name}${f.company ? ' from ' + f.company : ''}. Arriving ${f.in}${f.len ? ', staying ' + f.len : ''}.${q} Phone: ${f.phone}.`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });

  /* ---------- smooth scroll, nav ---------- */
  let lenis = null;
  if (!reduce && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    if (hasGsap) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  }
  const burger = $('.nav__burger'), drawer = $('#drawer');
  const closeDrawer = () => { drawer.hidden = true; burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; };
  burger.addEventListener('click', () => { const o = drawer.hidden; drawer.hidden = !o; burger.setAttribute('aria-expanded', String(o)); document.body.style.overflow = o ? 'hidden' : ''; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !drawer.hidden) closeDrawer(); });
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const t = $(id); if (!t) return;
    e.preventDefault(); closeDrawer();
    lenis ? lenis.scrollTo(t, { offset: -90 }) : t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));
  const nav = $('#nav'); let lastY = 0;
  window.addEventListener('scroll', () => { const y = scrollY; nav.classList.toggle('is-hidden', y > lastY && y > 600); lastY = y; }, { passive: true });

  /* ---------- word masks for headings ---------- */
  $$('[data-lines]').forEach(h => { h.innerHTML = h.textContent.trim().split(/\s+/).map(w => `<span class="ln" style="display:inline-block"><span>${w}</span></span>`).join(' '); });

  const loader = $('.loader');
  if (!hasGsap || reduce) {
    loader.classList.add('is-gone');
    $('.areas').classList.add('is-static');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- loader: count up to a year of nights, then lift ---------- */
  const heroLines = $$('.hero__title .ln > span');
  gsap.set(heroLines, { yPercent: 110 });
  gsap.set(['.hero__lede', '.calc'], { y: 40, opacity: 0 });
  gsap.set('.frame', { y: 80, opacity: 0 });
  const c = { v: 0 }, countEl = $('[data-count]');
  gsap.timeline()
    .to(c, { v: 365, duration: 1.4, ease: 'power3.inOut', onUpdate: () => (countEl.textContent = Math.round(c.v)) })
    .to('.loader__bar span', { scaleX: 1, duration: 1.4, ease: 'power3.inOut' }, 0)
    .to(loader, { yPercent: -100, duration: .9, ease: 'power4.inOut' }, '+=.15')
    .add(() => loader.classList.add('is-gone'))
    .to(heroLines, { yPercent: 0, duration: 1.1, stagger: .1, ease: 'power4.out' }, '-=.45')
    .to(['.hero__lede', '.calc'], { y: 0, opacity: 1, duration: .9, stagger: .12, ease: 'power3.out' }, '-=.8')
    .to('.frame', { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, '-=.6');

  /* ---------- tour film widens to full bleed ---------- */
  gsap.to('[data-frame]', {
    width: '100vw', borderRadius: 0, ease: 'none',
    scrollTrigger: { trigger: '[data-frame]', start: 'top 85%', end: 'top 10%', scrub: true }
  });
  gsap.fromTo('.frame__video', { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '[data-frame]', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---------- heading word reveals ---------- */
  $$('[data-lines]').forEach(h => gsap.from($$('.ln > span', h), { yPercent: 110, duration: .9, stagger: .04, ease: 'power3.out', scrollTrigger: { trigger: h, start: 'top 85%' } }));
  gsap.from('.every__list li', { y: 30, opacity: 0, stagger: .06, duration: .7, ease: 'power2.out', scrollTrigger: { trigger: '.every__list', start: 'top 85%' } });

  const mm = gsap.matchMedia();
  mm.add('(min-width: 861px)', () => {
    /* stacking cards: each card shrinks and dims as the next slides over it */
    const cards = $$('.card');
    cards.forEach((card, i) => {
      if (i === cards.length - 1) return;
      gsap.to(card, { scale: .92 - (cards.length - i - 2) * .02, filter: 'brightness(.96)', ease: 'none',
        scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 96px', scrub: true } });
    });
    cards.forEach(card => gsap.fromTo($('.card__main', card), { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'top 96px', scrub: true } }));

    /* locations: pinned horizontal scroll */
    const track = $('.areas__track');
    const dist = () => track.scrollWidth - innerWidth;
    const tween = gsap.to(track, { x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: '.areas', pin: '.areas__pin', start: 'top top', end: () => '+=' + dist(), scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 } });
    $$('.area').forEach(a => gsap.fromTo($('img, video', a), { xPercent: -10, scale: 1.15 }, { xPercent: 10, scale: 1.15, ease: 'none', scrollTrigger: { trigger: a, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } }));
  });
  mm.add('(max-width: 860px)', () => { $('.areas').classList.add('is-static'); return () => $('.areas').classList.remove('is-static'); });

  /* inset photo floats up inside each card */
  $$('.card__inset').forEach(el => gsap.fromTo(el, { y: 60 }, { y: -20, ease: 'none', scrollTrigger: { trigger: el.closest('.card'), start: 'top bottom', end: 'bottom top', scrub: true } }));

  /* ---------- weekday timeline ---------- */
  gsap.to('.timeline__line span', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 60%', end: 'bottom 60%', scrub: true } });
  $$('.tl').forEach(tl => {
    const right = tl.dataset.side === 'right';
    const narrow = innerWidth <= 860;
    gsap.from($('.tl__img', tl), { x: narrow ? 0 : (right ? 120 : -120), y: narrow ? 50 : 0, opacity: 0, clipPath: 'inset(0 0 0 0 round 22px)', duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: tl, start: 'top 80%' } });
    gsap.from($('.tl__txt', tl), { x: narrow ? 0 : (right ? -60 : 60), opacity: 0, duration: 1, delay: .1, ease: 'power3.out', scrollTrigger: { trigger: tl, start: 'top 80%' } });
    gsap.from($('time', tl), { scale: 0, duration: .6, ease: 'back.out(2)', scrollTrigger: { trigger: tl, start: 'top 65%' } });
  });

  /* ---------- bento parallax inside each tile ---------- */
  $$('[data-par]').forEach(el => gsap.fromTo(el, { yPercent: -20 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: el.closest('.b'), start: 'top bottom', end: 'bottom top', scrub: true } }));
  gsap.from('.b', { y: 60, opacity: 0, stagger: .08, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.bento', start: 'top 80%' } });

  /* ---------- companies + enquiry ---------- */
  gsap.from('.checks li', { x: 60, opacity: 0, stagger: .08, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: '.checks', start: 'top 80%' } });
  gsap.from('[data-reveal="left"]', { x: -100, opacity: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.enquire', start: 'top 75%' } });
  gsap.from('.enquire__form > *', { y: 24, opacity: 0, stagger: .05, duration: .6, ease: 'power2.out', scrollTrigger: { trigger: '.enquire', start: 'top 70%' } });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
