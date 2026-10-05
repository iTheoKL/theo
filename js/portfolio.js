(() => {
  const hero = document.querySelector('.hero');
  let pointerX = 0, pointerY = 0, pending = false;
  function paint() {
    pending = false;
    if (scrollY < hero.offsetHeight) {
      hero.style.setProperty('--px', `${pointerX * -9}px`);
      hero.style.setProperty('--py', `${scrollY * .18 + pointerY * -6}px`);
      hero.style.setProperty('--text-y', `${scrollY * .08}px`);
    }
  }
  function schedule() { if (!pending) { pending = true; requestAnimationFrame(paint); } }
  addEventListener('scroll', schedule, { passive: true });
  hero.addEventListener('pointermove', event => { pointerX = event.clientX / innerWidth - .5; pointerY = event.clientY / innerHeight - .5; schedule(); });
  function revealHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    if (target.tagName === 'DETAILS') target.open = true;
    let parent = target.parentElement;
    while (parent) { if (parent.tagName === 'DETAILS') parent.open = true; parent = parent.parentElement; }
    requestAnimationFrame(() => target.scrollIntoView({ block: 'start', behavior: 'instant' }));
  }
  addEventListener('hashchange', revealHash);
  revealHash();
  addEventListener('load', revealHash, { once: true });
  const links = [...document.querySelectorAll('nav a')];
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      links.forEach(link => { if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
    }
  }, { rootMargin: '-15% 0px -55% 0px' });
  document.querySelectorAll('main > section, .chapter').forEach(section => observer.observe(section));
  document.querySelectorAll('.locales a').forEach(link => link.addEventListener('click', () => { link.hash = location.hash; }));
})();
