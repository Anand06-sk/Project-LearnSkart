(function () {
  function rewriteAcademicSyllabusLinks() {
    try {
      var pathname = (location.pathname || "").replace(/\\/g, "/");
      var cleaned = pathname.replace(/\/index\.html$/i, "").replace(/\/+$/, "");
      var parts = cleaned.split("/").filter(Boolean);
      if (
        parts.length < 3 ||
        String(parts[0]).toLowerCase() !== "anna-university-notes"
      )
        return;

      var dept = String(parts[1] || "").toLowerCase();
      var subject = String(parts[2] || "").toLowerCase();
      if (!dept) return;

      var resolvedHref = subject
        ? "../../../syllabus/" + dept + "/" + subject + "/"
        : "../../../syllabus/index.html";

      document.querySelectorAll("a").forEach(function (link) {
        var label = (link.textContent || "").trim().toLowerCase();
        if (label === "view syllabus") link.setAttribute("href", resolvedHref);
      });
    } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", rewriteAcademicSyllabusLinks);
  } else {
    rewriteAcademicSyllabusLinks();
  }
  window.addEventListener("load", rewriteAcademicSyllabusLinks, false);
})();
