/* HUSH / 031 — portfolio interactions. No dependencies. */
(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (fine && !reduced) {
    const cursor = $("#cursor");
    const dot = $(".cursor__dot", cursor);
    const ring = $(".cursor__ring", cursor);
    if (cursor && dot && ring) {
      document.body.classList.add("has-cursor");
      let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
      window.addEventListener("pointermove", (event) => {
        x = event.clientX; y = event.clientY;
        cursor.style.opacity = "1";
        dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }, { passive: true });
      document.addEventListener("pointerover", (event) => {
        const target = event.target.closest("[data-cursor], a, button");
        cursor.classList.toggle("is-link", !!target);
      });
      document.addEventListener("pointerleave", () => { cursor.style.opacity = "0"; });
      (function follow() {
        rx += (x - rx) * 0.18;
        ry += (y - ry) * 0.18;
        ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
        requestAnimationFrame(follow);
      })();
    }
  }

  const bar = $("#scrollbar");
  const topbar = $("#topbar");
  const paper = $(".paper");
  function onScroll() {
    const root = document.documentElement;
    const max = root.scrollHeight - root.clientHeight;
    if (bar) bar.style.height = `${max > 0 ? root.scrollTop / max * 100 : 0}%`;
    if (topbar) topbar.classList.toggle("is-stuck", root.scrollTop > 24);
    if (paper && topbar) {
      const bounds = paper.getBoundingClientRect();
      topbar.classList.toggle("on-paper", bounds.top < 76 && bounds.bottom > 76);
    }
    if (!reduced) {
      $$('[data-parallax]').forEach((element) => {
        const speed = Number.parseFloat(element.dataset.parallax) || 0;
        const bounds = element.getBoundingClientRect();
        if (bounds.bottom > -200 && bounds.top < innerHeight + 200) {
          element.style.setProperty("--py", `${(bounds.top - innerHeight * 0.3) * speed}px`);
        }
      });
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  const menu = $("#menu");
  const menuButton = $("#menu-btn");
  if (menu && menuButton) {
    const setMenu = (open) => {
      menu.hidden = !open;
      menuButton.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("is-locked", open);
    };
    menuButton.addEventListener("click", () => setMenu(menu.hidden));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !menu.hidden) {
        setMenu(false);
        menuButton.focus();
      }
    });
    $$("a", menu).forEach((link) => link.addEventListener("click", () => setMenu(false)));
  }

  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduced) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    reveals.forEach((element, index) => {
      element.style.setProperty("--d", `${index % 4 * 55}ms`);
      observer.observe(element);
    });
  } else {
    reveals.forEach((element) => element.classList.add("is-in"));
  }

  const sections = $$("main > section[id]");
  const navLinks = $$(".nav a");
  if ("IntersectionObserver" in window && sections.length && navLinks.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => link.classList.toggle("is-current", link.hash === `#${entry.target.id}`));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((section) => observer.observe(section));
  }

  const field = $("#field");
  if (field && !reduced) {
    const context = field.getContext("2d", { alpha: true });
    let width = 0, height = 0, ratio = 1, particles = [];
    const pointer = { x: -999, y: -999, active: false };
    const random = (min, max) => min + Math.random() * (max - min);
    function resizeField() {
      ratio = Math.min(devicePixelRatio || 1, 2);
      width = innerWidth; height = innerHeight;
      field.width = width * ratio; field.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = width < 700 ? 26 : width < 1200 ? 46 : 72;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width, y: Math.random() * height,
        vx: random(-0.14, 0.14), vy: random(-0.12, 0.12),
        radius: random(0.7, 2.2), alpha: random(0.12, 0.5), pink: Math.random() > 0.62
      }));
    }
    window.addEventListener("pointermove", (event) => {
      pointer.x = event.clientX; pointer.y = event.clientY; pointer.active = true;
    }, { passive: true });
    window.addEventListener("pointerleave", () => { pointer.active = false; });
    let phase = 0;
    function drawField() {
      phase += 0.006;
      context.clearRect(0, 0, width, height);
      particles.forEach((particle) => {
        if (pointer.active) {
          const dx = pointer.x - particle.x, dy = pointer.y - particle.y;
          const distance2 = dx * dx + dy * dy;
          if (distance2 < 34000 && distance2 > 40) {
            const distance = Math.sqrt(distance2);
            const force = (1 - distance2 / 34000) * 0.34;
            particle.vx += dx / distance * force;
            particle.vy += dy / distance * force;
          }
        }
        particle.vx += Math.cos(particle.y * 0.004 + phase) * 0.004;
        particle.vy += Math.sin(particle.x * 0.004 + phase) * 0.004;
        particle.vx *= 0.965; particle.vy *= 0.965;
        particle.x += particle.vx; particle.y += particle.vy;
        if (particle.x < -20) particle.x = width + 20;
        if (particle.x > width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = height + 20;
        if (particle.y > height + 20) particle.y = -20;
        const glow = pointer.active ? Math.max(0, Math.min(1, 1 - Math.hypot(pointer.x - particle.x, pointer.y - particle.y) / 320)) : 0;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius + glow * 1.4, 0, Math.PI * 2);
        context.fillStyle = particle.pink
          ? `rgba(255, 46, 136, ${particle.alpha * (0.55 + glow * 0.45)})`
          : `rgba(200, 210, 220, ${particle.alpha * (0.4 + glow * 0.4)})`;
        context.fill();
        if (glow > 0.35) {
          context.beginPath(); context.moveTo(particle.x, particle.y); context.lineTo(pointer.x, pointer.y);
          context.strokeStyle = `rgba(255, 46, 136, ${glow * 0.045})`;
          context.lineWidth = 0.6; context.stroke();
        }
      });
      requestAnimationFrame(drawField);
    }
    resizeField();
    window.addEventListener("resize", resizeField);
    requestAnimationFrame(drawField);
  }

  /* redacted fields — reveal on hover (CSS), or persist on click / tap / Enter / Space */
  $$("[data-redact]").forEach((node) => {
    node.addEventListener("click", () => node.classList.toggle("is-open"));
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        node.classList.toggle("is-open");
      }
    });
  });

  /* hero typewriter — the name erases and retypes: Hush ⇄ Theo */
  const typeTarget = $(".hero__type");
  if (typeTarget) {
    const words = ["Hush", "Theo"];
    if (reduced) {
      typeTarget.textContent = words[0];
    } else {
      const TYPE = 115, ERASE = 65, HOLD = 2800, GAP = 480;
      let index = 0, length = words[0].length, erasing = true;
      typeTarget.textContent = words[0];
      const tick = () => {
        const value = words[index % words.length];
        if (erasing) {
          length = Math.max(0, length - 1);
          typeTarget.textContent = value.slice(0, length);
          if (length === 0) { erasing = false; index += 1; setTimeout(tick, GAP); }
          else setTimeout(tick, ERASE);
        } else {
          length = Math.min(value.length, length + 1);
          typeTarget.textContent = value.slice(0, length);
          if (length === value.length) { erasing = true; setTimeout(tick, HOLD); }
          else setTimeout(tick, TYPE);
        }
      };
      setTimeout(tick, HOLD);
    }
  }

  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = $(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", link.hash);
    });
  });
})();
