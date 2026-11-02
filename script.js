// =========================
// Mockup slider / overlay
// =========================

const slides = [
  { src: "billeder/side23.png", alt: "Opslag side 2-3" },
  { src: "billeder/side45.png", alt: "Opslag side 4-5" },
  { src: "billeder/side67.png", alt: "Opslag side 6-7" },
];

let index = 0;

const slider = document.getElementById("sliderWrapper"); // .mockup-slider
const img = document.getElementById("sliderImg");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const dotsEl = document.getElementById("dots");
const closeBtn = slider?.querySelector(".overlay-close");

function isOpen() {
  return slider?.classList.contains("is-active");
}

function renderDots() {
  if (!dotsEl) return;
  dotsEl.innerHTML = "";

  slides.forEach((_, i) => {
    const d = document.createElement("button");
    d.type = "button";
    d.className = "mockup-dot" + (i === index ? " is-active" : "");
    d.dataset.index = String(i);
    d.setAttribute("aria-label", `Gå til slide ${i + 1}`);
    dotsEl.appendChild(d);
  });
}

function updateNav() {
  if (!prevBtn || !nextBtn) return;

  const atStart = index === 0;
  const atEnd = index === slides.length - 1;

  prevBtn.style.opacity = atStart ? "0" : "1";
  prevBtn.style.pointerEvents = atStart ? "none" : "auto";

  nextBtn.style.opacity = atEnd ? "0" : "1";
  nextBtn.style.pointerEvents = atEnd ? "none" : "auto";
}

function show(i) {
  if (!img) return;
  if (i < 0 || i >= slides.length) return;

  index = i;
  img.src = slides[index].src;
  img.alt = slides[index].alt;

  renderDots();
  updateNav();
}

function openOverlay() {
  if (!slider) return;

  slider.classList.add("is-active");
  document.body.classList.add("mockup-open");

  // scroll overlay til toppen hver gang
  slider.scrollTop = 0;

  updateNav();
  renderDots();
}

function closeOverlay() {
  if (!slider) return;

  slider.classList.remove("is-active");
  document.body.classList.remove("mockup-open");
}

// Init
show(0);

const images = document.querySelectorAll(".floating-image");
const container = document.querySelector(".floating-images");

const objects = [];
const columns = Math.ceil(Math.sqrt(images.length));
const rows = Math.ceil(images.length / columns);

images.forEach((image, index) => {
  const width = image.offsetWidth;
  const height = image.offsetHeight;
  const column = index % columns;
  const row = Math.floor(index / columns);
  const xPosition = (column + 0.5 + (row % 2) * 0.2) / (columns + 0.2);
  const yPosition = (row + 0.5) / rows;

  const object = {
    element: image,
    x: xPosition * Math.max(0, container.clientWidth - width),
    y: yPosition * Math.max(0, container.clientHeight - height),
    angle: Math.random() * Math.PI * 2,
    speed: 36
  };

  objects.push(object);
});

let previousFrameTime;

function animate(frameTime) {
  const deltaTime = previousFrameTime === undefined
    ? 0
    : Math.min((frameTime - previousFrameTime) / 1000, 0.05);
  previousFrameTime = frameTime;

  objects.forEach(object => {

    const width = object.element.offsetWidth;
    const height = object.element.offsetHeight;
    const maxX = container.clientWidth - width;
    const maxY = container.clientHeight - height;

    object.x += Math.cos(object.angle) * object.speed * deltaTime;
    object.y += Math.sin(object.angle) * object.speed * deltaTime;

    // Rammer højre/venstre side
    if (object.x <= 0 || object.x >= maxX) {
      object.x = Math.max(0, Math.min(object.x, maxX));
      object.angle = Math.PI - object.angle;
    }

    // Rammer top/bund
    if (object.y <= 0 || object.y >= maxY) {
      object.y = Math.max(0, Math.min(object.y, maxY));
      object.angle = -object.angle;
    }

    object.element.style.transform =
      `translate(${object.x}px, ${object.y}px)`;
  });

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
// -------- Events --------

// Åbn ved klik på billedet (kun når overlay er lukket)
img?.addEventListener("click", () => {
  if (!isOpen()) openOverlay();
});

// Prev/Next knapper
prevBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  show(index - 1);
});

nextBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  show(index + 1);
});

// Kryds
closeBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  closeOverlay();
});

// Klik på baggrunden lukker (men ikke på billede/controls)
slider?.addEventListener("click", (e) => {
  if (!isOpen()) return;

  const t = e.target;

  // Klik på billede eller controls -> luk ikke
  if (
    t === img ||
    t.closest(".mockup-nav") ||
    t.closest(".mockup-dots") ||
    t.closest(".overlay-close")
  ) {
    return;
  }

  // Kun "baggrund"-klik lukker
  closeOverlay();
});

// Dots (delegation)
dotsEl?.addEventListener("click", (e) => {
  const btn = e.target.closest(".mockup-dot");
  if (!btn) return;

  const i = Number(btn.dataset.index);
  if (!Number.isNaN(i)) show(i);
});

// ESC + piletaster
document.addEventListener("keydown", (e) => {
  if (!isOpen()) return;

  if (e.key === "Escape") closeOverlay();
  if (e.key === "ArrowLeft") show(index - 1);
  if (e.key === "ArrowRight") show(index + 1);
});

// click handling (delegation)
document.addEventListener("click", (e) => {
  const target = e.target;

  // Kryds: luk overlay
  if (target.classList && target.classList.contains("overlay-close")) {
    closeOverlay();
    return;
  }

  // åbner på billede
  if (target.closest && target.closest("#sliderImg")) {
    openOverlay();
    return;
  }

  // prev/next
  if (target.id === "prevBtn") {
    e.stopPropagation();
    show(index - 1);
    return;
  }
  if (target.id === "nextBtn") {
    e.stopPropagation();
    show(index + 1);
    return;
  }

  // dot click
  if (target.classList && target.classList.contains("mockup-dot")) {
    const i = Number(target.dataset.index);
    if (!Number.isNaN(i)) show(i);
    return;
  }

  // klik på overlay-baggrund lukker (men ikke på controls)
  const slider = qs("sliderWrapper");
  if (slider && isOpen()) {
    if (target.closest(".mockup-nav") || target.closest(".mockup-dots")) return;
    if (target.closest("#sliderWrapper")) closeOverlay();
  }
});

// ESC lukker + piletaster skifter når åben (men stopper ved grænser)
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeOverlay();

  if (!isOpen()) return;

  if (e.key === "ArrowLeft" && index > 0) show(index - 1);
  if (e.key === "ArrowRight" && index < slides.length - 1) show(index + 1);
});

// --- Scroll reveal ---
const revealEls = document.querySelectorAll(".reveal");

const io = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target); // kun én gang
      }
    });
  },
  {
    threshold: 0.2,
  }
);

revealEls.forEach((el) => io.observe(el));

// pf-scroll-reveal.js (MULTI SECTION)
(() => {
  const clamp01 = (n) => Math.max(0, Math.min(1, n));

  function initAllPfScrollReveal() {
    const stages = document.querySelectorAll(".pf-stage");
    if (!stages.length) return;

    let ticking = false;

    // cache per stage
    const items = Array.from(stages).map((stage) => {
      const wrapper = stage.querySelector(".pf-scroll-reveal");
      if (!wrapper) return null;

      const overlay = wrapper.querySelector(".pf-overlay");
      if (!overlay) return null;

      // det element vi bruger til at måle "hvor meget scroll vi skal have"
      const measureEl =
        wrapper.querySelector(".pf-grid.pf-carousel") ||
        wrapper.querySelector(".mockup-wrap") ||
        wrapper;

      return { stage, wrapper, overlay, measureEl, revealDistance: 420 };
    }).filter(Boolean);

    if (!items.length) return;

    function computeRevealDistance(item) {
      // samme logik som du brugte: baseret på højde * 1.5, min 260
      const h = item.measureEl.offsetHeight || item.wrapper.offsetHeight || 600;
      item.revealDistance = Math.max(260, h * 0.8);
      item.stage.style.setProperty("--pf-reveal-distance", `${item.revealDistance}px`);
    }

    function getMaxShiftPx(item) {
      const rect = item.wrapper.getBoundingClientRect();
      const viewportW = window.innerWidth || document.documentElement.clientWidth;
      return (viewportW - rect.left) + item.overlay.offsetWidth + 16;
    }

    function updateAll() {
      ticking = false;

      // hvis mockup-slider overlay er åben, så stop (du havde samme idé)
      if (typeof isOpen === "function" && isOpen()) return;

      items.forEach((item) => {
        const stageRect = item.stage.getBoundingClientRect();
        const progress = clamp01((-stageRect.top) / item.revealDistance);
        item.overlay.style.transform = `translateX(${progress * getMaxShiftPx(item)}px)`;
      });
    }

    function onScrollOrResize() {
      if (typeof isOpen === "function" && isOpen()) return;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateAll);
    }

    // init
    items.forEach(computeRevealDistance);
    updateAll();

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", () => {
      items.forEach(computeRevealDistance);
      onScrollOrResize();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAllPfScrollReveal, { once: true });
  } else {
    initAllPfScrollReveal();
  }
})();


document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("introOverlay");
  const firstVideo = document.querySelector(".content-video");

  // hvis der er en forside-video, pause den straks — vi starter den senere
  if (firstVideo) {
    try {
      firstVideo.pause();
    } catch (e) {
      /* ignore */
    }
  }

  // Hvis overlay ikke findes (fx undersider), afspil video med lille forsinkelse
  if (!overlay) {
    if (firstVideo) setTimeout(() => firstVideo.play().catch(() => {}), 100);
    return;
  }

  // blokér page-scroll mens intro vises
  document.body.style.overflow = "hidden";

  setTimeout(() => {
    overlay.classList.add("is-hiding");

    const cleanup = () => {
      overlay.classList.add("is-hidden");
      document.body.style.overflow = ""; // genopret scroll
      // start forside-video efter overlay er væk
      if (firstVideo) firstVideo.play().catch(() => {});
    };

    // normalt: afvent transitionend
    const onTransitionEnd = () => {
      cleanup();
      clearTimeout(fallbackTimeout);
    };

    overlay.addEventListener("transitionend", onTransitionEnd, { once: true });

    // fallback: hvis transitionend af en eller anden grund ikke affyres
    const fallbackTimeout = setTimeout(() => {
      cleanup();
    }, 1200); // længere end CSS-transition (800ms)
  }, 2000);
});

/* ===== Cylinder gallery (fixed) ===== */
(() => {
  // Simple safeInit fallback (only runs once per key)
  const __inited = new Set();
  function safeInit(key, fn) {
    if (__inited.has(key)) return;
    __inited.add(key);
    try { fn(); } catch (err) { console.error(`[${key}] init error`, err); }
  }

  safeInit("cylinder", () => {
    const sec = document.querySelector("#cyl-sec");
    const cyl = document.querySelector("#cyl-cylinder");
    if (!sec || !cyl) return;

    const cards = Array.from(cyl.querySelectorAll(".cyl-card"));
    const count = cards.length;

    let rotY = 0;
    let rafId = 0;

    function layout() {
      const step = 360 / Math.max(1, count);
      cards.forEach((card, i) => {
        const a = i * step;
        card.style.transform =
          `translate(-50%, -50%) rotateY(${a}deg) translateZ(var(--radius))`;
      });
      scheduleRender();
    }

    function render() {
      rafId = 0;
      cyl.style.transform = `rotateX(var(--tiltX)) rotateY(${rotY}deg)`;
    }

    function scheduleRender() {
      if (rafId) return;
      rafId = requestAnimationFrame(render);
    }

    function isMostlyInView() {
      const r = sec.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const mid = r.top + r.height * 0.5;
      return mid > 0 && mid < vh;
    }

    // --- Events ---
    const onResize = () => layout();

    const onWheel = (e) => {
      if (!isMostlyInView()) return;
      rotY += e.deltaY * 0.08;
      scheduleRender();
    };

    let dragging = false;
    let lastX = 0;

    const onPointerDown = (e) => {
      dragging = true;
      lastX = e.clientX;
      // Capture pointer so drag continues even if cursor leaves element
      if (sec.setPointerCapture) sec.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      rotY += dx * 0.25;
      scheduleRender();
    };

    const stopDrag = () => { dragging = false; };

    // Attach
    window.addEventListener("resize", onResize);
    window.addEventListener("wheel", onWheel, { passive: true });

    sec.addEventListener("pointerdown", onPointerDown);
    sec.addEventListener("pointermove", onPointerMove);
    sec.addEventListener("pointerup", stopDrag);
    sec.addEventListener("pointercancel", stopDrag);
    sec.addEventListener("pointerleave", stopDrag);

    // Initial
    layout();
    render();

    // Optional: expose a cleanup if you need it later
    // (e.g. single-page apps)
    sec.__cylCleanup = () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("wheel", onWheel, { passive: true });

      sec.removeEventListener("pointerdown", onPointerDown);
      sec.removeEventListener("pointermove", onPointerMove);
      sec.removeEventListener("pointerup", stopDrag);
      sec.removeEventListener("pointercancel", stopDrag);
      sec.removeEventListener("pointerleave", stopDrag);
    };
  });
})();
document.querySelectorAll('.pf-hover-video').forEach(video => {
  const wrapper = video.closest('.pf-video-wrapper');

  const trimEndSeconds = Number(video.dataset.trimEnd);
  if (trimEndSeconds > 0) {
    video.addEventListener('timeupdate', () => {
      if (
        Number.isFinite(video.duration) &&
        video.duration > trimEndSeconds &&
        video.currentTime >= video.duration - trimEndSeconds
      ) {
        video.currentTime = video.duration - trimEndSeconds;
        video.pause();
      }
    });
  }

  wrapper.addEventListener('mouseenter', () => {
    video.play();
  });

  wrapper.addEventListener('mouseleave', () => {
    video.pause();
    video.currentTime = 0;
  });
});
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("is-intro");

  // Vis intro i 1.5 sek
  setTimeout(() => {
    document.body.classList.add("is-intro-exit");

    // Når width-transitionen er færdig (900ms), lås normal state
    setTimeout(() => {
      document.body.classList.remove("is-intro", "is-intro-exit");
      document.body.classList.add("is-intro-done");
    }, 900);
  }, 2000);
});
