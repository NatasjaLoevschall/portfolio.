const section = document.querySelector(".ay-scroll-section");
const photos = section ? Array.from(section.querySelectorAll(".ay-photo")) : [];
const text = section?.querySelector(".ay-scroll-text");
const videoStage = document.querySelector(".ay-video-stage");
const videoOverlay = document.querySelector(".ay-video-overlay");
const videoCards = Array.from(document.querySelectorAll(".ay-video-card"));
const videoLightbox = document.querySelector(".ay-video-lightbox");
const lightboxCloseButton = videoLightbox?.querySelector(".ay-video-lightbox__close");
const customCursor = document.querySelector("#custom-cursor");
let activeVideoCard = null;

if (videoStage && videoOverlay) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function updateVideoOverlay() {
    const scrollDistance = videoStage.offsetHeight - window.innerHeight;
    const progress = scrollDistance > 0
      ? Math.min(Math.max(-videoStage.getBoundingClientRect().top / scrollDistance, 0), 1)
      : 1;
    const dismissed = reduceMotion.matches || progress >= 1;

    videoStage.classList.toggle("is-overlay-dismissed", dismissed);
    videoOverlay.style.transform = `translateX(${(reduceMotion.matches ? 1 : progress) * 100}%)`;
  }

  window.addEventListener("scroll", updateVideoOverlay, { passive: true });
  window.addEventListener("resize", updateVideoOverlay);
  reduceMotion.addEventListener("change", updateVideoOverlay);
  updateVideoOverlay();
}

videoCards.forEach((card) => {
  const video = card.querySelector("video");
  const previewButton = card.querySelector(".ay-video-card__preview");

  card.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse") card.classList.add("is-hovered");
  });

  card.addEventListener("pointerleave", () => {
    card.classList.remove("is-hovered");
  });

  previewButton.addEventListener("click", () => {
    if (!videoLightbox || !lightboxCloseButton || videoLightbox.open) return;

    activeVideoCard = card;
    previewButton.setAttribute("aria-pressed", "true");
    video.controls = false;
    video.muted = false;
    video.currentTime = 0;
    if (customCursor) {
      videoLightbox.appendChild(customCursor);
    }
    videoLightbox.insertBefore(video, lightboxCloseButton);
    videoLightbox.showModal();
    lightboxCloseButton.focus();

    video.play().catch((error) => {
      if (error.name !== "AbortError") {
        console.error("Kunne ikke afspille AY-videoen.", error);
      }
    });
  });
});

if (videoLightbox && lightboxCloseButton) {
  lightboxCloseButton.addEventListener("click", () => videoLightbox.close());
  videoLightbox.addEventListener("click", (event) => {
    if (event.target === videoLightbox) videoLightbox.close();
  });
  videoLightbox.addEventListener("close", () => {
    if (!activeVideoCard) return;

    const video = videoLightbox.querySelector("video");
    const previewButton = activeVideoCard.querySelector(".ay-video-card__preview");
    video.pause();
    video.controls = false;
    video.muted = true;
    activeVideoCard.insertBefore(video, previewButton);
    previewButton.setAttribute("aria-pressed", "false");
    if (customCursor) {
      document.body.appendChild(customCursor);
    }
    activeVideoCard = null;
  });
}

document.querySelectorAll("video[data-trim-end]").forEach((video) => {
  const trimEndSeconds = Number(video.dataset.trimEnd);

  video.addEventListener("timeupdate", () => {
    if (
      Number.isFinite(video.duration) &&
      video.duration > trimEndSeconds &&
      video.currentTime >= video.duration - trimEndSeconds
    ) {
      video.currentTime = 0;
    }
  });
});

if (section && photos.length && text) {
  let frameRequested = false;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const movements = [
    [-1.05, -0.72],
    [1.05, -0.72],
    [-1, 0.72],
    [0, 1.02],
    [1, 0.72],
  ];

  function clamp(value, min = 0, max = 1) {
    return Math.min(Math.max(value, min), max);
  }

  function ease(value) {
    return value * value * (3 - 2 * value);
  }

  function updateScrollScene() {
    frameRequested = false;

    const scrollDistance = section.offsetHeight - window.innerHeight;
    const progress = scrollDistance > 0
      ? clamp(-section.getBoundingClientRect().top / scrollDistance)
      : 0;
    const flyProgress = reduceMotion.matches
      ? 1
      : ease(progress);

    photos.forEach((photo, index) => {
      const [dx, dy] = movements[index];
      const x = dx * section.clientWidth * 0.33 * flyProgress;
      const y = dy * 26 * flyProgress;

      photo.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}vh, 0)`;
      photo.style.opacity = "1";
    });

    const reveal = reduceMotion.matches ? 1 : progress;
    text.style.opacity = String(reveal);
    text.style.clipPath = `inset(${100 - reveal * 100}% 0 0)`;
  }

  function requestScrollUpdate() {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(updateScrollScene);
  }

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate);
  reduceMotion.addEventListener("change", requestScrollUpdate);
  updateScrollScene();
}
