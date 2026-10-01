document.addEventListener("DOMContentLoaded", () => {
  // Handle counter animations
  const counters = document.querySelectorAll(".stat-item h4[data-target]");
  const duration = 1200; // ms total duration per counter

  counters.forEach((el) => {
    const target = parseInt(el.getAttribute("data-target"), 10) || 0;
    const suffix = el.getAttribute("data-suffix") || "";
    const start = 0;
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percent = Math.min(progress / duration, 1);
      const eased = easeOutQuad(percent);
      const value = Math.floor(start + (target - start) * eased);
      el.textContent = value + (percent === 1 ? suffix : "");
      // add pop animation
      el.classList.add("pop");
      setTimeout(() => el.classList.remove("pop"), 120);
      if (progress < duration) {
        window.requestAnimationFrame(step);
      } else {
        // ensure exact final value
        el.textContent = target + suffix;
      }
    }

    window.requestAnimationFrame(step);
  });

  function easeOutQuad(t) {
    return t * (2 - t);
  }

  // Handle regulation dropdown
  const regulationDropdown = document.getElementById("regulation-dropdown");
  const syllabusFCards = document.querySelectorAll(".syllabus-card");

  if (regulationDropdown) {
    // Load saved regulation preference
    try {
      const savedRegulation =
        localStorage.getItem("syllabus-regulation") || "2021";
      regulationDropdown.value = savedRegulation;
      updateCardsForRegulation(savedRegulation);
    } catch (e) {}

    // Handle regulation change
    regulationDropdown.addEventListener("change", (e) => {
      const selectedRegulation = e.target.value;
      updateCardsForRegulation(selectedRegulation);

      // Save preference
      try {
        localStorage.setItem("syllabus-regulation", selectedRegulation);
      } catch (error) {}
    });
  }

  function updateCardsForRegulation(regulation) {
    syllabusFCards.forEach((card) => {
      const hrefKey = `data-href-${regulation}`;
      const newHref = card.getAttribute(hrefKey);

      if (newHref) {
        card.href = newHref;
        card.setAttribute("data-regulation", regulation);
      }

      // Update badge text
      const badge = card.querySelector(".reg-badge");
      if (badge) {
        badge.textContent = `Regulation ${regulation}`;
      }
    });
  }
});
