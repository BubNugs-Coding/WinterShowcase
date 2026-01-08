function qs(sel, root = document) {
  return root.querySelector(sel);
}

function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function setToast(btn, text, ms = 1200) {
  const old = btn.textContent;
  btn.textContent = text;
  btn.disabled = true;
  window.setTimeout(() => {
    btn.textContent = old;
    btn.disabled = false;
  }, ms);
}

function setupActiveNav() {
  const links = qsa(".navLink");
  const sections = links
    .map((a) => qs(a.getAttribute("href")))
    .filter(Boolean);

  const byId = new Map(sections.map((s) => [s.id, s]));
  const linkById = new Map(
    links
      .map((a) => {
        const id = (a.getAttribute("href") || "").replace("#", "");
        return [id, a];
      })
      .filter(([id]) => byId.has(id)),
  );

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;

      for (const a of links) a.removeAttribute("aria-current");
      const a = linkById.get(visible.target.id);
      if (a) a.setAttribute("aria-current", "page");
    },
    {
      root: null,
      threshold: [0.2, 0.35, 0.5, 0.65],
    },
  );

  sections.forEach((s) => observer.observe(s));
}

function setupScrollProgress() {
  const bar = qs("#progressBar");
  if (!bar) return;

  const onScroll = () => {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const height = doc.scrollHeight - doc.clientHeight;
    const pct = height > 0 ? (scrollTop / height) * 100 : 0;
    bar.style.width = `${clamp(pct, 0, 100).toFixed(2)}%`;
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function setupExpandAll() {
  const btn = qs("#expandAllBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const details = qsa("details.accordion");
    const allOpen = details.every((d) => d.open);
    details.forEach((d) => {
      d.open = !allOpen;
    });
    btn.textContent = allOpen ? "Expand all" : "Collapse all";
  });
}

function setupCopyLink() {
  const btn = qs("#copyLinkBtn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast(btn, "Copied!");
    } catch {
      // Fallback: select+copy via prompt.
      window.prompt("Copy this link:", window.location.href);
    }
  });
}

function setupFilters() {
  const chips = qsa(".chip");
  const filterTargets = qsa("[data-tags]");

  const setActiveChip = (chip) => {
    chips.forEach((c) => c.classList.toggle("isActive", c === chip));
  };

  const applyFilter = (tag) => {
    filterTargets.forEach((el) => {
      const tags = (el.getAttribute("data-tags") || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const show = tag === "all" ? true : tags.includes(tag);
      el.classList.toggle("isHidden", !show);
    });
  };

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const tag = chip.getAttribute("data-filter") || "all";
      setActiveChip(chip);
      applyFilter(tag);
    });
  });

  // Initial
  const active = qs(".chip.isActive") || chips[0];
  if (active) applyFilter(active.getAttribute("data-filter") || "all");
}

function setupGalleryModal() {
  const modal = qs("#imgModal");
  const modalImg = qs("#modalImg");
  const modalCaption = qs("#modalCaption");
  if (!modal || !modalImg || !modalCaption) return;

  const items = qsa(".galleryItem");
  items.forEach((btn) => {
    btn.addEventListener("click", () => {
      const full = btn.getAttribute("data-full");
      const caption = btn.getAttribute("data-caption") || "Image";
      if (!full) return;

      modalImg.src = full;
      modalImg.alt = caption;
      modalCaption.textContent = caption;
      modal.showModal();
    });
  });

  modal.addEventListener("click", (e) => {
    // Close if click outside frame.
    const frame = qs(".modalFrame", modal);
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    const inside =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;
    if (!inside) modal.close();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupActiveNav();
  setupScrollProgress();
  setupExpandAll();
  setupCopyLink();
  setupFilters();
  setupGalleryModal();
});


