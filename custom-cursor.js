if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  const interactiveSelector = [
    "a",
    "button",
    "input",
    "select",
    "textarea",
    "summary",
    "[role='button']",
    "[tabindex]:not([tabindex='-1'])",
    "#sliderImg",
  ].join(",");

  const cursor = document.createElement("div");
  cursor.id = "custom-cursor";
  cursor.setAttribute("aria-hidden", "true");
  document.body.appendChild(cursor);

  function getInteractiveTarget(target) {
    return target instanceof Element ? target.closest(interactiveSelector) : null;
  }

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;

    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
    cursor.classList.add("is-visible");
  });

  document.addEventListener("pointerover", (event) => {
    if (event.pointerType !== "mouse") return;
    cursor.classList.toggle("is-interactive", Boolean(getInteractiveTarget(event.target)));
  });

  document.addEventListener("pointerout", (event) => {
    if (event.pointerType !== "mouse") return;

    const target = getInteractiveTarget(event.target);
    const nextTarget = getInteractiveTarget(event.relatedTarget);
    if (target && target !== nextTarget) {
      cursor.classList.remove("is-interactive");
    }
  });

  document.addEventListener("pointerleave", () => {
    cursor.classList.remove("is-visible", "is-interactive");
  });

  window.addEventListener("blur", () => {
    cursor.classList.remove("is-visible", "is-interactive");
  });
}
